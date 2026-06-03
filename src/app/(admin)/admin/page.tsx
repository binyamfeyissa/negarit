"use client";

import { useEffect, useState } from "react";
import {
  Users, Briefcase, FileText, TrendingUp, Download,
  UserCheck, Building2, Target, ArrowUpRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";
import type { AnalyticsOverview, Job } from "@/lib/api/types";
import { ApiError } from "@/lib/api/types";
import { useLocale } from "@/lib/i18n";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

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

interface StatCardProps {
  title: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  accent: string;
  iconBg: string;
  href?: string;
}

function StatCard({ title, value, sub, icon, accent, iconBg, href }: StatCardProps) {
  return (
    <Card className={`rounded-2xl shadow-sm border overflow-hidden ${accent}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
            {icon}
          </div>
          {href && (
            <Link href={href} className="text-gray-400 hover:text-gray-600 transition-colors">
              <ArrowUpRight size={16} />
            </Link>
          )}
        </div>
        <div className="mt-4">
          <p className="text-3xl font-bold text-gray-900 leading-none">{value}</p>
          <p className="text-sm font-semibold text-gray-600 mt-1.5">{title}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

const PIE_COLORS = ["#6366f1", "#10b981", "#f59e0b"];

export default function AdminDashboardPage() {
  const { api } = useAuth();
  const { tr } = useLocale();
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [recentJobs, setRecentJobs] = useState<AnyJob[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [loading, setLoading] = useState(true);

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
          api.jobs.list({ page: 1, limit: 8 }),
        ]);
        if (cancelled) return;
        setOverview(o);
        setRecentJobs(jobs.data as AnyJob[]);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof ApiError ? e.message : "Failed to load dashboard data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [api]);

  const signupData = (overview?.dailySignups ?? []).map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    signups: d.count,
  }));

  const pieData = overview ? [
    { name: "Recruiters", value: overview.totalRecruiters },
    { name: "Applicants", value: overview.totalApplicants },
  ] : [];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{tr("dashboard")}</h1>
          <p className="text-sm text-gray-500 mt-1">Platform overview and live analytics.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={() => exportReport("csv")} disabled={exporting} className="flex items-center gap-1.5 text-xs text-gray-600">
            <Download size={13} /> {tr("exportCSV")}
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportReport("json")} disabled={exporting} className="flex items-center gap-1.5 text-xs text-gray-600">
            <Download size={13} /> {tr("exportJSON")}
          </Button>
        </div>
      </div>

      {error ? <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-3">{error}</div> : null}

      {/* Primary stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={tr("adTotalUsers")}
          value={loading ? "—" : (overview?.totalUsers ?? 0)}
          sub="All registered accounts"
          icon={<Users size={18} className="text-indigo-600" />}
          accent="border-indigo-100"
          iconBg="bg-indigo-50"
          href="/admin/users"
        />
        <StatCard
          title={tr("adActiveJobs")}
          value={loading ? "—" : (overview?.activeJobs ?? 0)}
          sub="Open positions"
          icon={<Briefcase size={18} className="text-violet-600" />}
          accent="border-violet-100"
          iconBg="bg-violet-50"
          href="/admin/jobs"
        />
        <StatCard
          title={tr("adTotalApps")}
          value={loading ? "—" : (overview?.totalApplications ?? 0)}
          sub="Total submissions"
          icon={<FileText size={18} className="text-emerald-600" />}
          accent="border-emerald-100"
          iconBg="bg-emerald-50"
        />
        <StatCard
          title="Hire Rate"
          value={loading ? "—" : `${overview?.hireRate ?? 0}%`}
          sub="Applications resulting in hire"
          icon={<TrendingUp size={18} className="text-amber-600" />}
          accent="border-amber-100"
          iconBg="bg-amber-50"
        />
      </div>

      {/* Secondary stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Applicants"
          value={loading ? "—" : (overview?.totalApplicants ?? 0)}
          sub="Job seekers on platform"
          icon={<UserCheck size={18} className="text-sky-600" />}
          accent="border-sky-100"
          iconBg="bg-sky-50"
        />
        <StatCard
          title="Total Recruiters"
          value={loading ? "—" : (overview?.totalRecruiters ?? 0)}
          sub="Companies posting jobs"
          icon={<Building2 size={18} className="text-rose-600" />}
          accent="border-rose-100"
          iconBg="bg-rose-50"
          href="/admin/companies"
        />
        <StatCard
          title={tr("adAvgMatch")}
          value={loading ? "—" : `${overview?.avgMatchScore ?? 0}%`}
          sub="AI match accuracy"
          icon={<Target size={18} className="text-fuchsia-600" />}
          accent="border-fuchsia-100"
          iconBg="bg-fuchsia-50"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily signups area chart */}
        <Card className="lg:col-span-2 rounded-2xl border-gray-100 shadow-sm">
          <CardHeader className="px-6 pt-5 pb-2 border-b border-gray-50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-gray-800">Daily Signups</CardTitle>
              <span className="text-xs text-gray-400">{signupData.length} days</span>
            </div>
          </CardHeader>
          <CardContent className="px-2 py-4">
            {signupData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={signupData} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="signupGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 12 }}
                    labelStyle={{ fontWeight: 600, color: "#1e293b" }}
                  />
                  <Area type="monotone" dataKey="signups" stroke="#6366f1" strokeWidth={2} fill="url(#signupGrad)" dot={false} activeDot={{ r: 4, fill: "#6366f1" }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-55 flex items-center justify-center text-sm text-gray-400">
                No signup data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* User breakdown pie chart */}
        <Card className="rounded-2xl border-gray-100 shadow-sm">
          <CardHeader className="px-6 pt-5 pb-2 border-b border-gray-50">
            <CardTitle className="text-sm font-semibold text-gray-800">User Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="px-4 py-4 flex flex-col items-center gap-4">
            {pieData.length > 0 && (pieData[0].value > 0 || pieData[1].value > 0) ? (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={78}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="w-full space-y-2">
                  {pieData.map((d, i) => (
                    <div key={d.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i] }} />
                        <span className="text-gray-600 font-medium">{d.name}</span>
                      </div>
                      <span className="font-bold text-gray-900">{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-55 flex items-center justify-center text-sm text-gray-400">
                No user data yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent jobs table */}
      <Card className="rounded-2xl border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 bg-white">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
            <Briefcase size={15} className="text-indigo-500" />
            {tr("adRecentJobs")}
          </div>
          <Link href="/admin/jobs" className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1">
            {tr("viewAll")} <ArrowUpRight size={12} />
          </Link>
        </div>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50 border-gray-100">
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3 pl-6">{tr("adColTitle")}</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3">{tr("adColCompany")}</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3">{tr("adColType")}</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3">{tr("adColLocation")}</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3 text-right">Posted</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3 text-right">{tr("adColApplicants")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentJobs.map((j) => {
                const company = j.company ?? j.recruiter?.companyName ?? "—";
                return (
                  <TableRow key={j.id} className="border-gray-50 hover:bg-indigo-50/30 transition-colors">
                    <TableCell className="py-3.5 pl-6 font-semibold text-gray-900 max-w-60">
                      <Link href={`/admin/jobs/${j.id}`} className="hover:text-indigo-600 transition-colors line-clamp-1">
                        {j.title}
                      </Link>
                    </TableCell>
                    <TableCell className="py-3.5 text-gray-700 text-sm font-medium">{company}</TableCell>
                    <TableCell className="py-3.5">
                      <Badge className={`text-xs font-medium shadow-none ${TYPE_COLORS[j.type] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
                        {typeLabel(j.type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3.5 text-gray-600 text-sm">{j.location}</TableCell>
                    <TableCell className="py-3.5 text-gray-400 text-xs text-right whitespace-nowrap">
                      {j.postedAt ? new Date(j.postedAt).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell className="py-3.5 text-right pr-6">
                      <span className="inline-flex items-center justify-center min-w-8 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold px-2 py-0.5">
                        {j.applicantCount}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
              {recentJobs.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-sm text-gray-400 py-12 text-center">No jobs yet.</TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
