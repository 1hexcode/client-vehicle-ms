"use client";

import React, { useState, useEffect, useMemo } from "react";
import { api } from "@/lib/api";
import { Part, User, Vehicle, ApiResponse } from "@/types";
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  User as UserIcon,
  Car,
  PackageSearch,
  Receipt,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

interface CartItem extends Part {
  cartQuantity: number;
}

export default function StaffPOSPage() {
  const [parts, setParts] = useState<Part[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
  const [tax, setTax] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [partsRes, customersRes, vehiclesRes] = await Promise.all([
          api.get("/api/Parts"),
          api.get("/api/Customers"),
          api.get("/api/Vehicles")
        ]) as [ApiResponse<Part[]>, ApiResponse<User[]>, ApiResponse<Vehicle[]>];

        if (partsRes.success) setParts((partsRes.data || []).filter(p => p.isActive && p.stockQuantity > 0));
        if (customersRes.success) setCustomers((customersRes.data || []).filter(c => c.isActive));
        if (vehiclesRes.success) setVehicles(vehiclesRes.data || []);
      } catch (error) {
        toast.error("Failed to load POS data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredParts = useMemo(() => {
    if (!searchQuery) return parts;
    const lowerQuery = searchQuery.toLowerCase();
    return parts.filter(
      p => p.name.toLowerCase().includes(lowerQuery) || p.sku.toLowerCase().includes(lowerQuery)
    );
  }, [parts, searchQuery]);

  const customerVehicles = useMemo(() => {
    if (!selectedCustomerId) return [];
    return vehicles.filter(v => v.customerId === selectedCustomerId);
  }, [vehicles, selectedCustomerId]);

  const addToCart = (part: Part) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === part.id);
      if (existing) {
        if (existing.cartQuantity >= part.stockQuantity) {
          toast.error(`Only ${part.stockQuantity} in stock`);
          return prev;
        }
        return prev.map(item =>
          item.id === part.id
            ? { ...item, cartQuantity: item.cartQuantity + 1 }
            : item
        );
      }
      return [...prev, { ...part, cartQuantity: 1 }];
    });
  };

  const updateQuantity = (partId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === partId) {
          const newQ = item.cartQuantity + delta;
          if (newQ > item.stockQuantity) {
            toast.error(`Only ${item.stockQuantity} in stock`);
            return item;
          }
          if (newQ < 1) return item;
          return { ...item, cartQuantity: newQ };
        }
        return item;
      });
    });
  };

  const removeFromCart = (partId: string) => {
    setCart(prev => prev.filter(item => item.id !== partId));
  };

  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.unitPrice * item.cartQuantity, 0);
  }, [cart]);

  const total = subtotal + tax;

  const handleCheckout = async () => {
    if (!selectedCustomerId) {
      toast.error("Please select a customer");
      return;
    }
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    const payload = {
      customerId: selectedCustomerId,
      vehicleId: selectedVehicleId || null,
      tax: tax,
      lines: cart.map(item => ({
        partId: item.id,
        quantity: item.cartQuantity,
        unitPrice: item.unitPrice
      }))
    };

    try {
      setSubmitting(true);
      const res: ApiResponse<any> = await api.post("/api/sales-invoices", payload);
      if (res.success) {
        toast.success("Invoice created successfully");
        setCart([]);
        setSelectedCustomerId("");
        setSelectedVehicleId("");
        setTax(0);
        // Refresh parts to get updated stock
        const partsRes: ApiResponse<Part[]> = await api.get("/api/Parts");
        if (partsRes.success) setParts((partsRes.data || []).filter(p => p.isActive && p.stockQuantity > 0));
      } else {
        toast.error(res.message || "Checkout failed");
      }
    } catch (error: any) {
      toast.error(error?.message || "An error occurred during checkout");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-100px)] flex gap-6 p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Left Panel - Part Selection */}
      <div className="flex-1 flex flex-col bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search parts by name or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {filteredParts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500">
              <PackageSearch className="w-12 h-12 mb-2 opacity-50" />
              <p>No parts found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredParts.map(part => (
                <div 
                  key={part.id}
                  onClick={() => addToCart(part)}
                  className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl cursor-pointer hover:border-orange-500/50 hover:shadow-md transition-all group relative overflow-hidden flex flex-col h-full"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-zinc-900 dark:text-white line-clamp-2 mb-1 group-hover:text-orange-500 transition-colors">{part.name}</p>
                    <p className="text-xs text-zinc-500 font-mono mb-3">{part.sku}</p>
                  </div>
                  <div className="flex items-end justify-between mt-auto">
                    <div>
                      <p className="text-xs text-zinc-500 mb-0.5">Price</p>
                      <p className="font-bold text-zinc-900 dark:text-white">Rs. {part.unitPrice.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-zinc-500 mb-0.5">Stock</p>
                      <p className={`font-semibold text-sm ${part.stockQuantity <= part.reorderLevel ? 'text-red-500' : 'text-green-500'}`}>
                        {part.stockQuantity}
                      </p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Cart & Checkout */}
      <div className="w-[400px] xl:w-[450px] flex flex-col bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm shrink-0">
        
        {/* Customer & Vehicle Selection */}
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 space-y-4">
          <div className="flex items-center gap-2 text-zinc-900 dark:text-white font-bold text-lg mb-2">
            <ShoppingCart className="w-5 h-5 text-orange-500" />
            Current Sale
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-zinc-500 flex items-center gap-1.5 mb-1.5">
                <UserIcon className="w-3.5 h-3.5" /> Customer *
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => {
                  setSelectedCustomerId(e.target.value);
                  setSelectedVehicleId(""); // reset vehicle when customer changes
                }}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
              >
                <option value="">Select Customer</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.fullName} ({c.phoneNumber})</option>
                ))}
              </select>
            </div>

            {selectedCustomerId && customerVehicles.length > 0 && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-xs font-semibold text-zinc-500 flex items-center gap-1.5 mb-1.5">
                  <Car className="w-3.5 h-3.5" /> Vehicle (Optional)
                </label>
                <select
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500"
                >
                  <option value="">No Vehicle Selected</option>
                  {customerVehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.make} {v.model} - {v.vehicleNumber}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-5">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-400">
              <Receipt className="w-10 h-10 mb-3 opacity-20" />
              <p className="text-sm">Cart is empty</p>
              <p className="text-xs mt-1">Select parts from the left to begin</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex gap-3 group">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">{item.name}</p>
                    <p className="text-xs text-zinc-500 mb-2">Rs. {item.unitPrice.toLocaleString()}</p>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
                        <button 
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-7 h-7 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-orange-500 disabled:opacity-50"
                          disabled={item.cartQuantity <= 1}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium text-zinc-900 dark:text-white">
                          {item.cartQuantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-7 h-7 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-orange-500 disabled:opacity-50"
                          disabled={item.cartQuantity >= item.stockQuantity}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-zinc-400 hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-zinc-900 dark:text-white">
                      Rs. {(item.unitPrice * item.cartQuantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totals & Checkout */}
        <div className="p-5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 mt-auto">
          <div className="space-y-3 mb-5">
            <div className="flex justify-between text-sm text-zinc-600 dark:text-zinc-400">
              <span>Subtotal</span>
              <span className="font-medium text-zinc-900 dark:text-white">Rs. {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-zinc-600 dark:text-zinc-400">
              <span>Tax Amount</span>
              <div className="flex items-center gap-1">
                <span className="text-zinc-500">Rs.</span>
                <input 
                  type="number" 
                  min="0"
                  value={tax}
                  onChange={(e) => setTax(Number(e.target.value) || 0)}
                  className="w-20 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded px-2 py-1 text-right focus:outline-none focus:border-orange-500 text-zinc-900 dark:text-white"
                />
              </div>
            </div>
            
            <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
              <span className="font-semibold text-zinc-900 dark:text-white text-lg">Total</span>
              <span className="font-bold text-orange-600 text-xl">Rs. {total.toLocaleString()}</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={submitting || cart.length === 0 || !selectedCustomerId}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-orange-600 hover:bg-orange-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-800 text-white disabled:text-zinc-500 rounded-xl font-bold transition-all active:scale-[0.98]"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Complete Sale
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
}
