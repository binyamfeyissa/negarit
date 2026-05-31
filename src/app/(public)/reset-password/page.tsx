"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api/types";
import { useAuth } from "@/components/auth/auth-provider";
import { useLocale } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { Eye, EyeOff } from "lucide-react";

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { api } = useAuth();
  const { tr } = useLocale();

  const token = searchParams.get("token") ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit() {
    if (!token) {
      setError(tr("resetMissingToken"));
      return;
    }
    if (newPassword.length < 8) {
      setError(tr("resetPasswordTooShort"));
      return;
    }
    if (newPassword !== confirm) {
      setError(tr("resetPasswordMismatch"));
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await api.auth.resetPassword(token, newPassword);
      setDone(true);
    } catch (e) {
      if (e instanceof ApiError) setError(e.message);
      else setError(tr("genericError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="w-full flex items-center justify-between mb-6">
        <Image src="/logo.png" alt="Negarit" width={140} height={40} priority className="h-10 w-auto object-contain" />
        <LanguageSwitcher />
      </div>

      <Card className="w-full rounded-2xl shadow-sm border-gray-100 p-4">
        <CardHeader className="flex flex-col items-center">
          <CardTitle className="text-2xl text-center">{tr("resetTitle")}</CardTitle>
          <CardDescription className="text-center text-gray-500">{tr("resetSubtitle")}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error ? <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">{error}</div> : null}

          {done ? (
            <div className="space-y-4 text-center">
              <div className="text-sm text-gray-600">{tr("resetSuccessBody")}</div>
              <Button onClick={() => router.push("/login")} className="w-full bg-indigo-500 hover:bg-indigo-600 rounded-xl p-6" size="lg">
                {tr("loginBtn")}
              </Button>
            </div>
          ) : (
            <>
              {!token ? (
                <div className="text-sm text-red-600">{tr("resetMissingToken")}</div>
              ) : null}

              <div className="space-y-2">
                <label className="text-sm font-medium">{tr("resetNewPasswordLabel")} <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Input
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    type={showNew ? "text" : "password"}
                    placeholder="••••••••"
                    className="rounded-xl border-gray-200 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((v) => !v)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">{tr("resetConfirmLabel")} <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Input
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    className="rounded-xl border-gray-200 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <Button disabled={loading || !token} onClick={onSubmit} className="w-full bg-indigo-500 hover:bg-indigo-600 rounded-xl mt-2 p-6" size="lg">
                {loading ? "…" : tr("resetBtn")}
              </Button>

              <div className="text-center text-sm">
                <button onClick={() => router.push("/login")} className="text-indigo-600 font-medium hover:underline">
                  {tr("backToLoginLink")}
                </button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
