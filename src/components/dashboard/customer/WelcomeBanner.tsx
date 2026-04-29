"use client";

import { Wrench, Calendar } from "lucide-react";
import Link from "next/link";

interface WelcomeBannerProps {
  userName?: string;
}

export default function WelcomeBanner({ userName }: WelcomeBannerProps) {
  return (
    <div className="bg-[#F97316] rounded-2xl p-8 md:p-10 relative overflow-hidden">
      <div className="relative z-10">
        <h2 className="text-2xl md:text-3xl font-bold font-outfit text-white mb-2">
          Ready to hit the road, {userName?.split(' ')[0]}?
        </h2>
        <p className="text-white/70 text-sm max-w-lg mb-6">
          Manage your vehicles, track service history, and book appointments in one place.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/customer/appointments" className="bg-white text-[#F97316] px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-100 transition-all inline-flex items-center gap-2">
            <Calendar size={16} /> Book Service
          </Link>
          <Link href="/customer/vehicles" className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-white/20 transition-all">
            View History
          </Link>
        </div>
      </div>
      <Wrench size={180} className="absolute -bottom-10 -right-10 text-white/10" />
    </div>
  );
}
