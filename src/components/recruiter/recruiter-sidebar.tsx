"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Briefcase, User, Settings, HelpCircle, Coins } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useLocale } from '@/lib/i18n';

function classNames(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

const linkHrefs = ['/recruiter','/recruiter/jobs','/recruiter/profile','/recruiter/settings','/recruiter/tokens','/recruiter/help'];

function resolveActive(pathname: string) {
  let active = '';
  for (const href of linkHrefs) {
    if (pathname === href) return href;
    if (pathname.startsWith(href + '/') && href.length > active.length) active = href;
  }
  return active;
}

export function RecruiterSidebarLinks() {
  const pathname = usePathname();
  const { tr } = useLocale();
  const activeHref = resolveActive(pathname);

  const LinkItem = ({ href, children, icon }: { href: string; children: React.ReactNode; icon: React.ReactNode }) => {
    const active = href === activeHref;
    return (
      <Link href={href} aria-current={active ? 'page' : undefined}
        className={classNames('flex items-center space-x-3 px-2 py-2 rounded-md font-medium text-sm',
          active ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50')}>
        {icon}<span>{children}</span>
      </Link>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-6 flex-1 space-y-8 overflow-y-auto">
        <div>
          <h3 className="text-xs font-medium text-gray-400 mb-4 px-2">{tr("mainMenu")}</h3>
          <nav className="space-y-1">
            <LinkItem href="/recruiter" icon={<Home size={18} />}>{tr("dashboard")}</LinkItem>
            <LinkItem href="/recruiter/jobs" icon={<Briefcase size={18} />}>{tr("jobs")}</LinkItem>
            <LinkItem href="/recruiter/profile" icon={<User size={18} />}>{tr("profile")}</LinkItem>
          </nav>
        </div>
        <div>
          <h3 className="text-xs font-medium text-gray-400 mb-4 px-2">{tr("settingsAndSupport")}</h3>
          <nav className="space-y-1">
            <LinkItem href="/recruiter/settings" icon={<Settings size={18} />}>{tr("settingsNav")}</LinkItem>
            <LinkItem href="/recruiter/tokens" icon={<Coins size={18} />}>{tr("tokens")}</LinkItem>
            <LinkItem href="/recruiter/help" icon={<HelpCircle size={18} />}>{tr("helpCenter")}</LinkItem>
          </nav>
        </div>
      </div>
      <div className="px-4 pb-6 mt-auto">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center shadow-sm">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Coins size={15} className="text-amber-600" />
            <h4 className="font-bold text-sm text-amber-900">{tr("tokNeedMore")}</h4>
          </div>
          <p className="text-xs text-amber-700 mb-3 leading-tight">{tr("tokJobCost")}</p>
          <Link href="/recruiter/tokens" className="block w-full text-center py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm transition-colors">
            {tr("tokRefill")}
          </Link>
        </div>
      </div>
    </div>
  );
}

export function RecruiterSidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-100 hidden md:flex flex-col h-screen sticky top-0">
      <div className="p-4 flex items-center justify-between border-b border-transparent h-16">
        <div className="flex items-center space-x-2">
          <img src="/logo.png" alt="Negarit" className="h-8 object-contain" />
          <span className="text-xl font-bold">Negarit</span>
        </div>
      </div>
      <RecruiterSidebarLinks />
    </aside>
  );
}
