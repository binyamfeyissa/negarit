"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import type { Application, AppStatus } from "@/lib/api/types";
import { ApiError } from "@/lib/api/types";
import { Briefcase, MapPin, Clock, Search, X, ExternalLink, CheckCircle2, Circle, XCircle } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLocale } from "@/lib/i18n";

// ── constants ────────────────────────────────────────────────────────────────

const PIPELINE: AppStatus[] = ["SUBMITTED", "REVIEWED", "SHORTLISTED", "INTERVIEW", "OFFERED"];

// STATUS_LABELS is built at runtime from tr() — see useStatusLabels() below
type StatusLabels = Record<AppStatus, string>;

const TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  REMOTE: "Remote",
  CONTRACT: "Contract",
  INTERN: "Internship",
};

// ── helpers ──────────────────────────────────────────────────────────────────

// Backend may return lowercase statuses — normalise before any comparison
function norm(status: string | undefined | null): AppStatus {
  return (status?.toUpperCase() ?? "SUBMITTED") as AppStatus;
}

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

function matchColor(score: number) {
  if (score >= 90) return "text-emerald-700 bg-emerald-50 border-emerald-200";
  if (score >= 70) return "text-teal-700 bg-teal-50 border-teal-200";
  if (score >= 50) return "text-amber-700 bg-amber-50 border-amber-200";
  return "text-rose-700 bg-rose-50 border-rose-200";
}

function pipelineStep(appStatus: AppStatus, step: AppStatus): "done" | "current" | "upcoming" {
  const s = norm(appStatus);
  if (s === "REJECTED") return "upcoming";
  const appIdx = PIPELINE.indexOf(s);
  const stepIdx = PIPELINE.indexOf(step);
  if (stepIdx < appIdx) return "done";
  if (stepIdx === appIdx) return "current";
  return "upcoming";
}

// ── status stepper ───────────────────────────────────────────────────────────

function StatusStepper({ status, labels, rejectedMsg }: { status: AppStatus; labels: StatusLabels; rejectedMsg: string }) {
  const isRejected = norm(status) === "REJECTED";

  return (
    <div className="w-full">
      {isRejected ? (
        <div className="flex items-center gap-2">
          <XCircle size={14} className="text-rose-500 shrink-0" />
          <span className="text-xs text-rose-600 font-semibold">{rejectedMsg}</span>
        </div>
      ) : (
        <div className="flex items-center gap-0">
          {PIPELINE.map((step, i) => {
            const state = pipelineStep(status, step);
            return (
              <div key={step} className="flex items-center" style={{ flex: i < PIPELINE.length - 1 ? "1" : "none" }}>
                <div className="flex flex-col items-center gap-1 shrink-0">
                  {state === "done" ? (
                    <CheckCircle2 size={16} className="text-emerald-500" />
                  ) : state === "current" ? (
                    <div className="h-4 w-4 rounded-full bg-indigo-600 ring-2 ring-indigo-200 ring-offset-1" />
                  ) : (
                    <Circle size={16} className="text-slate-300" />
                  )}
                  <span className={`text-[10px] font-semibold whitespace-nowrap ${
                    state === "done" ? "text-emerald-600" :
                    state === "current" ? "text-indigo-700" :
                    "text-slate-400"
                  }`}>
                    {labels[step]}
                  </span>
                </div>
                {i < PIPELINE.length - 1 && (
                  <div className={`flex-1 h-px mx-1 mb-3 ${state === "done" ? "bg-emerald-300" : "bg-slate-200"}`} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── application card ─────────────────────────────────────────────────────────

function ApplicationCard({ app, labels, rejectedMsg, offerMsg }: { app: Application; labels: StatusLabels; rejectedMsg: string; offerMsg: string }) {
  const posted = timeAgo(app.appliedAt);
  const isRejected = norm(app.status) === "REJECTED";
  const isOffered = norm(app.status) === "OFFERED";

  return (
    <div className={`rounded-2xl border bg-white p-5 space-y-4 transition hover:shadow-md ${
      isRejected ? "border-rose-100 opacity-80" :
      isOffered ? "border-emerald-200 shadow-sm" :
      "border-slate-200"
    }`}>
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-400">
            <Briefcase size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={`font-bold text-slate-950 leading-tight ${isRejected ? "line-through text-slate-500" : ""}`}>
                {app.job.title}
              </h3>
              {isOffered && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  🎉 {offerMsg}
                </span>
              )}
            </div>
            <Link
              href={`/candidate/jobs/${app.job.id}`}
              className="text-sm text-slate-500 hover:text-indigo-600 hover:underline mt-0.5 block transition-colors"
            >
              {app.job.company ?? "—"}
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {app.matchScore != null && (
            <Badge className={`text-xs font-bold border ${matchColor(app.matchScore)}`}>
              {app.matchScore}% match
            </Badge>
          )}
          <Link
            href={`/candidate/jobs/${app.job.id}`}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
            title="View job"
          >
            <ExternalLink size={15} />
          </Link>
        </div>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
        {app.job.location && (
          <span className="flex items-center gap-1"><MapPin size={11} className="text-slate-400" />{app.job.location}</span>
        )}
        {app.job.type && (
          <span className="flex items-center gap-1"><Clock size={11} className="text-slate-400" />{TYPE_LABELS[app.job.type] ?? app.job.type}</span>
        )}
        {posted && (
          <span className="text-slate-400">Applied {posted}</span>
        )}
      </div>

      {/* Status stepper */}
      <StatusStepper status={app.status} labels={labels} rejectedMsg={rejectedMsg} />
    </div>
  );
}

// ── pipeline summary bar ─────────────────────────────────────────────────────

function PipelineBar({ applications, labels }: { applications: Application[]; labels: StatusLabels }) {
  const counts = useMemo(() => {
    const c: Record<AppStatus, number> = { SUBMITTED: 0, REVIEWED: 0, SHORTLISTED: 0, INTERVIEW: 0, OFFERED: 0, REJECTED: 0 };
    applications.forEach((a) => { const s = norm(a.status); c[s] = (c[s] ?? 0) + 1; });
    return c;
  }, [applications]);

  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
      {([...PIPELINE, "REJECTED"] as AppStatus[]).map((status) => {
        const isRejected = status === "REJECTED";
        const isOffered = status === "OFFERED";
        return (
          <div key={status} className={`rounded-xl border px-3 py-2.5 text-center ${
            isOffered ? "border-emerald-200 bg-emerald-50" :
            isRejected ? "border-rose-100 bg-rose-50" :
            "border-slate-200 bg-white"
          }`}>
            <p className={`text-2xl font-bold ${
              isOffered ? "text-emerald-700" :
              isRejected ? "text-rose-600" :
              "text-slate-900"
            }`}>{counts[status]}</p>
            <p className={`text-[11px] font-semibold mt-0.5 ${
              isOffered ? "text-emerald-600" :
              isRejected ? "text-rose-500" :
              "text-slate-500"
            }`}>{labels[status]}</p>
          </div>
        );
      })}
    </div>
  );
}

// ── page ─────────────────────────────────────────────────────────────────────

type Filter = AppStatus | "ALL" | "ACTIVE";

const ACTIVE_STATUSES: AppStatus[] = ["SUBMITTED", "REVIEWED", "SHORTLISTED", "INTERVIEW"];

export default function CandidateApplicationsPage() {
  const { api } = useAuth();
  const { tr } = useLocale();

  const FILTER_TABS: { id: Filter; label: string }[] = [
    { id: "ALL", label: tr("appAll") },
    { id: "ACTIVE", label: tr("appActive") },
    { id: "SHORTLISTED", label: tr("statusShortlisted") },
    { id: "INTERVIEW", label: tr("statusInterview") },
    { id: "OFFERED", label: tr("statusOffered") },
    { id: "REJECTED", label: tr("statusRejected") },
  ];

  const statusLabels: StatusLabels = {
    SUBMITTED: tr("statusSubmitted"),
    REVIEWED: tr("statusReviewed"),
    SHORTLISTED: tr("statusShortlisted"),
    INTERVIEW: tr("statusInterview"),
    OFFERED: tr("statusOffered"),
    REJECTED: tr("statusRejected"),
  };
  const rejectedMsg = tr("appRejectedMsg");
  const offerMsg = tr("appOfferReceived");
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    api.applicant.myApplications({ page: 1, limit: 200 })
      .then((res) => { if (!cancelled) { setApplications(res.data ?? []); } })
      .catch((e) => { if (!cancelled) setError(e instanceof ApiError ? e.message : "Failed to load applications."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [api]);

  const displayed = useMemo(() => {
    return applications.filter((a) => {
      const s = norm(a.status);
      if (filter === "ACTIVE" && !ACTIVE_STATUSES.includes(s)) return false;
      if (filter !== "ALL" && filter !== "ACTIVE" && s !== filter) return false;
      if (search) {
        const q = search.toLowerCase();
        return a.job.title?.toLowerCase().includes(q) || a.job.company?.toLowerCase().includes(q) || a.job.location?.toLowerCase().includes(q);
      }
      return true;
    });
  }, [applications, filter, search]);

  const filterCount = (f: Filter) => {
    if (f === "ALL") return applications.length;
    if (f === "ACTIVE") return applications.filter((a) => ACTIVE_STATUSES.includes(norm(a.status))).length;
    return applications.filter((a) => norm(a.status) === f).length;
  };

  return (
    <div className="max-w-4xl mx-auto pb-10 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{tr("appMyApplications")}</h1>
        <p className="text-sm text-slate-500 mt-1">{tr("appTrackStatus")}</p>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      )}

      {/* Pipeline summary */}
      {!loading && applications.length > 0 && (
        <PipelineBar applications={applications} labels={statusLabels} />
      )}

      {/* Filter + search bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex items-center gap-1 flex-wrap">
          {FILTER_TABS.map(({ id, label }) => {
            const count = filterCount(id);
            const active = filter === id;
            return (
              <button
                key={id}
                onClick={() => setFilter(id)}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                  active
                    ? id === "REJECTED"
                      ? "bg-rose-600 text-white border-rose-600"
                      : id === "OFFERED"
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-slate-950 text-white border-slate-950"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                }`}
              >
                {label}
                {count > 0 && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    active ? "bg-white/20" : "bg-slate-100 text-slate-600"
                  }`}>{count}</span>
                )}
              </button>
            );
          })}
          {filter !== "ALL" && (
            <button onClick={() => setFilter("ALL")} className="text-xs text-slate-400 hover:text-slate-600 px-2">
              <X size={13} />
            </button>
          )}
        </div>

        <div className="relative sm:ml-auto w-full sm:w-56">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            placeholder={tr("appSearchJobs")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>
      </div>

      {/* Applications list */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : displayed.length > 0 ? (
        <div className="space-y-4">
          {displayed.map((app) => (
            <ApplicationCard key={app.id} app={app} labels={statusLabels} rejectedMsg={rejectedMsg} offerMsg={offerMsg} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-14 text-center space-y-2">
          <p className="text-slate-700 font-semibold">
            {applications.length === 0 ? tr("appNoAppsYet") : tr("appNoMatchFilter")}
          </p>
          {applications.length === 0 && (
            <p className="text-sm text-slate-400">
              Browse <Link href="/candidate/jobs" className="text-indigo-600 hover:underline">recommended jobs</Link> and hit Apply.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
