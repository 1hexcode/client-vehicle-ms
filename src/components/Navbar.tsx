"use client";

import Link from "next/link";
import { useAuth } from "@/store/AuthContext";
import { LogOut, User as UserIcon } from "lucide-react";

import { usePathname } from "next/navigation";

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const isDashboard =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/staff") ||
    pathname.startsWith("/customer");

  if (isDashboard) return null;
  <nav className="glass fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-6xl z-[1000] px-8 py-3 flex justify-between items-center">
    <Link href="/" className="font-bold text-2xl tracking-tighter">
      VEHICLE<span className="text-primary">MS</span>
    </Link>

    <div className="hidden md:flex gap-8 items-center">
      <Link href="/" className="hover:text-primary transition-colors">
        Home
      </Link>
      {user?.role === "Admin" && (
        <Link
          href="/admin/dashboard"
          className="hover:text-primary transition-colors"
        >
          Admin Panel
        </Link>
      )}
      {user?.role === "Staff" && (
        <Link
          href="/staff/dashboard"
          className="hover:text-primary transition-colors"
        >
          Staff Panel
        </Link>
      )}
      {user?.role === "Customer" && (
        <Link
          href="/customer/dashboard"
          className="hover:text-primary transition-colors"
        >
          My Profile
        </Link>
      )}

      {user ? (
        <div className="flex items-center gap-4 border-l border-white/10 pl-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <UserIcon size={16} />
            </div>
            <span className="text-sm font-medium">{user.fullName}</span>
          </div>
          <button
            onClick={logout}
            className="text-zinc-400 hover:text-red-400 transition-colors flex items-center gap-1 text-sm font-medium"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      ) : (
        <Link
          href="/auth/login"
          className="bg-primary hover:bg-primary-hover text-white px-6 py-2 rounded-lg font-semibold shadow-lg shadow-indigo-500/30 transition-all"
        >
          Sign In
        </Link>
      )}
    </div>
  </nav>;
}
