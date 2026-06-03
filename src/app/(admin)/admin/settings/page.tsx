"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Mail, ShieldCheck, User, Clock } from "lucide-react";

export default function SettingsAccountPage() {
  const { user } = useAuth();

  const fields = [
    {
      icon: <Mail size={15} className="text-indigo-500" />,
      label: "Email address",
      value: user?.email ?? "—",
    },
    {
      icon: <ShieldCheck size={15} className="text-emerald-500" />,
      label: "Role",
      value: (
        <Badge className="bg-rose-50 text-rose-700 border-rose-100 text-xs font-semibold shadow-none">
          ADMIN
        </Badge>
      ),
    },
    {
      icon: <User size={15} className="text-slate-400" />,
      label: "User ID",
      value: <span className="font-mono text-xs text-gray-500">{user?.id ?? "—"}</span>,
    },
    {
      icon: <Clock size={15} className="text-amber-500" />,
      label: "Verification",
      value: user?.isVerified ? (
        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 text-xs font-semibold shadow-none">Verified</Badge>
      ) : (
        <Badge className="bg-amber-50 text-amber-700 border-amber-100 text-xs font-semibold shadow-none">Unverified</Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-gray-900">Account Information</h2>
        <p className="text-sm text-gray-500 mt-1">Your admin account details. Contact a superadmin to change your email.</p>
      </div>

      <div className="divide-y divide-gray-100 rounded-xl border border-gray-100 overflow-hidden">
        {fields.map((f) => (
          <div key={f.label} className="flex items-center justify-between px-5 py-4 bg-white hover:bg-gray-50/50 transition-colors">
            <div className="flex items-center gap-2.5 text-sm text-gray-500 font-medium">
              {f.icon}
              {f.label}
            </div>
            <div className="text-sm font-semibold text-gray-900">{f.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 px-5 py-4 text-sm text-indigo-700">
        <p className="font-semibold mb-0.5">Admin account</p>
        <p className="text-indigo-600 text-xs">This account has full platform access. To update account details, use the password reset flow or contact your system administrator.</p>
      </div>
    </div>
  );
}
