"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/auth/auth-provider";
import type { TokenPackage, PaymentHistoryItem, ApiErrorDetail } from "@/lib/api/types";
import { ApiError } from "@/lib/api/types";
import { Coins, CreditCard, History, ExternalLink, Zap, CheckCircle, AlertCircle, Loader2, Briefcase } from "lucide-react";
import { useLocale } from "@/lib/i18n";

const ETB_PER_TOKEN = 10;
const CUSTOM_MIN_ETB = 100;
const TOKENS_PER_JOB_POST = 20;

type VerifyState = "idle" | "verifying" | "success" | "error";

function RecruiterTokensPage() {
  const { api } = useAuth();
  const { tr } = useLocale();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [balance, setBalance] = useState<number | null>(null);
  const [packages, setPackages] = useState<TokenPackage[]>([]);
  const [history, setHistory] = useState<PaymentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<ApiErrorDetail[] | null>(null);
  const [initiating, setInitiating] = useState<string | null>(null);

  const [customEtb, setCustomEtb] = useState("");
  const [customInitiating, setCustomInitiating] = useState(false);

  const [verifyState, setVerifyState] = useState<VerifyState>("idle");
  const [verifyResult, setVerifyResult] = useState<{ tokensGranted: number } | null>(null);

  async function loadData() {
    try {
      const [profile, pkgs, hist] = await Promise.all([
        api.recruiter.me(),
        api.payments.packages(),
        api.payments.history(),
      ]);
      setBalance(profile.tokens ?? 0);
      setPackages(pkgs.packages ?? []);
      setHistory(hist.payments ?? []);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load token data.");
    } finally {
      setLoading(false);
    }
  }

  // Verify Chapa redirect
  useEffect(() => {
    const txRef = searchParams.get("txRef");
    if (!txRef) return;

    router.replace("/recruiter/tokens", { scroll: false });
    setVerifyState("verifying");
    api.payments.verify(txRef)
      .then((result) => {
        setVerifyResult({ tokensGranted: result.tokensGranted });
        setVerifyState("success");
        loadData();
      })
      .catch(() => setVerifyState("error"));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [profile, pkgs, hist] = await Promise.all([
          api.recruiter.me(),
          api.payments.packages(),
          api.payments.history(),
        ]);
        if (cancelled) return;
        setBalance(profile.tokens ?? 0);
        setPackages(pkgs.packages ?? []);
        setHistory(hist.payments ?? []);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof ApiError ? e.message : "Failed to load token data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [api]);

  function setApiError(e: unknown) {
    if (e instanceof ApiError) {
      setError(e.message);
      const details = (e.payload as { error?: { details?: ApiErrorDetail[] } } | null)?.error?.details;
      setErrorDetails(details?.length ? details : null);
    } else {
      setError("Failed to initiate payment.");
      setErrorDetails(null);
    }
  }

  function clearError() { setError(null); setErrorDetails(null); }

  async function handleBuy(packageId: string) {
    setInitiating(packageId);
    clearError();
    try {
      const result = await api.payments.initiate({ packageId });
      if (result.checkoutUrl) window.open(result.checkoutUrl, "_blank", "noopener,noreferrer");
    } catch (e) {
      setApiError(e);
    } finally {
      setInitiating(null);
    }
  }

  async function handleCustomBuy() {
    const etb = parseFloat(customEtb);
    if (!etb || etb < CUSTOM_MIN_ETB) {
      setError(`Minimum custom amount is ${CUSTOM_MIN_ETB} ETB.`);
      setErrorDetails(null);
      return;
    }
    setCustomInitiating(true);
    clearError();
    try {
      const result = await api.payments.initiate({ customEtb: etb });
      if (result.checkoutUrl) window.open(result.checkoutUrl, "_blank", "noopener,noreferrer");
      setCustomEtb("");
    } catch (e) {
      setApiError(e);
    } finally {
      setCustomInitiating(false);
    }
  }

  function statusColor(status: string) {
    if (status === "COMPLETED") return "bg-emerald-50 text-emerald-700 border-emerald-100";
    if (status === "FAILED") return "bg-rose-50 text-rose-700 border-rose-100";
    return "bg-amber-50 text-amber-700 border-amber-100";
  }

  const customEtbNum = parseFloat(customEtb) || 0;
  const customTokensPreview = Math.floor(customEtbNum / ETB_PER_TOKEN);
  const jobPostsAvailable = balance != null ? Math.floor(balance / TOKENS_PER_JOB_POST) : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tokens</h1>
        <p className="text-sm text-slate-500 mt-1">{tr("tokJobCost")}</p>
      </div>

      {/* Verification banners */}
      {verifyState === "verifying" && (
        <div className="flex items-center gap-3 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
          <Loader2 size={16} className="shrink-0 animate-spin" />
          <span className="font-medium">{tr("tokVerifying")}</span>
        </div>
      )}
      {verifyState === "success" && verifyResult && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle size={16} className="shrink-0" />
          <span className="font-medium">{tr("tokPayConfirmed")} — <strong>{verifyResult.tokensGranted} tokens</strong> {tr("tokTokensAdded")}</span>
        </div>
      )}
      {verifyState === "error" && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          <AlertCircle size={16} className="shrink-0" />
          <span className="font-medium">{tr("tokVerifyError")}</span>
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3 space-y-1">
          <p className="font-medium">{error}</p>
          {errorDetails?.map((d, i) => (
            <p key={i} className="text-xs text-red-500">
              {d.path?.length ? <span className="font-mono">{d.path.join(".")}: </span> : null}
              {d.message}
            </p>
          ))}
        </div>
      )}

      {/* Balance card */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="rounded-3xl border-amber-100 shadow-sm bg-amber-50/60">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-amber-100 flex items-center justify-center">
              <Coins size={28} className="text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-amber-700 font-medium">Current Balance</p>
              <p className="text-4xl font-bold text-amber-900">{loading ? "—" : (balance ?? 0)}</p>
              <p className="text-xs text-amber-600 mt-1">tokens · 1 token = {ETB_PER_TOKEN} ETB</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-indigo-100 shadow-sm bg-indigo-50/60">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-indigo-100 flex items-center justify-center">
              <Briefcase size={28} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-indigo-700 font-medium">{tr("tokJobPostsAvailable")}</p>
              <p className="text-4xl font-bold text-indigo-900">{loading ? "—" : (jobPostsAvailable ?? 0)}</p>
              <p className="text-xs text-indigo-600 mt-1">{TOKENS_PER_JOB_POST} {tr("tokPerJobPost")}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Packages */}
      <Card className="rounded-3xl border-slate-200 shadow-sm bg-white">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="text-base flex items-center gap-2"><CreditCard size={16} /> Buy Tokens</CardTitle>
          <CardDescription>Purchase tokens to post jobs. Powered by Chapa.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {packages.length === 0 && !loading ? (
            <p className="text-sm text-slate-500 text-center py-4">{tr("tokNoPackages")}</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {packages.map((pkg) => (
                <div key={pkg.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 flex flex-col gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">{pkg.name}</p>
                    {pkg.description && <p className="text-xs text-slate-500 mt-1">{pkg.description}</p>}
                    <p className="text-xs text-indigo-600 mt-1 font-medium">
                      = {Math.floor(pkg.tokens / TOKENS_PER_JOB_POST)} job post{Math.floor(pkg.tokens / TOKENS_PER_JOB_POST) !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex items-end justify-between gap-2">
                    <div>
                      <p className="text-2xl font-bold text-amber-700">{pkg.tokens}</p>
                      <p className="text-xs text-slate-500">tokens</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900">
                        {(pkg.priceEtb ?? pkg.tokens * ETB_PER_TOKEN).toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500">{tr("tokEthBirr")}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleBuy(pkg.id)}
                    disabled={initiating === pkg.id}
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                    size="sm"
                  >
                    <ExternalLink size={14} className="mr-1" />
                    {initiating === pkg.id ? "Loading…" : "Buy Now"}
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Custom amount */}
          <div className="rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/40 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={15} className="text-indigo-500" />
              <p className="text-sm font-semibold text-indigo-800">Custom Amount</p>
              <span className="text-xs text-indigo-400 ml-auto">1 token = {ETB_PER_TOKEN} ETB</span>
            </div>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="text-xs text-slate-500 mb-1 block">Amount (ETB)</label>
                <div className="relative">
                  <Input
                    type="number"
                    min={CUSTOM_MIN_ETB}
                    step={ETB_PER_TOKEN}
                    placeholder={`min. ${CUSTOM_MIN_ETB} ETB`}
                    value={customEtb}
                    onChange={(e) => setCustomEtb(e.target.value)}
                    className="pr-24"
                  />
                  {customTokensPreview > 0 && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-indigo-600 font-semibold pointer-events-none">
                      = {customTokensPreview} token{customTokensPreview !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>
              <Button
                onClick={handleCustomBuy}
                disabled={customInitiating || !customEtb || parseFloat(customEtb) < CUSTOM_MIN_ETB}
                className="bg-indigo-600 hover:bg-indigo-700 shrink-0"
                size="sm"
              >
                <ExternalLink size={14} className="mr-1" />
                {customInitiating ? "Loading…" : "Buy Now"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment history */}
      {history.length > 0 && (
        <Card className="rounded-3xl border-slate-200 shadow-sm bg-white">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-base flex items-center gap-2"><History size={16} /> Payment History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {history.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-4 px-6 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">+{p.tokensGranted} tokens</p>
                    <p className="text-xs text-slate-400">{p.txRef}</p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <Badge className={statusColor(p.status)}>{p.status}</Badge>
                    <p className="text-xs text-slate-500">{p.amount?.toLocaleString()} ETB · {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ""}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function RecruiterTokensPageWrapper() {
  return (
    <Suspense>
      <RecruiterTokensPage />
    </Suspense>
  );
}
