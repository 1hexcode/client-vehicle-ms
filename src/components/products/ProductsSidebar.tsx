"use client";

import { useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { PartCategory } from "@/types";

export type SortKey = "recent" | "price-asc" | "price-desc" | "name-asc";

interface ProductsSidebarProps {
  q: string;
  onQChange: (v: string) => void;

  categories: PartCategory[];
  categoryCounts: Map<string, number>;
  selectedCategoryIds: string[];
  onCategoryToggle: (id: string) => void;

  vehicleTypes: string[];
  vehicleTypeCounts: Map<string, number>;
  selectedVehicleTypes: string[];
  onVehicleTypeToggle: (vt: string) => void;

  priceBounds: { min: number; max: number };
  minPrice: string | null;
  maxPrice: string | null;
  onMinPriceChange: (v: string) => void;
  onMaxPriceChange: (v: string) => void;

  inStockOnly: boolean;
  onInStockToggle: (v: boolean) => void;

  onClearAll: () => void;
  activeFilterCount: number;
}

export default function ProductsSidebar({
  q,
  onQChange,
  categories,
  categoryCounts,
  selectedCategoryIds,
  onCategoryToggle,
  vehicleTypes,
  vehicleTypeCounts,
  selectedVehicleTypes,
  onVehicleTypeToggle,
  priceBounds,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  inStockOnly,
  onInStockToggle,
  onClearAll,
  activeFilterCount,
}: ProductsSidebarProps) {
  return (
    <div className="space-y-3 lg:sticky lg:top-24">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300">Filters</h3>
        {activeFilterCount > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs text-[#F97316] hover:text-[#FB923C] inline-flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Clear all
          </button>
        )}
      </div>

      {/* Search */}
      <Section title="Search" defaultOpen>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={q}
            onChange={(e) => onQChange(e.target.value)}
            placeholder="Search by name, SKU…"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#141414] border border-[#222] text-sm text-white placeholder-gray-500 focus:border-[#F97316]/50 focus:outline-none transition-colors"
          />
        </div>
      </Section>

      {/* Categories */}
      <Section
        title={`Categories${selectedCategoryIds.length ? ` · ${selectedCategoryIds.length}` : ""}`}
        defaultOpen
      >
        {categories.length === 0 ? (
          <p className="text-xs text-gray-500">No categories available.</p>
        ) : (
          <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1 -mr-1">
            {categories
              .filter((c) => c.isActive !== false)
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((cat) => {
                const checked = selectedCategoryIds.includes(cat.id);
                const count = categoryCounts.get(cat.id) || 0;
                return (
                  <label
                    key={cat.id}
                    className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
                      checked ? "bg-[#F97316]/10 text-white" : "hover:bg-[#1A1A1A] text-gray-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onCategoryToggle(cat.id)}
                      className="w-4 h-4 rounded border-[#333] bg-[#0F0F0F] text-[#F97316] focus:ring-[#F97316]/30 focus:ring-offset-0"
                    />
                    <span className="text-sm flex-1 truncate">{cat.name}</span>
                    <span className="text-[11px] text-gray-500 tabular-nums">{count}</span>
                  </label>
                );
              })}
          </div>
        )}
      </Section>

      {/* Vehicle types */}
      <Section
        title={`Vehicle Type${selectedVehicleTypes.length ? ` · ${selectedVehicleTypes.length}` : ""}`}
        defaultOpen
      >
        {vehicleTypes.length === 0 ? (
          <p className="text-xs text-gray-500">No vehicle types available.</p>
        ) : (
          <div className="space-y-1.5">
            {vehicleTypes.map((vt) => {
              const checked = selectedVehicleTypes.includes(vt);
              const count = vehicleTypeCounts.get(vt) || 0;
              return (
                <label
                  key={vt}
                  className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
                    checked ? "bg-[#F97316]/10 text-white" : "hover:bg-[#1A1A1A] text-gray-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onVehicleTypeToggle(vt)}
                    className="w-4 h-4 rounded border-[#333] bg-[#0F0F0F] text-[#F97316] focus:ring-[#F97316]/30 focus:ring-offset-0"
                  />
                  <span className="text-sm flex-1">{vt}</span>
                  <span className="text-[11px] text-gray-500 tabular-nums">{count}</span>
                </label>
              );
            })}
          </div>
        )}
      </Section>

      {/* Price */}
      <Section title="Price (Rs.)" defaultOpen>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            min={0}
            value={minPrice ?? ""}
            onChange={(e) => onMinPriceChange(e.target.value)}
            placeholder={priceBounds.min.toString()}
            className="px-3 py-2 rounded-xl bg-[#141414] border border-[#222] text-sm text-white placeholder-gray-600 focus:border-[#F97316]/50 focus:outline-none"
          />
          <input
            type="number"
            min={0}
            value={maxPrice ?? ""}
            onChange={(e) => onMaxPriceChange(e.target.value)}
            placeholder={priceBounds.max.toString()}
            className="px-3 py-2 rounded-xl bg-[#141414] border border-[#222] text-sm text-white placeholder-gray-600 focus:border-[#F97316]/50 focus:outline-none"
          />
        </div>
        {priceBounds.max > 0 && (
          <p className="text-[11px] text-gray-500 mt-1.5">
            Catalogue range: Rs. {priceBounds.min.toLocaleString()} – Rs. {priceBounds.max.toLocaleString()}
          </p>
        )}
      </Section>

      {/* Stock */}
      <Section title="Availability" defaultOpen>
        <label className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-[#1A1A1A] transition-colors">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => onInStockToggle(e.target.checked)}
            className="w-4 h-4 rounded border-[#333] bg-[#0F0F0F] text-[#F97316] focus:ring-[#F97316]/30 focus:ring-offset-0"
          />
          <span className="text-sm text-gray-300">In stock only</span>
        </label>
      </Section>
    </div>
  );
}

function Section({
  title,
  defaultOpen,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="bg-[#0F0F0F] border border-[#222] rounded-2xl">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-200 hover:text-white"
      >
        <span>{title}</span>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="px-4 pb-4 pt-1">{children}</div>}
    </div>
  );
}
