"use client";

import { Search, Bell, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { AdminSidebarLinks } from '@/components/admin/admin-sidebar';
import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/auth-provider';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  userName?: string;
  userRole?: string;
  avatarUrl?: string;
  mobileSidebarLinks?: ReactNode;
}

export function AdminHeader({ 
  userName = "Sabrina Gomez", 
  userRole = "Super Admin", 
  avatarUrl = "https://i.pravatar.cc/150?u=a042581f4e29026704d",
  mobileSidebarLinks 
}: HeaderProps) {
  const { logout } = useAuth();
  const router = useRouter();

  async function onLogout() {
    await logout();
    router.replace('/');
  }

  return (
    <header className="h-16 border-b border-gray-100 bg-white flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
      <div className="flex items-center flex-1 space-x-4">
        {/* Mobile Navigation Trigger */}
        <Sheet>
          <SheetTrigger className="p-2 -ml-2 text-gray-500 hover:text-gray-700 md:hidden bg-transparent border-none">
            <Menu size={20} />
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <SheetTitle className="sr-only">Menu Navigation</SheetTitle>
            <div className="p-4 flex items-center space-x-2 h-16 border-b border-gray-50">
              <img src="/logo.png" alt="Negarit Logo" className="h-8 object-contain" />
              <span className="text-xl font-bold">Negarit</span>
            </div>
            {mobileSidebarLinks ? mobileSidebarLinks : <AdminSidebarLinks />}
          </SheetContent>
        </Sheet>

        <div className="w-full max-w-sm relative hidden sm:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input 
            type="text" 
            placeholder="Search" 
            className="pl-9 bg-gray-50/50 border-gray-200 rounded-lg h-9 text-sm w-full"
          />
          <div className="absolute right-2.5 top-2.5 flex space-x-1">
             <span className="text-[10px] text-gray-400 bg-gray-100 px-1 py-0.5 rounded border border-gray-200 flex items-center">⌘</span>
             <span className="text-[10px] text-gray-400 bg-gray-100 px-1 py-0.5 rounded border border-gray-200">K</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-4 ml-4">
        <Button variant="outline" size="sm" onClick={() => void onLogout()}>
          Logout
        </Button>
        <button className="relative p-2 text-gray-400 hover:text-gray-600 transition border border-gray-100 rounded-full">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
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
