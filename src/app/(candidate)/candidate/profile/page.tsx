"use client";

import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/components/auth/auth-provider";
import type { ApplicantProfile, DocType } from "@/lib/api/types";
import { ApiError } from "@/lib/api/types";
import { fileUrl } from "@/lib/config";
import { Coins, Upload, ShieldCheck, FileText, ExternalLink, RefreshCw } from "lucide-react";
import { useLocale } from "@/lib/i18n";

const DOC_TYPES: { value: DocType; label: string }[] = [
  { value: "DEGREE", label: "Degree" },
  { value: "CERTIFICATION", label: "Certification" },
  { value: "OTHER", label: "Other" },
];

function completenessColor(pct: number) {
  if (pct >= 80) return "text-emerald-700 bg-emerald-50 border-emerald-100";
  if (pct >= 50) return "text-amber-700 bg-amber-50 border-amber-100";
  return "text-rose-700 bg-rose-50 border-rose-100";
}

export default function CandidateProfilePage() {
  const { api, user } = useAuth();
  const { tr } = useLocale();
  const [profile, setProfile] = useState<ApplicantProfile | null>(null);
  const [tokens, setTokens] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [preferredRoles, setPreferredRoles] = useState("");
  const [skills, setSkills] = useState("");

  const resumeInputRef = useRef<HTMLInputElement>(null);
  const [uploadingResume, setUploadingResume] = useState(false);

  const [docFile, setDocFile] = useState<File | null>(null);
  const [docType, setDocType] = useState<DocType>("DEGREE");
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const docInputRef = useRef<HTMLInputElement>(null);

  async function loadProfile() {
    try {
      const [p, bal] = await Promise.all([
        api.applicant.me(),
        api.applicant.tokenBalance().catch(() => null),
      ]);
      setProfile(p);
      setTokens(bal?.tokens ?? p.tokens ?? null);
      setFullName(p.full_name ?? "");
      setPhone(p.phone ?? "");
      setWebsite(p.website ?? "");
      setExperienceYears(p.experience_years != null ? String(p.experience_years) : "");
      setPreferredRoles(p.preferred_roles?.join(", ") ?? "");
      setSkills(p.parsed_skills?.join(", ") ?? "");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load profile.");
    }
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await loadProfile();
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [api]);

  async function handleSave() {
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      const years = experienceYears.trim() !== "" ? Number(experienceYears) : undefined;
      const roles = preferredRoles.trim() ? preferredRoles.split(",").map((r) => r.trim()).filter(Boolean) : undefined;
      const skillList = skills.trim() ? skills.split(",").map((s) => s.trim()).filter(Boolean) : undefined;
      const updated = await api.applicant.updateMe({
        fullName: fullName.trim() || undefined,
        phone: phone.trim() || undefined,
        website: website.trim() || undefined,
        experienceYears: years,
        preferredRoles: roles,
        skills: skillList,
      });
      setProfile(updated);
      setSuccess("Profile updated.");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  async function handleResumeUpload(file: File) {
    setUploadingResume(true);
    setError(null);
    setSuccess(null);
    try {
      await api.applicant.uploadResume(file);
      await loadProfile();
      setSuccess("Resume uploaded successfully.");
      if (resumeInputRef.current) resumeInputRef.current.value = "";
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to upload resume.");
    } finally {
      setUploadingResume(false);
    }
  }

  async function handleDocUpload() {
    if (!docFile) return;
    setUploadingDoc(true);
    setError(null);
    setSuccess(null);
    try {
      await api.applicant.uploadVerificationDoc(docFile, docType);
      setSuccess("Verification document uploaded.");
      setDocFile(null);
      if (docInputRef.current) docInputRef.current.value = "";
      await loadProfile();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to upload document.");
    } finally {
      setUploadingDoc(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pb-10">
        <div className="animate-pulse space-y-4">
          <div className="h-36 rounded-3xl bg-slate-100" />
          <div className="h-64 rounded-3xl bg-slate-100" />
          <div className="h-48 rounded-3xl bg-slate-100" />
        </div>
      </div>
    );
  }

  const completeness = profile?.completeness ?? 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">{error}</div>}
      {success && <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg p-3">{success}</div>}

      {/* Header */}
      <Card className="rounded-3xl border-slate-200 shadow-sm bg-white">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-2xl font-bold text-slate-900">{profile?.full_name ?? user?.email ?? "—"}</p>
              <p className="text-sm text-slate-500 mt-1">{user?.email}</p>
              <div className="flex gap-2 mt-3 flex-wrap">
                <Badge className={profile?.is_verified ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100"}>
                  {profile?.is_verified ? tr("statusVerified") : tr("statusUnverified")}
                </Badge>
                <Badge className={completenessColor(completeness)}>
                  {completeness}% complete
                </Badge>
                {profile?.experience_years != null && (
                  <Badge className="bg-slate-50 text-slate-700 border-slate-200">
                    {profile.experience_years} yr{profile.experience_years !== 1 ? "s" : ""} experience
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-amber-50 border border-amber-100 px-4 py-3">
              <Coins size={20} className="text-amber-600" />
              <div>
                <p className="text-xs text-amber-600 font-medium">{tr("cdTokenBalance")}</p>
                <p className="text-xl font-bold text-amber-800">{tokens ?? "—"}</p>
              </div>
            </div>
          </div>

          {/* Profile completeness bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Profile completeness</span>
              <span className="font-semibold text-slate-700">{completeness}%</span>
            </div>
            <Progress value={completeness} className="h-2" />
            {completeness < 100 && (
              <p className="text-xs text-slate-400">
                {completeness < 50 ? "Add your experience, skills, and upload a resume to increase your match score." :
                 completeness < 80 ? "Almost there — fill in the remaining fields to maximise recruiter visibility." :
                 "Great profile! Upload a verification document to get fully verified."}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resume */}
      <Card className="rounded-3xl border-slate-200 shadow-sm bg-white">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-indigo-600" />
            <CardTitle>{tr("cdResumeCard")}</CardTitle>
          </div>
          <CardDescription>Your CV is used to calculate match scores and parse skills</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile?.resume_url ? (
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-indigo-100 bg-indigo-50/40 px-4 py-3">
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-indigo-600 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-indigo-900">Resume on file</p>
                  <a
                    href={fileUrl(profile.resume_url) ?? "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    View resume <ExternalLink size={10} />
                  </a>
                </div>
              </div>
              {profile.resume_score != null && (
                <div className="text-right shrink-0">
                  <p className="text-xs text-slate-500">Resume score</p>
                  <p className="text-lg font-bold text-indigo-700">{profile.resume_score}%</p>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
              No resume uploaded yet. Upload one to unlock match scoring and AI tools.
            </div>
          )}

          {profile?.parsed_skills && profile.parsed_skills.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Skills parsed from resume</p>
              <div className="flex flex-wrap gap-2">
                {profile.parsed_skills.map((skill) => (
                  <span key={skill} className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium border border-indigo-100">{skill}</span>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-5 text-center">
            <RefreshCw size={20} className="mx-auto text-slate-400 mb-2" />
            <p className="text-sm font-medium text-slate-700 mb-1">{profile?.resume_url ? "Re-upload Resume" : "Upload Resume"}</p>
            <p className="text-xs text-slate-400 mb-3">PDF, DOC, DOCX · up to 10 MB</p>
            <label className="inline-block cursor-pointer">
              <Button
                variant="outline"
                size="sm"
                disabled={uploadingResume}
                onClick={() => resumeInputRef.current?.click()}
              >
                <Upload size={14} className="mr-2" />
                {uploadingResume ? "Uploading..." : profile?.resume_url ? "Replace File" : "Choose File"}
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
          </div>
        </CardContent>
      </Card>

      {/* Edit profile */}
      <Card className="rounded-3xl border-slate-200 shadow-sm bg-white">
        <CardHeader>
          <CardTitle>{tr("rpEditProfile")}</CardTitle>
          <CardDescription>Update your personal details and preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">{tr("fullNameLabel")}</label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" disabled={loading} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">{tr("phoneLabel")}</label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+2519..." disabled={loading} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">{tr("rpWebsite")}</label>
              <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." disabled={loading} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">{tr("cdFieldExperience")}</label>
              <Input value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} placeholder="3" type="number" min={0} disabled={loading} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">{tr("cdFieldRoles")}</label>
              <Input value={preferredRoles} onChange={(e) => setPreferredRoles(e.target.value)} placeholder="Software Engineer, Backend Developer" disabled={loading} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">{tr("cdFieldSkills")}</label>
              <Input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="Python, React, SQL" disabled={loading} />
            </div>
          </div>

          <div className="pt-2">
            <Button onClick={handleSave} disabled={saving || loading} className="bg-indigo-600 hover:bg-indigo-700">
              {saving ? tr("loadingText") : tr("save")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Verification document */}
      <Card className="rounded-3xl border-slate-200 shadow-sm bg-white">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-indigo-600" />
            <CardTitle>Verification Document</CardTitle>
          </div>
          <CardDescription>Upload a degree, certification, or other document to get verified</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile?.verification_doc_url && (
            <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3 text-sm text-emerald-800">
              <ShieldCheck size={16} />
              <div>
                <p className="font-medium">Document on file: {profile.verification_doc_type ?? "—"}</p>
                <a href={fileUrl(profile.verification_doc_url) ?? "#"} target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline text-xs flex items-center gap-1">
                  View document <ExternalLink size={10} />
                </a>
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Document Type</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value as DocType)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
              >
                {DOC_TYPES.map((dt) => (
                  <option key={dt.value} value={dt.value}>{dt.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">File (PDF, DOC, DOCX)</label>
              <Input
                ref={docInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setDocFile(e.target.files?.[0] ?? null)}
              />
            </div>
          </div>

          <Button
            onClick={handleDocUpload}
            disabled={!docFile || uploadingDoc}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Upload size={16} />
            {uploadingDoc ? "Uploading..." : profile?.verification_doc_url ? "Replace Document" : "Upload Document"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
