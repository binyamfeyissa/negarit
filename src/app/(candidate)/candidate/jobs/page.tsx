"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import type { Job, Application } from "@/lib/api/types";
import { ApiError } from "@/lib/api/types";
import { Search, MapPin, DollarSign, Briefcase, Clock, Users, X } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useLocale } from "@/lib/i18n";

// ── helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateStr?: string | null) {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return "Just now";
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} day${d !== 1 ? "s" : ""} ago`;
  return `${Math.floor(d / 7)}w ago`;
}

function formatSalary(min?: number | null, max?: number | null) {
  const fmt = (n: number) => n >= 1000 ? `${Math.round(n / 1000)}K` : String(n);
  if (min != null && max != null) return `${fmt(min)} – ${fmt(max)}`;
  if (min != null) return `${fmt(min)}+`;
  if (max != null) return `up to ${fmt(max)}`;
  return null;
}

const TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  REMOTE: "Remote",
  CONTRACT: "Contract",
  INTERN: "Internship",
};

const TYPE_FILTERS = Object.keys(TYPE_LABELS) as (keyof typeof TYPE_LABELS)[];

function matchLabel(score: number) {
  if (score >= 90) return "STRONG MATCH";
  if (score >= 70) return "GOOD MATCH";
  if (score >= 50) return "FAIR MATCH";
  return "LOW MATCH";
}

function matchColor(score: number) {
  if (score >= 90) return "#10b981";
  if (score >= 70) return "#14b8a6";
  if (score >= 50) return "#f59e0b";
  return "#ef4444";
}

// ── circular match score ──────────────────────────────────────────────────────

function MatchCircle({ score }: { score: number | null }) {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const pct = score ?? 0;
  const offset = circ - (pct / 100) * circ;
  const color = score != null ? matchColor(pct) : "#334155";
  const label = score != null ? matchLabel(pct) : "ANALYZING";
  return (
    <>
      {/* Mobile: compact badge */}
      <div className="sm:hidden flex flex-col items-center justify-center gap-0.5 bg-slate-950 rounded-xl px-2 py-2 w-14 shrink-0 self-stretch">
        <span className="text-xs font-bold text-white">{score != null ? `${pct}%` : "—"}</span>
        <span className="text-[8px] text-slate-400 text-center leading-tight tracking-wide">MATCH</span>
      </div>
      {/* Desktop: full circle panel */}
      <div className="hidden sm:flex flex-col items-center justify-center gap-2 bg-slate-950 rounded-2xl px-5 py-4 w-36 shrink-0 self-stretch">
        <svg width="90" height="90" viewBox="0 0 90 90">
          <circle cx="45" cy="45" r={r} fill="none" stroke="#1e293b" strokeWidth="7" />
          <circle
            cx="45" cy="45" r={r} fill="none" stroke={color} strokeWidth="7"
            strokeDasharray={circ} strokeDashoffset={offset}
            transform="rotate(-90 45 45)" strokeLinecap="round"
          />
          {score != null ? (
            <text x="45" y="49" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="20" fontWeight="700" fontFamily="system-ui">
              {pct}%
            </text>
          ) : (
            <text x="45" y="49" textAnchor="middle" dominantBaseline="middle" fill="#475569" fontSize="24" fontWeight="700" fontFamily="system-ui">
              —
            </text>
          )}
        </svg>
        <p className="text-[11px] font-bold text-white text-center leading-tight tracking-wide">{label}</p>
      </div>
    </>
  );
}

// ── job card ──────────────────────────────────────────────────────────────────

function JobCard({ job, appliedIds }: { job: Job; appliedIds: Set<string> }) {
  const { tr } = useLocale();
  const salary = formatSalary(job.salaryMin, job.salaryMax);
  const posted = timeAgo(job.postedAt);
  const isApplied = appliedIds.has(job.id);
  const score: number | null = job.matchScore ?? null;

  return (
    <Link
      href={`/candidate/jobs/${job.id}`}
      className="flex gap-0 rounded-2xl border border-slate-200 bg-white overflow-hidden hover:border-indigo-300 hover:shadow-md transition group"
    >
      {/* Main content */}
      <div className="flex-1 p-3 sm:p-5 space-y-2 sm:space-y-3 min-w-0">
        {/* top row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* company logo placeholder */}
            <div className="h-11 w-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-400">
              <Briefcase size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                {posted && <span className="text-xs text-slate-400">{posted}</span>}
                {(job.applicantCount ?? 0) < 25 && (
                  <span className="text-xs text-emerald-600 font-medium">· {tr("cjEarlyApplicant")}</span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-950 leading-tight mt-0.5 group-hover:text-indigo-700 transition">
                {job.title}
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">
                {job.recruiter?.id ? (
                  <Link
                    href={`/candidate/companies/${job.recruiter.id}?name=${encodeURIComponent(job.recruiter.companyName ?? "")}&industry=${encodeURIComponent(job.recruiter.industry ?? "")}&website=${encodeURIComponent(job.recruiter.website ?? "")}`}
                    onClick={(e) => e.stopPropagation()}
                    className="hover:text-indigo-600 hover:underline transition-colors"
                  >
                    {job.recruiter.companyName}
                  </Link>
                ) : (job.recruiter?.companyName ?? "—")}
                {job.category && <span className="text-slate-400"> · {job.category}</span>}
              </p>
            </div>
          </div>

          {isApplied && (
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 shrink-0 text-xs">Applied</Badge>
          )}
        </div>

        {/* meta row */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs sm:text-sm text-slate-600">
          {job.location && (
            <span className="flex items-center gap-1.5"><MapPin size={13} className="text-slate-400 shrink-0" />{job.location}</span>
          )}
          {job.type && (
            <span className="flex items-center gap-1.5"><Clock size={13} className="text-slate-400 shrink-0" />{TYPE_LABELS[job.type] ?? job.type}</span>
          )}
          {salary && (
            <span className="flex items-center gap-1.5"><DollarSign size={13} className="text-slate-400 shrink-0" />{salary}</span>
          )}
        </div>

        {/* bottom row */}
        <div className="flex items-center gap-3 pt-1">
          {job.applicantCount != null && (
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Users size={12} />{job.applicantCount} applicant{job.applicantCount !== 1 ? "s" : ""}
            </span>
          )}
          {job.requiredSkills?.slice(0, 3).map((s) => (
            <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">{s}</span>
          ))}
        </div>
      </div>

      {/* match score panel */}
      <div className="p-3 flex items-stretch">
        <MatchCircle score={score} />
      </div>
    </Link>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────

type Tab = "recommended" | "applied";

export default function CandidateJobsPage() {
  const { api } = useAuth();
  const { tr } = useLocale();
  const [recommended, setRecommended] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [tab, setTab] = useState<Tab>("recommended");
  const [search, setSearch] = useState("");
  const [typeFilters, setTypeFilters] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [rec, apps] = await Promise.all([
          api.jobs.recommended({ limit: 100 }).catch(() => ({ data: [] as Job[] })),
          api.applicant.myApplications({ page: 1, limit: 200 }).catch(() => ({ data: [] as Application[] })),
        ]);
        if (cancelled) return;
        setRecommended(rec.data ?? []);
        setApplications(apps.data ?? []);
        setError(null);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof ApiError ? e.message : "Failed to load jobs.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [api]);

  const appliedIds = useMemo(() => new Set(applications.map((a) => a.job.id)), [applications]);

  function toggleType(t: string) {
    setTypeFilters((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);
  }

  const displayJobs = useMemo(() => {
    const source: Job[] =
      tab === "applied"
        ? applications.map((a) => ({ ...a.job, matchScore: a.matchScore } as unknown as Job))
        : recommended;

    return source.filter((job) => {
      const q = search.toLowerCase();
      const matchesSearch = !q ||
        job.title?.toLowerCase().includes(q) ||
        (job as Job & { company?: string }).company?.toLowerCase().includes(q) ||
        job.recruiter?.companyName?.toLowerCase().includes(q) ||
        job.location?.toLowerCase().includes(q);
      const matchesType = typeFilters.length === 0 || typeFilters.includes(job.type ?? "");
      return matchesSearch && matchesType;
    });
  }, [tab, recommended, applications, search, typeFilters]);

  return (
    <div className="max-w-5xl mx-auto pb-10 space-y-0">
      {/* Page header */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-slate-100 px-1 pb-0">
        {/* Title + tabs + search */}
        <div className="flex flex-wrap items-center gap-2 pt-3 pb-0">
          <h1 className="text-xl font-extrabold tracking-tight text-slate-950 uppercase shrink-0">Jobs</h1>
          <nav className="flex items-center gap-0.5">
            {(
              [
                { id: "recommended", label: tr("cjRecommended"), count: recommended.length },
                { id: "applied", label: tr("cjApplied"), count: applications.length },
              ] as { id: Tab; label: string; count: number }[]
            ).map(({ id, label, count }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                  tab === id
                    ? "border-slate-950 text-slate-950"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                {label}
                {count > 0 && (
                  <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${tab === id ? "bg-slate-950 text-white" : "bg-slate-200 text-slate-600"}`}>
                    {count}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Search — full width on mobile, fixed on desktop */}
          <div className="ml-auto relative w-full sm:w-56">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
            <Input
              placeholder={tr("cjSearchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-none">
          {TYPE_FILTERS.map((t) => (
            <button
              key={t}
              onClick={() => toggleType(t)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors shrink-0 ${
                typeFilters.includes(t)
                  ? "bg-slate-950 text-white border-slate-950"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
              }`}
            >
              {TYPE_LABELS[t]}
              {typeFilters.includes(t) && <X size={11} />}
            </button>
          ))}
          {(typeFilters.length > 0 || search) && (
            <button
              onClick={() => { setTypeFilters([]); setSearch(""); }}
              className="text-xs text-slate-400 hover:text-slate-600 px-2 shrink-0"
            >
              {tr("alClearFilters")}
            </button>
          )}
          <span className="ml-auto shrink-0 text-xs text-slate-400">
            {displayJobs.length} job{displayJobs.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="pt-4 space-y-3 px-1">
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
        )}

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-36 rounded-2xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : displayJobs.length > 0 ? (
          displayJobs.map((job) => (
            <JobCard key={job.id} job={job} appliedIds={appliedIds} />
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center">
            <p className="text-sm font-semibold text-slate-700">
              {tab === "recommended" ? tr("cjNoRecommended") : tr("cjNoApplied")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
