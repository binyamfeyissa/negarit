"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, BadgeCheck, BriefcaseBusiness, CalendarClock, FileText, Globe2, Sparkles, Target, Users2, UserRoundSearch, TrendingUp, CheckCircle2, ClipboardList, Building2 } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PostJobDialog } from "@/components/recruiter/post-job-dialog";
import { useAuth } from "@/components/auth/auth-provider";
import type { AppStatus, Job, RecruiterProfile } from "@/lib/api/types";
import { ApiError } from "@/lib/api/types";

type RecruiterApplication = {
  id?: string;
  applicationId?: string;
  status: string;
  matchScore: number;
  appliedAt: string;
  coverLetter?: string | null;
  applicant?: {
    id?: string;
    fullName?: string;
    email?: string;
    parsedSkills?: string[];
    experienceYears?: number | null;
    resumeUrl?: string | null;
  };
  job: Job;
};

type DashboardJob = Job & {
  applications: RecruiterApplication[];
  avgMatchScore: number;
  lastActivity?: string | null;
  statusCounts: Record<AppStatus, number>;
};

const statusValues: AppStatus[] = ["SUBMITTED", "REVIEWED", "SHORTLISTED", "INTERVIEW", "OFFERED", "REJECTED"];

function normalizeStatus(status?: string | null): AppStatus | null {
  const upper = status?.toUpperCase();
  return upper && statusValues.includes(upper as AppStatus) ? (upper as AppStatus) : null;
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function statusClass(status: string) {
  switch (normalizeStatus(status)) {
    case "SUBMITTED":
      return "border-slate-200 text-slate-700 bg-slate-50";
    case "REVIEWED":
      return "border-blue-200 text-blue-700 bg-blue-50";
    case "SHORTLISTED":
      return "border-amber-200 text-amber-700 bg-amber-50";
    case "INTERVIEW":
      return "border-violet-200 text-violet-700 bg-violet-50";
    case "OFFERED":
      return "border-emerald-200 text-emerald-700 bg-emerald-50";
    case "REJECTED":
      return "border-rose-200 text-rose-700 bg-rose-50";
    default:
      return "border-slate-200 text-slate-700 bg-slate-50";
  }
}

function typeClass(type: string) {
  return type === "FULL_TIME"
    ? "bg-indigo-50 text-indigo-700 border-indigo-100"
    : type === "REMOTE"
      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
      : type === "CONTRACT"
        ? "bg-amber-50 text-amber-700 border-amber-100"
        : "bg-slate-50 text-slate-700 border-slate-100";
}

function prettyTypeLabel(type?: string) {
  switch (type) {
    case 'FULL_TIME':
      return 'Full time';
    case 'PART_TIME':
      return 'Part time';
    case 'REMOTE':
      return 'Remote';
    case 'CONTRACT':
      return 'Contract';
    case 'INTERN':
      return 'Intern';
    default:
      return type ?? '—';
  }
}

function formatSalary(min?: number | null, max?: number | null) {
  if (min == null && max == null) return null;
  if (min != null && max != null) return `${min.toLocaleString()} - ${max.toLocaleString()}`;
  if (min != null) return `${min.toLocaleString()}+`;
  return `${max?.toLocaleString()}`;
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="border-slate-200/80 shadow-sm bg-white/90 backdrop-blur-sm rounded-2xl">
      <CardContent className="p-5 flex h-full flex-col justify-between gap-5">
        <div className="flex items-start justify-between">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
            {icon}
          </div>
          <ArrowUpRight className="text-slate-300" size={18} />
        </div>
        <div>
          <p className="text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
          <p className="mt-1 text-sm font-medium text-slate-700">{title}</p>
          <p className="mt-2 text-xs leading-5 text-slate-500">{subtitle}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function DetailLine({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/10 py-3 last:border-none last:pb-0">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="text-sm font-medium text-white">{value}</span>
    </div>
  );
}

export default function RecruiterDashboard() {
  const { api } = useAuth();
  const [profile, setProfile] = useState<RecruiterProfile | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<RecruiterApplication[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const [profileRes, jobsRes] = await Promise.all([
          api.recruiter.me(),
          api.recruiter.myJobs({ page: 1, limit: 100 }),
        ]);

        const trackedJobs = jobsRes.data ?? [];
        const applicationBatches = await Promise.all(
          trackedJobs.map(async (job) => {
            try {
              const res = await api.recruiter.candidatesForJob(job.id, { page: 1, limit: 100 });
              return (res.data ?? []).map((application) => ({
                ...(application as Omit<RecruiterApplication, "job">),
                job,
              }));
            } catch {
              return [] as RecruiterApplication[];
            }
          }),
        );

        if (cancelled) return;
        setProfile(profileRes);
        setJobs(trackedJobs);
        setApplications(applicationBatches.flat());
        setError(null);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof ApiError ? e.message : "Failed to load recruiter dashboard.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [api, reloadKey]);

  const totalApplicants = useMemo(() => jobs.reduce((sum, job) => sum + (job.applicantCount || 0), 0), [jobs]);
  const totalJobs = jobs.length;
  const applicationsTracked = applications.length;
  const avgApplicantsPerJob = totalJobs > 0 ? Math.round(totalApplicants / totalJobs) : 0;
  const avgMatchScore = applicationsTracked > 0 ? Math.round(applications.reduce((sum, application) => sum + (application.matchScore || 0), 0) / applicationsTracked) : 0;

  const applicationsByJob = useMemo(() => {
    const map = new Map<string, RecruiterApplication[]>();
    applications.forEach((application) => {
      const jobId = application.job?.id;
      if (!jobId) return;
      const existing = map.get(jobId) ?? [];
      existing.push(application);
      map.set(jobId, existing);
    });
    return map;
  }, [applications]);

  const dashboardJobs = useMemo(() => {
    return jobs
      .map((job) => {
        const jobApplications = applicationsByJob.get(job.id) ?? [];
        const sortedApplications = [...jobApplications].sort((left, right) => new Date(right.appliedAt).getTime() - new Date(left.appliedAt).getTime());
        const avgMatch = jobApplications.length > 0
          ? Math.round(jobApplications.reduce((sum, application) => sum + (application.matchScore || 0), 0) / jobApplications.length)
          : 0;

        const statusCounts = statusValues.reduce((acc, status) => {
          acc[status] = jobApplications.filter((application) => normalizeStatus(application.status) === status).length;
          return acc;
        }, {} as Record<AppStatus, number>);

        return {
          ...job,
          applications: jobApplications,
          avgMatchScore: avgMatch,
          lastActivity: sortedApplications[0]?.appliedAt ?? null,
          statusCounts,
        };
      })
      .sort((left, right) => right.applicantCount - left.applicantCount);
  }, [applicationsByJob, jobs]);

  const topJobs = dashboardJobs.slice(0, 5);
  const topJob = topJobs[0] ?? null;
  const mostActiveJob = [...dashboardJobs].sort((left, right) => right.applications.length - left.applications.length)[0] ?? null;
  const topCandidate = [...applications].sort((left, right) => right.matchScore - left.matchScore)[0] ?? null;
  const recentApplications = [...applications]
    .sort((left, right) => new Date(right.appliedAt).getTime() - new Date(left.appliedAt).getTime())
    .slice(0, 6);

  const pipelineData = statusValues.map((status) => ({
    status,
    count: applications.filter((application) => normalizeStatus(application.status) === status).length,
  }));

  const maxPipelineCount = Math.max(1, ...pipelineData.map((item) => item.count));
  const maxJobApplicants = Math.max(1, ...dashboardJobs.map((job) => job.applicantCount));

  const weeklyTrend = useMemo(() => {
    const counts = new Map<string, number>();
    applications.forEach((application) => {
      const key = application.appliedAt ? application.appliedAt.slice(0, 10) : "";
      if (!key) return;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });

    return Array.from(counts.entries())
      .sort(([leftDate], [rightDate]) => leftDate.localeCompare(rightDate))
      .slice(-7)
      .map(([date, count]) => ({
        date,
        label: new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        count,
      }));
  }, [applications]);

  const dominantJobType = useMemo(() => {
    const typeCounts = jobs.reduce<Record<string, number>>((acc, job) => {
      acc[job.type] = (acc[job.type] ?? 0) + 1;
      return acc;
    }, {});
    return Object.entries(typeCounts).sort((left, right) => right[1] - left[1])[0] ?? null;
  }, [jobs]);

  const latestActivity = recentApplications[0] ?? null;
  const verifiedLabel = profile?.isVerified ? "Verified recruiter" : profile?.status ?? "—";
  const companyWebsite = profile?.website ?? profile?.industry ?? "—";
  const jobsWithActivity = dashboardJobs.filter((job) => job.applications.length > 0).length;

  if (loading && !profile) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 pb-10">
        <Card className="rounded-3xl border-slate-200 shadow-sm bg-white">
          <CardContent className="p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-6 w-56 rounded bg-slate-200" />
              <div className="h-4 w-80 rounded bg-slate-100" />
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 pt-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-28 rounded-2xl bg-slate-100" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative max-w-7xl mx-auto space-y-8 pb-10">
      <div className="absolute inset-x-0 top-0 -z-10 h-72 bg-linear-to-b from-indigo-50 via-white to-transparent" />

      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-linear-to-br from-slate-950 via-slate-900 to-indigo-950 text-white shadow-2xl">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative grid gap-8 p-8 md:p-10 xl:grid-cols-[1.35fr_0.85fr]">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-white/10 bg-white/10 text-white hover:bg-white/10">{verifiedLabel}</Badge>
              <Badge className="border-emerald-400/20 bg-emerald-400/15 text-emerald-100 hover:bg-emerald-400/15">
                {totalJobs} live roles
              </Badge>
              <Badge className="border-indigo-400/20 bg-indigo-400/15 text-indigo-100 hover:bg-indigo-400/15">
                {jobsWithActivity}/{totalJobs || 1} roles active
              </Badge>
            </div>

            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-300/80">Recruiter Command Center</p>
              <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
                {profile?.companyName ?? "Recruiter Dashboard"}
              </h1>
              <p className="max-w-3xl text-sm leading-7 text-slate-200 md:text-base">
                {profile
                  ? `${profile.companyName} is actively managing ${totalJobs} roles across ${totalApplicants} applicants, with ${applicationsTracked} tracked application records and an average match score of ${avgMatchScore}%.`
                  : "Track job performance, application flow, and recruiter activity from a single executive dashboard."}
              </p>
            </div>

            {/* <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Active Jobs</p>
                <p className="mt-2 text-2xl font-semibold text-white">{profile?.activeJobs ?? totalJobs}</p>
                <p className="mt-1 text-xs text-slate-300">Roles currently in market</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Applicants</p>
                <p className="mt-2 text-2xl font-semibold text-white">{totalApplicants}</p>
                <p className="mt-1 text-xs text-slate-300">Total applicant count across jobs</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Hires</p>
                <p className="mt-2 text-2xl font-semibold text-white">{profile?.totalHires ?? 0}</p>
                <p className="mt-1 text-xs text-slate-300">Confirmed hires from this account</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Average Match</p>
                <p className="mt-2 text-2xl font-semibold text-white">{avgMatchScore}%</p>
                <p className="mt-1 text-xs text-slate-300">Across tracked applications</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <PostJobDialog
                onSuccess={() => setReloadKey((value) => value + 1)}
                trigger={
                  <Button className="bg-white text-slate-950 hover:bg-slate-100 shadow-lg shadow-black/10">
                    + Post Job
                  </Button>
                }
              />
              <Link
                href="/recruiter/jobs"
                className="inline-flex h-8 items-center justify-center rounded-lg border border-white/20 bg-white/5 px-3 text-sm font-medium text-white transition hover:bg-white/10 hover:text-white"
              >
                View All Jobs
              </Link>
            </div> */}
          </div>

          {/* <Card className="border-white/10 bg-white/8 text-white shadow-xl backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Company Snapshot</p>
                  <h2 className="mt-2 text-xl font-semibold">{profile?.companyName ?? "—"}</h2>
                </div>
                <Badge className="border-emerald-400/20 bg-emerald-400/15 text-emerald-100 hover:bg-emerald-400/15">
                  {profile?.isVerified ? "Verified" : "Pending"}
                </Badge>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Industry</p>
                  <p className="mt-2 text-sm font-medium text-white">{profile?.industry ?? "—"}</p>
                </div>
                <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Employees</p>
                  <p className="mt-2 text-sm font-medium text-white">{profile?.employeeCount ?? "—"}</p>
                </div>
                <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Website</p>
                  <p className="mt-2 truncate text-sm font-medium text-white">{companyWebsite}</p>
                </div>
                <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Email</p>
                  <p className="mt-2 truncate text-sm font-medium text-white">{profile?.email ?? "—"}</p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-black/20 p-4 ring-1 ring-white/10">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-white">Recruitment pulse</p>
                  <Sparkles className="text-indigo-200" size={16} />
                </div>
                <div className="mt-4 space-y-1">
                  <DetailLine label="Most active job" value={mostActiveJob?.title ?? "—"} />
                  <DetailLine label="Top candidate match" value={topCandidate ? `${topCandidate.applicant?.fullName ?? "Unknown"} · ${topCandidate.matchScore}%` : "—"} />
                  <DetailLine label="Latest activity" value={latestActivity ? formatDateTime(latestActivity.appliedAt) : "—"} />
                  <DetailLine label="Primary job type" value={dominantJobType ? `${dominantJobType[0]} (${dominantJobType[1]})` : "—"} />
                </div>
              </div>
            </CardContent>
          </Card> */}
        </div>
      </section>

      {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-sm">{error}</div> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <StatCard title="Live jobs" value={profile?.activeJobs ?? totalJobs} subtitle="Open roles tracked in the backend" icon={<BriefcaseBusiness size={20} />} />
        <StatCard title="Applicants" value={totalApplicants} subtitle="Total applicant count across loaded jobs" icon={<Users2 size={20} />} />
        <StatCard title="Applications loaded" value={applicationsTracked} subtitle="Detailed application records retrieved" icon={<ClipboardList size={20} />} />
        <StatCard title="Hires" value={profile?.totalHires ?? 0} subtitle="Successful placements on this account" icon={<CheckCircle2 size={20} />} />
        <StatCard title="Avg applicants / job" value={avgApplicantsPerJob} subtitle="Applicant pressure per open role" icon={<Target size={20} />} />
        <StatCard title="Avg match score" value={`${avgMatchScore}%`} subtitle="Mean match score across applications" icon={<TrendingUp size={20} />} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
        <Card className="rounded-3xl border-slate-200 shadow-sm bg-white/95">
          <CardHeader className="border-b border-slate-100 pb-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg text-slate-950">Application Pipeline</CardTitle>
                <CardDescription>Counts by status across the application records loaded into this dashboard.</CardDescription>
              </div>
              <Badge className="border-indigo-100 bg-indigo-50 text-indigo-700 hover:bg-indigo-50">{applicationsTracked} tracked</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {applicationsTracked > 0 ? (
              <>
                <ChartContainer
                  config={{
                    count: { label: "Applications", color: "#4f46e5" },
                  }}
                  className="h-80 w-full"
                >
                  <BarChart data={pipelineData} margin={{ left: 0, right: 0, top: 8 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="status" tickLine={false} axisLine={false} tickMargin={10} />
                    <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
                    <ChartTooltip content={<ChartTooltipContent indicator="dot" />} cursor={false} />
                    <Bar dataKey="count" fill="var(--color-count)" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ChartContainer>

                <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {pipelineData.map((item) => {
                    const percent = Math.round((item.count / maxPipelineCount) * 100);
                    return (
                      <div key={item.status} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <Badge className={statusClass(item.status)}>{item.status}</Badge>
                          <span className="text-sm font-semibold text-slate-900">{item.count}</span>
                        </div>
                        <Progress value={percent} className="mt-3" />
                        <p className="mt-2 text-xs text-slate-500">{percent}% of the busiest stage</p>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
                <p className="text-sm font-medium text-slate-900">No application data yet</p>
                <p className="mt-1 text-sm text-slate-500">Once candidates apply, the pipeline chart and stage counts will populate here.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-200 shadow-sm bg-slate-950 text-white">
          <CardHeader className="border-b border-white/10 pb-4">
            <CardTitle className="text-lg text-white">Recruitment Health</CardTitle>
            <CardDescription className="text-slate-300">A compact summary of portfolio strength and current momentum.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Top job</p>
                    <p className="mt-2 text-sm font-semibold text-white">{topJob?.title ?? "—"}</p>
                  </div>
                  <Badge className={typeClass(topJob?.type ?? "FULL_TIME")}>{topJob?.type ?? "—"}</Badge>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center justify-between gap-4 text-slate-300">
                    <span>Applicants</span>
                    <span className="font-semibold text-white">{topJob?.applicantCount ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 text-slate-300">
                    <span>Average match</span>
                    <span className="font-semibold text-white">{topJob ? `${topJob.avgMatchScore}%` : "—"}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 text-slate-300">
                    <span>Last activity</span>
                    <span className="font-semibold text-white">{topJob?.lastActivity ? formatDateTime(topJob.lastActivity) : "—"}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Tracked job types</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["FULL_TIME", "PART_TIME", "REMOTE", "CONTRACT", "INTERN"].map((jobType) => {
                    const count = jobs.filter((job) => job.type === jobType).length;
                    return (
                      <Badge key={jobType} className="border-white/10 bg-white/10 text-white hover:bg-white/10">
                        {jobType} {count}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Current momentum</p>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-slate-300">Jobs with applicants</span>
                    <span className="font-semibold text-white">{jobsWithActivity}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-slate-300">Latest application</span>
                    <span className="font-semibold text-white">{latestActivity ? formatDateTime(latestActivity.appliedAt) : "—"}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-slate-300">Leading stage</span>
                    <span className="font-semibold text-white">
                      {pipelineData.sort((left, right) => right.count - left.count)[0]?.status ?? "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Card className="rounded-3xl border-slate-200 shadow-sm bg-white/95">
          <CardHeader className="border-b border-slate-100 pb-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg text-slate-950">Recent Applications</CardTitle>
                <CardDescription>Most recent candidate activity across the jobs loaded into this dashboard.</CardDescription>
              </div>
              <Badge className="border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-50">Latest {recentApplications.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {recentApplications.length > 0 ? (
              recentApplications.map((application) => (
                <div key={application.applicationId ?? application.id ?? `${application.job.id}-${application.appliedAt}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-indigo-200 hover:bg-white">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-base font-semibold text-slate-950">{application.applicant?.fullName ?? "Unknown candidate"}</p>
                      <p className="mt-1 text-sm text-slate-500">{application.job.title}</p>
                    </div>
                    <Badge className={statusClass(application.status)}>
                      {normalizeStatus(application.status) ?? application.status}
                    </Badge>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span>{application.applicant?.email ?? "No email provided"}</span>
                    <span>Match {application.matchScore}%</span>
                    <span>{formatDate(application.appliedAt)}</span>
                    <Link href={`/recruiter/jobs/${application.job.id}`} className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:underline">
                      Open job <ArrowUpRight size={14} />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
                No application records have been loaded yet.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-200 shadow-sm bg-white/95">
          <CardHeader className="border-b border-slate-100 pb-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg text-slate-950">Top Jobs</CardTitle>
                <CardDescription>Ranked by applicant volume with average match context.</CardDescription>
              </div>
              <Badge className="border-indigo-100 bg-indigo-50 text-indigo-700 hover:bg-indigo-50">{topJobs.length} ranked</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {topJobs.length > 0 ? (
              topJobs.map((job) => {
                const fill = Math.round((job.applicantCount / maxJobApplicants) * 100);
                const companyOrLocation = job.recruiter?.companyName ?? job.location ?? '—';
                const salaryLabel = formatSalary(job.salaryMin, job.salaryMax);
                return (
                  <Link key={job.id} href={`/recruiter/jobs/${job.id}`} className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-indigo-200 hover:bg-white">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-950">{job.title ?? 'Untitled role'}</p>
                        <p className="mt-1 text-sm text-slate-500">{companyOrLocation}</p>
                        <div className="mt-2 text-xs text-slate-500">
                          {salaryLabel ? <span className="mr-3">💰 {salaryLabel}</span> : null}
                          {job.deadline ? <span>⏰ Closes {formatDate(job.deadline)}</span> : null}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={typeClass(job.type)}>{prettyTypeLabel(job.type)}</Badge>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-500">
                      <div>
                        <span className="block text-slate-400">Applicants</span>
                        <span className="mt-1 block text-sm font-semibold text-slate-900">{job.applicantCount ?? 0}</span>
                      </div>
                      <div>
                        <span className="block text-slate-400">Average match</span>
                        <span className="mt-1 block text-sm font-semibold text-slate-900">{job.avgMatchScore ?? 0}%</span>
                      </div>
                    </div>

                    <Progress value={fill} className="mt-3" />

                    <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-500">
                      <span>{job.lastActivity ? `Last activity ${formatDate(job.lastActivity)}` : 'No application activity yet'}</span>
                      <span>{fill}% of top volume</span>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
                No jobs have been posted yet. Use the button above to create the first role.
              </div>
            )}

            {/* <div className="rounded-2xl bg-slate-950 p-5 text-white">
              <div className="flex items-center gap-3">
                <Building2 size={18} className="text-indigo-300" />
                <p className="text-sm font-semibold">Portfolio notes</p>
              </div>
              <div className="mt-4 space-y-2 text-sm text-slate-300">
                <p>{totalJobs} jobs currently tracked in the recruiter workspace.</p>
                <p>{jobsWithActivity} jobs already have candidate activity.</p>
                <p>{dominantJobType ? `${dominantJobType[0]} is the most common job type.` : "Job type distribution will appear once roles are posted."}</p>
              </div>
            </div> */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}