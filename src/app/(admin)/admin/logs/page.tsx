"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/components/auth/auth-provider";
import { ApiError } from "@/lib/api/types";
import { useLocale } from "@/lib/i18n";

type AuditLog = Record<string, unknown>;

function actionColor(action: string): string {
  const a = action.toUpperCase();
  if (a.includes("DELETE") || a.includes("REMOVE") || a.includes("REJECT")) return "bg-red-50 text-red-700 border-red-100";
  if (a.includes("CREATE") || a.includes("REGISTER") || a.includes("APPROVE")) return "bg-emerald-50 text-emerald-700 border-emerald-100";
  if (a.includes("UPDATE") || a.includes("EDIT") || a.includes("PATCH")) return "bg-amber-50 text-amber-700 border-amber-100";
  if (a.includes("LOGIN") || a.includes("AUTH")) return "bg-indigo-50 text-indigo-700 border-indigo-100";
  return "bg-gray-100 text-gray-600 border-gray-200";
}

function displayField(log: AuditLog, key: string): string {
  const v = log[key];
  if (v == null) return "—";
  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") return String(v);
  return JSON.stringify(v);
}

export default function AdminLogsPage() {
  const { api } = useAuth();
  const { tr } = useLocale();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [userId, setUserId] = useState("");
  const [action, setAction] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const query = useMemo(
    () => ({ userId: userId.trim() || undefined, action: action.trim() || undefined, from: from || undefined, to: to || undefined }),
    [userId, action, from, to],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await api.admin.logs({ ...query, page: 1, limit: 50 });
        if (cancelled) return;
        setLogs(res.data ?? []);
        setError(null);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof ApiError ? e.message : "Failed to load logs.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [api, query]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{tr("auditLogs")}</h1>
        <p className="text-sm text-gray-500 mt-1">Activity trail from the backend.</p>
      </div>

      {error ? <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-3">{error}</div> : null}

      <Card className="shadow-sm border-gray-100 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 flex flex-wrap items-center gap-3 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 mr-2">
            <Activity size={15} className="text-indigo-500" />
            Logs
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input value={userId} onChange={(e) => setUserId(e.target.value)} placeholder={tr("alFilterUser")} className="pl-9 h-8 w-48 text-xs border-gray-200" />
          </div>
          <Input value={action} onChange={(e) => setAction(e.target.value)} placeholder={tr("alFilterAction")} className="h-8 w-40 text-xs border-gray-200" />
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-8 w-36 text-xs border-gray-200" title="From date" />
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-8 w-36 text-xs border-gray-200" title="To date" />
          <Button variant="outline" size="sm" onClick={() => { setUserId(""); setAction(""); setFrom(""); setTo(""); }} className="text-xs text-gray-600">
            {tr("alClearFilters")}
          </Button>
          <span className="ml-auto text-xs text-gray-400">{loading ? "Loading…" : `${logs.length} entries`}</span>
        </div>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50 border-gray-100">
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3 pl-5">{tr("alColTimestamp")}</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3">{tr("alColAction")}</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3">{tr("alColUser")}</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3">{tr("alColTarget")}</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3">{tr("alColDetails")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log, idx) => {
                const action = displayField(log, "action");
                return (
                  <TableRow key={String(log.id ?? idx)} className="border-gray-50 hover:bg-indigo-50/30 transition-colors">
                    <TableCell className="py-3.5 pl-5 text-gray-500 text-xs whitespace-nowrap">
                      {typeof log.createdAt === "string" || typeof log.timestamp === "string"
                        ? new Date(String(log.createdAt ?? log.timestamp)).toLocaleString()
                        : "—"}
                    </TableCell>
                    <TableCell className="py-3.5">
                      <Badge className={`text-xs font-semibold shadow-none ${actionColor(action)}`}>
                        {action}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3.5 text-gray-700 text-xs font-mono">{displayField(log, "userId")}</TableCell>
                    <TableCell className="py-3.5 text-gray-500 text-xs font-mono">{displayField(log, "targetId")}</TableCell>
                    <TableCell className="py-3.5 text-gray-500 text-xs max-w-xs truncate">{displayField(log, "details")}</TableCell>
                  </TableRow>
                );
              })}
              {logs.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-sm text-gray-400 py-12 text-center">
                    {tr("alNoLogs")}
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
