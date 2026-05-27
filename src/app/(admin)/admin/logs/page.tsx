"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/components/auth/auth-provider";
import { ApiError } from "@/lib/api/types";
import { useLocale } from "@/lib/i18n";

type AuditLog = Record<string, unknown>;

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

  function displayField(log: AuditLog, key: string): string {
    const v = log[key];
    if (v == null) return "—";
    if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") return String(v);
    return JSON.stringify(v);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">{tr("auditLogs")}</h1>
        <p className="text-gray-500 text-sm">Activity trail from the backend.</p>
      </div>

      {error ? <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">{error}</div> : null}

      <Card className="shadow-sm border-gray-100 rounded-xl overflow-hidden">
        <div className="p-4 flex flex-wrap items-center gap-3 bg-white border-b border-gray-50">
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-4 w-4 text-gray-400" />
            <Input
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder={tr("alFilterUser")}
              className="pl-9 h-8 w-48 text-xs bg-white border-gray-200"
            />
          </div>
          <Input
            value={action}
            onChange={(e) => setAction(e.target.value)}
            placeholder={tr("alFilterAction")}
            className="h-8 w-40 text-xs bg-white border-gray-200"
          />
          <Input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="h-8 w-36 text-xs bg-white border-gray-200"
            title="From date"
          />
          <Input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="h-8 w-36 text-xs bg-white border-gray-200"
            title="To date"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setUserId(""); setAction(""); setFrom(""); setTo(""); }}
            className="text-xs"
          >
            {tr("alClearFilters")}
          </Button>
          <span className="ml-auto text-xs text-gray-400">{loading ? "Loading…" : `${logs.length} entries`}</span>
        </div>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50 hover:bg-gray-50/50 border-gray-100">
                <TableHead className="text-gray-500 font-medium text-xs">{tr("alColTimestamp")}</TableHead>
                <TableHead className="text-gray-500 font-medium text-xs">{tr("alColUser")}</TableHead>
                <TableHead className="text-gray-500 font-medium text-xs">{tr("alColAction")}</TableHead>
                <TableHead className="text-gray-500 font-medium text-xs">{tr("alColTarget")}</TableHead>
                <TableHead className="text-gray-500 font-medium text-xs">{tr("alColDetails")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log, idx) => (
                <TableRow key={String(log.id ?? idx)} className="border-gray-50 hover:bg-gray-50/10">
                  <TableCell className="text-gray-600 text-xs whitespace-nowrap">
                    {typeof log.createdAt === "string" || typeof log.timestamp === "string"
                      ? new Date(String(log.createdAt ?? log.timestamp)).toLocaleString()
                      : "—"}
                  </TableCell>
                  <TableCell className="text-gray-700 text-xs">{displayField(log, "userId")}</TableCell>
                  <TableCell className="font-medium text-gray-800 text-xs">{displayField(log, "action")}</TableCell>
                  <TableCell className="text-gray-600 text-xs">{displayField(log, "targetId")}</TableCell>
                  <TableCell className="text-gray-500 text-xs max-w-xs truncate">{displayField(log, "details")}</TableCell>
                </TableRow>
              ))}
              {logs.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-sm text-gray-500 p-6 text-center">
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
