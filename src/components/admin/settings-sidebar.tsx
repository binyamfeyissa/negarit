"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { User, Lock } from "lucide-react";

const settingsNav = [
  { name: "Account", href: "/admin/settings", icon: User },
  { name: "Password", href: "/admin/settings/plan", icon: Lock },
];

export function SettingsSidebar() {
  const pathname = usePathname();

  return (
    <nav className="w-full md:w-52 space-y-1 pr-6 pb-6 border-r border-transparent md:border-gray-100 shrink-0">
      {settingsNav.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              isActive
                ? "bg-indigo-50 text-indigo-700"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <Icon size={15} />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
