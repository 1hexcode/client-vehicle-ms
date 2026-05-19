"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ChevronRight,
  Lightbulb,
  Octagon,
  Wind,
  Snowflake,
  Disc,
  Car,
  Compass,
  Settings2,
  Cog,
  BatteryCharging,
  Zap,
  Droplet,
  Filter,
  Fuel,
  Flame,
  Volume2,
  Armchair,
  Eye,
  Wrench,
  Package,
  LucideIcon,
} from "lucide-react";
import { PartCategory, Part } from "@/types";

const ICON_RULES: { keywords: string[]; icon: LucideIcon }[] = [
  { keywords: ["light", "lamp", "bulb", "optic", "head", "tail"], icon: Lightbulb },
  { keywords: ["brake", "brak", "pad", "rotor"], icon: Octagon },
  { keywords: ["exhaust", "muffler", "silencer"], icon: Wind },
  { keywords: ["cool", "radiator", "ac ", "a/c", "coolant"], icon: Snowflake },
  { keywords: ["wheel", "tire", "tyre", "rim"], icon: Disc },
  { keywords: ["body", "exterior", "bumper", "fender", "panel"], icon: Car },
  { keywords: ["steer", "wheel column", "handle"], icon: Compass },
  { keywords: ["transmission", "gearbox", "clutch"], icon: Cog },
  { keywords: ["engine", "motor", "block", "piston"], icon: Settings2 },
  { keywords: ["battery"], icon: BatteryCharging },
  { keywords: ["electric", "wiring", "harness", "fuse"], icon: Zap },
  { keywords: ["oil", "lubricant", "fluid"], icon: Droplet },
  { keywords: ["filter"], icon: Filter },
  { keywords: ["fuel", "petrol", "diesel", "tank"], icon: Fuel },
  { keywords: ["spark", "plug", "ignition"], icon: Flame },
  { keywords: ["horn", "audio", "speaker", "sound"], icon: Volume2 },
  { keywords: ["seat", "interior", "cabin", "upholstery"], icon: Armchair },
  { keywords: ["mirror", "glass", "windshield"], icon: Eye },
  { keywords: ["tool", "kit"], icon: Wrench },
];

function pickIcon(name: string): LucideIcon {
  const lower = name.toLowerCase();
  for (const rule of ICON_RULES) {
    if (rule.keywords.some((kw) => lower.includes(kw))) return rule.icon;
  }
  return Package;
}

type CategoryCard = { id: string; name: string; count: number; Icon: LucideIcon };

export default function Categories() {
  const [cards, setCards] = useState<CategoryCard[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
    const token =
      typeof document !== "undefined"
        ? document.cookie.split("; ").find((c) => c.startsWith("token="))?.split("=")[1]
        : undefined;
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token && token !== "undefined") headers.Authorization = `Bearer ${token}`;

    async function load() {
      try {
        const [catsRes, partsRes] = await Promise.all([
          fetch(`${apiBase}/api/part-categories`, { headers }),
          fetch(`${apiBase}/api/Parts`, { headers }),
        ]);
        const catsJson = await catsRes.json().catch(() => ({}));
        const partsJson = await partsRes.json().catch(() => ({}));

        const categories: PartCategory[] = Array.isArray(catsJson?.data)
          ? catsJson.data
          : Array.isArray(catsJson)
            ? catsJson
            : [];
        const parts: Part[] = Array.isArray(partsJson?.data)
          ? partsJson.data
          : Array.isArray(partsJson)
            ? partsJson
            : [];

        const countByCat = new Map<string, number>();
        for (const p of parts) {
          if (p.isActive === false) continue;
          countByCat.set(p.categoryId, (countByCat.get(p.categoryId) || 0) + 1);
        }

        const active = categories.filter((c) => c.isActive);
        const ranked = active
          .map((c) => ({
            id: c.id,
            name: c.name,
            count: countByCat.get(c.id) || 0,
            Icon: pickIcon(c.name),
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 8);

        if (!cancelled) setCards(ranked);
      } catch {
        if (!cancelled) setCards([]);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="categories" className="max-w-7xl mx-auto px-6 py-16">
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-2xl font-bold font-outfit">Popular Categories</h2>
        <Link
          href="/products"
          className="text-sm text-gray-400 hover:text-[#F97316] transition-colors inline-flex items-center gap-1"
        >
          View All Category <ChevronRight size={16} />
        </Link>
      </div>

      {cards === null ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-[#141414] border border-[#222] animate-pulse"
            >
              <div className="w-14 h-14 rounded-full bg-[#1A1A1A]" />
              <div className="h-3 w-20 rounded bg-[#1A1A1A]" />
              <div className="h-2 w-12 rounded bg-[#1A1A1A]" />
            </div>
          ))}
        </div>
      ) : cards.length === 0 ? (
        <div className="text-center py-12 text-gray-500 text-sm">
          No categories available yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {cards.map((cat) => {
            const Icon = cat.Icon;
            return (
              <Link
                key={cat.id}
                href={`/products?category=${cat.id}`}
                className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-[#141414] border border-[#222] hover:border-[#F97316]/40 hover:bg-[#1A1A1A] transition-all duration-300 cursor-pointer group"
              >
                <div className="w-14 h-14 rounded-full bg-[#1A1A1A] border border-[#222] flex items-center justify-center group-hover:bg-[#F97316]/10 group-hover:border-[#F97316]/30 transition-all">
                  <Icon
                    size={24}
                    className="text-gray-400 group-hover:text-[#F97316] transition-colors"
                    strokeWidth={1.5}
                  />
                </div>
                <span className="text-xs font-semibold text-center leading-tight">
                  {cat.name}
                </span>
                <span className="text-[10px] text-gray-500">
                  {cat.count} {cat.count === 1 ? "Item" : "Items"}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
