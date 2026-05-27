"use client";

import { useEffect, useState, useMemo } from "react";
import { MapPin, DollarSign, Clock, Users, Search, X, Briefcase } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/i18n";
import { API_BASE_URL } from "@/lib/config";
import type { Job, Paginated } from "@/lib/api/types";

const TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  REMOTE: "Remote",
  CONTRACT: "Contract",
  INTERN: "Internship",
};

const TYPE_FILTERS = Object.keys(TYPE_LABELS);

function timeAgo(dateStr?: string | null) {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return "Just now";
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return `${Math.floor(d / 7)}w ago`;
}

function formatSalary(min?: number | null, max?: number | null) {
  const fmt = (n: number) => n >= 1000 ? `${Math.round(n / 1000)}K` : String(n);
  if (min != null && max != null) return `${fmt(min)} – ${fmt(max)} ETB`;
  if (min != null) return `${fmt(min)}+ ETB`;
  if (max != null) return `up to ${fmt(max)} ETB`;
  return null;
}

function formatDeadline(dateStr?: string | null) {
  if (!dateStr) return null;
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(new Date(dateStr));
}

function typeColor(type?: string) {
  switch (type) {
    case "FULL_TIME": return "bg-indigo-50 text-indigo-700 border-indigo-100";
    case "REMOTE": return "bg-emerald-50 text-emerald-700 border-emerald-100";
    case "CONTRACT": return "bg-amber-50 text-amber-700 border-amber-100";
    case "PART_TIME": return "bg-blue-50 text-blue-700 border-blue-100";
    default: return "bg-slate-50 text-slate-700 border-slate-100";
  }
}

function JobCard({ job }: { job: Job }) {
  const { tr } = useLocale();
  const salary = formatSalary(job.salaryMin, job.salaryMax);
  const deadline = formatDeadline(job.deadline);
  const posted = timeAgo(job.postedAt);

  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-6 hover:border-indigo-200 hover:shadow-md transition-all">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-400">
          <Briefcase size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h3 className="text-lg font-bold text-slate-950 group-hover:text-indigo-700 transition leading-tight">
                {job.title}
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">
                {job.recruiter?.companyName ?? "—"}
                {job.category && <span className="text-slate-400"> · {job.category}</span>}
              </p>
            </div>
            {job.type && (
              <Badge className={typeColor(job.type)}>{TYPE_LABELS[job.type] ?? job.type}</Badge>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-slate-600">
            {job.location && (
              <span className="flex items-center gap-1.5"><MapPin size={13} className="text-slate-400" />{job.location}</span>
            )}
            {salary && (
              <span className="flex items-center gap-1.5"><DollarSign size={13} className="text-slate-400" />{salary}</span>
            )}
            {deadline && (
              <span className="flex items-center gap-1.5"><Clock size={13} className="text-slate-400" />{tr("mjDeadlineLabel")} {deadline}</span>
            )}
            {job.applicantCount != null && (
              <span className="flex items-center gap-1.5"><Users size={13} className="text-slate-400" />{job.applicantCount} {tr("mjApplicantsLabel")}</span>
            )}
            {posted && (
              <span className="text-slate-400 text-xs">{tr("mjPostedAgo")} {posted}</span>
            )}
          </div>

          {job.requiredSkills?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {job.requiredSkills.slice(0, 4).map((skill) => (
                <span key={skill} className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">{skill}</span>
              ))}
              {job.requiredSkills.length > 4 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">+{job.requiredSkills.length - 4}</span>
              )}
            </div>
          )}

          <div className="mt-4 flex items-center gap-3">
            <Link
              href={`/login?next=/candidate/jobs/${job.id}`}
              className="inline-flex items-center justify-center text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-1.5 rounded-lg transition"
            >
              {tr("mjApplyNow")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MarketingJobsPage() {
  const { tr } = useLocale();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  async function fetchJobs(pageNum: number, append = false) {
    if (pageNum === 1) setLoading(true); else setLoadingMore(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(pageNum), limit: "20" });
      if (search.trim()) params.set("q", search.trim());
      if (typeFilter) params.set("type", typeFilter);
      const res = await fetch(`${API_BASE_URL}/jobs?${params}`);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = (await res.json()) as Paginated<Job>;
      const incoming = data.data ?? [];
      setJobs((prev) => append ? [...prev, ...incoming] : incoming);
      setHasMore(incoming.length === 20);
    } catch {
      setError("Failed to load jobs. Please try again.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    setPage(1);
    fetchJobs(1, false);
  }, [search, typeFilter]);

  function handleLoadMore() {
    const next = page + 1;
    setPage(next);
    fetchJobs(next, true);
  }

  function toggleType(t: string) {
    setTypeFilter((prev) => prev === t ? "" : t);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero banner */}
      <div className="bg-linear-to-br from-slate-950 via-slate-900 to-indigo-950 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{tr("mjTitle")}</h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">{tr("mjSubtitle")}</p>

          <div className="relative max-w-xl mx-auto mt-6">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 pointer-events-none" />
            <Input
              placeholder={tr("mjSearchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-12 rounded-xl bg-white text-slate-900 border-0 shadow-lg text-base"
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {TYPE_FILTERS.map((t) => (
            <button
              key={t}
              onClick={() => toggleType(t)}
              className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full border transition-colors ${
                typeFilter === t
                  ? "bg-slate-950 text-white border-slate-950"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
              }`}
            >
              {TYPE_LABELS[t]}
              {typeFilter === t && <X size={12} />}
            </button>
          ))}
          {(typeFilter || search) && (
            <button
              onClick={() => { setTypeFilter(""); setSearch(""); }}
              className="text-sm text-slate-400 hover:text-slate-600 px-2"
            >
              {tr("alClearFilters")}
            </button>
          )}
          {!loading && (
            <span className="ml-auto text-sm text-slate-400">{jobs.length} {tr("mjTotalJobs")}</span>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
        )}

        {/* Job list */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-36 rounded-2xl bg-white animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <p className="text-slate-700 font-semibold">{tr("mjNoJobs")}</p>
            <p className="text-slate-400 text-sm mt-1">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}

        {/* Load more */}
        {hasMore && !loading && (
          <div className="text-center pt-4">
            <Button
              variant="outline"
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="rounded-xl px-8"
            >
              {loadingMore ? tr("loadingText") : tr("mjLoadMore")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
