"use client";

import React from "react";
import { useAuth } from "@/store/AuthContext";
import {
  Car,
  Calendar,
  LogOut,
  LayoutDashboard,
  LayoutGrid,
  Search,
  Bell,
  History,
  MessageSquare,
  User,
  Users as UsersIcon,
  Package,
  BarChart3,
  ShoppingCart,
  ShoppingBag,
  ShieldCheck,
  Menu,
  X,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import Image from "next/image";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type NavLink = { name: string; href: string; icon: any };

const NAVIGATION: Record<string, NavLink[]> = {
  Admin: [
    { name: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Staff Management", href: "/admin/staff", icon: UsersIcon },
    { name: "Inventory", href: "/admin/inventory", icon: Package },
    { name: "Categories", href: "/admin/categories", icon: LayoutGrid },
    { name: "Vendors", href: "/admin/vendors", icon: ShieldCheck },
    { name: "Reviews", href: "/admin/reviews", icon: MessageSquare },
    { name: "Financial Reports", href: "/admin/reports", icon: BarChart3 },
    { name: "Purchase Invoices", href: "/admin/purchase-invoices", icon: FileText },
    { name: "Settings", href: "/admin/settings", icon: User },
  ],
  Staff: [
    { name: "Dashboard", href: "/staff/dashboard", icon: LayoutDashboard },
    { name: "Point of Sale", href: "/staff/pos", icon: ShoppingCart },
    { name: "Sales History", href: "/staff/sales", icon: History },
    { name: "Inventory", href: "/staff/inventory", icon: Package },
    { name: "Appointments", href: "/staff/appointments", icon: Calendar },
    { name: "Part Requests", href: "/staff/requests", icon: ShoppingBag },
    { name: "Customers", href: "/staff/customers", icon: UsersIcon },
  ],

  Customer: [
    { name: "Dashboard", href: "/customer/dashboard", icon: LayoutDashboard },
    { name: "My Vehicles", href: "/customer/vehicles", icon: Car },
    { name: "Appointments", href: "/customer/appointments", icon: Calendar },
    { name: "Part Requests", href: "/customer/requests", icon: History },
    { name: "Reviews", href: "/customer/reviews", icon: MessageSquare },
    { name: "Profile", href: "/customer/profile", icon: User },
  ],
};

export default function BaseDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const roleLinks = NAVIGATION[user?.role || "Customer"] || NAVIGATION.Customer;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0F0F0F] border-r border-[#222] hidden lg:flex flex-col fixed inset-y-0 z-50">
        <div className="p-6">
          <Link href="/" className="mb-10 block">
            <Image
              src="/images/logo-black.jpeg"
              alt="Vehiclehub Logo"
              width={160}
              height={60}
              className="h-12 w-auto mx-auto object-contain"
              priority
            />
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
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-[#F97316] text-white shadow-lg shadow-[#F97316]/20"
                      : "text-gray-400 hover:text-white hover:bg-[#1A1A1A]",
                  )}
                >
                  <Icon size={18} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-[#222] space-y-4">
          <div className="bg-[#141414] rounded-xl p-4 border border-[#222]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#F97316]/10 rounded-lg flex items-center justify-center text-[#F97316] font-bold text-xs">
                {user?.role?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">
                  {user?.fullName}
                </p>
                <p className="text-[10px] text-gray-500">{user?.role} Portal</p>
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all w-full text-sm font-medium"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 lg:ml-64 relative flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-[72px] border-b border-[#222] bg-[#0F0F0F]/80 backdrop-blur-xl sticky top-0 z-40 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-gray-400 hover:text-white"
            >
              <Menu size={22} />
            </button>
            <p className="text-sm text-gray-400 hidden sm:block">
              <span className="text-gray-600">{user?.role} /</span>{" "}
              <span className="text-white font-medium capitalize">
                {pathname.split("/").pop()?.replace("-", " ")}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600"
                size={16}
              />
              <input
                placeholder="Search..."
                className="bg-[#141414] border border-[#222] rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#F97316]/50 transition-colors w-56"
              />
            </div>
            <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#F97316] rounded-full" />
            </button>
            {/* <div className="w-px h-8 bg-[#222]" />
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold">{user?.fullName}</p>
                <p className="text-[10px] text-gray-500">{user?.role}</p>
              </div>
              <div className="w-10 h-10 bg-[#F97316] rounded-xl flex items-center justify-center font-bold text-sm">
                {user?.fullName?.[0]}
              </div>
            </div> */}
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </div>
      </main>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-[#0F0F0F] border-r border-[#222] p-6">
            <div className="flex items-center justify-between mb-8">
              <Link href="/" className="block">
                <Image
                  src="/images/logo-black.jpeg"
                  alt="VehicleMS Logo"
                  width={80}
                  height={40}
                  className="h-10 w-auto rounded-lg object-contain"
                />
              </Link>
              <button onClick={() => setIsMobileMenuOpen(false)}>
                <X size={22} className="text-gray-400" />
              </button>
            </div>
            <nav className="space-y-1">
              {roleLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                      isActive
                        ? "bg-[#F97316] text-white"
                        : "text-gray-400 hover:text-white hover:bg-[#1A1A1A]",
                    )}
                  >
                    <Icon size={18} />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </nav>
            <button
              onClick={logout}
              className="absolute bottom-6 left-6 right-6 flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-all text-sm font-medium"
            >
              <LogOut size={18} /> Logout
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}
