"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const settingsNav = [
  { name: "General", href: "/admin/settings" },
  { name: "Plan & Pricing", href: "/admin/settings/plan" },
  { name: "My Account", href: "#" },
  { name: "Tax & Duties", href: "#" },
  { name: "Password", href: "#" },
  { name: "Notifications", href: "#" },
];

export function SettingsSidebar() {
  const pathname = usePathname();

  return (
    <nav className="w-full md:w-64 space-y-1 pr-6 pb-6 border-r border-transparent md:border-gray-100 flex-shrink-0">
      {settingsNav.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/admin/settings" && pathname?.startsWith(item.href));
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center px-4 py-2.5 rounded-lg text-sm font-medium",
              isActive
                ? "bg-gray-100/80 text-gray-900"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
