"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export interface CartItem {
  partId: string;
  name: string;
  sku: string;
  unitPrice: number;
  imageUrl?: string | null;
  stockQuantity: number;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (partId: string) => void;
  updateQuantity: (partId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "vms_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {
      // ignore corrupt cart
    }
    setHydrated(true);
  }, []);

  // Persist on change (only after hydration so we don't wipe storage on mount)
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore quota errors
    }
  }, [items, hydrated]);

  const addItem: CartContextType["addItem"] = (item, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((p) => p.partId === item.partId);
      if (existing) {
        const nextQty = Math.min(existing.quantity + quantity, item.stockQuantity);
        return prev.map((p) =>
          p.partId === item.partId ? { ...p, ...item, quantity: nextQty } : p,
        );
      }
      const nextQty = Math.min(Math.max(quantity, 1), item.stockQuantity);
      return [...prev, { ...item, quantity: nextQty }];
    });
  };

  const removeItem: CartContextType["removeItem"] = (partId) => {
    setItems((prev) => prev.filter((p) => p.partId !== partId));
  };

  const updateQuantity: CartContextType["updateQuantity"] = (partId, quantity) => {
    setItems((prev) => {
      if (quantity <= 0) return prev.filter((p) => p.partId !== partId);
      return prev.map((p) =>
        p.partId === partId
          ? { ...p, quantity: Math.min(quantity, p.stockQuantity) }
          : p,
      );
    });
  };

  const clearCart = () => setItems([]);

  const itemCount = useMemo(
    () => items.reduce((sum, p) => sum + p.quantity, 0),
    [items],
  );
  const subtotal = useMemo(
    () => items.reduce((sum, p) => sum + p.quantity * p.unitPrice, 0),
    [items],
  );

  return (
    <CartContext.Provider
      value={{ items, itemCount, subtotal, addItem, removeItem, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
