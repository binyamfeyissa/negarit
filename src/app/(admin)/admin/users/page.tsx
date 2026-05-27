"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Download, MoreHorizontal } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/components/auth/auth-provider";
import { ApiError } from "@/lib/api/types";
import { useLocale } from "@/lib/i18n";

type AnyUser = Record<string, unknown>;

function displayName(u: AnyUser) {
  const full_name = typeof u.full_name === "string" ? u.full_name : null;
  const fullName = typeof u.fullName === "string" ? u.fullName : null;
  const companyName = typeof u.companyName === "string" ? u.companyName : null;
  const email = typeof u.email === "string" ? u.email : null;
  const id = typeof u.id === "string" ? u.id : null;
  return full_name || fullName || companyName || email || id || "—";
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

export default function UsersPage() {
  const { api } = useAuth();
  const { tr } = useLocale();
  const [q, setQ] = useState("");
  const [users, setUsers] = useState<AnyUser[]>([]);
  const [error, setError] = useState<string | null>(null);

  const query = useMemo(() => q.trim(), [q]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.admin.users({ q: query || undefined, page: 1, limit: 20 });
        if (cancelled) return;
        setUsers(res.data);
        setError(null);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof ApiError ? e.message : "Failed to load users.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [api, query]);

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
          <h1 className="text-2xl font-bold mb-1 border-gray-100">{tr("users")}</h1>
          <p className="text-gray-500 text-sm">Live users from the backend.</p>
        </div>
        <Button onClick={exportJson} variant="outline" className="flex items-center space-x-2 text-sm text-gray-700 bg-white border-gray-200">
          <Download size={16} />
          <span>{tr("exportJSON")}</span>
        </Button>
      </div>

      {error ? <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">{error}</div> : null}

      <Card className="shadow-sm border-gray-100 rounded-xl overflow-hidden">
        <div className="p-4 flex flex-row items-center justify-between bg-white border-b border-gray-50">
          <h2 className="text-base font-bold">{tr("auAllUsers")}</h2>
          <div className="flex space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2 h-4 w-4 text-gray-400" />
                <Input value={q} onChange={(e) => setQ(e.target.value)} type="text" placeholder="Search by name or email" className="pl-9 h-8 w-60 text-xs bg-white border-gray-200" />
              </div>
          </div>
        </div>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50 hover:bg-gray-50/50 border-gray-100">
                <TableHead className="text-gray-500 font-medium text-xs">{tr("auColName")}</TableHead>
                <TableHead className="text-gray-500 font-medium text-xs">{tr("auColEmail")}</TableHead>
                <TableHead className="text-gray-500 font-medium text-xs">{tr("auColRole")}</TableHead>
                <TableHead className="text-gray-500 font-medium text-xs">{tr("auColStatus")}</TableHead>
                <TableHead className="text-gray-500 font-medium text-xs">{tr("auColCreated")}</TableHead>
                <TableHead className="text-right w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u, idx) => (
                <TableRow key={typeof u.id === "string" ? u.id : String(idx)} className="border-gray-50 hover:bg-gray-50/10">
                  <TableCell className="font-semibold text-gray-800">{displayName(u)}</TableCell>
                  <TableCell className="text-gray-600">{displayField(u, "email")}</TableCell>
                  <TableCell className="text-gray-600 font-medium">{displayField(u, "role")}</TableCell>
                  <TableCell className="text-gray-600 font-medium">{displayField(u, "status")}</TableCell>
                  <TableCell className="text-gray-600 text-sm">
                    {typeof u.created_at === "string" ? new Date(u.created_at).toLocaleString() : "—"}
                  </TableCell>
                  <TableCell className="text-right py-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="text-gray-400 hover:text-gray-600 bg-transparent border-none p-1 rounded-sm">
                        <MoreHorizontal size={16} />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            const id = userId(u);
                            if (!id) return;
                            api.admin.updateUserStatus(id, { status: "SUSPENDED", note: "Suspended by admin" }).then(() => null);
                          }}
                        >
                          {tr("auSuspend")}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            const id = userId(u);
                            if (!id) return;
                            api.admin.updateUserStatus(id, { status: "ACTIVE", note: "Re-activated by admin" }).then(() => null);
                          }}
                        >
                          {tr("auActivate")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-sm text-gray-500 p-6 text-center">
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
