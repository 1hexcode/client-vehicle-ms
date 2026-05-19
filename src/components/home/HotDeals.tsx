"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Timer, ShoppingCart, Settings2 } from "lucide-react";
import toast from "react-hot-toast";
import { HotDeal } from "@/types";

const VISIBLE = 3;

function formatCountdown(ms: number): string {
  if (ms <= 0) return "Ended";
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (days > 0) return `${days}d ${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m`;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function HotDeals() {
  const [deals, setDeals] = useState<HotDeal[] | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let cancelled = false;
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "";

    async function load() {
      try {
        const res = await fetch(`${apiBase}/api/hot-deals`, {
          headers: { "Content-Type": "application/json" },
        });
        const json = res.ok ? await res.json().catch(() => ({})) : {};
        const list: HotDeal[] = Array.isArray(json?.data)
          ? json.data
          : Array.isArray(json)
            ? json
            : [];
        if (!cancelled) setDeals(list);
      } catch {
        if (!cancelled) setDeals([]);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const visible = useMemo(() => (deals ?? []).slice(0, VISIBLE), [deals]);
  const soonestEnd = useMemo(() => {
    if (!visible.length) return null;
    const future = visible
      .map((d) => new Date(d.endsAt).getTime())
      .filter((t) => Number.isFinite(t) && t > now);
    return future.length ? Math.min(...future) : null;
  }, [visible, now]);

  if (deals !== null && deals.length === 0) return null;

  return (
    <section id="deals" className="max-w-7xl mx-auto px-6 py-16">
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold font-outfit">Hot Deals</h2>
          {soonestEnd && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-bold">
              <Timer size={14} /> Ends in {formatCountdown(soonestEnd - now)}
            </div>
          )}
        </div>
        <Link
          href="/deals"
          className="text-sm text-gray-400 hover:text-[#F97316] transition-colors inline-flex items-center gap-1"
        >
          View All <ChevronRight size={16} />
        </Link>
      </div>

      {deals === null ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: VISIBLE }).map((_, i) => (
            <div
              key={i}
              className="bg-[#141414] rounded-2xl border border-[#222] p-6 flex gap-6 items-center animate-pulse"
            >
              <div className="w-32 h-32 rounded-xl bg-[#1A1A1A]" />
              <div className="flex-1 space-y-3">
                <div className="h-3 w-16 rounded bg-[#1A1A1A]" />
                <div className="h-4 w-3/4 rounded bg-[#1A1A1A]" />
                <div className="h-6 w-1/2 rounded bg-[#1A1A1A]" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {visible.map((deal) => {
            const discount =
              deal.discountPercentage ??
              (deal.originalPrice && deal.originalPrice > 0
                ? Math.round(((deal.originalPrice - deal.dealPrice) / deal.originalPrice) * 100)
                : null);
            return (
              <div
                key={deal.id}
                className="bg-[#141414] rounded-2xl border border-[#222] p-6 flex gap-6 items-center group hover:border-[#F97316]/30 transition-all"
              >
                <div className="w-32 h-32 rounded-xl bg-[#1A1A1A] flex items-center justify-center shrink-0 relative">
                  <Settings2 size={40} className="text-[#333]" />
                  {discount !== null && discount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-10 h-10 rounded-full flex items-center justify-center">
                      -{discount}%
                    </span>
                  )}
                </div>
                <div className="space-y-2 flex-1 min-w-0">
                  {deal.categoryName && (
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#F97316] truncate">
                      {deal.categoryName}
                    </p>
                  )}
                  <h4 className="font-bold truncate" title={deal.partName}>
                    {deal.partName || "Part"}
                  </h4>
                  <div className="flex items-center gap-3 pt-1">
                    {deal.originalPrice && deal.originalPrice > deal.dealPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        Rs.{deal.originalPrice.toLocaleString()}
                      </span>
                    )}
                    <span className="text-xl font-bold text-[#F97316]">
                      Rs.{deal.dealPrice.toLocaleString()}
                    </span>
                  </div>
                  <button
                    onClick={() => toast.success(`${deal.partName || "Item"} added to cart!`)}
                    className="mt-2 bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold px-5 py-2 rounded-lg transition-colors inline-flex items-center gap-1.5"
                  >
                    <ShoppingCart size={14} /> Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
