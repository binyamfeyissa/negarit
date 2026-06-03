"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building, Users, Briefcase, CheckCircle, XCircle } from "lucide-react";
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
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      api.admin.users({ role: "RECRUITER", page: 1, limit: 100 }),
      api.admin.pendingRecruiters(),
    ]).then(([usersRes, pendingRes]) => {
      if (cancelled) return;
      const list = Array.isArray(usersRes.data) ? usersRes.data.filter((r) => r.role === "RECRUITER") : [];
      setRecruiters(list);
      setPending(pendingRes.data ?? []);
      setError(null);
    }).catch((e) => {
      if (cancelled) return;
      setError(e instanceof ApiError ? e.message : "Failed to load companies.");
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [api, reloadKey]);

  async function handleReview(userId: string, action: "approve" | "reject") {
    setReviewingId(userId);
    setError(null);
    setSuccess(null);
    try {
      await api.admin.reviewRecruiter(userId, { decision: action });
      setSuccess(`Recruiter ${action === "approve" ? "approved" : "rejected"}.`);
      setReloadKey((k) => k + 1);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to update recruiter.");
    } finally {
      setReviewingId(null);
    }
  }

  const total = recruiters.length;
  const active = recruiters.filter((r) => (r.status ?? "") === "ACTIVE").length;
  const verified = recruiters.filter((r) => !!(r.isVerified ?? r.is_verified)).length;

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
              <div key={r.id} className="rounded-xl border border-amber-100 bg-white p-4 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 truncate">{(r as AnyRecruiter).company_name as string ?? r.companyName ?? "—"}</p>
                    <p className="text-sm text-gray-500">{r.email} · {r.industry ?? "—"}</p>
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
                {(r as AnyRecruiter).license_doc && typeof (r as AnyRecruiter).license_doc === "string" ? (
                  <a
                    href={String((r as AnyRecruiter).license_doc)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:underline"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    View License Document
                  </a>
                ) : <span className="text-xs text-gray-400 italic">No license document uploaded</span>}
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
                <div key={String(c.id ?? Math.random())} className="border rounded-2xl p-4 bg-white hover:border-indigo-200 hover:shadow-sm transition-all">
                  <div className="flex items-start space-x-3">
                    <div className="h-11 w-11 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                      <Building size={20} className="text-indigo-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-semibold text-gray-900 truncate text-sm">
                            {String(c.company_name ?? c.companyName ?? "—")}
                          </div>
                          <div className="text-xs text-gray-500 truncate mt-0.5">{String(c.industry ?? "—")}</div>
                        </div>
                        {c.is_verified
                          ? <span className="shrink-0 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">{tr("statusVerified")}</span>
                          : <span className="shrink-0 px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full text-xs font-medium">{tr("statusUnverified")}</span>
                        }
                      </div>

                      <div className="mt-2.5 text-xs text-gray-500 truncate">{String(c.email ?? "—")}</div>

                      <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
                        {typeof c.license_doc === "string" && c.license_doc ? (
                          <a
                            href={c.license_doc}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline font-medium"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                            View Document
                          </a>
                        ) : (
                          <span className="text-xs text-gray-300 italic">No document</span>
                        )}
                        {typeof c.created_at === "string" && (
                          <span className="text-xs text-gray-400">
                            Joined {new Date(c.created_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {!c.is_verified && typeof c.id === "string" ? (
                        <div className="flex gap-1.5 mt-3">
                          <Button
                            size="sm"
                            onClick={() => handleReview(String(c.id), "approve")}
                            disabled={reviewingId === String(c.id)}
                            className="h-7 px-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            <CheckCircle size={12} className="mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReview(String(c.id), "reject")}
                            disabled={reviewingId === String(c.id)}
                            className="h-7 px-2 text-xs text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <XCircle size={12} className="mr-1" />
                            Reject
                          </Button>
                        </div>
                      ) : null}
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
