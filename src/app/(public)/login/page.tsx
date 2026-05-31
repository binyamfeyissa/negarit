"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ApiError } from "@/lib/api/types";
import { roleHome, useAuth } from "@/components/auth/auth-provider";
import { useLocale } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { Eye, EyeOff } from "lucide-react";

type Mode = "login" | "register_applicant" | "register_recruiter" | "verify_otp" | "forgot_password" | "forgot_sent";

const OTP_TTL = 10 * 60; // 10 minutes in seconds

export default function AuthPage() {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  );
}

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, registerApplicant, registerRecruiter, verifyEmail, resendOtp, api } = useAuth();
  const { tr } = useLocale();

  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [licenseFile, setLicenseFile] = useState<File | null>(null);

  const [showPassword, setShowPassword] = useState(false);

  const [otp, setOtp] = useState("");
  const [otpSecondsLeft, setOtpSecondsLeft] = useState(OTP_TTL);
  const otpTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function startOtpTimer() {
    setOtpSecondsLeft(OTP_TTL);
    if (otpTimerRef.current) clearInterval(otpTimerRef.current);
    otpTimerRef.current = setInterval(() => {
      setOtpSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(otpTimerRef.current!);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  useEffect(() => () => { if (otpTimerRef.current) clearInterval(otpTimerRef.current); }, []);

  function formatCountdown(secs: number) {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  const title = useMemo(() => {
    if (mode === "login") return tr("loginTitle");
    if (mode === "register_applicant") return tr("regApplicantTitle");
    if (mode === "register_recruiter") return tr("regRecruiterTitle");
    if (mode === "verify_otp") return tr("otpTitle");
    if (mode === "forgot_password") return tr("forgotTitle");
    return tr("forgotSentTitle");
  }, [mode, tr]);

  const subtitle = useMemo(() => {
    if (mode === "login") return tr("loginSubtitle");
    if (mode === "register_applicant") return tr("regApplicantSubtitle");
    if (mode === "register_recruiter") return tr("regRecruiterSubtitle");
    if (mode === "verify_otp") return tr("otpSubtitle");
    if (mode === "forgot_password") return tr("forgotSubtitle");
    return tr("forgotSentSubtitle");
  }, [mode, tr]);

  async function onSubmit() {
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      if (mode === "login") {
        const u = await login(email, password);
        const next = searchParams.get("next");
        router.push(next && next.startsWith("/") ? next : roleHome(u.role));
        return;
      }

      if (mode === "register_applicant") {
        await registerApplicant({ fullName, email, password, phone: phone || undefined });
        startOtpTimer();
        setMode("verify_otp");
        return;
      }

      if (mode === "register_recruiter") {
        const res = await registerRecruiter({ companyName, email, password, industry, licenseFile });
        setMode("login");
        setInfo(`${tr("recruiterPendingMsg")} (ID: ${res.userId})`);
        return;
      }

      if (mode === "verify_otp") {
        const u = await verifyEmail(otp);
        router.push(roleHome(u.role));
        return;
      }

      if (mode === "forgot_password") {
        await api.auth.forgotPassword(email);
        setMode("forgot_sent");
        return;
      }
    } catch (e) {
      if (e instanceof ApiError) setError(e.message);
      else setError(tr("genericError"));
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOtp() {
    setError(null);
    try {
      await resendOtp();
      startOtpTimer();
      setInfo(tr("otpResent"));
    } catch (e) {
      if (e instanceof ApiError) setError(e.message);
      else setError(tr("genericError"));
    }
  }

  function goToMode(next: Mode) {
    setError(null);
    setInfo(null);
    setMode(next);
  }

  const submitLabel = useMemo(() => {
    if (loading) return "…";
    if (mode === "login") return tr("loginBtn");
    if (mode === "verify_otp") return tr("otpVerifyBtn");
    if (mode === "forgot_password") return tr("forgotSendBtn");
    return tr("createAccountBtn");
  }, [loading, mode, tr]);

  return (
    <div className="w-full max-w-md">
      <div className="w-full flex items-center justify-between mb-6">
        <Image src="/logo.png" alt="Negarit" width={140} height={40} priority className="h-10 w-auto object-contain" />
        <LanguageSwitcher />
      </div>

      <Card className="w-full rounded-2xl shadow-sm border-gray-100 p-4">
        <CardHeader className="flex flex-col items-center">
          <Avatar className="h-16 w-16 mb-4 border border-indigo-100 shadow-sm bg-indigo-50 text-indigo-600">
            <AvatarFallback>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-2xl text-center">{title}</CardTitle>
          <CardDescription className="text-center text-gray-500">{subtitle}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error ? <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">{error}</div> : null}
          {info ? <div className="text-sm text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-lg p-3">{info}</div> : null}

          {/* OTP screen */}
          {mode === "verify_otp" ? (
            <>
              <div className="text-center text-sm text-gray-500">
                {tr("otpExpiresIn")} <span className={`font-mono font-semibold ${otpSecondsLeft < 60 ? "text-red-500" : "text-indigo-600"}`}>{formatCountdown(otpSecondsLeft)}</span>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{tr("otpLabel")} <span className="text-red-500">*</span></label>
                <Input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  className="rounded-xl border-gray-200 text-center tracking-widest text-lg"
                  inputMode="numeric"
                />
              </div>
              <Button disabled={loading} onClick={onSubmit} className="w-full bg-indigo-500 hover:bg-indigo-600 rounded-xl mt-2 p-6" size="lg">
                {submitLabel}
              </Button>
              <div className="text-center text-sm text-gray-500">
                {tr("otpNoCode")}{" "}
                <button
                  onClick={handleResendOtp}
                  disabled={otpSecondsLeft > 0 && otpSecondsLeft < OTP_TTL - 30}
                  className="text-indigo-600 font-medium disabled:opacity-40"
                >
                  {tr("otpResendBtn")}
                </button>
              </div>
            </>
          ) : mode === "forgot_sent" ? (
            <div className="text-center space-y-4 py-2">
              <div className="text-sm text-gray-600">{tr("forgotSentBody")}</div>
              <Button variant="outline" onClick={() => goToMode("login")} className="w-full rounded-xl">
                {tr("backToLoginLink")}
              </Button>
            </div>
          ) : (
            <>
              {/* Register applicant fields */}
              {mode === "register_applicant" ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium">{tr("fullNameLabel")} <span className="text-red-500">*</span></label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Abebe Bekele" className="rounded-xl border-gray-200" />
                </div>
              ) : null}

              {/* Register recruiter fields */}
              {mode === "register_recruiter" ? (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{tr("companyNameLabel")} <span className="text-red-500">*</span></label>
                    <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Ethio Telecom" className="rounded-xl border-gray-200" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{tr("industryLabel")} <span className="text-red-500">*</span></label>
                    <Input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="FinTech" className="rounded-xl border-gray-200" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{tr("licenseDocLabel")}</label>
                    <Input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setLicenseFile(e.target.files?.[0] ?? null)} className="rounded-xl border-gray-200" />
                  </div>
                </>
              ) : null}

              {mode === "register_applicant" ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium">{tr("phoneLabel")}</label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+2519…" className="rounded-xl border-gray-200" />
                </div>
              ) : null}

              {/* Email — shown on all non-OTP, non-sent modes */}
              <div className="space-y-2">
                <label className="text-sm font-medium">{tr("emailLabel")} <span className="text-red-500">*</span></label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="name@example.com" className="rounded-xl border-gray-200" />
              </div>

              {/* Password — hidden on forgot_password */}
              {mode !== "forgot_password" ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium">{tr("passwordLabel")} <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="rounded-xl border-gray-200 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              ) : null}

              {mode === "login" ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="keep-login" />
                    <label htmlFor="keep-login" className="text-sm font-medium leading-none text-gray-500">{tr("keepLoggedIn")}</label>
                  </div>
                  <button onClick={() => goToMode("forgot_password")} className="text-sm text-indigo-600 font-medium hover:underline">
                    {tr("forgotPasswordLink")}
                  </button>
                </div>
              ) : null}

              <Button disabled={loading} onClick={onSubmit} className="w-full bg-indigo-500 hover:bg-indigo-600 rounded-xl mt-2 p-6" size="lg">
                {submitLabel}
              </Button>

              <div className="mt-4 text-center text-sm text-gray-500 space-y-2">
                {mode !== "login" ? (
                  <button onClick={() => goToMode("login")} className="text-indigo-600 font-medium">{tr("backToLoginLink")}</button>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <button onClick={() => goToMode("register_applicant")} className="text-indigo-600 font-medium">{tr("regAsApplicantLink")}</button>
                    <span className="text-gray-300">|</span>
                    <button onClick={() => goToMode("register_recruiter")} className="text-indigo-600 font-medium">{tr("regAsRecruiterLink")}</button>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
