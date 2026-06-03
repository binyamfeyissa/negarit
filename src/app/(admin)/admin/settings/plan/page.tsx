"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Lock, Mail, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { ApiError } from "@/lib/api/types";

export default function SettingsPasswordPage() {
  const { api, user } = useAuth();
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSendReset() {
    if (!user?.email) return;
    setStatus("loading");
    setErrorMsg("");
    try {
      await api.auth.forgotPassword(user.email);
      setStatus("sent");
    } catch (e) {
      setStatus("error");
      setErrorMsg(e instanceof ApiError ? e.message : "Failed to send reset email. Please try again.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-gray-900">Change Password</h2>
        <p className="text-sm text-gray-500 mt-1">We'll send a password reset link to your admin email address.</p>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white divide-y divide-gray-100 overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4">
          <div className="h-9 w-9 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
            <Lock size={16} className="text-indigo-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">Password reset via email</p>
            <p className="text-xs text-gray-500 mt-0.5">A secure link will be sent to <span className="font-medium text-gray-700">{user?.email ?? "your email"}</span></p>
          </div>
        </div>

        <div className="px-5 py-4 bg-gray-50/60">
          {status === "idle" || status === "loading" ? (
            <Button
              onClick={handleSendReset}
              disabled={status === "loading"}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-2"
            >
              {status === "loading" ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Mail size={15} />
              )}
              {status === "loading" ? "Sending…" : "Send Reset Link"}
            </Button>
          ) : status === "sent" ? (
            <div className="flex items-start gap-3 text-sm text-emerald-700">
              <CheckCircle size={18} className="shrink-0 mt-0.5 text-emerald-500" />
              <div>
                <p className="font-semibold">Reset email sent!</p>
                <p className="text-emerald-600 text-xs mt-0.5">Check your inbox at <span className="font-medium">{user?.email}</span> and follow the link to set a new password.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-sm text-red-600">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <p>{errorMsg}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStatus("idle")}
                className="text-xs"
              >
                Try again
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-amber-100 bg-amber-50/60 px-5 py-4 text-sm text-amber-700">
        <p className="font-semibold mb-0.5">Security reminder</p>
        <p className="text-amber-600 text-xs">After resetting your password, all existing sessions remain active. Make sure to use a strong, unique password.</p>
      </div>
    </div>
  );
}
