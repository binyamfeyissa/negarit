"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/auth/auth-provider";
import type { TokenPackage, PaymentHistoryItem, TokenBalance, ApiErrorDetail } from "@/lib/api/types";
import { ApiError } from "@/lib/api/types";
import { Coins, CreditCard, History, ExternalLink, Zap } from "lucide-react";
import { useLocale } from "@/lib/i18n";

const ETB_PER_TOKEN = 10;
const CUSTOM_MIN_ETB = 100;

export default function CandidateTokensPage() {
  const { api } = useAuth();
  const { tr } = useLocale();
  const [balance, setBalance] = useState<TokenBalance | null>(null);
  const [packages, setPackages] = useState<TokenPackage[]>([]);
  const [history, setHistory] = useState<PaymentHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<ApiErrorDetail[] | null>(null);
  const [initiating, setInitiating] = useState<string | null>(null);

  const [customEtb, setCustomEtb] = useState("");
  const [customInitiating, setCustomInitiating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [bal, pkgs, hist] = await Promise.all([
          api.applicant.tokenBalance(),
          api.payments.packages(),
          api.payments.history(),
        ]);
        if (cancelled) return;
        setBalance(bal);
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

  function clearError() {
    setError(null);
    setErrorDetails(null);
  }

  async function handleBuy(packageId: string) {
    setInitiating(packageId);
    clearError();
    try {
      const result = await api.payments.initiate({ packageId });
      if (result.checkoutUrl) {
        window.open(result.checkoutUrl, "_blank", "noopener,noreferrer");
      }
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
      if (result.checkoutUrl) {
        window.open(result.checkoutUrl, "_blank", "noopener,noreferrer");
      }
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

  function tokenTypeColor(type: string) {
    if (type?.startsWith("CREDIT")) return "bg-emerald-50 text-emerald-700 border-emerald-100";
    return "bg-rose-50 text-rose-700 border-rose-100";
  }

  const customEtbNum = parseFloat(customEtb) || 0;
  const customTokensPreview = Math.floor(customEtbNum / ETB_PER_TOKEN);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{tr("tokens")}</h1>
        <p className="text-sm text-slate-500 mt-1">{tr("cdTokensDesc")}</p>
      </div>

      {error ? (
        <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3 space-y-1">
          <p className="font-medium">{error}</p>
          {errorDetails?.map((d, i) => (
            <p key={i} className="text-xs text-red-500">
              {d.path?.length ? <span className="font-mono">{d.path.join(".")}: </span> : null}
              {d.message}
            </p>
          ))}
        </div>
      ) : null}

      {/* Balance card */}
      <Card className="rounded-3xl border-amber-100 shadow-sm bg-amber-50/60">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-amber-100 flex items-center justify-center">
            <Coins size={28} className="text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-amber-700 font-medium">{tr("ctBalance")}</p>
            <p className="text-4xl font-bold text-amber-900">{loading ? "—" : (balance?.tokens ?? 0)}</p>
            <p className="text-xs text-amber-600 mt-1">tokens available · 1 token = {ETB_PER_TOKEN} ETB</p>
          </div>
        </CardContent>
      </Card>

      {/* Token history */}
      {balance?.history && balance.history.length > 0 ? (
        <Card className="rounded-3xl border-slate-200 shadow-sm bg-white">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-base flex items-center gap-2"><History size={16} /> {tr("ctHistory")}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {balance.history.map((entry, i) => (
                <div key={i} className="flex items-center justify-between gap-4 px-6 py-3">
                  <div className="flex items-center gap-3">
                    <Badge className={tokenTypeColor(entry.type)}>{entry.type}</Badge>
                    <span className="text-sm text-slate-600">{entry.description ?? "—"}</span>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${entry.type?.startsWith("CREDIT") ? "text-emerald-700" : "text-rose-700"}`}>
                      {entry.type?.startsWith("CREDIT") ? "+" : "-"}{Math.abs(entry.amount)}
                    </p>
                    <p className="text-xs text-slate-400">{entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : ""}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Packages */}
      <Card className="rounded-3xl border-slate-200 shadow-sm bg-white">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="text-base flex items-center gap-2"><CreditCard size={16} /> {tr("ctBuyTokens")}</CardTitle>
          <CardDescription>Purchase a token package to unlock AI features. Powered by Chapa.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {packages.length === 0 && !loading ? (
            <p className="text-sm text-slate-500 text-center py-4">No packages available.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {packages.map((pkg) => (
                <div key={pkg.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5 flex flex-col gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">{pkg.name}</p>
                    {pkg.description ? <p className="text-xs text-slate-500 mt-1">{pkg.description}</p> : null}
                  </div>
                  <div className="flex items-end justify-between gap-2">
                    <div>
                      <p className="text-2xl font-bold text-amber-700">{pkg.tokens}</p>
                      <p className="text-xs text-slate-500">tokens</p>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-bold text-slate-900">{pkg.priceEtb?.toLocaleString()} ETB</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleBuy(pkg.id)}
                    disabled={initiating === pkg.id}
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                    size="sm"
                  >
                    <ExternalLink size={14} className="mr-1" />
                    {initiating === pkg.id ? tr("loadingText") : tr("ctPurchase")}
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Custom amount */}
          <div className="rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/40 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={15} className="text-indigo-500" />
              <p className="text-sm font-semibold text-indigo-800">{tr("ctCustomAmount")}</p>
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
                {customInitiating ? tr("loadingText") : tr("ctPurchase")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment history */}
      {history.length > 0 ? (
        <Card className="rounded-3xl border-slate-200 shadow-sm bg-white">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-base flex items-center gap-2"><History size={16} /> {tr("ctPaymentHistory")}</CardTitle>
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
      ) : null}
    </div>
  );
}
