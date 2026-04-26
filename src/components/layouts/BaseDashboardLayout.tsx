'use client';

import React from 'react';
import { useAuth } from '@/store/AuthContext';
import { 
  Car, 
  Calendar, 
  LogOut, 
  LayoutDashboard, 
  Search, 
  Bell,
  History,
  MessageSquare,
  User,
  Users as UsersIcon,
  Package,
  FileText,
  BarChart3,
  ShoppingCart,
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type NavLink = {
  name: string;
  href: string;
  icon: any;
};

const NAVIGATION: Record<string, NavLink[]> = {
  Admin: [
    { name: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Staff Management', href: '/admin/staff', icon: UsersIcon },
    { name: 'Inventory', href: '/admin/inventory', icon: Package },
    { name: 'Vendors', href: '/admin/vendors', icon: ShieldCheck },
    { name: 'Financial Reports', href: '/admin/reports', icon: BarChart3 },
    { name: 'Settings', href: '/admin/settings', icon: User },
  ],
  Staff: [
    { name: 'Dashboard', href: '/staff/dashboard', icon: LayoutDashboard },
    { name: 'Point of Sale', href: '/staff/pos', icon: ShoppingCart },
    { name: 'Inventory', href: '/staff/inventory', icon: Package },
    { name: 'Appointments', href: '/staff/appointments', icon: Calendar },
    { name: 'Customers', href: '/staff/customers', icon: UsersIcon },
  ],
  Customer: [
    { name: 'Dashboard', href: '/customer/dashboard', icon: LayoutDashboard },
    { name: 'My Vehicles', href: '/customer/vehicles', icon: Car },
    { name: 'Appointments', href: '/customer/appointments', icon: Calendar },
    { name: 'Part Requests', href: '/customer/requests', icon: History },
    { name: 'Reviews', href: '/customer/reviews', icon: MessageSquare },
    { name: 'Profile', href: '/customer/profile', icon: User },
  ],
};

export default function BaseDashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // Fallback to Customer if role is missing (should be handled by middleware)
  const roleLinks = NAVIGATION[user?.role || 'Customer'] || NAVIGATION.Customer;

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 flex overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="w-64 border-r border-white/5 bg-black/20 backdrop-blur-xl hidden lg:flex flex-col fixed inset-y-0 z-50">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-3 mb-10 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
              <Car className="text-white" size={24} />
            </div>
            <span className="text-2xl font-bold font-outfit tracking-tight">Vehicle<span className="text-primary">MS</span></span>
          </Link>

          <nav className="space-y-1">
            {roleLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                    isActive 
                      ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_20px_rgba(99,102,241,0.05)]" 
                      : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
                  )}
                >
                  <Icon size={20} className={cn("transition-colors", isActive ? "text-primary" : "group-hover:text-white")} />
                  <span className="font-medium text-sm">{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-white/5 space-y-4">
          <div className="bg-white/5 rounded-2xl p-4">
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2">Workspace</p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs uppercase">
                {user?.role?.[0]}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-bold truncate">{user?.role} Portal</p>
                <p className="text-[10px] text-zinc-500 truncate">Online</p>
              </div>
            </div>
          </div>
          
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all w-full group text-sm"
          >
            <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
            <span className="font-medium">Logout System</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 relative flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-20 border-b border-white/5 bg-black/40 backdrop-blur-md sticky top-0 z-40 px-6 sm:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-zinc-400 hover:text-white"
            >
              <Menu size={24} />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-sm font-medium text-zinc-400">
                System / <span className="text-white capitalize">{pathname.split('/').pop()?.replace('-', ' ')}</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            <div className="relative group hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-primary transition-colors" size={18} />
              <input 
                placeholder="Search resources..." 
                className="bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all w-48 lg:w-64"
              />
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
               {/* Notifications */}
              <button className="relative p-2 rounded-xl hover:bg-white/5 transition-colors group">
                <Bell size={20} className="text-zinc-400 group-hover:text-primary transition-colors" />
                <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-primary rounded-full ring-2 ring-black" />
              </button>
              
              <div className="h-8 w-[1px] bg-white/10 mx-2 hidden sm:block" />

              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-white">{user?.fullName}</p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-tighter">{user?.role}</p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow-lg shadow-primary/20">
                  {user?.fullName?.[0] || 'U'}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {children}
          </div>
        </div>
      </main>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-[#0a0a0a] border-r border-white/10 p-6 animate-slide-in-left">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Car className="text-primary" size={24} />
                <span className="text-xl font-bold font-outfit">Vehicle<span className="text-primary">MS</span></span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)}>
                <X size={24} className="text-zinc-400" />
              </button>
            </div>
            
            <nav className="space-y-2">
              {roleLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                      isActive ? "bg-primary text-white" : "text-zinc-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{link.name}</span>
                  </Link>
                );
              })}
            </nav>
            
            <button
              onClick={logout}
              className="absolute bottom-6 left-6 right-6 flex items-center gap-3 px-4 py-4 rounded-xl text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-all font-bold text-sm"
            >
              <LogOut size={20} />
              Logout
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}
