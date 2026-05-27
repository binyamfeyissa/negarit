"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building, Users, Briefcase, Globe, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import type { RecruiterProfile } from "@/lib/api/types";
import { ApiError } from "@/lib/api/types";
import { useLocale } from "@/lib/i18n";

type AnyRecruiter = Record<string, unknown>;

export default function AdminCompaniesPage() {
  const { api } = useAuth();
  const { tr } = useLocale();
  const [recruiters, setRecruiters] = useState<AnyRecruiter[]>([]);
  const [pending, setPending] = useState<RecruiterProfile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [usersRes, pendingRes] = await Promise.all([
        api.admin.users({ role: "RECRUITER", page: 1, limit: 100 }),
        api.admin.pendingRecruiters(),
      ]);
      const list = Array.isArray(usersRes.data) ? usersRes.data.filter((r) => r.role === "RECRUITER") : [];
      setRecruiters(list);
      setPending(pendingRes.data ?? []);
      setError(null);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load companies.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleReview(userId: string, action: "approve" | "reject") {
    setReviewingId(userId);
    setError(null);
    setSuccess(null);
    try {
      await api.admin.reviewRecruiter(userId, { decision: action });
      setSuccess(`Recruiter ${action === "approve" ? "approved" : "rejected"}.`);
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to update recruiter.");
    } finally {
      setReviewingId(null);
    }
  }

  const total = recruiters.length;
  const active = recruiters.filter((r) => (r.status ?? "") === "ACTIVE").length;
  const verified = recruiters.filter((r) => !!r.isVerified).length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{tr("companies")}</h1>
        <p className="text-sm text-slate-500">Browse recruiter organizations and manage approvals.</p>
      </div>

      {error ? <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">{error}</div> : null}
      {success ? <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg p-3">{success}</div> : null}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="rounded-2xl">
          <CardHeader className="px-4 py-3 bg-emerald-50 border-b border-emerald-100">
            <div className="flex items-center space-x-3">
              <Users size={18} className="text-emerald-600" />
              <CardTitle className="text-sm font-semibold">{tr("acTotalCompanies")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-900">{total}</div>
            <div className="text-sm text-gray-500">Registered recruiter organizations</div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="px-4 py-3 bg-blue-50 border-b border-blue-100">
            <div className="flex items-center space-x-3">
              <Briefcase size={18} className="text-blue-600" />
              <CardTitle className="text-sm font-semibold">{tr("acActiveCompanies")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-900">{active}</div>
            <div className="text-sm text-gray-500">Currently active organizations</div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="px-4 py-3 bg-indigo-50 border-b border-indigo-100">
            <div className="flex items-center space-x-3">
              <Building size={18} className="text-indigo-600" />
              <CardTitle className="text-sm font-semibold">{tr("acVerifiedCompanies")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-900">{verified}</div>
            <div className="text-sm text-gray-500">Verified company profiles</div>
          </CardContent>
        </Card>
      </div>

      {pending.length > 0 ? (
        <Card className="rounded-2xl shadow-sm border-amber-200">
          <CardHeader className="bg-amber-50 border-b border-amber-100 px-4 py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-amber-900">{tr("acPendingApproval")}</CardTitle>
              <Badge className="bg-amber-100 text-amber-800 border-amber-200">{pending.length} pending</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {pending.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-4 rounded-xl border border-amber-100 bg-white p-4">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 truncate">{r.companyName}</p>
                  <p className="text-sm text-gray-500">{r.email} · {r.industry}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    onClick={() => handleReview(r.id, "approve")}
                    disabled={reviewingId === r.id}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <CheckCircle size={14} className="mr-1" />
                    {tr("acApprove")}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReview(r.id, "reject")}
                    disabled={reviewingId === r.id}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <XCircle size={14} className="mr-1" />
                    {tr("acReject")}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="bg-white border-b border-gray-50 flex items-center justify-between px-4 py-3">
          <CardTitle className="text-base font-bold">{tr("acDirectory")}</CardTitle>
          <div className="text-sm text-gray-500">{loading ? "Loading…" : `${total} companies`}</div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recruiters.length === 0 && !loading ? (
              <div className="col-span-full text-sm text-gray-500 p-6 text-center">No companies found.</div>
            ) : (
              recruiters.map((c) => (
                <div key={String(c.id ?? Math.random())} className="border rounded-2xl p-4 bg-white">
                  <div className="flex items-start space-x-3">
                    <div className="h-12 w-12 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                      <Building className="text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-semibold text-gray-900 truncate">{String(c.companyName ?? c.name ?? "—")}</div>
                          <div className="text-sm text-gray-500 truncate">{String(c.industry ?? "—")}</div>
                        </div>
                        <div className="text-sm text-gray-500 shrink-0">{c.employeeCount ? `${c.employeeCount} emp` : "—"}</div>
                      </div>

                      <div className="mt-3 text-sm text-gray-600 space-y-1">
                        <div className="truncate">{String(c.email ?? "—")}</div>
                        {c.website ? (
                          <a
                            className="text-indigo-600 text-sm hover:underline inline-flex items-center gap-1"
                            href={String(c.website).startsWith("http") ? String(c.website) : `https://${String(c.website)}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Globe size={14} />
                            <span className="truncate">{String(c.website).replace(/^https?:\/\//, "")}</span>
                          </a>
                        ) : null}
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Briefcase size={14} />
                          <span>{String(c.activeJobs ?? 0)} jobs</span>
                        </div>
                        <div className="text-sm">
                          {c.isVerified
                            ? <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">{tr("statusVerified")}</span>
                            : <span className="px-2 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-medium">{tr("statusUnverified")}</span>
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
