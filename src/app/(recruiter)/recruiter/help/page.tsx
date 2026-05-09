"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/components/auth/auth-provider";
import Link from "next/link";

export default function HelpCenterPage() {
  const { user } = useAuth();
  const role = user?.role ?? 'APPLICANT';

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      <Card className="rounded-3xl border-slate-200 shadow-sm bg-white">
        <CardHeader>
          <CardTitle>Help Center</CardTitle>
          <CardDescription>Guides and quick tips for using the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-slate-700">You are signed in as <strong>{role}</strong>. Use the links below to jump to role-specific help.</p>

          {role === 'RECRUITER' && (
            <div className="space-y-3">
              <h3 className="text-base font-semibold">For Recruiters</h3>
              <ul className="list-disc pl-6 text-sm text-slate-600">
                <li>Post jobs from the "Post Job" button in the dashboard.</li>
                <li>View applicants from a job's detail page; use the stage buttons to move candidates.</li>
                <li>Use the bulk actions on the jobs page to update many applications at once.</li>
                <li>Open a candidate to view cover letter and resume files; schedule interviews from the card.</li>
              </ul>
            </div>
          )}

          {role === 'APPLICANT' && (
            <div className="space-y-3">
              <h3 className="text-base font-semibold">For Applicants</h3>
              <ul className="list-disc pl-6 text-sm text-slate-600">
                <li>Create a complete profile and upload your resume in your profile page.</li>
                <li>Search jobs from the public listings and apply from the job page.</li>
                <li>Track application status from your dashboard.</li>
              </ul>
            </div>
          )}

          {role === 'ADMIN' && (
            <div className="space-y-3">
              <h3 className="text-base font-semibold">For Administrators</h3>
              <ul className="list-disc pl-6 text-sm text-slate-600">
                <li>Manage users and recruiters from the admin console.</li>
                <li>Use the jobs and companies admin pages to monitor platform activity.</li>
              </ul>
            </div>
          )}

          <div className="mt-6">
            <Link href="/recruiter/settings" className="text-indigo-600 hover:underline">Open account settings</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
