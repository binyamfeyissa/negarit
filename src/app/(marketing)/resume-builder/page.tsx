"use client";

import { useState } from "react";
import { useLocale, type TranslationKey } from "@/lib/i18n";
import { Plus, Trash2, Download, Eye, Edit3, Mail, Phone, MapPin, Globe, Briefcase, GraduationCap, Award } from "lucide-react";

type Experience = { id: string; company: string; position: string; startDate: string; endDate: string; present: boolean; description: string };
type Education = { id: string; institution: string; degree: string; startDate: string; endDate: string };

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

/* Injected into <head> at runtime so it works regardless of Tailwind purge */
const PRINT_STYLES = `
@page { size: A4 portrait; margin: 0; }

@media print {
  body * { visibility: hidden !important; }
  #rb-print-target { visibility: visible !important; position: fixed !important; inset: 0; width: 210mm; min-height: 297mm; background: white !important; z-index: 99999; overflow: hidden; border-radius: 0 !important; box-shadow: none !important; border: none !important; }
  #rb-print-target * { visibility: visible !important; }
}
`;

export default function ResumeBuilderPage() {
  const { tr } = useLocale();
  const [view, setView] = useState<"edit" | "preview">("edit");

  // Personal
  const [firstName, setFirstName] = useState("Abebe");
  const [lastName, setLastName] = useState("Bekele");
  const [jobTitle, setJobTitle] = useState("Senior Software Engineer");
  const [email, setEmail] = useState("abebe.bekele@email.com");
  const [phone, setPhone] = useState("+251 91 234 5678");
  const [address, setAddress] = useState("Addis Ababa, Ethiopia");
  const [website, setWebsite] = useState("linkedin.com/in/abebe");
  const [summary, setSummary] = useState(
    "Results-driven software engineer with 6+ years of experience building scalable web applications. Passionate about clean code, AI-powered products, and mentoring junior developers."
  );

  // Experience
  const [experiences, setExperiences] = useState<Experience[]>([
    {
      id: uid(),
      company: "Ethio Telecom",
      position: "Senior Software Engineer",
      startDate: "Jan 2021",
      endDate: "",
      present: true,
      description: "Led development of customer-facing APIs serving 500k+ daily users. Reduced latency by 40% through caching strategies.",
    },
    {
      id: uid(),
      company: "Kifiya Financial Technology",
      position: "Backend Developer",
      startDate: "Mar 2019",
      endDate: "Dec 2020",
      present: false,
      description: "Built microservices for payment processing and KYC workflows using Node.js and PostgreSQL.",
    },
  ]);

  // Education
  const [educations, setEducations] = useState<Education[]>([
    { id: uid(), institution: "Addis Ababa University", degree: "B.Sc. Computer Science", startDate: "Sep 2015", endDate: "Jun 2019" },
  ]);

  // Skills
  const [skills, setSkills] = useState(["TypeScript", "React", "Node.js", "PostgreSQL", "AWS", "Docker", "Python"]);
  const [newSkill, setNewSkill] = useState("");

  function addExperience() {
    setExperiences((prev) => [
      ...prev,
      { id: uid(), company: "", position: "", startDate: "", endDate: "", present: false, description: "" },
    ]);
  }

  function removeExperience(id: string) {
    setExperiences((prev) => prev.filter((e) => e.id !== id));
  }

  function updateExp(id: string, field: keyof Experience, value: string | boolean) {
    setExperiences((prev) => prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  }

  function addEducation() {
    setEducations((prev) => [...prev, { id: uid(), institution: "", degree: "", startDate: "", endDate: "" }]);
  }

  function removeEducation(id: string) {
    setEducations((prev) => prev.filter((e) => e.id !== id));
  }

  function updateEdu(id: string, field: keyof Education, value: string) {
    setEducations((prev) => prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  }

  function addSkill() {
    const s = newSkill.trim();
    if (s && !skills.includes(s)) setSkills((prev) => [...prev, s]);
    setNewSkill("");
  }

  const resumeProps = { firstName, lastName, jobTitle, email, phone, address, website, summary, experiences, educations, skills, tr };

  return (
    <>
      {/* ─── Print-only styles injected into <head> ─── */}
      {/* eslint-disable-next-line react/no-danger */}
      <style dangerouslySetInnerHTML={{ __html: PRINT_STYLES }} />

      {/*
        Always-rendered, off-screen print target.
        The print CSS makes this the only visible element during printing.
        Using visibility:hidden + absolute offset (not display:none) so the
        browser still renders it and the print engine can reach it.
      */}
      <div
        id="rb-print-target"
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", top: 0, visibility: "hidden", width: "210mm" }}
      >
        <ResumePreview {...resumeProps} />
      </div>

      <div className="min-h-screen bg-slate-50">
        {/* Page header */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-700 py-12 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">{tr("rbTitle")}</h1>
            <p className="text-indigo-200 max-w-xl mx-auto text-sm leading-relaxed">{tr("rbSubtitle")}</p>
          </div>
        </div>

        {/* Toggle + actions */}
        <div className="sticky top-16 z-40 bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex rounded-xl bg-slate-100 p-1">
              <button
                onClick={() => setView("edit")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  view === "edit" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Edit3 size={15} /> {tr("rbEdit")}
              </button>
              <button
                onClick={() => setView("preview")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  view === "preview" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Eye size={15} /> {tr("rbPreview")}
              </button>
            </div>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition-colors"
            >
              <Download size={15} /> {tr("rbDownload")}
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">
          {view === "edit" ? (
            <div className="grid lg:grid-cols-2 gap-8">
              {/* ─── Editor ─────────────────────────────────── */}
              <div className="space-y-6">
                {/* Personal */}
                <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
                  <h2 className="font-bold text-slate-900 flex items-center gap-2">
                    <Award size={16} className="text-indigo-500" /> {tr("rbPersonal")}
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-500">{tr("rbFirstName")}</label>
                      <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-500">{tr("rbLastName")}</label>
                      <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="text-xs font-medium text-slate-500">{tr("rbJobTitle")}</label>
                      <input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-500">{tr("rbEmail")}</label>
                      <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-500">{tr("rbPhone")}</label>
                      <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-500">{tr("rbAddress")}</label>
                      <input value={address} onChange={(e) => setAddress(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-slate-500">Website / LinkedIn</label>
                      <input value={website} onChange={(e) => setWebsite(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="text-xs font-medium text-slate-500">{tr("rbSummary")}</label>
                      <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={4} placeholder={tr("rbSummaryPlaceholder")} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none" />
                    </div>
                  </div>
                </section>

                {/* Experience */}
                <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
                  <h2 className="font-bold text-slate-900 flex items-center gap-2">
                    <Briefcase size={16} className="text-indigo-500" /> {tr("rbExperience")}
                  </h2>
                  {experiences.map((exp) => (
                    <div key={exp.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-3 relative">
                      <button onClick={() => removeExperience(exp.id)} className="absolute top-3 right-3 text-slate-300 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-slate-500">{tr("rbCompany")}</label>
                          <input value={exp.company} onChange={(e) => updateExp(exp.id, "company", e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-slate-500">{tr("rbPosition")}</label>
                          <input value={exp.position} onChange={(e) => updateExp(exp.id, "position", e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-slate-500">{tr("rbStartDate")}</label>
                          <input value={exp.startDate} onChange={(e) => updateExp(exp.id, "startDate", e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-slate-500">{tr("rbEndDate")}</label>
                          <div className="flex items-center gap-2">
                            <input value={exp.present ? tr("rbPresent") : exp.endDate} disabled={exp.present} onChange={(e) => updateExp(exp.id, "endDate", e.target.value)} className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white disabled:bg-slate-100 disabled:text-slate-400" />
                            <label className="flex items-center gap-1 text-xs text-slate-500 cursor-pointer shrink-0">
                              <input type="checkbox" checked={exp.present} onChange={(e) => updateExp(exp.id, "present", e.target.checked)} className="rounded" />
                              {tr("rbPresent")}
                            </label>
                          </div>
                        </div>
                        <div className="col-span-2 space-y-1">
                          <label className="text-xs font-medium text-slate-500">{tr("rbDescription")}</label>
                          <textarea value={exp.description} onChange={(e) => updateExp(exp.id, "description", e.target.value)} rows={2} className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white resize-none" />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button onClick={addExperience} className="flex items-center gap-2 text-indigo-600 font-semibold text-sm hover:text-indigo-700 transition-colors">
                    <Plus size={15} /> {tr("rbAddExperience")}
                  </button>
                </section>

                {/* Education */}
                <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
                  <h2 className="font-bold text-slate-900 flex items-center gap-2">
                    <GraduationCap size={16} className="text-indigo-500" /> {tr("rbEducation")}
                  </h2>
                  {educations.map((edu) => (
                    <div key={edu.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-3 relative">
                      <button onClick={() => removeEducation(edu.id)} className="absolute top-3 right-3 text-slate-300 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2 space-y-1">
                          <label className="text-xs font-medium text-slate-500">{tr("rbInstitution")}</label>
                          <input value={edu.institution} onChange={(e) => updateEdu(edu.id, "institution", e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white" />
                        </div>
                        <div className="col-span-2 space-y-1">
                          <label className="text-xs font-medium text-slate-500">{tr("rbDegree")}</label>
                          <input value={edu.degree} onChange={(e) => updateEdu(edu.id, "degree", e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-slate-500">{tr("rbStartDate")}</label>
                          <input value={edu.startDate} onChange={(e) => updateEdu(edu.id, "startDate", e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-slate-500">{tr("rbEndDate")}</label>
                          <input value={edu.endDate} onChange={(e) => updateEdu(edu.id, "endDate", e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white" />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button onClick={addEducation} className="flex items-center gap-2 text-indigo-600 font-semibold text-sm hover:text-indigo-700 transition-colors">
                    <Plus size={15} /> {tr("rbAddEducation")}
                  </button>
                </section>

                {/* Skills */}
                <section className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
                  <h2 className="font-bold text-slate-900 flex items-center gap-2">
                    <Award size={16} className="text-indigo-500" /> {tr("rbSkills")}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <span key={skill} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100">
                        {skill}
                        <button onClick={() => setSkills((prev) => prev.filter((s) => s !== skill))} className="hover:text-red-500 transition-colors">×</button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }} placeholder={tr("rbAddSkill")} className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                    <button onClick={addSkill} className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"><Plus size={15} /></button>
                  </div>
                </section>
              </div>

              {/* ─── Live Preview (desktop sidebar) ─────────── */}
              <div className="hidden lg:block">
                <div className="sticky top-32">
                  <ResumePreview {...resumeProps} />
                </div>
              </div>
            </div>
          ) : (
            /* Full-page preview on mobile / preview tab */
            <ResumePreview {...resumeProps} />
          )}
        </div>
      </div>
    </>
  );
}

function ResumePreview({
  firstName, lastName, jobTitle, email, phone, address, website,
  summary, experiences, educations, skills, tr,
}: {
  firstName: string; lastName: string; jobTitle: string;
  email: string; phone: string; address: string; website: string;
  summary: string; experiences: Experience[]; educations: Education[];
  skills: string[]; tr: (k: TranslationKey) => string;
}) {
  return (
    <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-200 font-sans" style={{ width: "100%", maxWidth: "210mm" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(to right, #3730a3, #1e1b4b)", padding: "28px 32px", color: "white" }}>
        <p style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>{firstName} {lastName}</p>
        <p style={{ fontSize: "13px", color: "#a5b4fc", margin: "4px 0 0" }}>{jobTitle}</p>
        <div style={{ marginTop: "14px", display: "flex", flexWrap: "wrap", gap: "4px 16px", fontSize: "11px", color: "#c7d2fe" }}>
          {email && <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><MailIcon />  {email}</span>}
          {phone && <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><PhoneIcon /> {phone}</span>}
          {address && <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><PinIcon />  {address}</span>}
          {website && <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><GlobeIcon /> {website}</span>}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "24px 32px", display: "flex", flexDirection: "column", gap: "20px", fontSize: "12px" }}>
        {summary && (
          <PreviewSection title="Summary">
            <p style={{ color: "#475569", lineHeight: 1.6, margin: 0 }}>{summary}</p>
          </PreviewSection>
        )}

        {experiences.filter((e) => e.company || e.position).length > 0 && (
          <PreviewSection title={tr("rbExperience")}>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {experiences.filter((e) => e.company || e.position).map((exp) => (
                <div key={exp.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <p style={{ fontWeight: 700, color: "#0f172a", margin: 0 }}>{exp.position}</p>
                      <p style={{ color: "#4f46e5", fontWeight: 600, margin: "2px 0 0" }}>{exp.company}</p>
                    </div>
                    <p style={{ color: "#94a3b8", margin: 0, textAlign: "right", whiteSpace: "nowrap" }}>
                      {exp.startDate}{exp.startDate ? " – " : ""}{exp.present ? tr("rbPresent") : exp.endDate}
                    </p>
                  </div>
                  {exp.description && <p style={{ marginTop: "5px", color: "#64748b", lineHeight: 1.55 }}>{exp.description}</p>}
                </div>
              ))}
            </div>
          </PreviewSection>
        )}

        {educations.filter((e) => e.institution || e.degree).length > 0 && (
          <PreviewSection title={tr("rbEducation")}>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {educations.filter((e) => e.institution || e.degree).map((edu) => (
                <div key={edu.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <p style={{ fontWeight: 700, color: "#0f172a", margin: 0 }}>{edu.degree}</p>
                    <p style={{ color: "#64748b", margin: "2px 0 0" }}>{edu.institution}</p>
                  </div>
                  <p style={{ color: "#94a3b8", margin: 0, textAlign: "right", whiteSpace: "nowrap" }}>
                    {edu.startDate}{edu.startDate ? " – " : ""}{edu.endDate}
                  </p>
                </div>
              ))}
            </div>
          </PreviewSection>
        )}

        {skills.length > 0 && (
          <PreviewSection title={tr("rbSkills")}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {skills.map((skill) => (
                <span key={skill} style={{ padding: "3px 10px", borderRadius: "999px", background: "#eef2ff", color: "#4338ca", fontWeight: 600, border: "1px solid #c7d2fe", fontSize: "11px" }}>
                  {skill}
                </span>
              ))}
            </div>
          </PreviewSection>
        )}
      </div>
    </div>
  );
}

function PreviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
        <p style={{ margin: 0, fontWeight: 700, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", color: "#1e293b" }}>{title}</p>
        <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }} />
      </div>
      {children}
    </section>
  );
}

/* Inline SVG icons — no external deps needed inside the print target */
function MailIcon() { return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>; }
function PhoneIcon() { return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.06 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>; }
function PinIcon() { return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>; }
function GlobeIcon() { return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>; }
