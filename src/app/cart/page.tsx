"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  Settings2,
  Lock,
  Loader2,
  PackageX,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { useCart } from "@/store/CartContext";
import { useAuth } from "@/store/AuthContext";
import { api } from "@/lib/api";
import { ApiResponse } from "@/types";

export default function CartPage() {
  const router = useRouter();
  const { items, subtotal, itemCount, updateQuantity, removeItem, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      toast("Please sign in to complete your purchase", { icon: "🔒" });
      if (typeof window !== "undefined") {
        sessionStorage.setItem("postLoginRedirect", "/cart");
      }
      router.push("/auth/login");
      return;
    }

    if (user.role !== "Customer") {
      toast.error("Only customers can place orders from the storefront");
      return;
    }

    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    const payload = {
      customerId: user.id,
      vehicleId: null,
      taxRate: 0,
      discountRate: 0,
      serviceCharge: 0,
      lines: items.map((item) => ({
        partId: item.partId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    };

    try {
      setSubmitting(true);
      const res: ApiResponse<any> = await api.post("/api/sales-invoices", payload);
      if (res.success) {
        toast.success("Order placed successfully!");
        clearCart();
        router.push("/customer/dashboard");
      } else {
        toast.error(res.message || "Checkout failed");
      }
    } catch (err: any) {
      toast.error(err?.message || "Something went wrong during checkout");
    } finally {
      setSubmitting(false);
    }
  };

  const isEmpty = items.length === 0;

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white">
      <div className="max-w-7xl mx-auto px-6 py-10 md:py-14">
        {/* Breadcrumb */}
        <div className="text-xs text-gray-500 flex items-center gap-2 mb-4">
          <Link href="/" className="hover:text-[#F97316]">
            Home
          </Link>
          <span>/</span>
          <span className="text-gray-300">Cart</span>
        </div>

        {/* Header */}
        <div className="flex items-end justify-between gap-4 flex-wrap mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
              <ShoppingCart className="w-8 h-8 text-[#F97316]" />
              Your Cart
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              {isEmpty
                ? "Your cart is empty"
                : `${itemCount} ${itemCount === 1 ? "item" : "items"} in your cart`}
            </p>
          </div>
          {!isEmpty && (
            <button
              onClick={() => {
                clearCart();
                toast.success("Cart cleared");
              }}
              className="text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-red-400 transition-colors"
            >
              Clear cart
            </button>
          )}
        </div>

        {isEmpty ? (
          <EmptyCart />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
            {/* Items list */}
            <section className="space-y-3">
              {items.map((item) => {
                const lineTotal = item.unitPrice * item.quantity;
                return (
                  <article
                    key={item.partId}
                    className="bg-[#141414] border border-[#222] rounded-2xl p-4 flex gap-4 items-center hover:border-[#F97316]/30 transition-colors"
                  >
                    {/* Image */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-[#1A1A1A] flex items-center justify-center shrink-0 overflow-hidden">
                      {item.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Settings2 size={32} className="text-[#333]" strokeWidth={1.2} />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm sm:text-base line-clamp-2">
                        {item.name}
                      </h3>
                      {item.sku && (
                        <p className="text-[11px] text-gray-500 font-mono mt-0.5 truncate">
                          SKU: {item.sku}
                        </p>
                      )}
                      <p className="text-sm text-[#F97316] font-bold mt-1.5">
                        Rs. {item.unitPrice.toLocaleString()}
                      </p>
                    </div>

                    {/* Quantity stepper */}
                    <div className="flex items-center gap-1 bg-[#1A1A1A] border border-[#222] rounded-lg p-1">
                      <button
                        onClick={() => updateQuantity(item.partId, item.quantity - 1)}
                        className="w-7 h-7 rounded-md hover:bg-[#222] flex items-center justify-center text-gray-300 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-sm font-bold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.partId, item.quantity + 1)}
                        disabled={item.quantity >= item.stockQuantity}
                        className="w-7 h-7 rounded-md hover:bg-[#222] flex items-center justify-center text-gray-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* Line total + remove */}
                    <div className="hidden sm:flex flex-col items-end gap-2 w-28">
                      <p className="text-base font-bold whitespace-nowrap">
                        Rs. {lineTotal.toLocaleString()}
                      </p>
                      <button
                        onClick={() => {
                          removeItem(item.partId);
                          toast.success("Item removed");
                        }}
                        className="text-xs text-gray-500 hover:text-red-400 inline-flex items-center gap-1 transition-colors"
                      >
                        <Trash2 size={12} /> Remove
                      </button>
                    </div>

                    {/* Remove (mobile) */}
                    <button
                      onClick={() => {
                        removeItem(item.partId);
                        toast.success("Item removed");
                      }}
                      className="sm:hidden w-8 h-8 rounded-md hover:bg-[#1A1A1A] flex items-center justify-center text-gray-500 hover:text-red-400 transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </article>
                );
              })}
            </section>

            {/* Summary */}
            <aside className="lg:sticky lg:top-28 self-start space-y-4">
              <div className="bg-[#141414] border border-[#222] rounded-2xl p-6 space-y-4">
                <h2 className="font-bold text-lg">Order Summary</h2>

                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal ({itemCount} items)</span>
                    <span className="text-white">Rs. {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Delivery</span>
                    <span className="text-green-400 font-semibold">
                      {subtotal >= 5000 ? "Free" : "Calculated at next step"}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Tax</span>
                    <span>Calculated at checkout</span>
                  </div>
                </div>

                <div className="border-t border-[#222] pt-4 flex items-baseline justify-between">
                  <span className="text-sm font-semibold text-gray-300">Total</span>
                  <span className="text-2xl font-extrabold text-[#F97316]">
                    Rs. {subtotal.toLocaleString()}
                  </span>
                </div>

                {!authLoading && !user && (
                  <div className="bg-[#1A1A1A] border border-[#F97316]/30 rounded-xl p-3 flex items-start gap-2.5">
                    <Lock size={14} className="text-[#F97316] mt-0.5 shrink-0" />
                    <p className="text-xs text-gray-300 leading-relaxed">
                      <span className="font-semibold text-white">Sign in required</span> to
                      place your order. Your cart will be waiting after you log in.
                    </p>
                  </div>
                )}

                <button
                  onClick={handleCheckout}
                  disabled={submitting || authLoading}
                  className="w-full flex items-center justify-center gap-2 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Processing…
                    </>
                  ) : user ? (
                    <>
                      Checkout <ArrowRight size={16} />
                    </>
                  ) : (
                    <>
                      <Lock size={14} /> Sign in to checkout
                    </>
                  )}
                </button>

                <Link
                  href="/products"
                  className="block text-center text-xs font-semibold uppercase tracking-wider text-gray-400 hover:text-white transition-colors"
                >
                  ← Continue shopping
                </Link>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}

function EmptyCart() {
  return (
    <div className="bg-[#0F0F0F] border border-dashed border-[#222] rounded-2xl p-16 text-center">
      <PackageX className="w-12 h-12 text-gray-500 mx-auto mb-4" />
      <p className="font-semibold text-gray-200 text-lg">Your cart is empty</p>
      <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
        Browse our catalogue and add some parts to get started.
      </p>
      <Link
        href="/products"
        className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-sm font-bold transition-colors"
      >
        Shop all parts <ArrowRight size={14} />
      </Link>
    </div>
  );
}
