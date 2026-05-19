"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Timer,
  ShoppingCart,
  Settings2,
  Flame,
  PackageX,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import { HotDeal } from "@/types";
import { useCart } from "@/store/CartContext";

function formatCountdown(ms: number): string {
  if (ms <= 0) return "Ended";
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (days > 0)
    return `${days}d ${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}m`;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function DealsBrowser() {
  const [deals, setDeals] = useState<HotDeal[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => Date.now());

  const load = async () => {
    setLoading(true);
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
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
      setDeals(list);
    } catch {
      setDeals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const visible = deals ?? [];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold font-outfit flex items-center gap-3">
            <Flame className="text-[#F97316]" size={32} /> Hot Deals
          </h1>
          <p className="text-gray-400 mt-2 text-sm">
            Limited-time discounts on selected vehicle parts. Grab them before they expire.
          </p>
        </div>
        <button
          onClick={load}
          className="self-start md:self-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-[#141414] border border-[#222] text-gray-300 hover:border-[#F97316]/40 hover:text-white transition-all text-sm font-semibold"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {loading && deals === null ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
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
      ) : visible.length === 0 ? (
        <div className="bg-[#0F0F0F] border border-[#222] rounded-2xl py-20 text-center">
          <PackageX className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="font-semibold text-gray-100">No active deals right now</p>
          <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
            Check back soon — we run new promotions regularly.
          </p>
          <Link
            href="/products"
            className="inline-block mt-5 px-5 py-2.5 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-sm font-bold transition-colors"
          >
            Browse all parts
          </Link>
        </div>
      ) : (
        <DealsGrid deals={visible} now={now} />
      )}
    </div>
  );
}

function DealsGrid({ deals, now }: { deals: HotDeal[]; now: number }) {
  const { addItem } = useCart();
  const sorted = useMemo(
    () =>
      [...deals].sort(
        (a, b) => new Date(a.endsAt).getTime() - new Date(b.endsAt).getTime(),
      ),
    [deals],
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {sorted.map((deal) => {
        const endMs = new Date(deal.endsAt).getTime();
        const remaining = endMs - now;
        const discount =
          deal.discountPercentage ??
          (deal.originalPrice && deal.originalPrice > 0
            ? Math.round(
                ((deal.originalPrice - deal.dealPrice) / deal.originalPrice) * 100,
              )
            : null);

        return (
          <article
            key={deal.id}
            className="bg-[#141414] rounded-2xl border border-[#222] p-6 flex gap-5 items-stretch group hover:border-[#F97316]/30 transition-all"
          >
            <div className="w-32 h-32 rounded-xl bg-[#1A1A1A] flex items-center justify-center shrink-0 relative">
              <Settings2 size={40} className="text-[#333]" />
              {discount !== null && discount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-10 h-10 rounded-full flex items-center justify-center">
                  -{discount}%
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0 flex flex-col">
              {deal.categoryName && (
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#F97316] truncate">
                  {deal.categoryName}
                </p>
              )}
              <h3 className="font-bold mt-1 line-clamp-2" title={deal.partName}>
                {deal.partName || "Part"}
              </h3>
              {deal.partSku && (
                <p className="text-[11px] text-gray-500 mt-0.5">SKU: {deal.partSku}</p>
              )}
              <div className="flex items-baseline gap-3 mt-2">
                {deal.originalPrice && deal.originalPrice > deal.dealPrice && (
                  <span className="text-sm text-gray-500 line-through">
                    Rs.{deal.originalPrice.toLocaleString()}
                  </span>
                )}
                <span className="text-xl font-bold text-[#F97316]">
                  Rs.{deal.dealPrice.toLocaleString()}
                </span>
              </div>
              <div className="mt-auto pt-3 flex items-center justify-between gap-3">
                <span
                  className={`text-[11px] font-semibold inline-flex items-center gap-1.5 ${
                    remaining > 0 ? "text-red-400" : "text-gray-500"
                  }`}
                >
                  <Timer size={12} />
                  {remaining > 0 ? formatCountdown(remaining) : "Ended"}
                </span>
                <button
                  onClick={() => {
                    addItem({
                      partId: deal.partId,
                      name: deal.partName || "Part",
                      sku: deal.partSku || "",
                      unitPrice: deal.dealPrice,
                      imageUrl: null,
                      stockQuantity: 999,
                    });
                    toast.success(`${deal.partName || "Item"} added to cart!`);
                  }}
                  disabled={remaining <= 0}
                  className="bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart size={14} /> Add
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
