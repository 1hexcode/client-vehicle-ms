"use client";

import { Star, Heart, Eye, ShoppingCart, Settings2 } from "lucide-react";
import toast from "react-hot-toast";

const PRODUCTS = [
  { name: "Round Car Filter", category: "FUEL", price: 15.99, oldPrice: 19.99, rating: 4, inStock: true, badge: "Sale" },
  { name: "Swedish Diesel Scania", category: "ENGINE", price: 99.99, oldPrice: null, rating: 5, inStock: true, badge: null },
  { name: "Sport Racing Wheel", category: "INTERIOR", price: 129.99, oldPrice: null, rating: 4, inStock: true, badge: null },
  { name: "Evo Brake Discs", category: "BRAKE", price: 34.99, oldPrice: null, rating: 5, inStock: true, badge: "Hot" },
  { name: "Car Spark Plugs", category: "ENGINE", price: 12.99, oldPrice: null, rating: 3, inStock: false, badge: null },
  { name: "Oil Filter Motor", category: "FUEL", price: 8.99, oldPrice: 12.99, rating: 4, inStock: true, badge: "Sale" },
];

const FILTER_TABS = ["Brake", "Wheel", "Fuel", "Lights", "Filter", "Key", "Battery"];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={12} className={i < count ? "text-[#F97316] fill-[#F97316]" : "text-[#333]"} />
      ))}
    </div>
  );
}

export default function ProductGrid() {
  const handleAddToCart = (name: string) => {
    toast.success(`${name} added to cart!`);
  };

  return (
    <section id="products" className="max-w-7xl mx-auto px-6 py-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
        <h2 className="text-2xl font-bold font-outfit">Highest Sold Products</h2>
        <div className="flex flex-wrap gap-2">
          {FILTER_TABS.map((tab, i) => (
            <button
              key={tab}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                i === 0
                  ? "bg-[#F97316] text-white"
                  : "bg-[#141414] text-gray-400 border border-[#222] hover:border-[#F97316]/40 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
        {PRODUCTS.map((product, i) => (
          <div key={i} className="bg-[#141414] rounded-2xl border border-[#222] overflow-hidden group hover:border-[#333] transition-all">
            {/* Product image placeholder */}
            <div className="relative aspect-square bg-[#1A1A1A] flex items-center justify-center overflow-hidden">
              <Settings2 size={48} className="text-[#222] group-hover:text-[#333] transition-colors" />
              {product.badge && (
                <span className={`absolute top-3 left-3 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                  product.badge === "Sale" ? "bg-[#F97316] text-white" : "bg-red-500 text-white"
                }`}>
                  {product.badge}
                </span>
              )}
              {/* Hover actions */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button 
                  onClick={() => toast.success("Added to Wishlist")}
                  className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-black hover:bg-[#F97316] hover:text-white transition-colors"
                >
                  <Heart size={16} />
                </button>
                <button className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-black hover:bg-[#F97316] hover:text-white transition-colors">
                  <Eye size={16} />
                </button>
                <button 
                  onClick={() => handleAddToCart(product.name)}
                  className="w-9 h-9 bg-[#F97316] rounded-full flex items-center justify-center text-white hover:bg-[#EA580C] transition-colors"
                >
                  <ShoppingCart size={16} />
                </button>
              </div>
            </div>
            {/* Info */}
            <div className="p-4 space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#F97316]">{product.category}</p>
              <h4 className="text-sm font-bold truncate">{product.name}</h4>
              <StarRating count={product.rating} />
              <div className="flex items-center gap-2 pt-1">
                {product.oldPrice && (
                  <span className="text-xs text-gray-500 line-through">Rs.{product.oldPrice}</span>
                )}
                <span className="text-base font-bold text-white">Rs.{product.price}</span>
              </div>
              <span className={`text-[10px] font-semibold ${product.inStock ? "text-green-500" : "text-red-400"}`}>
                {product.inStock ? "● In Stock" : "● Out of Stock"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
