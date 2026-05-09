"use client";

import { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { RequireRole } from "@/components/auth/require-role";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <RequireRole role="ADMIN">
      <div className="flex min-h-screen bg-[#fcfcfc] text-slate-800">
        <AdminSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <AdminHeader />
          <main className="p-6 overflow-y-auto">{children}</main>
        </div>
      </div>
    </RequireRole>
  );
}
