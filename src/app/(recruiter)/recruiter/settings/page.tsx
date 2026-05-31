"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/auth-provider";
import { ApiError } from "@/lib/api/types";

export default function RecruiterSettingsGeneralPage() {
  const { api } = useAuth();

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
    api.recruiter.me().then((p) => {
      if (cancelled) return;
      setCompanyName(p.companyName ?? "");
      setIndustry(p.industry ?? "");
      setEmployeeCount(p.employeeCount != null ? String(p.employeeCount) : "");
      setWebsite(p.website ?? "");
    }).catch((e) => {
      if (cancelled) return;
      setError(e instanceof ApiError ? e.message : "Failed to load profile.");
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [api]);

  async function handleSave() {
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      const count = employeeCount.trim() !== "" ? Number(employeeCount) : undefined;
      await api.recruiter.updateMe({
        companyName: companyName.trim() || undefined,
        industry: industry.trim() || undefined,
        employeeCount: count,
        website: website.trim() || undefined,
      });
      setSuccess("Settings saved.");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">{error}</div>}
      {success && <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg p-3">{success}</div>}

      <div>
        <h2 className="text-base font-bold text-gray-900">Company Profile</h2>
        <p className="text-sm text-gray-500 mt-1">Update your company details visible to applicants.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">Company Name</label>
          <Input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Acme Corp"
            disabled={loading}
            className="border-gray-200 rounded-lg"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">Industry</label>
          <Input
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="FinTech"
            disabled={loading}
            className="border-gray-200 rounded-lg"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">Employee Count</label>
          <Input
            value={employeeCount}
            onChange={(e) => setEmployeeCount(e.target.value)}
            placeholder="50"
            type="number"
            min={1}
            disabled={loading}
            className="border-gray-200 rounded-lg"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700">Website</label>
          <Input
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://company.com"
            disabled={loading}
            className="border-gray-200 rounded-lg"
          />
        </div>
      </div>

      <div className="pt-2">
        <Button
          onClick={handleSave}
          disabled={saving || loading}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          {saving ? "Saving…" : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
