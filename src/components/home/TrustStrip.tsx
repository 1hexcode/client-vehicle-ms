"use client";

import { Truck, RotateCcw, Headphones, CreditCard } from "lucide-react";

const TRUST_ITEMS = [
  { icon: Truck, title: "Free Delivery", desc: "Orders over Rs. 5,000" },
  { icon: RotateCcw, title: "Easy Returns", desc: "30-day return policy" },
  { icon: Headphones, title: "24/7 Support", desc: "Dedicated assistance" },
  { icon: CreditCard, title: "Secure Payment", desc: "100% protected" },
];

export default function TrustStrip() {
  return (
    <section className="border-y border-[#222]">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
        {TRUST_ITEMS.map((item, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#F97316]/10 flex items-center justify-center shrink-0">
              <item.icon size={22} className="text-[#F97316]" />
            </div>
            <div>
              <h4 className="text-sm font-bold">{item.title}</h4>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
