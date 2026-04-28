"use client";

import Link from "next/link";
import { ArrowLeft, LucideIcon } from "lucide-react";

interface AuthBrandingProps {
  title: string;
  subtitle: string;
  description: string;
  icon: LucideIcon;
}

export default function AuthBranding({ title, subtitle, description, icon: Icon }: AuthBrandingProps) {
  return (
    <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-[#F97316]">
      <div className="relative z-10 flex flex-col justify-between p-14 w-full">
        <Link href="/" className="flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm font-medium">
          <ArrowLeft size={18} /> Back to Home
        </Link>
        <div className="space-y-6">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <Icon size={32} className="text-white" />
          </div>
          <h1 className="text-5xl font-extrabold font-outfit leading-tight text-white">
            {title}<br />{subtitle}
          </h1>
          <p className="text-white/70 max-w-sm leading-relaxed">
            {description}
          </p>
        </div>
        <p className="text-white/40 text-xs">© 2026 VehicleMS. All rights reserved.</p>
      </div>
      {/* Decorative elements */}
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-white/5" />
      <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/5" />
    </div>
  );
}
