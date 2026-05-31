"use client";

import { use, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { useLocale } from "@/lib/i18n";
import type { Job } from "@/lib/api/types";
import { ApiError } from "@/lib/api/types";
import {
  Briefcase, MapPin, DollarSign, Clock, Users, Globe, Building2,
  ArrowLeft, ExternalLink, Calendar,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Suspense } from "react";

// ── helpers ──────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  REMOTE: "Remote",
  CONTRACT: "Contract",
  INTERN: "Internship",
};

function typeColor(type?: string) {
  switch (type) {
    case "FULL_TIME": return "bg-indigo-50 text-indigo-700 border-indigo-100";
    case "REMOTE": return "bg-emerald-50 text-emerald-700 border-emerald-100";
    case "CONTRACT": return "bg-amber-50 text-amber-700 border-amber-100";
    case "PART_TIME": return "bg-blue-50 text-blue-700 border-blue-100";
    default: return "bg-slate-50 text-slate-700 border-slate-100";
  }
}

function formatSalary(min?: number | null, max?: number | null) {
  const fmt = (n: number) => n >= 1000 ? `${Math.round(n / 1000)}K` : String(n);
  if (min != null && max != null) return `${fmt(min)} – ${fmt(max)} ETB`;
  if (min != null) return `${fmt(min)}+ ETB`;
  if (max != null) return `up to ${fmt(max)} ETB`;
  return null;
}

function timeAgo(dateStr?: string | null) {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  const d = Math.floor(diff / 86_400_000);
  if (d < 1) return "Today";
  if (d < 7) return `${d}d ago`;
  return `${Math.floor(d / 7)}w ago`;
}

// ── job card ─────────────────────────────────────────────────────────────────

function JobCard({ job }: { job: Job }) {
  const salary = formatSalary(job.salaryMin, job.salaryMax);
  const posted = timeAgo(job.postedAt);

  return (
    <Link
      href={`/candidate/jobs/${job.id}`}
      className="group block rounded-2xl border border-slate-200 bg-white p-5 hover:border-indigo-200 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 flex-wrap">
            <h3 className="font-bold text-slate-950 group-hover:text-indigo-700 transition leading-tight">
              {job.title}
            </h3>
            {job.type && (
              <Badge className={`shrink-0 text-xs ${typeColor(job.type)}`}>
                {TYPE_LABELS[job.type] ?? job.type}
              </Badge>
            )}
          </div>

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
            {job.location && (
              <span className="flex items-center gap-1"><MapPin size={11} className="text-slate-400" />{job.location}</span>
            )}
            {salary && (
              <span className="flex items-center gap-1"><DollarSign size={11} className="text-slate-400" />{salary}</span>
            )}
            {job.deadline && (
              <span className="flex items-center gap-1"><Calendar size={11} className="text-slate-400" />Deadline {new Date(job.deadline).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
            )}
            {job.applicantCount != null && (
              <span className="flex items-center gap-1"><Users size={11} className="text-slate-400" />{job.applicantCount} applicant{job.applicantCount !== 1 ? "s" : ""}</span>
            )}
            {posted && <span className="text-slate-400">{posted}</span>}
          </div>

          {job.requiredSkills?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {job.requiredSkills.slice(0, 5).map((s) => (
                <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">{s}</span>
              ))}
              {job.requiredSkills.length > 5 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-400">+{job.requiredSkills.length - 5}</span>
              )}
            </div>
          )}
        </div>

        <ExternalLink size={15} className="text-slate-300 group-hover:text-indigo-400 transition shrink-0 mt-0.5" />
      </div>
    </Link>
  );
}

// ── page inner ────────────────────────────────────────────────────────────────

function CompanyPageInner({ recruiterId }: { recruiterId: string }) {
  const { api } = useAuth();
  const { tr } = useLocale();
  const searchParams = useSearchParams();

  // Seed company info from URL params (populated by the linking job card)
  const seedName = searchParams.get("name") ?? "";
  const seedIndustry = searchParams.get("industry") ?? "";
  const seedWebsite = searchParams.get("website") ?? "";

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Company info resolved from the first fetched job (more complete)
  const company = jobs[0]?.recruiter ?? {
    id: recruiterId,
    companyName: seedName,
    industry: seedIndustry,
    website: seedWebsite || null,
  };

  useEffect(() => {
    let cancelled = false;

    async function load() {
      // Mirror what the jobs page search bar does: search by company name.
      // The /jobs?q= endpoint searches recruiter/company names, which is why
      // typing "negarit" on the jobs page returns Negarit Tech's listings.
      const res = await api.jobs.list({ q: seedName || undefined, limit: 100 });
      const all = res.data ?? [];
      // Filter to only this company's jobs (recruiter ID match, or name match as fallback)
      return all.filter(
        (j) => j.recruiter?.id === recruiterId || j.recruiter?.companyName === seedName
      );
    }

    load()
      .then((jobs) => { if (!cancelled) setJobs(jobs); })
      .catch((e) => { if (!cancelled) setError(e instanceof ApiError ? e.message : "Failed to load jobs."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [api, recruiterId, seedName]);

  const activeJobs = jobs.filter((j) => j.status !== "CLOSED");

  return (
    <div className="max-w-4xl mx-auto pb-10 space-y-8">
      {/* Back */}
      <Link href="/candidate/jobs" className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 transition">
        <ArrowLeft size={16} /> {tr("compBackToJobs")}
      </Link>

      {/* Company hero */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-950 via-slate-900 to-indigo-950 text-white shadow-2xl">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute -bottom-20 left-1/4 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="relative p-8 md:p-10 space-y-5">
          {/* Logo placeholder + name */}
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
              <Building2 size={24} className="text-white/70" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">{company.companyName || "Company"}</h1>
              {company.industry && (
                <p className="text-slate-300 mt-1 text-sm sm:text-base">{company.industry}</p>
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2 text-slate-300">
              <Briefcase size={15} className="text-indigo-300" />
              <span><strong className="text-white">{loading ? "—" : activeJobs.length}</strong> {tr("compOpenPos")}{activeJobs.length !== 1 ? "s" : ""}</span>
            </div>
            {company.website && (
              <a
                href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-indigo-300 hover:text-indigo-200 transition"
              >
                <Globe size={15} />
                <span>{company.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}</span>
                <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      )}

      {/* Job listings */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            {tr("compOpenPositions")}
            {!loading && <span className="ml-2 text-sm font-normal text-slate-400">({activeJobs.length})</span>}
          </h2>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : activeJobs.length > 0 ? (
          <div className="space-y-3">
            {activeJobs.map((job) => <JobCard key={job.id} job={job} />)}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <p className="text-slate-500 text-sm">{tr("compNoPositions")}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── page ─────────────────────────────────────────────────────────────────────

export default function CompanyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense>
      <CompanyPageInner recruiterId={id} />
    </Suspense>
  );
}
