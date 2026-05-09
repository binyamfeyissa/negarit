"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/components/auth/auth-provider";
import type { ApplicantProfile, Application, Job } from "@/lib/api/types";
import { ApiError } from "@/lib/api/types";
import { Briefcase, Target, Clock, CheckCircle2, Upload, ArrowUpRight } from "lucide-react";
import Link from "next/link";

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

function statusClass(status: string) {
  const upper = status?.toUpperCase();
  switch (upper) {
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

export default function CandidateDashboardPage() {
  const { api } = useAuth();
  const [profile, setProfile] = useState<ApplicantProfile | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [resumeStatus, setResumeStatus] = useState<{ parseStatus: string; resumeScore: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [applyLoading, setApplyLoading] = useState(false);

  async function load() {
    setError(null);
    try {
      const [p, a, j, rs] = await Promise.all([
        api.applicant.me(),
        api.applicant.myApplications({ page: 1, limit: 50 }),
        api.jobs.list({ page: 1, limit: 50 }),
        api.applicant.resumeStatus().catch(() => null),
      ]);
      setProfile(p);
      setApplications(a.data);
      setJobs(j.data);
      if (rs) setResumeStatus({ parseStatus: rs.parseStatus, resumeScore: rs.resumeScore });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onUploadResume(file: File) {
    setError(null);
    try {
      await api.applicant.uploadResume(file);
      await load();
      setSuccess("Resume uploaded successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Resume upload failed.");
    }
  }

  async function apply() {
    if (!selectedJobId) return;
    setError(null);
    setApplyLoading(true);
    try {
      await api.applicant.apply(selectedJobId, { coverLetter: coverLetter || undefined });
      setCoverLetter("");
      setSelectedJobId("");
      await load();
      setSuccess("Application sent successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to apply.");
    } finally {
      setApplyLoading(false);
    }
  }

  const totalApplications = applications.length;
  const avgMatchScore = totalApplications > 0 ? Math.round(applications.reduce((sum, app) => sum + app.matchScore, 0) / totalApplications) : 0;
  const offeredCount = applications.filter((a) => a.status?.toUpperCase() === "OFFERED").length;
  const interviewCount = applications.filter((a) => a.status?.toUpperCase() === "INTERVIEW").length;

  const recentApplications = [...applications]
    .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
    .slice(0, 6);

  const topMatches = [...applications]
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5);

  if (loading) {
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
      <div className="absolute inset-x-0 top-0 -z-10 h-72 bg-linear-to-b from-emerald-50 via-white to-transparent" />

      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-linear-to-br from-slate-950 via-slate-900 to-emerald-950 text-white shadow-2xl">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl" />
        <div className="relative space-y-6 p-8 md:p-10">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.25em] text-slate-300/80">Welcome back,</p>
            <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
              {profile?.full_name ?? "Candidate"}
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-slate-200 md:text-base">
              {profile
                ? `Track your applications, resume quality, and job matches. ${totalApplications} applications submitted with an average match of ${avgMatchScore}%.`
                : "Your dashboard to track applications and job opportunities."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-emerald-400/20 bg-emerald-400/15 text-emerald-100 hover:bg-emerald-400/15">
              Profile {profile?.completeness ?? 0}% complete
            </Badge>
            <Badge className="border-white/10 bg-white/10 text-white hover:bg-white/10">
              Resume: {resumeStatus?.parseStatus ?? "Not uploaded"}
            </Badge>
            {offeredCount > 0 && (
              <Badge className="border-emerald-400/20 bg-emerald-400/15 text-emerald-100 hover:bg-emerald-400/15">
                {offeredCount} offer{offeredCount !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>
      </section>

      {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 shadow-sm">{error}</div>}
      {success && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 shadow-sm">{success}</div>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Applications"
          value={totalApplications}
          subtitle="Total applications submitted"
          icon={<Briefcase size={20} />}
        />
        <StatCard
          title="Avg Match"
          value={`${avgMatchScore}%`}
          subtitle="Average match score across apps"
          icon={<Target size={20} />}
        />
        <StatCard
          title="Interviews"
          value={interviewCount}
          subtitle="Pending interview rounds"
          icon={<Clock size={20} />}
        />
        <StatCard
          title="Offers"
          value={offeredCount}
          subtitle="Job offers received"
          icon={<CheckCircle2 size={20} />}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
        <Card className="rounded-3xl border-slate-200 shadow-sm bg-white/95">
          <CardHeader className="border-b border-slate-100 pb-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg text-slate-950">Apply to Jobs</CardTitle>
                <CardDescription>Find and apply to roles that match your skills</CardDescription>
              </div>
              <Badge className="border-indigo-100 bg-indigo-50 text-indigo-700 hover:bg-indigo-50">{jobs.length} available</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Select a job</label>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full mt-2 border border-slate-200 rounded-lg h-10 px-3 text-sm bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">— Choose a role —</option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title} @ {j.recruiter?.companyName ?? "Company"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">Cover Letter (optional)</label>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Tell them why you're a great fit..."
                className="w-full mt-2 border border-slate-200 rounded-lg p-3 text-sm bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-24"
              />
            </div>

            <Button
              onClick={() => void apply()}
              disabled={!selectedJobId || applyLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium h-10"
            >
              {applyLoading ? "Applying..." : "Submit Application"}
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-200 shadow-sm bg-white/95">
          <CardHeader className="border-b border-slate-100 pb-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg text-slate-950">Upload Resume</CardTitle>
                <CardDescription>Keep your resume current</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
              <Upload size={24} className="mx-auto text-slate-400 mb-2" />
              <label className="block cursor-pointer">
                <span className="text-sm font-medium text-indigo-600 hover:underline">Click to upload</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void onUploadResume(f);
                  }}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-slate-500 mt-2">PDF, DOC, DOCX up to 10MB</p>
            </div>

            {resumeStatus && (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <div>
                  <p className="text-xs text-slate-400">Parse Status</p>
                  <p className="text-sm font-semibold text-slate-900 mt-1">{resumeStatus.parseStatus}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-2">Resume Score</p>
                  <div className="flex items-center gap-2">
                    <Progress value={resumeStatus.resumeScore} className="flex-1" />
                    <span className="text-sm font-semibold text-slate-900">{resumeStatus.resumeScore}%</span>
                  </div>
                </div>
              </div>
            )}

            <Link href="/candidate/profile" className="inline-block w-full">
              <Button variant="outline" className="w-full">
                Complete Profile
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Card className="rounded-3xl border-slate-200 shadow-sm bg-white/95">
          <CardHeader className="border-b border-slate-100 pb-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg text-slate-950">Recent Applications</CardTitle>
                <CardDescription>Latest activity across your job applications</CardDescription>
              </div>
              <Badge className="border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-50">Latest {recentApplications.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {recentApplications.length > 0 ? (
              recentApplications.map((app) => (
                <div key={app.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-indigo-200 hover:bg-white">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-base font-semibold text-slate-950">{app.job.title}</p>
                      <p className="mt-1 text-sm text-slate-500">{app.job.company ?? app.job.location}</p>
                    </div>
                    <Badge className={statusClass(app.status)}>
                      {app.status}
                    </Badge>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span>Match {app.matchScore}%</span>
                    <span>{formatDate(app.appliedAt)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
                No applications yet. Start applying to jobs!
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-200 shadow-sm bg-white/95">
          <CardHeader className="border-b border-slate-100 pb-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg text-slate-950">Top Matches</CardTitle>
                <CardDescription>Your best application matches</CardDescription>
              </div>
              <Badge className="border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-50">{topMatches.length} ranked</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {topMatches.length > 0 ? (
              topMatches.map((app) => (
                <div key={app.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-indigo-200 hover:bg-white">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-950">{app.job.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{app.job.company ?? app.job.location}</p>
                    </div>
                    <Badge className="border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                      {app.matchScore}%
                    </Badge>
                  </div>

                  <Progress value={app.matchScore} className="mt-3" />

                  <div className="mt-3 text-xs text-slate-500">
                    Status: <span className="font-semibold text-slate-900">{app.status}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
                No applications yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
