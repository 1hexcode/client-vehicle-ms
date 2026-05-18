"use client";

import Image from "next/image";
import Link from "next/link";
import { Zap, ArrowRight, ChevronRight, Shield } from "lucide-react";

interface HeroProps {
  dashboardHref: string;
}

export default function Hero({ dashboardHref }: HeroProps) {
  return (
    <section className="relative">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-6 py-8">
        {/* Main Hero */}
        <div className="lg:col-span-8 relative rounded-2xl overflow-hidden min-h-[420px] group">
          <Image
            src="/images/hero-banner.png"
            alt="Premium Vehicle Parts"
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
            priority
          />
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative z-10 h-full flex flex-col justify-center px-10 md:px-14 py-10">
            <span className="inline-flex items-center gap-2 bg-[#F97316] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full w-fit mb-5 animate-pulse-glow">
              <Zap size={12} /> New Arrivals
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-outfit leading-[1.05] mb-4 animate-slide-up">
              Get All Original<br />Parts for Your Car
            </h1>
            <p className="text-gray-300 text-sm md:text-base max-w-md mb-8 leading-relaxed animate-slide-up stagger-1">
              Starting from <span className="text-[#F97316] font-bold text-xl">Rs. 899</span> - Premium OEM & aftermarket parts for every make and model.
            </p>
            <Link
              href={dashboardHref}
              className="inline-flex items-center gap-2 bg-[#F97316] hover:bg-[#EA580C] text-white px-8 py-3.5 rounded-xl font-bold text-sm transition-all hover:gap-3 w-fit animate-slide-up stagger-2"
            >
              Shop Now <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        {/* Side cards */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="relative rounded-2xl overflow-hidden flex-1 min-h-[200px] group">
            <Image
              src="/images/promo-interior.png"
              alt="Interior Parts"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-black/50" />
            <div className="relative z-10 h-full flex flex-col justify-end p-8">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#F97316] mb-2">Find Parts</span>
              <h3 className="text-xl font-bold font-outfit mb-3">For Your Vehicle</h3>
              <Link href={dashboardHref} className="text-sm text-[#F97316] font-semibold inline-flex items-center gap-1 hover:gap-2 transition-all">
                Browse Parts <ChevronRight size={16} />
              </Link>
            </div>
          </div>
          <div className="rounded-2xl bg-[#141414] border border-[#222] p-8 flex-1 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#F97316]/10 flex items-center justify-center">
                <Shield size={20} className="text-[#F97316]" />
              </div>
              <span className="text-xs font-bold text-[#F97316] uppercase tracking-wider">AI Powered</span>
            </div>
            <h3 className="text-lg font-bold font-outfit mb-2">Part Failure Prediction</h3>
            <p className="text-gray-500 text-xs mb-4 leading-relaxed">Our AI monitors vehicle health patterns to predict failures before they happen.</p>
            <Link href="/auth/register" className="text-sm text-[#F97316] font-semibold inline-flex items-center gap-1 hover:gap-2 transition-all">
              Learn More <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
