"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RequireRole } from "@/components/auth/require-role";
import { useAuth } from "@/components/auth/auth-provider";

function PendingContent() {
  const router = useRouter();
  const { user, logout, api } = useAuth();
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api.recruiter.me().then((p) => {
      if (cancelled) return;
      setStatus(p.status);
      if (p.status === "ACTIVE") router.replace("/recruiter");
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [api, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-10 shadow-sm text-center">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 ring-1 ring-amber-200">
            <Clock className="text-amber-500" size={28} />
          </div>
        </div>

        <h1 className="mt-6 text-2xl font-bold text-slate-900">Account Under Review</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Your recruiter account is pending admin approval. You will receive access to the dashboard once
          your account is verified.
        </p>

        <div className="mt-8 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-left space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Email</span>
            <span className="font-medium text-slate-700">{user?.email ?? "—"}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Status</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
              <Clock size={11} /> {status ?? "PENDING"}
            </span>
          </div>
        </div>

        <p className="mt-6 text-xs text-slate-400">
          If you have questions, contact support.
        </p>

        <Button
          variant="outline"
          className="mt-6 w-full gap-2"
          onClick={() => logout()}
        >
          <LogOut size={15} />
          Sign out
        </Button>
      </div>
    </div>
  );
}

export default function RecruiterPendingPage() {
  return (
    <RequireRole role="RECRUITER">
      <PendingContent />
    </RequireRole>
  );
}
