"use client";

import { useEffect, useState, use } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth/auth-provider";
import type { Job, SkillGapResult, SkillGapAnalysis, MockInterviewResult } from "@/lib/api/types";
import { ApiError } from "@/lib/api/types";
import { Briefcase, MapPin, DollarSign, Calendar, Users, ArrowLeft, BrainCircuit, MessageSquare, Coins, CheckCircle2, XCircle, AlertTriangle, Lightbulb } from "lucide-react";
import Link from "next/link";

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
    case "FULL_TIME": return "Full time";
    case "PART_TIME": return "Part time";
    case "REMOTE": return "Remote";
    case "CONTRACT": return "Contract";
    case "INTERN": return "Intern";
    default: return type ?? "—";
  }
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

function formatSalary(min?: number | null, max?: number | null) {
  if (min == null && max == null) return null;
  if (min != null && max != null) return `${min.toLocaleString()} - ${max.toLocaleString()}`;
  if (min != null) return `${min.toLocaleString()}+`;
  return `${max?.toLocaleString()}`;
}

function SkillGapSection({ title, items, icon, itemClass }: {
  title: string;
  items: string[];
  icon: React.ReactNode;
  itemClass: string;
}) {
  if (!items?.length) return null;
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {icon}
        <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
        <span className="text-xs text-slate-400 ml-auto">{items.length}</span>
      </div>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className={`text-sm leading-relaxed rounded-lg px-3 py-2 ${itemClass}`}>
            {item.replace(/\*\*/g, "")}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SkillGapCard({ result }: { result: SkillGapResult }) {
  const analysis = result.analysis;
  const isStructured = typeof analysis === "object" && analysis !== null;
  const structured = isStructured ? (analysis as SkillGapAnalysis) : null;

  return (
    <Card className="rounded-3xl border-indigo-100 shadow-sm bg-white">
      <CardHeader className="border-b border-indigo-50 pb-4">
        <CardTitle className="text-base text-indigo-900 flex items-center gap-2">
          <BrainCircuit size={16} /> Skill Gap Analysis — {result.jobTitle}
          <Badge className="ml-auto bg-indigo-50 text-indigo-700 border-indigo-100">
            {result.tokensUsed} token{result.tokensUsed !== 1 ? "s" : ""} used
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-5">
        {structured ? (
          <>
            <SkillGapSection
              title="Matching Skills"
              items={structured.matching_skills ?? []}
              icon={<CheckCircle2 size={15} className="text-emerald-600" />}
              itemClass="bg-emerald-50 text-emerald-800 border border-emerald-100"
            />
            <SkillGapSection
              title="Missing Skills"
              items={structured.missing_skills ?? []}
              icon={<XCircle size={15} className="text-rose-500" />}
              itemClass="bg-rose-50 text-rose-800 border border-rose-100"
            />
            <SkillGapSection
              title="Weak Areas"
              items={structured.weak_areas ?? []}
              icon={<AlertTriangle size={15} className="text-amber-500" />}
              itemClass="bg-amber-50 text-amber-800 border border-amber-100"
            />
            <SkillGapSection
              title="Recommendations"
              items={structured.recommendations ?? []}
              icon={<Lightbulb size={15} className="text-indigo-500" />}
              itemClass="bg-indigo-50 text-indigo-800 border border-indigo-100"
            />
          </>
        ) : (
          <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{String(analysis)}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function CandidateJobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { api } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [applyLoading, setApplyLoading] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");

  const [skillGap, setSkillGap] = useState<SkillGapResult | null>(null);
  const [skillGapLoading, setSkillGapLoading] = useState(false);

  const [mockInterview, setMockInterview] = useState<MockInterviewResult | null>(null);
  const [mockInterviewLoading, setMockInterviewLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const j = await api.jobs.get(id);
        if (cancelled) return;
        setJob(j);
        setError(null);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof ApiError ? e.message : "Failed to load job details.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id, api]);

  async function handleApply() {
    setError(null);
    setApplyLoading(true);
    try {
      await api.applicant.apply(id, { coverLetter: coverLetter || undefined });
      setSuccess("Application sent successfully!");
      setCoverLetter("");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to apply.");
    } finally {
      setApplyLoading(false);
    }
  }

  async function handleSkillGap() {
    setSkillGap(null);
    setSkillGapLoading(true);
    setError(null);
    try {
      const result = await api.jobs.skillGap(id);
      setSkillGap(result);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Skill gap analysis failed.");
    } finally {
      setSkillGapLoading(false);
    }
  }

  async function handleMockInterview() {
    setMockInterview(null);
    setMockInterviewLoading(true);
    setError(null);
    try {
      const result = await api.jobs.mockInterview(id);
      setMockInterview(result);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Mock interview generation failed.");
    } finally {
      setMockInterviewLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto pb-10">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-24 rounded bg-slate-200" />
          <div className="h-10 w-96 rounded bg-slate-200" />
          <div className="grid gap-4 md:grid-cols-3 pt-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 rounded-2xl bg-slate-100" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto">
        <Link href="/candidate/jobs" className="inline-flex items-center gap-2 text-indigo-600 hover:underline mb-4">
          <ArrowLeft size={18} /> Back to jobs
        </Link>
        <Card className="rounded-3xl border-slate-200 shadow-sm bg-white">
          <CardContent className="p-8 text-center">
            <p className="text-slate-900 font-semibold">Job not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const salaryLabel = formatSalary(job.salaryMin, job.salaryMax);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <Link href="/candidate/jobs" className="inline-flex items-center gap-2 text-indigo-600 hover:underline">
        <ArrowLeft size={18} /> Back to jobs
      </Link>

      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-linear-to-br from-slate-950 via-slate-900 to-indigo-950 text-white shadow-2xl">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative space-y-6 p-8 md:p-10">
          <div>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{job.title}</h1>
            <p className="mt-2 text-lg text-slate-200">{job.recruiter?.companyName ?? "Company"}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge className={typeClass(job.type)}>{prettyTypeLabel(job.type)}</Badge>
            {job.category && <Badge className="border-white/10 bg-white/10 text-white hover:bg-white/10">{job.category}</Badge>}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {job.location && <div className="flex items-center gap-2 text-slate-200"><MapPin size={18} /><span>{job.location}</span></div>}
            {salaryLabel && <div className="flex items-center gap-2 text-slate-200"><DollarSign size={18} /><span>{salaryLabel}</span></div>}
            {job.postedAt && <div className="flex items-center gap-2 text-slate-200"><Calendar size={18} /><span>Posted {formatDate(job.postedAt)}</span></div>}
            {job.deadline && <div className="flex items-center gap-2 text-slate-200"><Calendar size={18} /><span>Deadline {formatDate(job.deadline)}</span></div>}
            {job.applicantCount != null && <div className="flex items-center gap-2 text-slate-200"><Users size={18} /><span>{job.applicantCount} applicants</span></div>}
          </div>
        </div>
      </div>

      {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
      {success && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

      {/* AI tools bar */}
      <Card className="rounded-2xl border-indigo-100 bg-indigo-50/50 shadow-none">
        <CardContent className="p-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-indigo-700 text-sm font-semibold mr-2">
            <BrainCircuit size={18} /> AI Tools
            <span className="text-xs font-normal text-indigo-500 flex items-center gap-1"><Coins size={12} /> token-gated</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSkillGap}
            disabled={skillGapLoading}
            className="border-indigo-200 text-indigo-700 hover:bg-indigo-100"
          >
            <BrainCircuit size={14} className="mr-1" />
            {skillGapLoading ? "Analysing..." : "Skill Gap Analysis"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleMockInterview}
            disabled={mockInterviewLoading}
            className="border-indigo-200 text-indigo-700 hover:bg-indigo-100"
          >
            <MessageSquare size={14} className="mr-1" />
            {mockInterviewLoading ? "Generating..." : "Mock Interview"}
          </Button>
        </CardContent>
      </Card>

      {skillGap ? <SkillGapCard result={skillGap} /> : null}

      {mockInterview ? (
        <Card className="rounded-3xl border-violet-100 shadow-sm bg-white">
          <CardHeader className="border-b border-violet-50 pb-4">
            <CardTitle className="text-base text-violet-900 flex items-center gap-2">
              <MessageSquare size={16} /> Mock Interview Questions
              <Badge className="ml-auto bg-violet-50 text-violet-700 border-violet-100">{mockInterview.tokensUsed} token{mockInterview.tokensUsed !== 1 ? "s" : ""} used</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ol className="space-y-3 list-decimal list-inside">
              {mockInterview.questions.map((q, i) => (
                <li key={i} className="text-sm text-slate-700 leading-relaxed">{q}</li>
              ))}
            </ol>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
        <div className="space-y-6">
          <Card className="rounded-3xl border-slate-200 shadow-sm bg-white/95">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-lg text-slate-950">Job Description</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{job.description || "No description provided."}</p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-slate-200 shadow-sm bg-white/95">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-lg text-slate-950">Requirements</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {job.requirements?.length > 0 ? (
                <ul className="list-disc pl-6 space-y-2 text-sm text-slate-700">
                  {job.requirements.map((req, i) => <li key={i}>{req}</li>)}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">No requirements listed.</p>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-slate-200 shadow-sm bg-white/95">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-lg text-slate-950">Required Skills</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {job.requiredSkills?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {job.requiredSkills.map((skill, i) => (
                    <Badge key={i} className="border-indigo-100 bg-indigo-50 text-indigo-700 hover:bg-indigo-50">{skill}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No specific skills listed.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="rounded-3xl border-slate-200 shadow-sm bg-white/95 sticky top-20">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-base text-slate-950">Apply Now</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Cover Letter (optional)</label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Tell them why you're a great fit..."
                  className="w-full mt-2 border border-slate-200 rounded-lg p-3 text-sm bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-32"
                />
              </div>
              <Button onClick={handleApply} disabled={applyLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium h-10">
                {applyLoading ? "Applying..." : "Submit Application"}
              </Button>
              <p className="text-xs text-slate-500 text-center">By applying, you agree to share your profile with the recruiter.</p>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-slate-200 shadow-sm bg-slate-50/95">
            <CardHeader className="pb-4">
              <CardTitle className="text-base text-slate-950">Company</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3 text-sm">
              <div>
                <p className="text-slate-500">Name</p>
                <p className="font-semibold text-slate-900">{job.recruiter?.companyName ?? "—"}</p>
              </div>
              {job.recruiter?.industry && (
                <div>
                  <p className="text-slate-500">Industry</p>
                  <p className="font-semibold text-slate-900">{job.recruiter.industry}</p>
                </div>
              )}
              {job.recruiter?.website && (
                <div>
                  <p className="text-slate-500">Website</p>
                  <p className="font-semibold text-slate-900 truncate">{job.recruiter.website}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
