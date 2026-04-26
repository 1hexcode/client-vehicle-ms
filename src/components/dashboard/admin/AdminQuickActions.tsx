"use client";

import { LucideIcon, ArrowRight } from "lucide-react";
import Link from "next/link";

interface ActionItem {
  label: string;
  icon: LucideIcon;
  href: string;
}

interface AdminQuickActionsProps {
  actions: ActionItem[];
}

export default function AdminQuickActions({ actions }: AdminQuickActionsProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold font-outfit">Quick Actions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {actions.map((action, i) => {
          const Icon = action.icon;
          return (
            <Link key={i} href={action.href}
              className="bg-[#141414] rounded-xl border border-[#222] p-6 flex items-center gap-4 hover:border-[#F97316]/30 hover:bg-[#1A1A1A] transition-all group">
              <div className="w-11 h-11 rounded-xl bg-[#F97316]/10 flex items-center justify-center">
                <Icon size={20} className="text-[#F97316]" />
              </div>
              <span className="font-medium text-sm">{action.label}</span>
              <ArrowRight size={16} className="ml-auto text-gray-600 group-hover:text-[#F97316] transition-colors" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
