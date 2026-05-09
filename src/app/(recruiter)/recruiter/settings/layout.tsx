import { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const settingsNav = [
  { label: "General", href: "/recruiter/settings" },
  { label: "Plan & Pricing", href: "/recruiter/settings/plan" },
  { label: "My Account", href: "#" },
  { label: "Tax & Duties", href: "#" },
  { label: "Password", href: "/recruiter/settings/password" },
  { label: "Notifications", href: "#" },
];

export default function RecruiterSettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your account preferences, privacy, and notifications.</p>
        </div>
        <Button className="bg-[#4238b8] hover:bg-[#342c94] text-white font-semibold px-6">Save Change</Button>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Settings Nav */}
          <nav className="w-full md:w-56 border-b md:border-b-0 md:border-r border-gray-100 p-4 space-y-1 flex-shrink-0">
            {settingsNav.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Content Area */}
          <div className="flex-1 p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
