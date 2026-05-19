"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Filter,
  X,
  Loader2,
  PackageX,
  ShoppingBag,
  ChevronDown,
} from "lucide-react";
import { Part, PartCategory } from "@/types";
import ProductsSidebar, { SortKey } from "./ProductsSidebar";
import ProductCard from "./ProductCard";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "recent", label: "Recently Added" },
  { key: "price-asc", label: "Price: Low → High" },
  { key: "price-desc", label: "Price: High → Low" },
  { key: "name-asc", label: "Name: A → Z" },
];

interface LoadState {
  parts: Part[];
  categories: PartCategory[];
  loading: boolean;
  error: string | null;
}

function parseListParam(v: string | null): string[] {
  if (!v) return [];
  return v.split(",").map((s) => s.trim()).filter(Boolean);
}

export default function ProductsBrowser() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [state, setState] = useState<LoadState>({
    parts: [],
    categories: [],
    loading: true,
    error: null,
  });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Fetch parts + categories once on mount. Guests can browse — 401s degrade to empty results.
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
        const [partsRes, catsRes] = await Promise.all([
          fetch(`${apiBase}/api/Parts`, { headers }),
          fetch(`${apiBase}/api/part-categories`, { headers }),
        ]);

        const partsJson = partsRes.ok ? await partsRes.json().catch(() => ({})) : {};
        const catsJson = catsRes.ok ? await catsRes.json().catch(() => ({})) : {};

        const parts: Part[] = Array.isArray(partsJson?.data)
          ? partsJson.data
          : Array.isArray(partsJson)
            ? partsJson
            : [];
        const categories: PartCategory[] = Array.isArray(catsJson?.data)
          ? catsJson.data
          : Array.isArray(catsJson)
            ? catsJson
            : [];

        if (!cancelled) {
          setState({ parts, categories, loading: false, error: null });
        }
      } catch (err: any) {
        if (!cancelled) {
          setState({
            parts: [],
            categories: [],
            loading: false,
            error: err?.message || "Failed to load products",
          });
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── URL-driven filter state ───────────────────────────────
  const q = searchParams.get("q") ?? "";
  const selectedCategoryIds = useMemo(
    () => parseListParam(searchParams.get("category")),
    [searchParams],
  );
  const selectedVehicleTypes = useMemo(
    () => parseListParam(searchParams.get("vehicleType")),
    [searchParams],
  );
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const inStockOnly = searchParams.get("inStock") === "1";
  const sort: SortKey =
    (searchParams.get("sort") as SortKey) || ("recent" as SortKey);

  const setParam = useCallback(
    (key: string, value: string | string[] | null) => {
      const next = new URLSearchParams(searchParams.toString());
      const v = Array.isArray(value) ? (value.length ? value.join(",") : null) : value;
      if (v === null || v === "") next.delete(key);
      else next.set(key, v);
      router.replace(`?${next.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const clearAll = useCallback(() => {
    router.replace("?", { scroll: false });
  }, [router]);

  // ── Derived data ─────────────────────────────────────────
  const categoryMap = useMemo(() => {
    const m = new Map<string, PartCategory>();
    state.categories.forEach((c) => m.set(c.id, c));
    return m;
  }, [state.categories]);

  const vehicleTypes = useMemo(() => {
    const set = new Set<string>();
    state.categories.forEach((c) => {
      if (c.vehicleType) set.add(c.vehicleType);
    });
    return Array.from(set).sort();
  }, [state.categories]);

  // Counts per category and per vehicle type computed from *active* parts only.
  const activeParts = useMemo(
    () => state.parts.filter((p) => p.isActive !== false),
    [state.parts],
  );

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    activeParts.forEach((p) => {
      counts.set(p.categoryId, (counts.get(p.categoryId) || 0) + 1);
    });
    return counts;
  }, [activeParts]);

  const vehicleTypeCounts = useMemo(() => {
    const counts = new Map<string, number>();
    activeParts.forEach((p) => {
      const vt = categoryMap.get(p.categoryId)?.vehicleType;
      if (!vt) return;
      counts.set(vt, (counts.get(vt) || 0) + 1);
    });
    return counts;
  }, [activeParts, categoryMap]);

  const priceBounds = useMemo(() => {
    if (activeParts.length === 0) return { min: 0, max: 0 };
    let min = Infinity;
    let max = -Infinity;
    activeParts.forEach((p) => {
      if (p.unitPrice < min) min = p.unitPrice;
      if (p.unitPrice > max) max = p.unitPrice;
    });
    return { min: Math.floor(min), max: Math.ceil(max) };
  }, [activeParts]);

  // ── Filtering + sorting ──────────────────────────────────
  const filtered = useMemo(() => {
    const qLower = q.trim().toLowerCase();
    const minP = minPrice ? Number(minPrice) : null;
    const maxP = maxPrice ? Number(maxPrice) : null;

    const result = activeParts.filter((p) => {
      if (qLower) {
        const haystack = `${p.name} ${p.sku} ${p.description ?? ""} ${p.categoryName ?? ""}`.toLowerCase();
        if (!haystack.includes(qLower)) return false;
      }
      if (selectedCategoryIds.length > 0 && !selectedCategoryIds.includes(p.categoryId)) {
        return false;
      }
      if (selectedVehicleTypes.length > 0) {
        const vt = categoryMap.get(p.categoryId)?.vehicleType;
        if (!vt || !selectedVehicleTypes.includes(vt)) return false;
      }
      if (minP != null && !Number.isNaN(minP) && p.unitPrice < minP) return false;
      if (maxP != null && !Number.isNaN(maxP) && p.unitPrice > maxP) return false;
      if (inStockOnly && p.stockQuantity <= 0) return false;
      return true;
    });

    const sorted = [...result];
    switch (sort) {
      case "price-asc":
        sorted.sort((a, b) => a.unitPrice - b.unitPrice);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.unitPrice - a.unitPrice);
        break;
      case "name-asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "recent":
      default:
        sorted.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
    }
    return sorted;
  }, [
    activeParts,
    q,
    selectedCategoryIds,
    selectedVehicleTypes,
    minPrice,
    maxPrice,
    inStockOnly,
    sort,
    categoryMap,
  ]);

  const activeFilterCount =
    (q ? 1 : 0) +
    selectedCategoryIds.length +
    selectedVehicleTypes.length +
    (minPrice ? 1 : 0) +
    (maxPrice ? 1 : 0) +
    (inStockOnly ? 1 : 0);

  // ── Render ───────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-6 py-10 md:py-14">
      {/* Header */}
      <div className="flex flex-col gap-3 mb-8">
        <div className="text-xs text-gray-500 flex items-center gap-2">
          <Link href="/" className="hover:text-[#F97316]">
            Home
          </Link>
          <span>/</span>
          <span className="text-gray-300">Shop</span>
        </div>
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
              <ShoppingBag className="w-8 h-8 text-[#F97316]" />
              Shop All Parts
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              {state.loading
                ? "Loading inventory…"
                : `${filtered.length.toLocaleString()} of ${activeParts.length.toLocaleString()} parts shown`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#141414] border border-[#222] text-sm font-medium hover:border-[#F97316]/40 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-[#F97316] text-white font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <SortDropdown
              value={sort}
              onChange={(v) => setParam("sort", v === "recent" ? null : v)}
            />
          </div>
        </div>
      </div>

      {state.error ? (
        <ErrorState message={state.error} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
          {/* Sidebar — desktop */}
          <aside className="hidden lg:block">
            <ProductsSidebar
              q={q}
              onQChange={(v) => setParam("q", v || null)}
              categories={state.categories}
              categoryCounts={categoryCounts}
              selectedCategoryIds={selectedCategoryIds}
              onCategoryToggle={(id) =>
                setParam(
                  "category",
                  selectedCategoryIds.includes(id)
                    ? selectedCategoryIds.filter((x) => x !== id)
                    : [...selectedCategoryIds, id],
                )
              }
              vehicleTypes={vehicleTypes}
              vehicleTypeCounts={vehicleTypeCounts}
              selectedVehicleTypes={selectedVehicleTypes}
              onVehicleTypeToggle={(vt) =>
                setParam(
                  "vehicleType",
                  selectedVehicleTypes.includes(vt)
                    ? selectedVehicleTypes.filter((x) => x !== vt)
                    : [...selectedVehicleTypes, vt],
                )
              }
              priceBounds={priceBounds}
              minPrice={minPrice}
              maxPrice={maxPrice}
              onMinPriceChange={(v) => setParam("minPrice", v || null)}
              onMaxPriceChange={(v) => setParam("maxPrice", v || null)}
              inStockOnly={inStockOnly}
              onInStockToggle={(v) => setParam("inStock", v ? "1" : null)}
              onClearAll={clearAll}
              activeFilterCount={activeFilterCount}
            />
          </aside>

          {/* Grid */}
          <section>
            {state.loading ? (
              <SkeletonGrid />
            ) : filtered.length === 0 ? (
              <EmptyState onClear={clearAll} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map((p) => (
                  <ProductCard
                    key={p.id}
                    part={p}
                    categoryLabel={
                      p.categoryName || categoryMap.get(p.categoryId)?.name || "Part"
                    }
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* Sidebar — mobile drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-[85vw] max-w-sm bg-[#0F0F0F] border-l border-[#222] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[#222]">
              <h3 className="font-bold flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#F97316]" /> Filters
              </h3>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-2 rounded-lg hover:bg-[#1A1A1A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <ProductsSidebar
                q={q}
                onQChange={(v) => setParam("q", v || null)}
                categories={state.categories}
                categoryCounts={categoryCounts}
                selectedCategoryIds={selectedCategoryIds}
                onCategoryToggle={(id) =>
                  setParam(
                    "category",
                    selectedCategoryIds.includes(id)
                      ? selectedCategoryIds.filter((x) => x !== id)
                      : [...selectedCategoryIds, id],
                  )
                }
                vehicleTypes={vehicleTypes}
                vehicleTypeCounts={vehicleTypeCounts}
                selectedVehicleTypes={selectedVehicleTypes}
                onVehicleTypeToggle={(vt) =>
                  setParam(
                    "vehicleType",
                    selectedVehicleTypes.includes(vt)
                      ? selectedVehicleTypes.filter((x) => x !== vt)
                      : [...selectedVehicleTypes, vt],
                  )
                }
                priceBounds={priceBounds}
                minPrice={minPrice}
                maxPrice={maxPrice}
                onMinPriceChange={(v) => setParam("minPrice", v || null)}
                onMaxPriceChange={(v) => setParam("maxPrice", v || null)}
                inStockOnly={inStockOnly}
                onInStockToggle={(v) => setParam("inStock", v ? "1" : null)}
                onClearAll={clearAll}
                activeFilterCount={activeFilterCount}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SortDropdown({
  value,
  onChange,
}: {
  value: SortKey;
  onChange: (v: SortKey) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortKey)}
        className="appearance-none pl-4 pr-9 py-2 rounded-xl bg-[#141414] border border-[#222] text-sm font-medium text-white hover:border-[#F97316]/40 focus:border-[#F97316] focus:outline-none transition-colors cursor-pointer"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.key} value={opt.key} className="bg-[#141414]">
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
      />
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="bg-[#141414] rounded-2xl border border-[#222] overflow-hidden animate-pulse"
        >
          <div className="aspect-square bg-[#1A1A1A]" />
          <div className="p-4 space-y-3">
            <div className="h-3 w-1/3 bg-[#222] rounded" />
            <div className="h-4 w-3/4 bg-[#222] rounded" />
            <div className="h-5 w-1/2 bg-[#222] rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="bg-[#0F0F0F] border border-dashed border-[#222] rounded-2xl p-16 text-center">
      <PackageX className="w-10 h-10 text-gray-500 mx-auto mb-3" />
      <p className="font-semibold text-gray-200">No parts match your filters</p>
      <p className="text-sm text-gray-500 mt-1">Try widening your search or clearing filters.</p>
      <button
        onClick={onClear}
        className="mt-5 px-4 py-2 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-sm font-bold transition-colors"
      >
        Clear filters
      </button>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="bg-[#0F0F0F] border border-red-500/30 rounded-2xl p-10 text-center">
      <p className="font-semibold text-red-400">{message}</p>
      <p className="text-sm text-gray-500 mt-1">Refresh the page or try again later.</p>
    </div>
  );
}

