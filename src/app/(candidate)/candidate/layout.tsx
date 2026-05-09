"use client";

import { ReactNode, useEffect, useState } from "react";
import { AdminHeader } from "@/components/admin/admin-header";
import { CandidateSidebar, CandidateSidebarLinks } from "@/components/candidate/candidate-sidebar";
import { RequireRole } from "@/components/auth/require-role";
import { useAuth } from "@/components/auth/auth-provider";

export default function CandidateLayout({ children }: { children: ReactNode }) {
  const { api, user } = useAuth();
  const [candidateName, setCandidateName] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api.applicant
      .me()
      .then((p) => {
        if (cancelled) return;
        setCandidateName(p.full_name);
      })
      .catch(() => {
        if (cancelled) return;
        setCandidateName(null);
      });
    return () => {
      cancelled = true;
    };
  }, [api]);

  return (
    <RequireRole role="APPLICANT">
      <div className="flex min-h-screen bg-gray-50/30">
        <CandidateSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader
            userName={candidateName ?? user?.email ?? "Candidate"}
            userRole="Applicant"
            mobileSidebarLinks={<CandidateSidebarLinks />}
          />
          <main className="flex-1 p-4 md:p-8 overflow-y-auto">{children}</main>
        </div>
      </div>
    </RequireRole>
  );
}
