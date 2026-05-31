"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/components/auth/auth-provider";
import type { ApplicantProfile, Application } from "@/lib/api/types";
import { ApiError } from "@/lib/api/types";
import { fileUrl } from "@/lib/config";
import { Briefcase, Target, Clock, CheckCircle2, Upload, ArrowUpRight, FileText, Coins, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n";

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

function statusClass(status: string) {
  switch (status?.toUpperCase()) {
    case "SUBMITTED": return "border-slate-200 text-slate-700 bg-slate-50";
    case "REVIEWED": return "border-blue-200 text-blue-700 bg-blue-50";
    case "SHORTLISTED": return "border-amber-200 text-amber-700 bg-amber-50";
    case "INTERVIEW": return "border-violet-200 text-violet-700 bg-violet-50";
    case "OFFERED": return "border-emerald-200 text-emerald-700 bg-emerald-50";
    case "REJECTED": return "border-rose-200 text-rose-700 bg-rose-50";
    default: return "border-slate-200 text-slate-700 bg-slate-50";
  }
}

function StatCard({ title, value, subtitle, icon }: { title: string; value: string | number; subtitle: string; icon: React.ReactNode }) {
  return (
    <Card className="border-slate-200/80 shadow-sm bg-white/90 rounded-2xl">
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
  const { tr } = useLocale();
  const [profile, setProfile] = useState<ApplicantProfile | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingResume, setUploadingResume] = useState(false);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  async function load() {
    setError(null);
    try {
      const [p, a] = await Promise.all([
        api.applicant.me(),
        api.applicant.myApplications({ page: 1, limit: 50 }),
      ]);
      setProfile(p);
      setApplications(a.data ?? []);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleResumeUpload(file: File) {
    setUploadingResume(true);
    setError(null);
    try {
      await api.applicant.uploadResume(file);
      await load();
      setSuccess("Resume uploaded!");
      setTimeout(() => setSuccess(null), 4000);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Resume upload failed.");
    } finally {
      setUploadingResume(false);
      if (resumeInputRef.current) resumeInputRef.current.value = "";
    }
  }

  const totalApplications = applications.length;
  const avgMatchScore = totalApplications > 0
    ? Math.round(applications.reduce((sum, app) => sum + (app.matchScore ?? 0), 0) / totalApplications)
    : 0;
  const offeredCount = applications.filter((a) => a.status?.toUpperCase() === "OFFERED").length;
  const interviewCount = applications.filter((a) => a.status?.toUpperCase() === "INTERVIEW").length;

  const recentApplications = useMemo(
    () => [...applications].sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()).slice(0, 6),
    [applications]
  );
  const topMatches = useMemo(
    () => [...applications].sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0)).slice(0, 5),
    [applications]
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 pb-10">
        <div className="animate-pulse space-y-4">
          <div className="h-48 rounded-3xl bg-slate-100" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 rounded-2xl bg-slate-100" />)}
          </div>
        </div>
      </div>
    );
  }

  const completeness = profile?.completeness ?? 0;
  const resumeUrl = fileUrl(profile?.resume_url);

  return (
    <div className="relative max-w-7xl mx-auto space-y-8 pb-10">
      <div className="absolute inset-x-0 top-0 -z-10 h-72 bg-linear-to-b from-emerald-50 via-white to-transparent" />

      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-linear-to-br from-slate-950 via-slate-900 to-emerald-950 text-white shadow-2xl">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl" />
        <div className="relative space-y-5 p-8 md:p-10">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.25em] text-slate-300/80">{tr("cdWelcome")},</p>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-5xl">{profile?.full_name ?? "Candidate"}</h1>
            <p className="max-w-2xl text-sm leading-7 text-slate-200 md:text-base">
              {totalApplications > 0
                ? `${totalApplications} application${totalApplications !== 1 ? "s" : ""} submitted · ${avgMatchScore}% avg match · ${interviewCount} interview${interviewCount !== 1 ? "s" : ""}`
                : "Browse open jobs and start applying to find your next role."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-emerald-400/20 bg-emerald-400/15 text-emerald-100 hover:bg-emerald-400/15">
              {completeness}% {tr("cdProfileComplete")}
            </Badge>
            {profile?.tokens != null && (
              <Badge className="border-amber-400/20 bg-amber-400/15 text-amber-100 hover:bg-amber-400/15 flex items-center gap-1">
                <Coins size={11} /> {profile.tokens} {tr("tokens")}
              </Badge>
            )}
            {profile?.is_verified && (
              <Badge className="border-emerald-400/20 bg-emerald-400/15 text-emerald-100 hover:bg-emerald-400/15">{tr("statusVerified")}</Badge>
            )}
            {offeredCount > 0 && (
              <Badge className="border-amber-400/20 bg-amber-400/15 text-amber-100 hover:bg-amber-400/15">
                {offeredCount} offer{offeredCount !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>
        </div>
      </section>

      {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
      {success && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard title={tr("cdTotalApps")} value={totalApplications} subtitle={tr("cdTotalSubmitted")} icon={<Briefcase size={20} />} />
        <StatCard title={tr("cdAvgMatch")} value={`${avgMatchScore}%`} subtitle={tr("cdAcrossApps")} icon={<Target size={20} />} />
        <StatCard title={tr("cdActiveInterviews")} value={interviewCount} subtitle={tr("cdActiveRounds")} icon={<Clock size={20} />} />
        <StatCard title={tr("cdOffers")} value={offeredCount} subtitle={tr("cdOffersReceived")} icon={<CheckCircle2 size={20} />} />
      </div>

      {/* Profile completeness + resume */}
      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.85fr]">
        <Card className="rounded-3xl border-slate-200 shadow-sm bg-white/95">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-lg text-slate-950">{tr("cdProfileCompleteness")}</CardTitle>
            <CardDescription>{tr("cdProfileDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{tr("cdOverallCompleteness")}</span>
                <span className="font-bold text-slate-900">{completeness}%</span>
              </div>
              <Progress value={completeness} className="h-3" />
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: tr("cdFieldFullName"), done: !!profile?.full_name },
                { label: tr("cdFieldPhone"), done: !!profile?.phone },
                { label: tr("cdFieldExperience"), done: profile?.experience_years != null },
                { label: tr("cdFieldRoles"), done: (profile?.preferred_roles?.length ?? 0) > 0 },
                { label: tr("cdFieldSkills"), done: (profile?.parsed_skills?.length ?? 0) > 0 },
                { label: tr("cdFieldResume"), done: !!profile?.resume_url },
                { label: tr("cdFieldVerDoc"), done: !!profile?.verification_doc_url },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full shrink-0 ${item.done ? "bg-emerald-500" : "bg-slate-200"}`} />
                  <span className={item.done ? "text-slate-600" : "text-slate-400"}>{item.label}</span>
                </div>
              ))}
            </div>

            <Link href="/candidate/profile">
              <Button variant="outline" className="w-full">
                {completeness < 100 ? tr("completeProfile") : tr("profile")}
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-200 shadow-sm bg-white/95">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-lg text-slate-950">{tr("cdResumeCard")}</CardTitle>
            <CardDescription>Your CV for AI-powered matching</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {resumeUrl ? (
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 px-4 py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <FileText size={18} className="text-indigo-600 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-indigo-900">Resume on file</p>
                    {profile?.resume_score != null && (
                      <p className="text-xs text-indigo-600">{tr("cdResumeScore")}: {profile.resume_score}%</p>
                    )}
                  </div>
                </div>
                <a href={resumeUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-800 shrink-0">
                  <ExternalLink size={16} />
                </a>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 text-center">
                {tr("cdNoResume")}
              </div>
            )}

            {profile?.parsed_skills && profile.parsed_skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {profile.parsed_skills.slice(0, 8).map((skill) => (
                  <span key={skill} className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs border border-indigo-100">{skill}</span>
                ))}
                {profile.parsed_skills.length > 8 && (
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-xs">+{profile.parsed_skills.length - 8} more</span>
                )}
              </div>
            )}

            <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-4 text-center">
              <label className="inline-block cursor-pointer">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={uploadingResume}
                  onClick={() => resumeInputRef.current?.click()}
                >
                  <Upload size={14} className="mr-2" />
                  {uploadingResume ? tr("loadingText") : resumeUrl ? tr("cdReplaceResume") : tr("cdUploadResume")}
                </Button>
                <input
                  ref={resumeInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void handleResumeUpload(f);
                  }}
                />
              </label>
              <p className="text-xs text-slate-400 mt-2">PDF, DOC, DOCX</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Applications */}
      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <Card className="rounded-3xl border-slate-200 shadow-sm bg-white/95">
          <CardHeader className="border-b border-slate-100 pb-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg text-slate-950">{tr("cdRecentApps")}</CardTitle>
                <CardDescription>{tr("cdLatestActivity")}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-50">{totalApplications} total</Badge>
                <Link href="/candidate/jobs">
                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">{tr("cdViewJobs")}</Button>
                </Link>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            {recentApplications.length > 0 ? (
              recentApplications.map((app) => (
                <Link
                  key={app.id}
                  href={`/candidate/jobs/${app.job.id}`}
                  className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-indigo-200 hover:bg-white"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-base font-semibold text-slate-950">{app.job.title}</p>
                      <p className="mt-1 text-sm text-slate-500">{app.job.company ?? app.job.location ?? "—"}</p>
                    </div>
                    <Badge className={statusClass(app.status)}>{app.status}</Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    {app.matchScore != null && <span>{tr("cdMatchScore")} {app.matchScore}%</span>}
                    <span>{formatDate(app.appliedAt)}</span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
                {tr("cdNoApps")}{" "}
                <Link href="/candidate/jobs" className="text-indigo-600 hover:underline">{tr("cdViewJobs")} →</Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-200 shadow-sm bg-white/95">
          <CardHeader className="border-b border-slate-100 pb-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg text-slate-950">{tr("cdTopMatches")}</CardTitle>
                <CardDescription>{tr("cdBestScoring")}</CardDescription>
              </div>
              <Badge className="border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-50">{topMatches.length} ranked</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {topMatches.length > 0 ? (
              topMatches.map((app) => (
                <Link
                  key={app.id}
                  href={`/candidate/jobs/${app.job.id}`}
                  className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-indigo-200 hover:bg-white"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-950">{app.job.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{app.job.company ?? app.job.location ?? "—"}</p>
                    </div>
                    <Badge className="border-emerald-100 bg-emerald-50 text-emerald-700 shrink-0">{app.matchScore ?? 0}%</Badge>
                  </div>
                  <Progress value={app.matchScore ?? 0} className="mt-3" />
                  <p className="mt-2 text-xs text-slate-500">Status: <span className="font-semibold text-slate-900">{app.status}</span></p>
                </Link>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
                {tr("cdNoApps")}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
