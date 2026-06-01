"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminHeader } from "@/components/admin/admin-header";
import { RecruiterSidebar, RecruiterSidebarLinks } from "@/components/recruiter/recruiter-sidebar";
import { RequireRole } from "@/components/auth/require-role";
import { useAuth } from "@/components/auth/auth-provider";

export default function RecruiterLayout({ children }: { children: ReactNode }) {
  const { api } = useAuth();
  const router = useRouter();
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api.recruiter
      .me()
      .then((p) => {
        if (cancelled) return;
        if (p.status !== "ACTIVE") {
          router.replace("/recruiter/pending");
          return;
        }
        setCompanyName(p.companyName);
        setReady(true);
      })
      .catch(() => {
        if (cancelled) return;
        setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [api, router]);

  return (
    <RequireRole role="RECRUITER">
      {ready ? (
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
      ) : null}
    </RequireRole>
  );
}
