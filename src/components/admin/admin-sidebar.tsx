"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Briefcase, Building, Settings, ScrollText } from 'lucide-react';
import { useLocale } from '@/lib/i18n';

function cls(active: boolean) {
  return `flex items-center space-x-3 px-2 py-2 rounded-md font-medium text-sm ${
    active ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
  }`;
}

export function AdminSidebarLinks() {
  const pathname = usePathname();
  const { tr } = useLocale();

  return (
    <div className="px-4 py-6 flex-1 space-y-8 overflow-y-auto">
      <div>
        <h3 className="text-xs font-medium text-gray-400 mb-4 px-2">{tr("mainMenu")}</h3>
        <nav className="space-y-1">
          <Link href="/admin" className={cls(pathname === '/admin')}><Home size={18} /><span>{tr("dashboard")}</span></Link>
          <Link href="/admin/users" className={cls(pathname.startsWith('/admin/users'))}><Users size={18} /><span>{tr("users")}</span></Link>
          <Link href="/admin/jobs" className={cls(pathname.startsWith('/admin/jobs'))}><Briefcase size={18} /><span>{tr("allJobs")}</span></Link>
        </nav>
      </div>

      <div>
        <h3 className="text-xs font-medium text-gray-400 mb-4 px-2">{tr("exploreSection")}</h3>
        <nav className="space-y-1">
          <Link href="/admin/companies" className={cls(pathname.startsWith('/admin/companies'))}><Building size={18} /><span>{tr("companies")}</span></Link>
          <Link href="/admin/logs" className={cls(pathname.startsWith('/admin/logs'))}><ScrollText size={18} /><span>{tr("auditLogs")}</span></Link>
        </nav>
      </div>

      <div>
        <h3 className="text-xs font-medium text-gray-400 mb-4 px-2">{tr("settingsNav")}</h3>
        <nav className="space-y-1">
          <Link href="/admin/settings" className={cls(pathname.startsWith('/admin/settings'))}><Settings size={18} /><span>{tr("settingsNav")}</span></Link>
        </nav>
      </div>
    </div>
  );
}

export function AdminSidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-100 hidden md:flex flex-col h-screen sticky top-0">
      <div className="p-4 flex items-center justify-between border-b border-transparent h-16">
        <div className="flex items-center space-x-2">
          <img src="/logo.png" alt="Negarit" className="h-8 object-contain" />
          <span className="text-xl font-bold">Negarit</span>
        </div>
      </div>
      <AdminSidebarLinks />
    </aside>
  );
}
