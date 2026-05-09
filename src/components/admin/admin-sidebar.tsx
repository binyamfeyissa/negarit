import Link from 'next/link';
import { Home, Users, Briefcase, Building, Settings } from 'lucide-react';

export function AdminSidebarLinks() {
  return (
    <div className="px-4 py-6 flex-1 space-y-8 overflow-y-auto">
      <div>
        <h3 className="text-xs font-medium text-gray-400 mb-4 px-2">Main Menu</h3>
        <nav className="space-y-1">
          <Link href="/admin" className="flex items-center space-x-3 text-indigo-600 bg-indigo-50 px-2 py-2 rounded-md font-medium text-sm">
            <Home size={18} />
            <span>Dashboard</span>
          </Link>
          <Link href="/admin/users" className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-2 py-2 rounded-md font-medium text-sm">
            <Users size={18} />
            <span>Users</span>
          </Link>
          <Link href="/admin/jobs" className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-2 py-2 rounded-md font-medium text-sm">
            <Briefcase size={18} />
            <span>Jobs</span>
          </Link>
        </nav>
      </div>
      
      <div>
        <h3 className="text-xs font-medium text-gray-400 mb-4 px-2">Explore</h3>
        <nav className="space-y-1">
          <Link href="/admin/companies" className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-2 py-2 rounded-md font-medium text-sm">
            <Building size={18} />
            <span>Companies</span>
          </Link>
        </nav>
      </div>
      
      <div>
        <h3 className="text-xs font-medium text-gray-400 mb-4 px-2">Settings</h3>
        <nav className="space-y-1">
          <Link href="/admin/settings" className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-2 py-2 rounded-md font-medium text-sm">
            <Settings size={18} />
            <span>Settings</span>
          </Link>
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
