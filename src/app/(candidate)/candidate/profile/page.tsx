"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/components/auth/auth-provider";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CandidateProfilePage() {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <Card className="rounded-3xl border-slate-200 shadow-sm bg-white">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Manage your account and profile information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Email Address</p>
              <p className="mt-2 text-base font-semibold text-slate-900">{user?.email ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Account Role</p>
              <p className="mt-2 text-base font-semibold text-slate-900">{user?.role ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Status</p>
              <p className="mt-2 text-base font-semibold text-slate-900">{user?.isVerified ? "Verified" : "Pending Verification"}</p>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6 space-y-3">
            <h3 className="font-semibold text-slate-900">Account Actions</h3>
            <div className="flex gap-3 flex-wrap">
              <Link href="/candidate/settings">
                <Button variant="outline">
                  Account Settings
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="text-rose-600 hover:text-rose-700">
                  Sign Out
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-slate-200 shadow-sm bg-slate-50">
        <CardHeader>
          <CardTitle className="text-base">Profile Completeness</CardTitle>
          <CardDescription>Complete these sections to improve visibility</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900">Personal Information</p>
              <p className="text-xs text-slate-500">Name, email, phone number</p>
            </div>
            <span className="text-sm font-semibold text-indigo-600">Recommended</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900">Resume Upload</p>
              <p className="text-xs text-slate-500">PDF or DOC format</p>
            </div>
            <span className="text-sm font-semibold text-emerald-600">Most Important</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900">Skills & Experience</p>
              <p className="text-xs text-slate-500">Technical and soft skills</p>
            </div>
            <span className="text-sm font-semibold text-indigo-600">Recommended</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
