import { ReactNode } from "react";
import { SettingsSidebar } from "@/components/admin/settings-sidebar";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-8 py-6 border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your admin account and security.</p>
      </div>
      <div className="flex flex-col md:flex-row p-6 gap-6">
        <SettingsSidebar />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
