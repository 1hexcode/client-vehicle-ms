"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { Part, ApiResponse } from "@/types";
import {
  Package,
  AlertTriangle,
  Search,
  RefreshCw,
  Tag,
  TrendingDown,
  BarChart3,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";
import { StatsCard } from "@/components/ui/StatsCard";
import DataTable from "@/components/ui/DataTable";

export default function StaffInventoryPage() {
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "low-stock" | "active">("all");

  const fetchParts = useCallback(async () => {
    try {
      setLoading(true);
      const res: ApiResponse<Part[]> = await api.get("/api/parts");
      if (res.success) setParts(res.data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchParts(); }, [fetchParts]);

  const filteredParts = parts.filter((part) => {
    const matchesSearch =
      part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      part.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (part.categoryName || "").toLowerCase().includes(searchQuery.toLowerCase());
    if (filter === "low-stock") return matchesSearch && part.stockQuantity <= part.reorderLevel;
    if (filter === "active") return matchesSearch && part.isActive;
    return matchesSearch;
  });

  const stats = {
    total: parts.length,
    active: parts.filter((p) => p.isActive).length,
    lowStock: parts.filter((p) => p.stockQuantity <= p.reorderLevel).length,
    totalValue: parts.reduce((acc, p) => acc + p.unitPrice * p.stockQuantity, 0),
  };

  const columns = [
    {
      key: "partDetails",
      header: "Part",
      render: (part: Part) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/30 flex items-center justify-center">
            <Package className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <p className="font-semibold text-zinc-900 dark:text-white">{part.name}</p>
            <p className="text-xs text-zinc-500 font-mono">{part.sku}</p>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (part: Part) => (
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 flex items-center gap-1 w-fit">
          <Tag className="w-3 h-3" />
          {part.categoryName || "Uncategorized"}
        </span>
      ),
    },
    {
      key: "stock",
      header: "Stock",
      render: (part: Part) => {
        const isLow = part.stockQuantity <= part.reorderLevel;
        return (
          <div className="flex items-center gap-2">
            <div className={`text-center rounded-xl px-3 py-1.5 min-w-[60px] ${
              isLow
                ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30"
                : "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30"
            }`}>
              <span className={`text-lg font-bold ${isLow ? "text-red-600" : "text-green-600"}`}>
                {part.stockQuantity}
              </span>
            </div>
            {isLow && (
              <div className="group relative">
                <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-red-600 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 shadow-lg">
                  Low! Reorder at {part.reorderLevel}
                </div>
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "pricing",
      header: "Sell Price",
      render: (part: Part) => (
        <div className="text-sm">
          <p className="font-semibold text-zinc-900 dark:text-white">
            Rs. {part.unitPrice.toLocaleString()}
          </p>
          <p className="text-xs text-zinc-400">
            Cost: Rs. {part.costPrice.toLocaleString()}
          </p>
        </div>
      ),
    },
    {
      key: "value",
      header: "Stock Value",
      render: (part: Part) => (
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Rs. {(part.unitPrice * part.stockQuantity).toLocaleString()}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (part: Part) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
          part.isActive
            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
        }`}>
          {part.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
            <Package className="w-8 h-8 text-orange-600" />
            Inventory
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            View current stock levels and part availability
          </p>
        </div>
        <button
          onClick={fetchParts}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all text-sm font-medium"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Total Parts"
          value={stats.total}
          icon={Package}
          variant="default"
        />
        <StatsCard
          label="Active Parts"
          value={stats.active}
          icon={CheckCircle2}
          variant="success"
        />
        <StatsCard
          label="Low Stock"
          value={stats.lowStock}
          icon={AlertTriangle}
          variant="danger"
          description={stats.lowStock > 0 ? "Reorder required" : "All stocked well"}
        />
        <StatsCard
          label="Inventory Value"
          value={`Rs. ${stats.totalValue.toLocaleString()}`}
          icon={BarChart3}
          variant="info"
        />
      </div>

      {/* Low Stock Banner */}
      {stats.lowStock > 0 && (
        <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          <p className="text-sm font-medium text-red-700 dark:text-red-400">
            <span className="font-bold">{stats.lowStock} part{stats.lowStock !== 1 ? "s are" : " is"} running low</span>
            {" "}on stock. Please notify the admin to reorder.
          </p>
        </div>
      )}

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredParts}
        loading={loading}
        keyExtractor={(p) => p.id}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by name, SKU, or category..."
        onRefresh={fetchParts}
        emptyIcon={Package}
        emptyMessage="No parts found matching your criteria."
        headerActions={
          <div className="flex items-center gap-2">
            {(["all", "low-stock", "active"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${
                  filter === f
                    ? f === "low-stock"
                      ? "bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                      : "bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400"
                    : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                {f === "low-stock" ? (
                  <span className="flex items-center gap-1">
                    <TrendingDown className="w-3 h-3" /> Low Stock
                    {stats.lowStock > 0 && (
                      <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full ml-0.5">
                        {stats.lowStock}
                      </span>
                    )}
                  </span>
                ) : f}
              </button>
            ))}
          </div>
        }
      />
    </div>
  );
}
