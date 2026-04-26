"use client";

import { LucideIcon } from "lucide-react";

interface StatItem {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
}

interface DashboardStatsProps {
  stats: StatItem[];
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div key={i} className="bg-[#141414] rounded-2xl border border-[#222] p-6 hover:border-[#333] transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: stat.color + '15' }}>
                <Icon size={22} style={{ color: stat.color }} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                <h3 className="text-2xl font-bold">{stat.value}</h3>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
