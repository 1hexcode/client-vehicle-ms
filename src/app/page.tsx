"use client";

import Link from "next/link";
import {
  ShieldCheck,
  Users,
  Settings,
  ShoppingBag,
  Search,
  Mail,
  Calendar,
  History,
  BrainCircuit,
  BellRing,
  Zap,
  ChevronRight,
  BarChart3,
  Truck,
} from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen pt-32 pb-20 px-6 bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.1),transparent),_radial-gradient(circle_at_bottom_left,_rgba(14,165,233,0.1),transparent)]">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto text-center animate-fade-in mb-32">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 text-sm font-medium text-primary">
          <Zap size={16} />
          <span>New: AI-Powered Part Failure Prediction</span>
        </div>
        <h1 className="text-5xl md:text-8xl font-extrabold mb-8 bg-gradient-to-br from-white via-white to-zinc-600 bg-clip-text text-transparent leading-[1.1] tracking-tight">
          Vehicle Parts MS <br />
          <span className="text-zinc-500">Intelligent Management.</span>
        </h1>
        <p className="text-lg md:text-xl text-zinc-400 max-w-3xl mx-auto mb-12 leading-relaxed font-light">
          A comprehensive ecosystem designed for modern automotive service
          centers. Streamline inventory, empower staff, and provide a superior
          customer experience with integrated AI insights and automated
          financial tracking.
        </p>

        <div className="flex flex-wrap gap-6 justify-center">
          <Link
            href="/auth/register"
            className="bg-primary hover:bg-primary-hover text-white px-10 py-4 rounded-xl text-lg font-bold shadow-xl shadow-indigo-500/40 transition-all hover:-translate-y-1 active:scale-95"
          >
            Get Started Now
          </Link>
          <Link
            href="#features"
            className="glass px-10 py-4 rounded-xl text-lg font-bold text-white hover:bg-white/5 transition-all"
          >
            Explore Features
          </Link>
        </div>
      </section>

      {/* Overview Section: Role-Based Core */}
      <section id="features" className="max-w-7xl mx-auto mb-32">
        <div className="text-center mb-16 px-4">
          <h2 className="text-4xl font-bold font-outfit mb-4">
            Enterprise-Grade Ecosystem
          </h2>
          <p className="text-zinc-500">
            Tailored experiences for every user in your organization.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Admin Role */}
          <div className="glass p-10 relative overflow-hidden group hover:border-primary/50 transition-all">
            <div className="absolute -right-8 -top-8 text-white/5 group-hover:text-primary/10 transition-colors">
              <ShieldCheck size={160} />
            </div>
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-8">
              <ShieldCheck size={32} />
            </div>
            <h3 className="text-2xl font-bold mb-4">Admin Console</h3>
            <ul className="space-y-4 text-zinc-400 mb-8">
              <li className="flex items-center gap-3">
                <BarChart3 size={18} className="text-primary" /> Financial
                Reports (Daily/Monthly)
              </li>
              <li className="flex items-center gap-3">
                <Users size={18} className="text-primary" /> Staff Management &
                Roles
              </li>
              <li className="flex items-center gap-3">
                <Settings size={18} className="text-primary" /> Inventory &
                Parts Control
              </li>
              <li className="flex items-center gap-3">
                <Truck size={18} className="text-primary" /> Vendor & Purchase
                Invoices
              </li>
            </ul>
            <div className="text-sm font-semibold text-primary inline-flex items-center gap-1 group-hover:gap-2 transition-all">
              Learn about Admin controls <ChevronRight size={16} />
            </div>
          </div>

          {/* Staff Role */}
          <div className="glass p-10 relative overflow-hidden group hover:border-emerald-500/50 transition-all">
            <div className="absolute -right-8 -top-8 text-white/5 group-hover:text-emerald-500/10 transition-colors">
              <ShoppingBag size={160} />
            </div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-8">
              <ShoppingBag size={32} />
            </div>
            <h3 className="text-2xl font-bold mb-4">Staff Operations</h3>
            <ul className="space-y-4 text-zinc-400 mb-8">
              <li className="flex items-center gap-3">
                <Search size={18} className="text-emerald-500" /> Advanced
                Customer Search
              </li>
              <li className="flex items-center gap-3">
                <Zap size={18} className="text-emerald-500" /> POS & Quick Sales
                Interface
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-emerald-500" /> Automated Email
                Invoicing
              </li>
              <li className="flex items-center gap-3">
                <History size={18} className="text-emerald-500" /> Service
                History Tracking
              </li>
            </ul>
            <div className="text-sm font-semibold text-emerald-500 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
              Explore operational tools <ChevronRight size={16} />
            </div>
          </div>

          {/* Customer Role */}
          <div className="glass p-10 relative overflow-hidden group hover:border-accent/50 transition-all">
            <div className="absolute -right-8 -top-8 text-white/5 group-hover:text-accent/10 transition-colors">
              <Users size={160} />
            </div>
            <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent mb-8">
              <Users size={32} />
            </div>
            <h3 className="text-2xl font-bold mb-4">Customer Portal</h3>
            <ul className="space-y-4 text-zinc-400 mb-8">
              <li className="flex items-center gap-3">
                <Settings size={18} className="text-accent" /> Profile & Vehicle
                Management
              </li>
              <li className="flex items-center gap-3">
                <Calendar size={18} className="text-accent" /> Appointment
                Booking
              </li>
              <li className="flex items-center gap-3">
                <History size={18} className="text-accent" /> Service & Purchase
                History
              </li>
              <li className="flex items-center gap-3">
                <Zap size={18} className="text-accent" /> Part Requests &
                Reviews
              </li>
            </ul>
            <div className="text-sm font-semibold text-accent inline-flex items-center gap-1 group-hover:gap-2 transition-all">
              View self-service features <ChevronRight size={16} />
            </div>
          </div>
        </div>
      </section>

      {/* Intelligence & Automation */}
      <section className="max-w-6xl mx-auto mb-32 glass p-12 rounded-[2rem] border-white/5 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[50%] h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-6">
              AI Powered
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-8 font-outfit leading-tight">
              Intelligent Prediction <br />& Automation.
            </h2>
            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-primary">
                  <BrainCircuit size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-bold mb-2">
                    AI Condition Analysis
                  </h4>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    Integrated AI analyzes vehicle usage patterns to predict
                    potential part failures before they happen.
                  </p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-500">
                  <BellRing size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-bold mb-2">
                    Automated Inventory Alerts
                  </h4>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    Never run out of stock. The system automatically alerts
                    admins when any part falls below a critical threshold.
                  </p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-500">
                  <Mail size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-bold mb-2">Smart Reminders</h4>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    Automatic email notifications for customers with unpaid
                    balances overdue by more than one month.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="hidden lg:block relative">
            <div className="aspect-square glass rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent" />
              <div className="relative z-10 h-full flex flex-col justify-center gap-6">
                <div className="p-6 glass bg-white/5 rounded-2xl animate-pulse">
                  <div className="flex justify-between items-center mb-4">
                    <div className="h-4 w-24 bg-zinc-700 rounded" />
                    <div className="h-4 w-12 bg-primary/40 rounded" />
                  </div>
                  <div className="h-2 w-full bg-zinc-800 rounded mb-2" />
                  <div className="h-2 w-2/3 bg-zinc-800 rounded" />
                </div>
                <div className="p-6 glass bg-zinc-900 border-primary/30 rounded-2xl translate-x-10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                      AI
                    </div>
                    <div className="h-4 w-32 bg-zinc-700 rounded" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 w-full bg-zinc-800 rounded" />
                    <div className="h-2 w-full bg-zinc-800 rounded" />
                    <div className="h-2 w-1/2 bg-zinc-800 rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Quote / Stats */}
      <section className="max-w-4xl mx-auto text-center py-20 px-4 border-t border-white/5">
        <h2 className="text-2xl md:text-3xl font-light italic text-zinc-300 leading-relaxed">
          &quot;This system isn&apos;t just about managing parts—it&apos;s about
          building a smarter, more responsive automotive business.&quot;
        </h2>
        <div className="mt-8 flex justify-center gap-12 text-center">
          <div>
            <div className="text-3xl font-bold text-white">99%</div>
            <div className="text-xs text-zinc-500 uppercase tracking-widest mt-1">
              Efficiency
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">AI</div>
            <div className="text-xs text-zinc-500 uppercase tracking-widest mt-1">
              Powered
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">100%</div>
            <div className="text-xs text-zinc-500 uppercase tracking-widest mt-1">
              Secure
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto mt-20 pt-10 border-t border-white/5 px-6 flex flex-col md:flex-row justify-between items-center gap-8 opacity-60">
        <div className="font-bold text-xl tracking-tighter">
          VEHICLE<span className="text-primary">MS</span>
        </div>
        <div className="flex gap-8 text-sm">
          <Link href="/privacy" className="hover:text-primary">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-primary">
            Terms of Service
          </Link>
          <Link href="/contact" className="hover:text-primary">
            Contact Support
          </Link>
        </div>
        <p className="text-xs text-zinc-500">
          © 2026 Vehicle Parts MS. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
