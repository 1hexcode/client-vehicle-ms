"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Heart, Eye, ShoppingCart, Settings2 } from "lucide-react";
import toast from "react-hot-toast";
import { Part, PartCategory } from "@/types";
import { useCart } from "@/store/CartContext";

const VISIBLE_PRODUCTS = 6;
const MAX_TABS = 7;

export default function ProductGrid() {
  const { addItem } = useCart();
  const [parts, setParts] = useState<Part[] | null>(null);
  const [categories, setCategories] = useState<PartCategory[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string>("all");

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
        const partsJson = await partsRes.json().catch(() => ({}));
        const catsJson = await catsRes.json().catch(() => ({}));

        const allParts: Part[] = Array.isArray(partsJson?.data)
          ? partsJson.data
          : Array.isArray(partsJson)
            ? partsJson
            : [];
        const allCats: PartCategory[] = Array.isArray(catsJson?.data)
          ? catsJson.data
          : Array.isArray(catsJson)
            ? catsJson
            : [];

        if (!cancelled) {
          setParts(allParts.filter((p) => p.isActive !== false));
          setCategories(allCats.filter((c) => c.isActive));
        }
      } catch {
        if (!cancelled) setParts([]);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const tabs = useMemo(() => {
    if (!parts) return [];
    const counts = new Map<string, number>();
    for (const p of parts) counts.set(p.categoryId, (counts.get(p.categoryId) || 0) + 1);
    return categories
      .map((c) => ({ id: c.id, name: c.name, count: counts.get(c.id) || 0 }))
      .filter((c) => c.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, MAX_TABS);
  }, [parts, categories]);

  const visible = useMemo(() => {
    if (!parts) return [];
    const filtered =
      activeCategoryId === "all"
        ? parts
        : parts.filter((p) => p.categoryId === activeCategoryId);
    return [...filtered]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, VISIBLE_PRODUCTS);
  }, [parts, activeCategoryId]);

  const handleAddToCart = (product: Part) => {
    if (product.stockQuantity <= 0) {
      toast.error("This part is currently out of stock");
      return;
    }
    addItem({
      partId: product.id,
      name: product.name,
      sku: product.sku,
      unitPrice: product.unitPrice,
      imageUrl: product.imageUrl,
      stockQuantity: product.stockQuantity,
    });
    toast.success(`${product.name} added to cart`);
  };

  return (
    <section id="products" className="max-w-7xl mx-auto px-6 py-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
        <h2 className="text-2xl font-bold font-outfit">Featured Products</h2>
        {tabs.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategoryId("all")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeCategoryId === "all"
                  ? "bg-[#F97316] text-white"
                  : "bg-[#141414] text-gray-400 border border-[#222] hover:border-[#F97316]/40 hover:text-white"
              }`}
            >
              All
            </button>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategoryId(tab.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  activeCategoryId === tab.id
                    ? "bg-[#F97316] text-white"
                    : "bg-[#141414] text-gray-400 border border-[#222] hover:border-[#F97316]/40 hover:text-white"
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {parts === null ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
          {Array.from({ length: VISIBLE_PRODUCTS }).map((_, i) => (
            <div
              key={i}
              className="bg-[#141414] rounded-2xl border border-[#222] overflow-hidden animate-pulse"
            >
              <div className="aspect-square bg-[#1A1A1A]" />
              <div className="p-4 space-y-2">
                <div className="h-3 w-16 rounded bg-[#1A1A1A]" />
                <div className="h-4 w-3/4 rounded bg-[#1A1A1A]" />
                <div className="h-3 w-1/3 rounded bg-[#1A1A1A]" />
              </div>
            </div>
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="text-center py-12 text-gray-500 text-sm">
          No products available yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
          {visible.map((product) => {
            const inStock = product.stockQuantity > 0;
            const isNew =
              (Date.now() - new Date(product.createdAt).getTime()) /
                (1000 * 60 * 60 * 24) <
              14;
            return (
              <div
                key={product.id}
                className="bg-[#141414] rounded-2xl border border-[#222] overflow-hidden group hover:border-[#333] transition-all"
              >
                <div className="relative aspect-square bg-[#1A1A1A] flex items-center justify-center overflow-hidden">
                  {product.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <Settings2
                      size={48}
                      className="text-[#222] group-hover:text-[#333] transition-colors"
                    />
                  )}
                  {isNew && (
                    <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-[#F97316] text-white">
                      New
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => toast.success("Added to Wishlist")}
                      className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-black hover:bg-[#F97316] hover:text-white transition-colors"
                      aria-label="Add to wishlist"
                    >
                      <Heart size={16} />
                    </button>
                    <Link
                      href={`/products?category=${product.categoryId}`}
                      className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-black hover:bg-[#F97316] hover:text-white transition-colors"
                      aria-label="View details"
                    >
                      <Eye size={16} />
                    </Link>
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={!inStock}
                      className="w-9 h-9 bg-[#F97316] rounded-full flex items-center justify-center text-white hover:bg-[#EA580C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Add to cart"
                    >
                      <ShoppingCart size={16} />
                    </button>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#F97316] truncate">
                    {product.categoryName || "Part"}
                  </p>
                  <h4 className="text-sm font-bold truncate" title={product.name}>
                    {product.name}
                  </h4>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-base font-bold text-white">
                      Rs.{product.unitPrice.toLocaleString()}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-semibold ${
                      inStock ? "text-green-500" : "text-red-400"
                    }`}
                  >
                    {inStock ? `● In Stock (${product.stockQuantity})` : "● Out of Stock"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
