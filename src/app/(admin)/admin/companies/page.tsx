"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Building, Users, Briefcase, Globe } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { ApiError } from "@/lib/api/types";

type AnyRecruiter = Record<string, any>;

export default function AdminCompaniesPage() {
  const { api } = useAuth();
  const [recruiters, setRecruiters] = useState<AnyRecruiter[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await api.admin.users({ page: 1, limit: 100 });
        if (cancelled) return;
        const list = Array.isArray(res.data) ? res.data.filter((r) => r.role === "RECRUITER") : [];
        setRecruiters(list);
        setError(null);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof ApiError ? e.message : "Failed to load companies.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [api]);

  const total = recruiters.length;
  const active = recruiters.filter((r) => (r.status ?? "") === "ACTIVE").length;
  const verified = recruiters.filter((r) => !!r.isVerified).length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Companies</h1>
        <p className="text-sm text-slate-500">Browse recruiter organizations and profile details.</p>
      </div>

      {error ? (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">{error}</div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="rounded-2xl">
          <CardHeader className="px-4 py-3 bg-emerald-50 border-b border-emerald-100">
            <div className="flex items-center space-x-3">
              <Users size={18} className="text-emerald-600" />
              <CardTitle className="text-sm font-semibold">Total Companies</CardTitle>
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
              <CardTitle className="text-sm font-semibold">Active</CardTitle>
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
              <CardTitle className="text-sm font-semibold">Verified</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-900">{verified}</div>
            <div className="text-sm text-gray-500">Verified company profiles</div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="bg-white border-b border-gray-50 flex items-center justify-between px-4 py-3">
          <CardTitle className="text-base font-bold">Company Directory</CardTitle>
          <div className="text-sm text-gray-500">{loading ? "Loading…" : `${total} companies`}</div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recruiters.length === 0 && !loading ? (
              <div className="col-span-full text-sm text-gray-500 p-6 text-center">No companies found.</div>
            ) : (
              recruiters.map((c) => (
                <div key={c.id ?? Math.random()} className="border rounded-2xl p-4 bg-white">
                  <div className="flex items-start space-x-3">
                    <div className="h-12 w-12 rounded-lg bg-slate-50 flex items-center justify-center">
                      <Building className="text-slate-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-900">{c.companyName ?? c.name ?? "—"}</div>
                          <div className="text-sm text-gray-500">{c.industry ?? "—"}</div>
                        </div>
                        <div className="text-sm text-gray-500">{c.employeeCount ? `${c.employeeCount} emp` : "—"}</div>
                      </div>

                      <div className="mt-3 text-sm text-gray-600 space-y-1">
                        <div>{c.email ?? "—"}</div>
                        {c.website ? (
                          <a className="text-indigo-600 text-sm hover:underline" href={String(c.website).startsWith("http") ? String(c.website) : `https://${String(c.website)}`} target="_blank" rel="noreferrer">
                            <span className="inline-flex items-center space-x-2">
                              <Globe size={14} />
                              <span>{String(c.website).replace(/^https?:\/\//, "")}</span>
                            </span>
                          </a>
                        ) : null}
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Briefcase size={14} />
                          <span>{c.activeJobs ?? 0} jobs</span>
                        </div>
                        <div className="text-sm">
                          {c.isVerified ? <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">Verified</span> : <span className="px-2 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-medium">Unverified</span>}
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
