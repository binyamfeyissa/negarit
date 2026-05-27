"use client";

import { Bell, Menu } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { AdminSidebarLinks } from '@/components/admin/admin-sidebar';
import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { useAuth } from '@/components/auth/auth-provider';
import { useLocale } from '@/lib/i18n';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  userName?: string;
  userRole?: string;
  avatarUrl?: string;
  mobileSidebarLinks?: ReactNode;
}

export function AdminHeader({
  userName = "Admin",
  userRole = "Admin",
  avatarUrl = "https://i.pravatar.cc/150?u=a042581f4e29026704d",
  mobileSidebarLinks,
}: HeaderProps) {
  const { logout } = useAuth();
  const { tr } = useLocale();
  const router = useRouter();

  async function onLogout() {
    await logout();
    router.replace('/login');
  }

  return (
    <header className="h-16 border-b border-gray-100 bg-white flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
      <div className="flex items-center flex-1 space-x-4">
        <Sheet>
          <SheetTrigger className="p-2 -ml-2 text-gray-500 hover:text-gray-700 md:hidden bg-transparent border-none">
            <Menu size={20} />
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <SheetTitle className="sr-only">{tr("mainMenu")}</SheetTitle>
            <div className="p-4 flex items-center space-x-2 h-16 border-b border-gray-50">
              <img src="/logo.png" alt="Negarit Logo" className="h-8 object-contain" />
              <span className="text-xl font-bold">Negarit</span>
            </div>
            {mobileSidebarLinks ?? <AdminSidebarLinks />}
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex items-center space-x-2 ml-4">
        <LanguageSwitcher />

        <Button variant="outline" size="sm" onClick={() => void onLogout()}>
          {tr("logout")}
        </Button>

        <button className="relative p-2 text-gray-400 hover:text-gray-600 transition border border-gray-100 rounded-full" aria-label={tr("notificationsLabel")}>
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold leading-tight">{userName}</p>
            <p className="text-xs text-gray-500 leading-tight">{userRole}</p>
          </div>
          <Avatar className="h-9 w-9">
            <AvatarImage src={avatarUrl} alt={userName} />
            <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
