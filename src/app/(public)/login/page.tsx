"use client";

import { Suspense, useMemo, useState } from "react";
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

type Mode = "login" | "register_applicant" | "register_recruiter";

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
  const { login, registerApplicant, registerRecruiter } = useAuth();
  const { tr } = useLocale();

  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [licenseFile, setLicenseFile] = useState<File | null>(null);

  const title = useMemo(() => {
    if (mode === "login") return tr("loginTitle");
    if (mode === "register_applicant") return tr("regApplicantTitle");
    return tr("regRecruiterTitle");
  }, [mode, tr]);

  const subtitle = useMemo(() => {
    if (mode === "login") return tr("loginSubtitle");
    if (mode === "register_applicant") return tr("regApplicantSubtitle");
    return tr("regRecruiterSubtitle");
  }, [mode, tr]);

  async function onSubmit() {
    setError(null);
    setLoading(true);
    try {
      if (mode === "login") {
        const u = await login(email, password);
        const next = searchParams.get("next");
        router.push(next && next.startsWith("/") ? next : roleHome(u.role));
        return;
      }
      if (mode === "register_applicant") {
        const u = await registerApplicant({ fullName, email, password, phone: phone || undefined });
        router.push(roleHome(u.role));
        return;
      }
      const res = await registerRecruiter({
        companyName,
        email,
        password,
        industry,
        licenseFile,
      });
      setMode("login");
      setError(`Recruiter registered (${res.userId}). Await admin approval, then log in.`);
    } catch (e) {
      if (e instanceof ApiError) setError(e.message);
      else setError("Something went wrong. Please try again.");
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

          {mode === "register_applicant" ? (
            <div className="space-y-2">
              <label className="text-sm font-medium">{tr("fullNameLabel")} <span className="text-red-500">*</span></label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Abebe Bekele" className="rounded-xl border-gray-200" />
            </div>
          ) : null}

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
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+2519..." className="rounded-xl border-gray-200" />
            </div>
          ) : null}

          <div className="space-y-2">
            <label className="text-sm font-medium">{tr("emailLabel")} <span className="text-red-500">*</span></label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="name@example.com" className="rounded-xl border-gray-200" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">{tr("passwordLabel")} <span className="text-red-500">*</span></label>
            <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="••••••••" className="rounded-xl border-gray-200" />
          </div>

          {mode === "login" ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="keep-login" />
                <label htmlFor="keep-login" className="text-sm font-medium leading-none text-gray-500">{tr("keepLoggedIn")}</label>
              </div>
              <span className="text-sm text-gray-400 font-medium">{tr("forgotPasswordLink")}</span>
            </div>
          ) : null}

          <Button disabled={loading} onClick={onSubmit} className="w-full bg-indigo-500 hover:bg-indigo-600 rounded-xl mt-2 p-6" size="lg">
            {loading ? "…" : mode === "login" ? tr("loginBtn") : tr("createAccountBtn")}
          </Button>

          <div className="mt-4 text-center text-sm text-gray-500 space-y-2">
            {mode !== "login" ? (
              <button onClick={() => setMode("login")} className="text-indigo-600 font-medium">{tr("backToLoginLink")}</button>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <button onClick={() => setMode("register_applicant")} className="text-indigo-600 font-medium">{tr("regAsApplicantLink")}</button>
                <span className="text-gray-300">|</span>
                <button onClick={() => setMode("register_recruiter")} className="text-indigo-600 font-medium">{tr("regAsRecruiterLink")}</button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
