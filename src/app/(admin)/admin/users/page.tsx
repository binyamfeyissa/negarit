"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Download, Users, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/components/auth/auth-provider";
import { ApiError } from "@/lib/api/types";
import { useLocale } from "@/lib/i18n";

type AnyUser = Record<string, unknown>;

function displayName(u: AnyUser) {
  return (
    (typeof u.full_name === "string" ? u.full_name : null) ||
    (typeof u.fullName === "string" ? u.fullName : null) ||
    (typeof u.companyName === "string" ? u.companyName : null) ||
    (typeof u.email === "string" ? u.email : null) ||
    (typeof u.id === "string" ? u.id : null) ||
    "—"
  );
}

function displayField(u: AnyUser, key: string) {
  const v = u[key];
  if (v == null) return "—";
  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") return String(v);
  return "—";
}

function userId(u: AnyUser): string | null {
  return typeof u.id === "string" ? u.id : null;
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-rose-50 text-rose-700 border-rose-100",
  RECRUITER: "bg-indigo-50 text-indigo-700 border-indigo-100",
  APPLICANT: "bg-emerald-50 text-emerald-700 border-emerald-100",
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-100",
  SUSPENDED: "bg-red-50 text-red-700 border-red-100",
  PENDING: "bg-amber-50 text-amber-700 border-amber-100",
};

const AVATAR_BG: Record<string, string> = {
  ADMIN: "bg-rose-100 text-rose-600",
  RECRUITER: "bg-indigo-100 text-indigo-600",
  APPLICANT: "bg-emerald-100 text-emerald-600",
};

export default function UsersPage() {
  const { api } = useAuth();
  const { tr } = useLocale();
  const [q, setQ] = useState("");
  const [users, setUsers] = useState<AnyUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const query = useMemo(() => q.trim(), [q]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.admin.users({ q: query || undefined, page: 1, limit: 50 });
        if (cancelled) return;
        setUsers(res.data);
        setError(null);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof ApiError ? e.message : "Failed to load users.");
      }
    })();
    return () => { cancelled = true; };
  }, [api, query, reloadKey]);

  function reload() { setReloadKey((k) => k + 1); }

  function exportJson() {
    const blob = new Blob([JSON.stringify(users, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{tr("users")}</h1>
          <p className="text-sm text-gray-500 mt-1">{users.length} user{users.length !== 1 ? "s" : ""} found</p>
        </div>
        <Button onClick={exportJson} variant="outline" size="sm" className="flex items-center gap-2 text-gray-600">
          <Download size={15} />
          {tr("exportJSON")}
        </Button>
      </div>

      {error ? <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-3">{error}</div> : null}

      <Card className="shadow-sm border-gray-100 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between border-b border-gray-100 bg-white">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
            <Users size={15} className="text-indigo-500" />
            {tr("auAllUsers")}
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or email…" className="pl-9 h-8 w-64 text-xs border-gray-200" />
          </div>
        </div>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50 border-gray-100">
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3 pl-5">{tr("auColName")}</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3">{tr("auColEmail")}</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3">{tr("auColRole")}</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3">{tr("auColStatus")}</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3">License</TableHead>
                <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wide py-3 text-right">{tr("auColCreated")}</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u, idx) => {
                const name = displayName(u);
                const role = displayField(u, "role");
                const status = displayField(u, "status");
                return (
                  <TableRow key={typeof u.id === "string" ? u.id : String(idx)} className="border-gray-50 hover:bg-indigo-50/30 transition-colors">
                    <TableCell className="py-3.5 pl-5">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${AVATAR_BG[role] ?? "bg-gray-100 text-gray-600"}`}>
                          {initials(name)}
                        </div>
                        <span className="font-semibold text-gray-900 text-sm">{name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5 text-gray-600 text-sm">{displayField(u, "email")}</TableCell>
                    <TableCell className="py-3.5">
                      <Badge className={`text-xs font-medium shadow-none ${ROLE_COLORS[role] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
                        {role}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3.5">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${status === "ACTIVE" ? "bg-emerald-500" : status === "SUSPENDED" ? "bg-red-500" : "bg-amber-400"}`} />
                        <Badge className={`text-xs font-medium shadow-none ${STATUS_COLORS[status] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}>
                          {status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5">
                      {u.role === "RECRUITER" && typeof u.license_doc === "string" && u.license_doc ? (
                        <a href={u.license_doc} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:underline font-medium" onClick={(e) => e.stopPropagation()}>
                          View
                        </a>
                      ) : <span className="text-gray-300 text-xs">—</span>}
                    </TableCell>
                    <TableCell className="py-3.5 text-right text-xs text-gray-400 whitespace-nowrap">
                      {typeof u.created_at === "string" ? new Date(u.created_at).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell className="py-3.5 pr-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors bg-transparent border-none">
                          <MoreHorizontal size={15} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="text-sm">
                          <DropdownMenuItem
                            className="text-amber-600 focus:text-amber-700 focus:bg-amber-50 cursor-pointer"
                            onClick={() => {
                              const id = userId(u);
                              if (!id) return;
                              api.admin.updateUserStatus(id, { status: "SUSPENDED", note: "Suspended by admin" }).then(reload);
                            }}
                          >
                            {tr("auSuspend")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-emerald-600 focus:text-emerald-700 focus:bg-emerald-50 cursor-pointer"
                            onClick={() => {
                              const id = userId(u);
                              if (!id) return;
                              api.admin.updateUserStatus(id, { status: "ACTIVE", note: "Re-activated by admin" }).then(reload);
                            }}
                          >
                            {tr("auActivate")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-sm text-gray-400 py-12 text-center">
                    No users found.
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
