"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/components/auth/auth-provider";
import Link from "next/link";

export default function RecruiterProfilePage() {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <Card className="rounded-3xl border-slate-200 shadow-sm bg-white">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Account and company details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm text-slate-700">
            <div>
              <p className="text-xs text-slate-400">Name / Company</p>
              <p className="font-semibold text-slate-900">{user?.email ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Role</p>
              <p className="font-semibold text-slate-900">{user?.role ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Account actions</p>
              <div className="mt-2 flex items-center gap-3">
                <Link href="/recruiter/settings" className="text-indigo-600 hover:underline">Open settings</Link>
                <Link href="/" className="text-sm text-slate-500 hover:underline">Sign out</Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
