"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/lib/i18n";

export default function CandidateSettingsPage() {
  const { tr } = useLocale();

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <Card className="rounded-3xl border-slate-200 shadow-sm bg-white">
        <CardHeader>
          <CardTitle>{tr("settingsNav")}</CardTitle>
          <CardDescription>Manage your account preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold text-slate-900 mb-4">{tr("csNotifications")}</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm text-slate-700">{tr("csNewMatches")}</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm text-slate-700">{tr("csRecruiterViews")}</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm text-slate-700">{tr("csWeeklyDigest")}</span>
              </label>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6">
            <h3 className="font-semibold text-slate-900 mb-4">{tr("csPrivacy")}</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm text-slate-700">{tr("csAllowContact")}</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" className="rounded" />
                <span className="text-sm text-slate-700">{tr("csPrivateProfile")}</span>
              </label>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6 flex gap-3">
            <Button className="bg-indigo-600 hover:bg-indigo-700">{tr("save")}</Button>
            <Button variant="outline">{tr("cancel")}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
