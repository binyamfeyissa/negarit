"use client";

import { useEffect, useState, use } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Search, ChevronDown, ExternalLink, Loader, ClipboardList } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/components/auth/auth-provider";
import type { Job, AppStatus, InterviewType, McqsResult } from "@/lib/api/types";
import { ApiError } from "@/lib/api/types";
import { fileUrl } from "@/lib/config";
import { ToastContainer, Toast } from "@/components/ui/toast";
import { EditJobDialog } from "@/components/recruiter/edit-job-dialog";

type ApplicationDetail = {
  id?: string;
  applicationId?: string;
  status: string;
  matchScore: number;
  matchDetails?: { method: string; raw_score: number };
  coverLetter?: string | null;
  appliedAt: string;
  applicant?: {
    id: string;
    fullName: string;
    email: string;
    parsedSkills?: string[];
    experienceYears?: number | null;
    resumeUrl?: string | null;
  };
};

type AnyApplication = ApplicationDetail;

const statusValues: AppStatus[] = ["SUBMITTED", "REVIEWED", "SHORTLISTED", "INTERVIEW", "OFFERED", "REJECTED"];

function normalizeStatus(status?: string | null): AppStatus | null {
  const value = status?.toUpperCase();
  return value && statusValues.includes(value as AppStatus) ? (value as AppStatus) : null;
}

function statusBadge(status: string) {
  const normalized = normalizeStatus(status);
  const color =
    normalized === "REJECTED"
      ? "border-red-200 text-red-600 bg-red-50"
      : normalized === "OFFERED"
        ? "border-emerald-200 text-emerald-700 bg-emerald-50"
        : "border-orange-200 text-orange-600 bg-orange-50";
  return (
    <Badge variant="outline" className={`${color} gap-1.5 shadow-none rounded-md px-2.5`}>
      <div className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
      {normalized ?? status}
    </Badge>
  );
}

export default function JobApplicationsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { api } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [apps, setApps] = useState<AnyApplication[]>([]);
  const [q, setQ] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<AppStatus | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [interviewModal, setInterviewModal] = useState<{ appId: string; name: string } | null>(null);
  const [interviewForm, setInterviewForm] = useState<{ type: InterviewType; scheduledTime: string; meetingLink: string; location: string }>({ type: "VIDEO", scheduledTime: "", meetingLink: "", location: "" });
  const [feedbackModal, setFeedbackModal] = useState<{ interviewId: string; appId: string } | null>(null);
  const [feedbackForm, setFeedbackForm] = useState({ score: 3, feedback: "" });
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [mcqs, setMcqs] = useState<McqsResult | null>(null);
  const [mcqsLoading, setMcqsLoading] = useState(false);
  const [noteModal, setNoteModal] = useState<{ type: "move" | "bulk"; status: AppStatus; appIds: string[] } | null>(null);
  const [noteInput, setNoteInput] = useState("");

  const addToast = (message: string, type: "success" | "error" | "info" = "success") => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [j, list] = await Promise.all([
          api.jobs.get(id),
          api.recruiter.candidatesForJob(id, { page: 1, limit: 50 }),
        ]);
        if (cancelled) return;
        setJob(j);
        setApps((list.data ?? []) as ApplicationDetail[]);
        setError(null);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof ApiError ? e.message : "Failed to load applications.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [api, id]);

  const filtered = apps.filter((a) => {
    const normalizedStatus = normalizeStatus(a.status);
    if (statusFilter && normalizedStatus !== statusFilter) return false;
    if (!q.trim()) return true;
    const hay = `${a.id ?? ""} ${normalizedStatus ?? a.status ?? ""} ${a.applicant?.fullName ?? ""} ${a.applicant?.email ?? ""}`.toLowerCase();
    return hay.includes(q.trim().toLowerCase());
  });

  async function move(applicationId: string, status: AppStatus, note?: string) {
    try {
      setLoading(true);
      await api.recruiter.moveStage(applicationId, { status, note: note || "" });
      const list = await api.recruiter.candidatesForJob(id, { page: 1, limit: 50 });
      setApps((list.data ?? []) as ApplicationDetail[]);
      addToast(`Candidate moved to ${status}`, "success");
      setError(null);
    } catch (e) {
      const errorMsg = e instanceof ApiError ? e.message : "Failed to update status.";
      setError(errorMsg);
      addToast(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  }

  async function bulkMove(status: AppStatus, note?: string) {
    if (selected.size === 0) {
      const msg = "Please select at least one application.";
      setError(msg);
      addToast(msg, "error");
      return;
    }
    try {
      setBulkLoading(true);
      await api.recruiter.bulkMove(id, { applicationIds: Array.from(selected), status, note: note || "" });
      const list = await api.recruiter.candidatesForJob(id, { page: 1, limit: 50 });
      setApps((list.data ?? []) as ApplicationDetail[]);
      setSelected(new Set());
      addToast(`${selected.size} candidates moved to ${status}`, "success");
      setError(null);
    } catch (e) {
      const errorMsg = e instanceof ApiError ? e.message : "Failed to bulk move applications.";
      setError(errorMsg);
      addToast(errorMsg, "error");
    } finally {
      setBulkLoading(false);
    }
  }

  async function scheduleInterview() {
    if (!interviewModal) return;
    try {
      setLoading(true);
      await api.recruiter.scheduleInterview(interviewModal.appId, {
        type: interviewForm.type,
        scheduledTime: interviewForm.scheduledTime,
        meetingLink: interviewForm.meetingLink || undefined,
        location: interviewForm.location || undefined,
      });
      const list = await api.recruiter.candidatesForJob(id, { page: 1, limit: 50 });
      setApps((list.data ?? []) as ApplicationDetail[]);
      setInterviewModal(null);
      setInterviewForm({ type: "VIDEO", scheduledTime: "", meetingLink: "", location: "" });
      addToast("Interview scheduled successfully", "success");
      setError(null);
    } catch (e) {
      const errorMsg = e instanceof ApiError ? e.message : "Failed to schedule interview.";
      setError(errorMsg);
      addToast(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  }

  async function submitFeedback() {
    if (!feedbackModal) return;
    try {
      setLoading(true);
      await api.recruiter.updateInterview(feedbackModal.interviewId, {
        score: feedbackForm.score,
        feedback: feedbackForm.feedback,
      });
      const list = await api.recruiter.candidatesForJob(id, { page: 1, limit: 50 });
      setApps((list.data ?? []) as ApplicationDetail[]);
      setFeedbackModal(null);
      setFeedbackForm({ score: 3, feedback: "" });
      addToast("Interview feedback submitted successfully", "success");
      setError(null);
    } catch (e) {
      const errorMsg = e instanceof ApiError ? e.message : "Failed to submit feedback.";
      setError(errorMsg);
      addToast(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  }

  async function generateMcqs() {
    setMcqs(null);
    setMcqsLoading(true);
    try {
      const result = await api.jobs.mcqs(id);
      setMcqs(result);
      addToast("MCQs generated", "success");
    } catch (e) {
      addToast(e instanceof ApiError ? e.message : "Failed to generate MCQs.", "error");
    } finally {
      setMcqsLoading(false);
    }
  }

  const toggleSelect = (appId: string) => {
    const newSet = new Set(selected);
    if (newSet.has(appId)) {
      newSet.delete(appId);
    } else {
      newSet.add(appId);
    }
    setSelected(newSet);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
          <p className="text-sm text-gray-500 mt-1">Manage applications for this job.</p>
        </div>
      </div>

      <Card className="border-none shadow-sm rounded-xl overflow-hidden text-white bg-[#2c1d8c]">
        <CardContent className="p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shrink-0">
              <div className="w-8 h-8 rounded-full border-4 border-yellow-400 border-l-red-400 border-t-red-400"></div>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1">{job?.title ?? "Loading..."}</h2>
              <p className="text-indigo-200 mb-2 font-medium">{job?.location ?? "—"}</p>
              <div className="flex items-center gap-4 text-sm font-medium text-white/90">
                <span>{apps.length} applicants</span>
              </div>
            </div>
          </div>
          {job ? (
            <EditJobDialog
              job={job}
              onSaved={setJob}
              trigger={
                <Button className="font-bold text-[#2c1d8c] bg-white hover:bg-gray-100 rounded-lg px-8">
                  Edit Job
                </Button>
              }
            />
          ) : (
            <Button disabled className="font-bold text-[#2c1d8c] bg-white hover:bg-gray-100 rounded-lg px-8">
              Edit Job
            </Button>
          )}
        </CardContent>
      </Card>

      {error ? <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">{error}</div> : null}

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => void generateMcqs()}
          disabled={mcqsLoading}
          className="flex items-center gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50"
        >
          <ClipboardList size={14} />
          {mcqsLoading ? "Generating…" : "Generate Screening MCQs"}
        </Button>
      </div>

      {mcqs ? (
        <Card className="border-indigo-100 rounded-2xl shadow-sm bg-white">
          <div className="p-4 border-b border-indigo-50 flex items-center justify-between">
            <h3 className="text-sm font-bold text-indigo-900 flex items-center gap-2"><ClipboardList size={14} /> Screening MCQs for {mcqs.jobTitle}</h3>
            <button onClick={() => setMcqs(null)} className="text-xs text-slate-400 hover:text-slate-700">Dismiss</button>
          </div>
          <div className="p-4 space-y-4">
            {mcqs.questions.map((q, i) => (
              <div key={i} className="rounded-xl border border-indigo-50 bg-indigo-50/40 p-4">
                <p className="text-sm font-semibold text-slate-900 mb-2">{i + 1}. {q.question}</p>
                {q.options && q.options.length > 0 ? (
                  <ul className="space-y-1">
                    {q.options.map((opt, j) => (
                      <li key={j} className={`text-xs px-3 py-1.5 rounded-lg ${q.answer === opt ? "bg-emerald-50 text-emerald-800 font-semibold border border-emerald-100" : "text-slate-600"}`}>
                        {opt}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {q.answer && !q.options?.length ? (
                  <p className="text-xs text-emerald-700 mt-2 font-medium">Answer: {q.answer}</p>
                ) : null}
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      <Card className="border-gray-100 shadow-sm rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-gray-900">Applicants</h3>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name, email, or application id" className="pl-9 h-9 border-gray-200" />
            </div>
          </div>
        </div>

        {/* Status Filters */}
        <div className="p-4 border-b border-gray-50 flex flex-wrap gap-2">
          <Button
            variant={statusFilter === null ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(null)}
            className="text-xs"
          >
            All ({apps.length})
          </Button>
          {statusValues.map((status) => {
            const count = apps.filter((a) => normalizeStatus(a.status) === status).length;
            return (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(statusFilter === status ? null : status)}
                className="text-xs"
              >
                {status} ({count})
              </Button>
            );
          })}
        </div>

        {/* Bulk Actions */}
        {selected.size > 0 && (
          <div className="p-4 border-b border-gray-50 bg-indigo-50 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900">{selected.size} selected</span>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button size="sm" variant="default" disabled={bulkLoading} />}>
                  {bulkLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                  Move Selected
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white border-gray-100 shadow-lg">
                  {(["REVIEWED", "SHORTLISTED", "INTERVIEW", "OFFERED", "REJECTED"] as AppStatus[]).map((status) => (
                    <DropdownMenuItem
                      key={status}
                      className="cursor-pointer"
                        onClick={() => setNoteModal({ type: "bulk", status, appIds: Array.from(selected) })}
                    >
                      Move to {status}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button size="sm" variant="outline" onClick={() => setSelected(new Set())}>
                Clear
              </Button>
            </div>
          </div>
        )}

        <div className="p-4 space-y-3">
          {filtered.map((a, idx) => {
            const appId = a.applicationId || a.id || `app-${idx}`;
            const isSelected = selected.has(appId);
            return (
            <div key={appId} className="border border-gray-100 rounded-lg overflow-hidden">
              <div
                className="p-4 bg-white hover:bg-gray-50/50 cursor-pointer transition flex items-center gap-4"
                onClick={() => setExpandedId(expandedId === appId ? null : appId)}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => {
                    e.stopPropagation();
                    toggleSelect(appId);
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600"
                />
                <ChevronDown
                  size={18}
                  className={`text-gray-400 transition-transform ${
                    expandedId === appId ? "rotate-180" : ""
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-medium text-gray-500">#{idx + 1}</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {a.applicant?.fullName || "Unknown"}
                    </span>
                    <span className="text-xs text-gray-500 truncate">
                      {a.applicant?.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>AI Match: <span className="font-semibold text-gray-900">{a.matchScore}%</span></span>
                    <span>{a.appliedAt ? new Date(a.appliedAt).toLocaleDateString() : "—"}</span>
                    <span>{statusBadge(a.status)}</span>
                  </div>
                </div>
                <div className="shrink-0">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className="h-8 w-8 p-0 text-gray-400 hover:text-gray-900 bg-transparent flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white border-gray-100 shadow-lg">
                        <DropdownMenuItem className="cursor-pointer" onClick={() => setNoteModal({ type: "move", status: "REVIEWED", appIds: [appId] })}>
                        Move to REVIEWED
                      </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer" onClick={() => setNoteModal({ type: "move", status: "SHORTLISTED", appIds: [appId] })}>
                        Move to SHORTLISTED
                      </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer" onClick={() => setNoteModal({ type: "move", status: "INTERVIEW", appIds: [appId] })}>
                        Move to INTERVIEW
                      </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer" onClick={() => setNoteModal({ type: "move", status: "OFFERED", appIds: [appId] })}>
                        Move to OFFERED
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer" onClick={() => setInterviewModal({ appId, name: a.applicant?.fullName || "Candidate" })}>
                        Schedule Interview
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer" onClick={() => setFeedbackModal({ interviewId: appId, appId })}>
                        Add Interview Feedback
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                          onClick={() => setNoteModal({ type: "move", status: "REJECTED", appIds: [appId] })}
                      >
                        Reject
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {expandedId === appId && (
                <div className="border-t border-gray-100 bg-gray-50/50 p-6 space-y-6">
                  {/* Applicant Info */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Applicant Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Full Name</p>
                        <p className="text-sm font-semibold text-gray-900">{a.applicant?.fullName || "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Email</p>
                        <p className="text-sm font-semibold text-gray-900">
                          <a href={`mailto:${a.applicant?.email}`} className="text-indigo-600 hover:underline">
                            {a.applicant?.email || "—"}
                          </a>
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Experience</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {a.applicant?.experienceYears !== undefined && a.applicant?.experienceYears !== null
                            ? `${a.applicant.experienceYears} years`
                            : "Not specified"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Application ID</p>
                        <p className="text-sm font-mono text-gray-900 truncate">{a.applicationId || a.id}</p>
                      </div>
                    </div>
                  </div>

                  {/* Skills */}
                  {a.applicant?.parsedSkills && a.applicant.parsedSkills.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {a.applicant.parsedSkills.map((skill, i) => (
                          <Badge key={i} variant="outline" className="bg-white border-gray-200 text-gray-700">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Match Details */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Match Analysis</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white border border-gray-100 rounded-lg p-3">
                        <p className="text-xs font-medium text-gray-500 mb-1">Overall Match</p>
                        <div className="flex items-baseline gap-2">
                          <p className="text-2xl font-bold text-indigo-600">{a.matchScore}%</p>
                        </div>
                      </div>
                      <div className="bg-white border border-gray-100 rounded-lg p-3">
                        <p className="text-xs font-medium text-gray-500 mb-1">Method</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {a.matchDetails?.method === "ai_semantic" ? "AI Semantic Match" : a.matchDetails?.method || "—"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Resume */}
                  {a.applicant?.resumeUrl && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Resume</h4>
                      <a
                        href={fileUrl(a.applicant.resumeUrl) ?? "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-200 text-indigo-600 hover:bg-indigo-100 rounded-lg font-medium text-sm transition"
                      >
                        <ExternalLink size={16} />
                        View Resume
                      </a>
                    </div>
                  )}

                  {/* Cover Letter */}
                  {a.coverLetter && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Cover Letter</h4>
                      <div className="bg-white border border-gray-100 rounded-lg p-4 text-sm text-gray-700 max-h-48 overflow-y-auto">
                        {a.coverLetter}
                      </div>
                    </div>
                  )}
                  {!a.coverLetter && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Cover Letter</h4>
                      <div className="bg-gray-100 border border-gray-200 rounded-lg p-4 text-sm text-gray-500">
                        No cover letter provided
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No applications found.
            </div>
          )}
        </div>
      </Card>

      {/* Interview Scheduling Modal */}
      {interviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-bold text-gray-900">Schedule Interview</h3>
              <p className="text-sm text-gray-600">for {interviewModal.name}</p>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Interview Type</label>
                  <select
                    value={interviewForm.type}
                    onChange={(e) => setInterviewForm({ ...interviewForm, type: e.target.value as InterviewType })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                  >
                    <option value="VIDEO">Video</option>
                    <option value="PHONE">Phone</option>
                    <option value="IN_PERSON">In Person</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Scheduled Date & Time</label>
                  <input
                    type="datetime-local"
                    value={interviewForm.scheduledTime}
                    onChange={(e) => setInterviewForm({ ...interviewForm, scheduledTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Meeting Link (optional)</label>
                  <input
                    type="text"
                    placeholder="https://meet.google.com/..."
                    value={interviewForm.meetingLink}
                    onChange={(e) => setInterviewForm({ ...interviewForm, meetingLink: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Location (optional)</label>
                  <input
                    type="text"
                    placeholder="Office address or phone number"
                    value={interviewForm.location}
                    onChange={(e) => setInterviewForm({ ...interviewForm, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => setInterviewModal(null)} disabled={loading}>
                  Cancel
                </Button>
                <Button onClick={() => void scheduleInterview()} disabled={loading || !interviewForm.scheduledTime}>
                  {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                  Schedule
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Interview Feedback Modal */}
      {feedbackModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-bold text-gray-900">Interview Feedback</h3>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Score (1-5)</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((score) => (
                      <button
                        key={score}
                        onClick={() => setFeedbackForm({ ...feedbackForm, score })}
                        className={`w-10 h-10 rounded-lg font-bold transition ${
                          feedbackForm.score === score
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                        }`}
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Feedback</label>
                  <textarea
                    value={feedbackForm.feedback}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, feedback: e.target.value })}
                    placeholder="Share your thoughts on the candidate's interview performance..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none h-24"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => setFeedbackModal(null)} disabled={loading}>
                  Cancel
                </Button>
                <Button onClick={() => void submitFeedback()} disabled={loading || !feedbackForm.feedback}>
                  {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Feedback
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

        {/* Note Modal */}
        {noteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-bold text-gray-900">
                  {noteModal.type === "move" ? "Move to " + noteModal.status : "Bulk Move to " + noteModal.status}
                </h3>
                <p className="text-sm text-gray-600">Add an optional note for the candidate</p>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Note (optional)</label>
                  <textarea
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    placeholder="e.g., Strong technical background, good communication skills"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none h-20"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setNoteModal(null);
                      setNoteInput("");
                    }}
                    disabled={loading || bulkLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={async () => {
                      if (noteModal.type === "move") {
                        await move(noteModal.appIds[0], noteModal.status, noteInput);
                      } else {
                        await bulkMove(noteModal.status, noteInput);
                      }
                      setNoteModal(null);
                      setNoteInput("");
                    }}
                    disabled={loading || bulkLoading}
                  >
                    {(loading || bulkLoading) && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                    Move
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Toast Container */}
        <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
