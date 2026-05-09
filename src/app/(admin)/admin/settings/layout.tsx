import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { SettingsSidebar } from "@/components/admin/settings-sidebar";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[600px]">
      <div className="px-8 py-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-xl font-bold mb-1">Settings</h1>
          <p className="text-sm text-gray-500">Manage your account preferences, privacy, and notifications.</p>
        </div>
        <Button className="bg-[#4238b8] hover:bg-[#342c94] text-white">Save Change</Button>
      </div>
      
      <div className="flex flex-col md:flex-row p-6">
        <SettingsSidebar />
        <div className="flex-1 md:pl-8">
          {children}
        </div>
      </div>
    </div>
  );
}
