"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Part, ApiResponse } from "@/types";
import { 
  Plus, 
  Search, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight, 
  MoreVertical,
  Edit,
  Trash2,
  Filter,
  Package,
  History,
  Loader2
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { DashboardCard } from "@/components/ui/DashboardCard";

export default function InventoryPage() {
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "low-stock">("all");

  const fetchParts = async () => {
    try {
      setLoading(true);
      const response: ApiResponse<Part[]> = await api.get("/api/Parts");
      if (response.success && response.data) {
        setParts(response.data);
      }
    } catch (error) {
      toast.error("Failed to fetch inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParts();
  }, []);

  const filteredParts = parts.filter((part) => {
    const matchesSearch = 
      part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      part.sku.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter === "low-stock") {
      return matchesSearch && part.stockQuantity <= part.reorderLevel;
    }
    return matchesSearch;
  });

  const stats = {
    totalItems: parts.length,
    lowStock: parts.filter(p => p.stockQuantity <= p.reorderLevel).length,
    totalValue: parts.reduce((acc, p) => acc + (p.unitPrice * p.stockQuantity), 0),
    totalCategories: new Set(parts.map(p => p.categoryId)).size,
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to disable this part? It will no longer be available for sales.")) return;
    try {
      const response: ApiResponse<string> = await api.delete(`/api/Parts/${id}`);
      if (response.success) {
        toast.success("Part disabled");
        fetchParts();
      }
    } catch (error) {
      toast.error("Failed to disable part");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white font-outfit">Inventory Management</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Track and manage your vehicle parts stock.</p>
        </div>
        <Link 
          href="/admin/inventory/add"
          className="flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-semibold shadow-lg shadow-orange-500/30 transition-all w-fit"
        >
          <Plus className="w-5 h-5" />
          Add New Part
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard 
          label="Total Parts" 
          value={stats.totalItems} 
          icon={Package}
          color="#F97316"
        />
        <DashboardCard 
          label="Low Stock" 
          value={stats.lowStock} 
          icon={AlertTriangle}
          color="#EF4444"
          trend={stats.lowStock > 0 ? "Attention Required" : undefined}
        />
        <DashboardCard 
          label="Inventory Value" 
          value={stats.totalValue.toLocaleString()} 
          icon={ArrowUpRight}
          color="#10B981"
        />
        <DashboardCard 
          label="Categories" 
          value={stats.totalCategories} 
          icon={Filter}
          color="#3B82F6"
        />
      </div>

      <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by name or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === "all" ? "bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-500" : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"}`}
            >
              All Parts
            </button>
            <button 
              onClick={() => setFilter("low-stock")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${filter === "low-stock" ? "bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-500" : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"}`}
            >
              Low Stock
              {stats.lowStock > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{stats.lowStock}</span>}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-900/50 text-left">
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Part Details</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Stock Level</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Pricing</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-500" />
                    <p className="text-zinc-500 mt-2">Loading inventory...</p>
                  </td>
                </tr>
              ) : filteredParts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-zinc-500">
                    No parts found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredParts.map((part) => (
                  <tr key={part.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-medium text-zinc-900 dark:text-white">{part.name}</span>
                        <span className="text-xs text-zinc-500 uppercase tracking-wider">{part.sku}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                        {part.categoryName || "Uncategorized"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${part.stockQuantity <= part.reorderLevel ? "text-red-500" : "text-zinc-900 dark:text-zinc-100"}`}>
                          {part.stockQuantity}
                        </span>
                        {part.stockQuantity <= part.reorderLevel && (
                          <div className="group relative">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-red-500 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                              Below reorder level ({part.reorderLevel})
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col text-sm">
                        <span className="text-zinc-900 dark:text-zinc-100">Sell: Rs. {part.unitPrice.toLocaleString()}</span>
                        <span className="text-xs text-zinc-500 text-[10px]">Cost: Rs. {part.costPrice.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${part.isActive ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-500" : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500"}`}>
                        {part.isActive ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <Link 
                          href={`/admin/inventory/edit/${part.id}`}
                          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-orange-500 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => handleDelete(part.id)}
                          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <Link 
                          href={`/admin/inventory/movements?partId=${part.id}`}
                          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-blue-500 transition-colors"
                        >
                          <History className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
