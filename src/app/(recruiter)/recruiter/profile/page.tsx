"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth/auth-provider";
import type { RecruiterProfile } from "@/lib/api/types";
import { ApiError } from "@/lib/api/types";
import { Coins } from "lucide-react";

export default function RecruiterProfilePage() {
  const { api, user } = useAuth();
  const [profile, setProfile] = useState<RecruiterProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [employeeCount, setEmployeeCount] = useState("");
  const [website, setWebsite] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const p = await api.recruiter.me();
        if (cancelled) return;
        setProfile(p);
        setCompanyName(p.companyName ?? "");
        setIndustry(p.industry ?? "");
        setEmployeeCount(p.employeeCount != null ? String(p.employeeCount) : "");
        setWebsite(p.website ?? "");
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof ApiError ? e.message : "Failed to load profile.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [api]);

  async function handleSave() {
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      const count = employeeCount.trim() !== "" ? Number(employeeCount) : undefined;
      const updated = await api.recruiter.updateMe({
        companyName: companyName.trim() || undefined,
        industry: industry.trim() || undefined,
        employeeCount: count,
        website: website.trim() || undefined,
      });
      setProfile(updated);
      setSuccess("Profile updated.");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      {error ? <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">{error}</div> : null}
      {success ? <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg p-3">{success}</div> : null}

      {/* Header card */}
      <Card className="rounded-3xl border-slate-200 shadow-sm bg-white">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-2xl font-bold text-slate-900">{profile?.companyName ?? user?.email ?? "—"}</p>
              <p className="text-sm text-slate-500 mt-1">{profile?.email ?? user?.email}</p>
              <div className="flex gap-2 mt-3 flex-wrap">
                <Badge className={profile?.isVerified ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100"}>
                  {profile?.isVerified ? "Verified" : "Unverified"}
                </Badge>
                <Badge className="bg-slate-50 text-slate-700 border-slate-100">
                  {profile?.status ?? "—"}
                </Badge>
                <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100">
                  {profile?.activeJobs ?? 0} active jobs
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-amber-50 border border-amber-100 px-4 py-3">
              <Coins size={20} className="text-amber-600" />
              <div>
                <p className="text-xs text-amber-600 font-medium">Token Balance</p>
                <p className="text-xl font-bold text-amber-800">{profile?.tokens ?? "—"}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit profile */}
      <Card className="rounded-3xl border-slate-200 shadow-sm bg-white">
        <CardHeader>
          <CardTitle>Edit Company Profile</CardTitle>
          <CardDescription>Update your company details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Company Name</label>
              <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Acme Corp" disabled={loading} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Industry</label>
              <Input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="FinTech" disabled={loading} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Employee Count</label>
              <Input value={employeeCount} onChange={(e) => setEmployeeCount(e.target.value)} placeholder="50" type="number" min={1} disabled={loading} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Website</label>
              <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://company.com" disabled={loading} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm pt-2">
            <div>
              <p className="text-slate-400 text-xs">Total Hires</p>
              <p className="font-semibold text-slate-900">{profile?.totalHires ?? "—"}</p>
            </div>
            <div>
              <p className="text-slate-400 text-xs">Member Since</p>
              <p className="font-semibold text-slate-900">
                {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "—"}
              </p>
            </div>
          </div>

          <div className="pt-2">
            <Button onClick={handleSave} disabled={saving || loading} className="bg-indigo-600 hover:bg-indigo-700">
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
