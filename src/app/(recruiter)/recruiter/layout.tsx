"use client";

import { ReactNode, useEffect, useState } from "react";
import { AdminHeader } from "@/components/admin/admin-header";
import { RecruiterSidebar, RecruiterSidebarLinks } from "@/components/recruiter/recruiter-sidebar";
import { RequireRole } from "@/components/auth/require-role";
import { useAuth } from "@/components/auth/auth-provider";

export default function RecruiterLayout({ children }: { children: ReactNode }) {
  const { api } = useAuth();
  const [companyName, setCompanyName] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api.recruiter
      .me()
      .then((p) => {
        if (cancelled) return;
        setCompanyName(p.companyName);
      })
      .catch(() => {
        if (cancelled) return;
        setCompanyName(null);
      });
    return () => {
      cancelled = true;
    };
  }, [api]);

  return (
    <RequireRole role="RECRUITER" requireVerified>
      <div className="flex min-h-screen bg-gray-50/30">
        <RecruiterSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader
            userName={companyName ?? "Recruiter"}
            userRole="Recruiter"
            mobileSidebarLinks={<RecruiterSidebarLinks />}
          />
          <main className="flex-1 p-4 md:p-8 overflow-y-auto">{children}</main>
        </div>
      </div>
    </RequireRole>
  );
}
