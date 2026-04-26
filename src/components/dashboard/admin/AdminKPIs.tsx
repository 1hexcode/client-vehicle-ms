"use client";

import { LucideIcon, TrendingUp } from "lucide-react";

interface KPIItem {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  trend: string;
}

interface AdminKPIsProps {
  stats: KPIItem[];
}

export default function AdminKPIs({ stats }: AdminKPIsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div key={i} className="bg-[#141414] rounded-2xl border border-[#222] p-6 hover:border-[#333] transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: stat.color + '15' }}>
                <Icon size={20} style={{ color: stat.color }} />
              </div>
              <TrendingUp size={16} className="text-green-500" />
            </div>
            <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
            <p className="text-xs text-gray-500">{stat.label}</p>
            <p className="text-[10px] text-gray-600 mt-2">{stat.trend}</p>
          </div>
        );
      })}
    </div>
  );
}
