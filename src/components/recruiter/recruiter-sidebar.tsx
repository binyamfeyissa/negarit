"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Briefcase, User, Settings, HelpCircle, CreditCard } from 'lucide-react';
import { Button } from "@/components/ui/button";

function classNames(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

export function RecruiterSidebarLinks() {
  const pathname = usePathname();

  // compute single best active href (longest matching prefix or exact match)
  const linkHrefs = [
    '/recruiter',
    '/recruiter/jobs',
    '/recruiter/profile',
    '/recruiter/settings',
    '/recruiter/help',
  ];

  let activeHref = '';
  for (const href of linkHrefs) {
    if (!href) continue;
    if (pathname === href) {
      activeHref = href;
      break;
    }
    if (pathname.startsWith(href + '/')) {
      if (href.length > activeHref.length) activeHref = href;
    } else if (pathname.startsWith(href)) {
      if (href.length > activeHref.length) activeHref = href;
    }
  }

  const LinkItem = ({ href, children, icon }: { href: string; children: React.ReactNode; icon: React.ReactNode }) => {
    const active = href === activeHref;
    return (
      <Link
        href={href}
        aria-current={active ? 'page' : undefined}
        className={classNames(
          'flex items-center space-x-3 px-2 py-2 rounded-md font-medium text-sm',
          active ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        )}
      >
        {icon}
        <span>{children}</span>
      </Link>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-6 flex-1 space-y-8 overflow-y-auto">
        <div>
          <h3 className="text-xs font-medium text-gray-400 mb-4 px-2">Main Menu</h3>
          <nav className="space-y-1">
            <LinkItem href="/recruiter" icon={<Home size={18} />}>Dashboard</LinkItem>
            <LinkItem href="/recruiter/jobs" icon={<Briefcase size={18} />}>Jobs</LinkItem>
            <LinkItem href="/recruiter/profile" icon={<User size={18} />}>Profile</LinkItem>
          </nav>
        </div>

        <div>
          <h3 className="text-xs font-medium text-gray-400 mb-4 px-2">Settings & Support</h3>
          <nav className="space-y-1">
            <LinkItem href="/recruiter/settings" icon={<Settings size={18} />}>Settings</LinkItem>
            <LinkItem href="#" icon={<CreditCard size={18} />}>Subscription</LinkItem>
            <LinkItem href="/recruiter/help" icon={<HelpCircle size={18} />}>Help Center</LinkItem>
          </nav>
        </div>
      </div>

      <div className="px-4 pb-6 mt-auto">
        <div className="bg-[#4238b8] rounded-xl p-4 text-white text-center shadow-sm">
          <h4 className="font-bold text-sm mb-1">Become Pro Access</h4>
          <p className="text-xs text-indigo-200 mb-4 leading-tight">Try your experience for using more features</p>
          <Button className="w-full bg-white text-[#4238b8] hover:bg-gray-50 font-bold rounded-lg shadow-sm">
            Upgrade Pro
          </Button>
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
