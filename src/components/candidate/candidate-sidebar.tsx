"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Briefcase, User, Settings, HelpCircle, BookOpen } from 'lucide-react';
import { Button } from "@/components/ui/button";

function classNames(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

export function CandidateSidebarLinks() {
  const pathname = usePathname();

  const linkHrefs = [
    '/candidate',
    '/candidate/jobs',
    '/candidate/profile',
    '/candidate/settings',
    '/candidate/help',
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
            <LinkItem href="/candidate" icon={<Home size={18} />}>Dashboard</LinkItem>
            <LinkItem href="/candidate/jobs" icon={<Briefcase size={18} />}>Jobs</LinkItem>
            <LinkItem href="/candidate/profile" icon={<User size={18} />}>Profile</LinkItem>
          </nav>
        </div>

        <div>
          <h3 className="text-xs font-medium text-gray-400 mb-4 px-2">Support</h3>
          <nav className="space-y-1">
            <LinkItem href="/candidate/settings" icon={<Settings size={18} />}>Settings</LinkItem>
            <LinkItem href="/candidate/help" icon={<HelpCircle size={18} />}>Help Center</LinkItem>
          </nav>
        </div>
      </div>

      <div className="px-4 pb-6 mt-auto">
        <div className="bg-linear-to-br from-emerald-600 to-teal-600 rounded-xl p-4 text-white text-center shadow-sm">
          <h4 className="font-bold text-sm mb-1">Complete Your Profile</h4>
          <p className="text-xs text-emerald-100 mb-4 leading-tight">Increase match score with recruiters</p>
          <Link href="/candidate/profile" className="inline-block w-full">
            <Button className="w-full bg-white text-emerald-600 hover:bg-emerald-50 font-bold rounded-lg shadow-sm">
              Finish Profile
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export function CandidateSidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-100 hidden md:flex flex-col h-screen sticky top-0">
      <div className="p-4 flex items-center justify-between border-b border-transparent h-16">
        <div className="flex items-center space-x-2">
          <img src="/logo.png" alt="Negarit" className="h-8 object-contain" />
          <span className="text-xl font-bold">Negarit</span>
        </div>
      </div>
      <CandidateSidebarLinks />
    </aside>
  );
}
