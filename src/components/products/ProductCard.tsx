"use client";

import { Heart, Settings2, ShoppingBag, Package } from "lucide-react";
import toast from "react-hot-toast";
import { Part } from "@/types";

interface ProductCardProps {
  part: Part;
  categoryLabel: string;
}

export default function ProductCard({ part, categoryLabel }: ProductCardProps) {
  const inStock = part.stockQuantity > 0;
  const lowStock = inStock && part.stockQuantity <= part.reorderLevel;

  return (
    <article className="bg-[#141414] rounded-2xl border border-[#222] overflow-hidden group hover:border-[#F97316]/40 transition-all duration-300 flex flex-col">
      {/* Image / placeholder */}
      <div className="relative aspect-square bg-[#1A1A1A] flex items-center justify-center overflow-hidden">
        <Settings2
          size={56}
          className="text-[#2A2A2A] group-hover:text-[#3A3A3A] group-hover:scale-110 transition-all duration-500"
          strokeWidth={1.2}
        />

        {/* Stock badge */}
        {!inStock ? (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-red-500/90 text-white">
            Out of Stock
          </span>
        ) : lowStock ? (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-amber-500/90 text-white">
            Low Stock
          </span>
        ) : null}

        {/* Hover quick actions */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={() => toast.success(`${part.name} saved to wishlist`)}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black hover:bg-[#F97316] hover:text-white transition-colors"
            aria-label="Save to wishlist"
          >
            <Heart size={16} />
          </button>
          <button
            onClick={() =>
              toast(`${part.name} — Rs. ${part.unitPrice.toLocaleString()}\nSKU: ${part.sku}`, {
                icon: "🔧",
              })
            }
            className="w-10 h-10 bg-[#F97316] rounded-full flex items-center justify-center text-white hover:bg-[#EA580C] transition-colors"
            aria-label="View details"
          >
            <Package size={16} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#F97316] truncate">
          {categoryLabel}
        </p>
        <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug min-h-[2.5rem]">
          {part.name}
        </h3>
        <p className="text-[11px] text-gray-500 font-mono truncate">SKU: {part.sku}</p>

        <div className="mt-auto pt-2 flex items-end justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-gray-500">Price</p>
            <p className="text-lg font-extrabold text-white">
              Rs. {part.unitPrice.toLocaleString()}
            </p>
          </div>
          <button
            onClick={() =>
              inStock
                ? toast.success(`${part.name} added to cart`)
                : toast.error("This part is currently out of stock")
            }
            disabled={!inStock}
            className="w-10 h-10 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white flex items-center justify-center transition-colors disabled:bg-[#1A1A1A] disabled:text-gray-600 disabled:cursor-not-allowed"
            aria-label="Add to cart"
          >
            <ShoppingBag size={16} />
          </button>
        </div>

        <p
          className={`text-[10px] font-semibold ${
            inStock ? "text-green-400" : "text-red-400"
          }`}
        >
          {inStock
            ? `● ${part.stockQuantity.toLocaleString()} in stock`
            : "● Out of stock"}
        </p>
      </div>
    </article>
  );
}
