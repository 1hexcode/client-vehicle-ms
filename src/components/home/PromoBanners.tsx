"use client";

import Link from "next/link";
import { ArrowRight, Car, Disc, Octagon, Flame } from "lucide-react";

export default function PromoBanners() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl bg-[#141414] border border-[#222] p-8 flex flex-col justify-center relative overflow-hidden group hover:border-[#F97316]/30 transition-all">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Featured</span>
          <h3 className="text-xl font-bold font-outfit mb-1">Interior Parts</h3>
          <p className="text-sm text-gray-400 mb-6">From <span className="text-[#F97316] font-bold">Rs. 5,999</span></p>
          <Link href="#" className="text-sm text-[#F97316] font-semibold inline-flex items-center gap-1 hover:gap-2 transition-all">Shop Now <ArrowRight size={16} /></Link>
          <Car size={120} className="absolute -bottom-6 -right-6 text-[#1A1A1A] group-hover:text-[#222] transition-colors" />
        </div>
        <div className="rounded-2xl bg-[#F97316] p-8 flex flex-col justify-center relative overflow-hidden group">
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/70 mb-1">For any Vehicle</span>
          <h3 className="text-xl font-bold font-outfit mb-1 text-white">Buy the Tires</h3>
          <p className="text-sm text-white/80 mb-6">From <span className="text-white font-bold">Rs. 3,999</span></p>
          <Link href="#" className="text-sm text-white font-semibold inline-flex items-center gap-1 hover:gap-2 transition-all">Shop Now <ArrowRight size={16} /></Link>
          <Disc size={120} className="absolute -bottom-6 -right-6 text-white/10" />
        </div>
        <div className="rounded-2xl bg-[#141414] border border-[#222] p-8 flex flex-col justify-center relative overflow-hidden group hover:border-[#F97316]/30 transition-all">
          <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Flame size={12} /> Hot Sale</span>
          <h3 className="text-xl font-bold font-outfit mb-1">Car Body Parts</h3>
          <p className="text-sm text-gray-400 mb-6">From <span className="text-[#F97316] font-bold">Rs. 8,999</span></p>
          <Link href="#" className="text-sm text-[#F97316] font-semibold inline-flex items-center gap-1 hover:gap-2 transition-all">Shop Now <ArrowRight size={16} /></Link>
          <Octagon size={120} className="absolute -bottom-6 -right-6 text-[#1A1A1A] group-hover:text-[#222] transition-colors" />
        </div>
      </div>
    </section>
  );
}
