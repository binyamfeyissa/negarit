"use client";

import { useEffect, useState } from "react";
import { Users, Briefcase, FileText, TrendingUp, Download } from "lucide-react";
import { MetricCard } from "@/components/admin/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";
import type { AnalyticsOverview, Job } from "@/lib/api/types";
import { ApiError } from "@/lib/api/types";
import { useLocale } from "@/lib/i18n";

export default function AdminDashboardPage() {
  const { api } = useAuth();
  const { tr } = useLocale();
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  async function exportReport(format: "csv" | "json") {
    setExporting(true);
    try {
      const buffer = await api.admin.report({ format });
      const blob = new Blob([buffer as ArrayBuffer], {
        type: format === "json" ? "application/json" : "text/csv",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `negarit-report.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Export failed.");
    } finally {
      setExporting(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [o, jobs] = await Promise.all([
          api.admin.analyticsOverview(),
          api.jobs.list({ page: 1, limit: 5 }),
        ]);
        if (cancelled) return;
        setOverview(o);
        setRecentJobs(jobs.data);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof ApiError ? e.message : "Failed to load dashboard data.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [api]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="mb-2 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1 border-gray-100">{tr("dashboard")}</h1>
          <p className="text-gray-500 text-sm">Live analytics from the backend.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportReport("csv")}
            disabled={exporting}
            className="flex items-center gap-1 text-xs"
          >
            <Download size={14} /> {tr("exportCSV")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportReport("json")}
            disabled={exporting}
            className="flex items-center gap-1 text-xs"
          >
            <Download size={14} /> {tr("exportJSON")}
          </Button>
        </div>
      </div>

      {error ? <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">{error}</div> : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title={tr("adTotalUsers")} value={overview ? String(overview.totalUsers) : "—"} trend="" isPositive={true} icon={<Users size={20} />} />
        <MetricCard title={tr("adActiveJobs")} value={overview ? String(overview.activeJobs) : "—"} trend="" isPositive={true} icon={<Briefcase size={20} />} />
        <MetricCard title={tr("adTotalApps")} value={overview ? String(overview.totalApplications) : "—"} trend="" isPositive={true} icon={<FileText size={20} />} />
        <MetricCard title={tr("adAvgMatch")} value={overview ? `${overview.avgMatchScore}%` : "—"} trend="" isPositive={true} icon={<TrendingUp size={20} />} />
      </div>

      <Card className="shadow-sm border-gray-100 rounded-xl overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between bg-white border-b border-gray-50">
          <CardTitle className="text-base font-bold">{tr("adRecentJobs")}</CardTitle>
          <Link href="/admin/jobs" className="text-sm text-indigo-600 font-semibold hover:underline">
            {tr("viewAll")}
          </Link>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50 hover:bg-gray-50/50 border-gray-100">
                <TableHead className="text-gray-500 font-medium text-xs">{tr("adColTitle")}</TableHead>
                <TableHead className="text-gray-500 font-medium text-xs">{tr("adColCompany")}</TableHead>
                <TableHead className="text-gray-500 font-medium text-xs">{tr("adColLocation")}</TableHead>
                <TableHead className="text-gray-500 font-medium text-xs">{tr("adColType")}</TableHead>
                <TableHead className="text-right text-gray-500 font-medium text-xs">{tr("adColApplicants")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentJobs.map((j) => (
                <TableRow key={j.id} className="border-gray-50 hover:bg-gray-50/10">
                  <TableCell className="font-semibold text-gray-800">
                    <Link href={`/admin/jobs/${j.id}`} className="hover:text-indigo-600">
                      {j.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-gray-700 font-medium">{j.recruiter?.companyName ?? "—"}</TableCell>
                  <TableCell className="text-gray-600">{j.location}</TableCell>
                  <TableCell className="text-gray-700 font-medium">{j.type}</TableCell>
                  <TableCell className="text-right text-gray-700 font-semibold">{j.applicantCount}</TableCell>
                </TableRow>
              ))}
              {recentJobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-sm text-gray-500 p-6 text-center">
                    No jobs yet.
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
