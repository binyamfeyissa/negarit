"use client";

import { useEffect, useState } from "react";
import { Users, Briefcase, FileText, TrendingUp } from "lucide-react";
import { MetricCard } from "@/components/admin/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";
import type { AnalyticsOverview, Job } from "@/lib/api/types";
import { ApiError } from "@/lib/api/types";

export default function AdminDashboardPage() {
  const { api } = useAuth();
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [error, setError] = useState<string | null>(null);

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
      <div className="mb-2">
        <h1 className="text-2xl font-bold mb-1 border-gray-100">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm">Live analytics from the backend.</p>
      </div>

      {error ? <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">{error}</div> : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Users" value={overview ? String(overview.totalUsers) : "—"} trend="" isPositive={true} icon={<Users size={20} />} />
        <MetricCard title="Active Jobs" value={overview ? String(overview.activeJobs) : "—"} trend="" isPositive={true} icon={<Briefcase size={20} />} />
        <MetricCard title="Total Applications" value={overview ? String(overview.totalApplications) : "—"} trend="" isPositive={true} icon={<FileText size={20} />} />
        <MetricCard title="Avg Match Score" value={overview ? `${overview.avgMatchScore}%` : "—"} trend="" isPositive={true} icon={<TrendingUp size={20} />} />
      </div>

      <Card className="shadow-sm border-gray-100 rounded-xl overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between bg-white border-b border-gray-50">
          <CardTitle className="text-base font-bold">Recent Job Posts</CardTitle>
          <Link href="/admin/jobs" className="text-sm text-indigo-600 font-semibold hover:underline">
            View all
          </Link>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50 hover:bg-gray-50/50 border-gray-100">
                <TableHead className="text-gray-500 font-medium text-xs">Title</TableHead>
                <TableHead className="text-gray-500 font-medium text-xs">Company</TableHead>
                <TableHead className="text-gray-500 font-medium text-xs">Location</TableHead>
                <TableHead className="text-gray-500 font-medium text-xs">Type</TableHead>
                <TableHead className="text-right text-gray-500 font-medium text-xs">Applicants</TableHead>
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
