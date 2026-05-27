"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Download } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";
import type { Job } from "@/lib/api/types";
import { ApiError } from "@/lib/api/types";
import { useLocale } from "@/lib/i18n";

export default function JobsPage() {
  const { api } = useAuth();
  const { tr } = useLocale();
  const [q, setQ] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [error, setError] = useState<string | null>(null);

  const query = useMemo(() => q.trim(), [q]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.jobs.list({ q: query || undefined, page: 1, limit: 20 });
        if (cancelled) return;
        setJobs(res.data);
        setError(null);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof ApiError ? e.message : "Failed to load jobs.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [api, query]);

  function exportCsv() {
    const header = ["id", "title", "company", "location", "type", "applicantCount", "postedAt"];
    const lines = [
      header.join(","),
      ...jobs.map((j) =>
        [
          j.id,
          JSON.stringify(j.title),
          JSON.stringify(j.recruiter?.companyName ?? ""),
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
          <h1 className="text-2xl font-bold mb-1 border-gray-100">{tr("allJobs")}</h1>
          <p className="text-gray-500 text-sm">Live jobs from the backend.</p>
        </div>
        <Button onClick={exportCsv} variant="outline" className="flex items-center space-x-2 text-sm text-gray-700 bg-white border-gray-200">
          <Download size={16} />
          <span>{tr("exportCSV")}</span>
        </Button>
      </div>

      {error ? <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">{error}</div> : null}

      <Card className="shadow-sm border-gray-100 rounded-xl overflow-hidden">
        <div className="p-4 flex flex-row items-center justify-between bg-white border-b border-gray-50">
          <h2 className="text-base font-bold">{tr("ajAllJobs")}</h2>
          <div className="flex space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2 h-4 w-4 text-gray-400" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} type="text" placeholder="Search" className="pl-9 h-8 w-60 text-xs bg-white border-gray-200" />
            </div>
          </div>
        </div>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50 hover:bg-gray-50/50 border-gray-100">
                <TableHead className="text-gray-500 font-medium text-xs">{tr("adColTitle")}</TableHead>
                <TableHead className="text-gray-500 font-medium text-xs">{tr("adColCompany")}</TableHead>
                <TableHead className="text-gray-500 font-medium text-xs">{tr("adColType")}</TableHead>
                <TableHead className="text-gray-500 font-medium text-xs">{tr("adColLocation")}</TableHead>
                <TableHead className="text-right text-gray-500 font-medium text-xs">{tr("adColApplicants")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id} className="border-gray-50 hover:bg-gray-50/10">
                  <TableCell className="font-semibold text-gray-800">
                    <Link href={`/admin/jobs/${job.id}`} className="hover:text-indigo-600">
                      {job.title}
                    </Link>
                  </TableCell>
                  <TableCell className="py-3 text-gray-800 font-medium">{job.recruiter?.companyName ?? "—"}</TableCell>
                  <TableCell className="py-3 text-gray-800 font-medium">{job.type}</TableCell>
                  <TableCell className="py-3 text-gray-600 font-medium">{job.location}</TableCell>
                  <TableCell className="text-right py-3 text-gray-700 font-semibold">{job.applicantCount}</TableCell>
                </TableRow>
              ))}
              {jobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-sm text-gray-500 p-6 text-center">
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
