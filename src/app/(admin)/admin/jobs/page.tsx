"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Download, Trash2, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";
import type { Job } from "@/lib/api/types";
import { ApiError } from "@/lib/api/types";
import { useLocale } from "@/lib/i18n";

type AnyJob = Job & { company?: string };

const TYPE_COLORS: Record<string, string> = {
  FULL_TIME: "bg-indigo-50 text-indigo-700 border-indigo-100",
  PART_TIME: "bg-violet-50 text-violet-700 border-violet-100",
  REMOTE: "bg-emerald-50 text-emerald-700 border-emerald-100",
  CONTRACT: "bg-amber-50 text-amber-700 border-amber-100",
  INTERN: "bg-sky-50 text-sky-700 border-sky-100",
};

function typeLabel(t: string) {
  return { FULL_TIME: "Full-time", PART_TIME: "Part-time", REMOTE: "Remote", CONTRACT: "Contract", INTERN: "Intern" }[t] ?? t;
}

export default function JobsPage() {
  const { api } = useAuth();
  const { tr } = useLocale();
  const [q, setQ] = useState("");
  const [jobs, setJobs] = useState<AnyJob[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const query = useMemo(() => q.trim(), [q]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.jobs.list({ q: query || undefined, page: 1, limit: 50 });
        if (cancelled) return;
        setJobs(res.data as AnyJob[]);
        setError(null);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof ApiError ? e.message : "Failed to load jobs.");
      }
    })();
    return () => { cancelled = true; };
  }, [api, query]);

  async function handleDelete(jobId: string) {
    if (!confirm("Delete this job post? This cannot be undone.")) return;
    setDeletingId(jobId);
    setError(null);
    try {
      await api.jobs.remove(jobId);
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to delete job.");
    } finally {
      setDeletingId(null);
    }
  }

  function exportCsv() {
    const header = ["id", "title", "company", "location", "type", "applicantCount", "postedAt"];
    const lines = [
      header.join(","),
      ...jobs.map((j) =>
        [
          j.id,
          JSON.stringify(j.title),
          JSON.stringify(j.company ?? j.recruiter?.companyName ?? ""),
          JSON.stringify(j.location),
          j.type,
          String(j.applicantCount),
          j.postedAt,
        ].join(","),
      ),
    ].join("\n");
    const blob = new Blob([lines], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "jobs.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{tr("allJobs")}</h1>
          <p className="text-sm text-gray-500 mt-1">{jobs.length} job{jobs.length !== 1 ? "s" : ""} found</p>
        </div>
        <Button onClick={exportCsv} variant="outline" size="sm" className="flex items-center gap-2 text-gray-600">
          <Download size={15} />
          {tr("exportCSV")}
        </Button>
      </div>

      {error ? <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-3">{error}</div> : null}

      <Card className="shadow-sm border-gray-100 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100 bg-white">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
            <Briefcase size={15} className="text-indigo-500" />
            {tr("ajAllJobs")}
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search jobs…" className="pl-9 h-8 w-56 text-xs border-gray-200" />
          </div>
        </div>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50 border-gray-100">
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3 pl-5">{tr("adColTitle")}</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3">{tr("adColCompany")}</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3">{tr("adColType")}</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3">{tr("adColLocation")}</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3 text-right">Posted</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3 text-right">{tr("adColApplicants")}</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => {
                const company = job.company ?? job.recruiter?.companyName ?? "—";
                return (
                  <TableRow key={job.id} className="border-gray-50 hover:bg-indigo-50/30 transition-colors group">
                    <TableCell className="py-3.5 pl-5 font-semibold text-gray-900 max-w-xs">
                      <Link href={`/admin/jobs/${job.id}`} className="hover:text-indigo-600 transition-colors line-clamp-1">
                        {job.title}
                      </Link>
                    </TableCell>
                    <TableCell className="py-3.5 text-gray-700 font-medium">{company}</TableCell>
                    <TableCell className="py-3.5">
                      <Badge className={`text-xs font-medium shadow-none ${TYPE_COLORS[job.type] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
                        {typeLabel(job.type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3.5 text-gray-600 text-sm">{job.location}</TableCell>
                    <TableCell className="py-3.5 text-gray-500 text-xs text-right whitespace-nowrap">
                      {job.postedAt ? new Date(job.postedAt).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell className="py-3.5 text-right">
                      <span className="inline-flex items-center justify-center min-w-[2rem] rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold px-2 py-0.5">
                        {job.applicantCount}
                      </span>
                    </TableCell>
                    <TableCell className="py-3.5 pr-3">
                      <button
                        onClick={() => handleDelete(job.id)}
                        disabled={deletingId === job.id}
                        className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-40"
                        title="Delete job"
                      >
                        <Trash2 size={14} />
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {jobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-sm text-gray-400 py-12 text-center">
                    No jobs found.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
