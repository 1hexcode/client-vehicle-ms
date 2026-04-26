"use client";

import Link from "next/link";
import { ChevronRight, Lightbulb, Octagon, Wind, Snowflake, Disc, Car, Compass, Settings2 } from "lucide-react";

const CATEGORIES = [
  { name: "Lights & Optics", count: "52 Items", icon: Lightbulb },
  { name: "Braking System", count: "38 Items", icon: Octagon },
  { name: "Exhaust Parts", count: "26 Items", icon: Wind },
  { name: "Cooling System", count: "19 Items", icon: Snowflake },
  { name: "Car Wheels", count: "44 Items", icon: Disc },
  { name: "Exterior Body", count: "31 Items", icon: Car },
  { name: "Steering Parts", count: "24 Items", icon: Compass },
  { name: "Engine Block", count: "17 Items", icon: Settings2 },
];

export default function Categories() {
  return (
    <section id="categories" className="max-w-7xl mx-auto px-6 py-16">
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-2xl font-bold font-outfit">Popular Categories</h2>
        <Link href="#" className="text-sm text-gray-400 hover:text-[#F97316] transition-colors inline-flex items-center gap-1">
          View All Category <ChevronRight size={16} />
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
        {CATEGORIES.map((cat, i) => {
          const Icon = cat.icon;
          return (
            <div key={i} className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-[#141414] border border-[#222] hover:border-[#F97316]/40 hover:bg-[#1A1A1A] transition-all duration-300 cursor-pointer group">
              <div className="w-14 h-14 rounded-full bg-[#1A1A1A] border border-[#222] flex items-center justify-center group-hover:bg-[#F97316]/10 group-hover:border-[#F97316]/30 transition-all">
                <Icon size={24} className="text-gray-400 group-hover:text-[#F97316] transition-colors" strokeWidth={1.5} />
              </div>
              <span className="text-xs font-semibold text-center leading-tight">{cat.name}</span>
              <span className="text-[10px] text-gray-500">{cat.count}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
