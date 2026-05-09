"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Shield, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { useRouter } from "next/navigation";

export default function AdminProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const adminName = useMemo(() => {
    if (!user) return "Admin";
    const em = typeof user.email === "string" ? user.email : "admin@example.com";
    return em.split("@")[0];
  }, [user]);

  function handleLogout() {
    logout?.();
    router.push("/");
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-linear-to-br from-slate-900 via-slate-800 to-slate-700 rounded-3xl px-8 py-12 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-1">{adminName}</h1>
        <p className="text-slate-300">Admin profile & security settings</p>
      </div>

      <Card>
        <CardHeader className="px-6 py-4">
          <div className="flex items-center space-x-3">
            <Mail size={18} className="text-gray-700" />
            <CardTitle>Account Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-sm text-gray-500">Email</div>
              <div className="font-medium text-gray-900">{user?.email ?? "—"}</div>
            </div>

            <div className="space-y-1">
              <div className="text-sm text-gray-500">Role</div>
              <div className="font-medium text-gray-900">Admin — Full Access</div>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button variant="outline" className="flex items-center space-x-2">
              <Settings size={16} />
              <span>Settings</span>
            </Button>
            <Button className="flex items-center space-x-2 bg-rose-600 text-white hover:bg-rose-700" onClick={handleLogout}>
              <LogOut size={16} />
              <span>Sign out</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="px-6 py-4">
            <div className="flex items-center space-x-3">
              <Shield size={18} className="text-blue-600" />
              <CardTitle>Security</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-sm text-gray-600">Two-factor authentication is enabled for this account.</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="px-6 py-4">
            <div className="flex items-center space-x-3">
              <Settings size={18} className="text-gray-700" />
              <CardTitle>Sessions</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-sm text-gray-600">1 active session from this device. You can sign out from other sessions.</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
