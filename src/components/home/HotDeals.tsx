"use client";

import Link from "next/link";
import { ChevronRight, Timer, Star, ShoppingCart, Settings2 } from "lucide-react";
import toast from "react-hot-toast";

const DEALS = [
  { name: "Premium Wheel Set", brand: "WHEEL", oldPrice: 299.99, price: 149.99, discount: 50, rating: 5 },
  { name: "Turbo Engine Parts Kit", brand: "ENGINE", oldPrice: 459.00, price: 229.50, discount: 50, rating: 5 },
  { name: "Hydraulic Brake System", brand: "BRAKE", oldPrice: 189.99, price: 94.99, discount: 50, rating: 4 },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={12} className={i < count ? "text-[#F97316] fill-[#F97316]" : "text-[#333]"} />
      ))}
    </div>
  );
}

export default function HotDeals() {
  return (
    <section id="deals" className="max-w-7xl mx-auto px-6 py-16">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold font-outfit">Hot Deals</h2>
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-bold">
            <Timer size={14} /> Ends in 12:45:30
          </div>
        </div>
        <Link href="#" className="text-sm text-gray-400 hover:text-[#F97316] transition-colors inline-flex items-center gap-1">
          View All <ChevronRight size={16} />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {DEALS.map((deal, i) => (
          <div key={i} className="bg-[#141414] rounded-2xl border border-[#222] p-6 flex gap-6 items-center group hover:border-[#F97316]/30 transition-all">
            <div className="w-32 h-32 rounded-xl bg-[#1A1A1A] flex items-center justify-center shrink-0 relative">
              <Settings2 size={40} className="text-[#333]" />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-10 h-10 rounded-full flex items-center justify-center">
                -{deal.discount}%
              </span>
            </div>
            <div className="space-y-2 flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#F97316]">{deal.brand}</p>
              <h4 className="font-bold truncate">{deal.name}</h4>
              <StarRating count={deal.rating} />
              <div className="flex items-center gap-3 pt-1">
                <span className="text-sm text-gray-500 line-through">Rs.{deal.oldPrice}</span>
                <span className="text-xl font-bold text-[#F97316]">Rs.{deal.price}</span>
              </div>
              <button 
                onClick={() => toast.success(`${deal.name} added to cart!`)}
                className="mt-2 bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold px-5 py-2 rounded-lg transition-colors inline-flex items-center gap-1.5"
              >
                <ShoppingCart size={14} /> Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
