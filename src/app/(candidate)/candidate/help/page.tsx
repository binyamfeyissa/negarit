"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/components/auth/auth-provider";

export default function CandidateHelpPage() {
  const { user } = useAuth();

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      <Card className="rounded-3xl border-slate-200 shadow-sm bg-white">
        <CardHeader>
          <CardTitle>Help Center</CardTitle>
          <CardDescription>Guides and tips for job seekers using the platform</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-base font-semibold mb-3">Getting Started</h3>
            <ul className="list-disc pl-6 text-sm text-slate-600 space-y-2">
              <li>Complete your profile to increase visibility to recruiters</li>
              <li>Upload a professional resume in PDF, DOC, or DOCX format</li>
              <li>The resume parser will analyze your document and calculate a quality score</li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-semibold mb-3">Finding & Applying to Jobs</h3>
            <ul className="list-disc pl-6 text-sm text-slate-600 space-y-2">
              <li>Browse available job listings from the dashboard</li>
              <li>View detailed job descriptions including requirements and salary</li>
              <li>Submit applications directly through the platform</li>
              <li>Add a personalized cover letter to increase your chances</li>
              <li>Track all your applications and their status in one place</li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-semibold mb-3">Application Status</h3>
            <ul className="list-disc pl-6 text-sm text-slate-600 space-y-2">
              <li><strong>Submitted:</strong> Your application was received</li>
              <li><strong>Reviewed:</strong> Recruiter reviewed your application</li>
              <li><strong>Shortlisted:</strong> You passed the initial screening</li>
              <li><strong>Interview:</strong> Invited to interview round</li>
              <li><strong>Offered:</strong> Job offer received</li>
              <li><strong>Rejected:</strong> Not selected for this role</li>
            </ul>
          </div>

          <div>
            <h3 className="text-base font-semibold mb-3">Improving Your Chances</h3>
            <ul className="list-disc pl-6 text-sm text-slate-600 space-y-2">
              <li>Keep your profile updated with current skills and experience</li>
              <li>Write meaningful cover letters tailored to each role</li>
              <li>Ensure your resume is well-formatted for parsing</li>
              <li>Check the match score before applying to see compatibility</li>
              <li>Respond promptly to interview invitations</li>
            </ul>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
            <p className="text-sm text-emerald-800">
              <strong>💡 Tip:</strong> Complete your profile and upload a resume to enable recruiter discovery. Higher profile completeness increases match scores with job opportunities.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
