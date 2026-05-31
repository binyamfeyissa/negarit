import { ReactNode } from "react";

export default function RecruiterSettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your company profile and account preferences.</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
