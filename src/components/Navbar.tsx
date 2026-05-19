"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/store/AuthContext";
import { useCart } from "@/store/CartContext";
import { 
  LogOut, 
  User as UserIcon, 
  Search, 
  Menu, 
  PhoneCall, 
  Truck,
  Heart,
  ShoppingCart,
  ChevronDown,
  X
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="w-full z-[1000] sticky top-0">
      {/* Top utility bar */}
      <div className="bg-[#111] border-b border-[#222] py-2 px-6 hidden md:flex justify-between items-center text-xs text-gray-400">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5">
            <PhoneCall size={12} className="text-[#F97316]" />
            Call us: +977 01-5555678
          </span>
          <span className="flex items-center gap-1.5">
            <Truck size={12} className="text-[#F97316]" />
            Free delivery on orders above Rs. 5,000
          </span>
        </div>
        <div className="flex items-center gap-6">
          {user ? (
            <span>Welcome, <strong className="text-white">{user.fullName}</strong></span>
          ) : (
            <>
              <Link href="/auth/login" className="hover:text-white transition-colors">Sign In</Link>
              <span className="text-[#333]">|</span>
              <Link href="/auth/register" className="hover:text-white transition-colors">Register</Link>
            </>
          )}
        </div>
      </div>

      {/* Main navigation */}
      <nav className="bg-[#0A0A0A] border-b border-[#222] px-6">
        <div className="max-w-7xl mx-auto h-[72px] flex items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="block shrink-0">
            <Image src="/images/logo-black.jpeg" alt="VehicleMS Logo" width={100} height={48} className="h-12 w-auto rounded-lg object-contain" priority />
          </Link>

          {/* Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-xl">
            <div className="flex w-full">
              <button className="bg-[#1A1A1A] border border-[#333] border-r-0 px-4 py-2.5 text-xs text-gray-400 flex items-center gap-1 rounded-l-lg hover:bg-[#222] transition-colors whitespace-nowrap">
                All Categories <ChevronDown size={14} />
              </button>
              <input
                type="text"
                placeholder="Search for parts, accessories, tools..."
                className="flex-1 bg-[#141414] border border-[#333] px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#F97316] transition-colors"
              />
              <button className="bg-[#F97316] hover:bg-[#EA580C] px-5 py-2.5 rounded-r-lg transition-colors">
                <Search size={18} className="text-white" />
              </button>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-5">
            {user ? (
              <div className="flex items-center gap-4">
                <Link href="/cart" className="p-2.5 text-gray-400 hover:text-white transition-colors relative" title="Cart">
                  <ShoppingCart size={20} />
                  {itemCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-[#F97316] rounded-full text-[9px] font-bold flex items-center justify-center text-white">
                      {itemCount > 99 ? "99+" : itemCount}
                    </span>
                  )}
                </Link>
                <Link
                  href={user.role === 'Admin' ? '/admin/dashboard' : user.role === 'Staff' ? '/staff/dashboard' : '/customer/dashboard'}
                  className="hidden sm:flex items-center gap-2 bg-[#F97316] hover:bg-[#EA580C] text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                >
                  <UserIcon size={16} />
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="p-2.5 text-gray-400 hover:text-red-400 transition-colors" title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-3">
                <Link href="/auth/login" className="p-2.5 text-gray-400 hover:text-white transition-colors" title="Wishlist">
                  <Heart size={20} />
                </Link>
                <Link href="/cart" className="p-2.5 text-gray-400 hover:text-white transition-colors relative" title="Cart">
                  <ShoppingCart size={20} />
                  {itemCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-[#F97316] rounded-full text-[9px] font-bold flex items-center justify-center text-white">
                      {itemCount > 99 ? "99+" : itemCount}
                    </span>
                  )}
                </Link>
                <div className="w-px h-8 bg-[#333] mx-1" />
                <Link href="/auth/login" className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors text-sm font-medium">
                  <UserIcon size={18} />
                  <span className="hidden xl:inline">Account</span>
                </Link>
              </div>
            )}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 text-gray-400">
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Category navigation strip */}
        <div className="max-w-7xl mx-auto hidden lg:flex items-center gap-8 py-3 text-sm border-t border-[#1A1A1A]">
          <Link href="/" className={`font-semibold transition-colors ${pathname === '/' ? 'text-[#F97316]' : 'text-gray-400 hover:text-white'}`}>Home</Link>
          <Link href="/products" className={`transition-colors ${pathname === '/products' ? 'text-[#F97316]' : 'text-gray-400 hover:text-white'}`}>Categories</Link>
          <Link href="/#products" className="text-gray-400 hover:text-white transition-colors">Best Sellers</Link>
          <Link href="/deals" className={`transition-colors ${pathname === '/deals' ? 'text-[#F97316]' : 'text-gray-400 hover:text-white'}`}>Hot Deals</Link>
          <Link href="/about" className={`transition-colors ${pathname === '/about' ? 'text-[#F97316]' : 'text-gray-400 hover:text-white'}`}>About Us</Link>
          <Link href="/contact" className={`transition-colors ${pathname === '/contact' ? 'text-[#F97316]' : 'text-gray-400 hover:text-white'}`}>Contact</Link>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)}>
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-[#111] border-l border-[#222] p-6 space-y-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <span className="font-bold text-lg">Menu</span>
              <button onClick={() => setMobileOpen(false)}><X size={24} /></button>
            </div>
            <div className="space-y-1">
              {[
                { label: 'Home', href: '/' },
                { label: 'Categories', href: '/products' },
                { label: 'Best Sellers', href: '/#products' },
                { label: 'Hot Deals', href: '/deals' },
                { label: 'Shop', href: '/products' },
                { label: 'Cart', href: '/cart' },
                { label: 'About', href: '/about' },
                { label: 'Contact', href: '/contact' },
              ].map(item => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="block py-3 px-4 text-gray-300 hover:text-[#F97316] hover:bg-[#1A1A1A] rounded-lg transition-all text-sm font-medium"
                >
                  {item.label}
                </Link>
              ))}
            </div>
            {!user && (
              <div className="pt-4 border-t border-[#222] space-y-2">
                <Link href="/auth/login" className="block w-full text-center py-3 bg-[#F97316] rounded-lg font-semibold text-sm">Sign In</Link>
                <Link href="/auth/register" className="block w-full text-center py-3 border border-[#333] rounded-lg text-sm text-gray-300">Register</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
