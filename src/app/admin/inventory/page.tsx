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
  Loader2,
  Store,
  DollarSign,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { StatsCard } from "@/components/ui/StatsCard";
import Modal from "@/components/ui/Modal";
import DataTable from "@/components/ui/DataTable";
import InventoryForm from "@/components/admin/InventoryForm";
import Switch from "@/components/ui/Switch";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { PartCategory, Vendor } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function InventoryPage() {
  const [parts, setParts] = useState<Part[]>([]);
  const [categories, setCategories] = useState<PartCategory[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "low-stock">("all");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState<Part | undefined>();
  const [partToDelete, setPartToDelete] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      const fetchParts = api.get("/api/parts").then(res => {
        if (res.success) setParts(res.data || []);
      }).catch(() => toast.error("Failed to load parts"));

      const fetchCats = api.get("/api/part-categories").then(res => {
        if (res.success) setCategories(res.data || []);
      }).catch(() => toast.error("Failed to load categories"));

      const fetchVendors = api.get("/api/vendors").then(res => {
        if (res.success) setVendors(res.data || []);
      }).catch(() => toast.error("Failed to load vendors"));

      await Promise.allSettled([fetchParts, fetchCats, fetchVendors]);
      
    } catch (error) {
      toast.error("Failed to sync inventory data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleAddPart = () => {
    setSelectedPart(undefined);
    setIsModalOpen(true);
  };

  const handleEditPart = (part: Part) => {
    setSelectedPart(part);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: any) => {
    try {
      setSubmitting(true);
      if (selectedPart) {
        const response: ApiResponse<Part> = await api.put(`/api/Parts/${selectedPart.id}`, data);
        if (response.success) {
          toast.success("Part updated");
          setIsModalOpen(false);
          fetchInitialData();
        }
      } else {
        const response: ApiResponse<Part> = await api.post("/api/Parts", data);
        if (response.success) {
          toast.success("Part added to inventory");
          setIsModalOpen(false);
          fetchInitialData();
        }
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

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

  const handleDeleteClick = (id: string) => {
    setPartToDelete(id);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!partToDelete) return;
    try {
      setSubmitting(true);
      const response: ApiResponse<string> = await api.delete(`/api/parts/${partToDelete}`);
      if (response.success) {
        toast.success("Part disabled");
        setIsConfirmOpen(false);
        fetchInitialData();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Failed to disable part");
    } finally {
      setSubmitting(false);
      setPartToDelete(null);
    }
  };

  const handleTogglePartStatus = async (part: Part) => {
    try {
      const cleanData = {
        categoryId: part.categoryId,
        vendorId: part.vendorId,
        name: part.name,
        sku: part.sku,
        description: part.description,
        costPrice: part.costPrice,
        unitPrice: part.unitPrice,
        stockQuantity: part.stockQuantity,
        reorderLevel: part.reorderLevel,
        isActive: !part.isActive
      };
      const response = await api.put(`/api/Parts/${part.id}`, cleanData);
      if (response.success) {
        toast.success(`Part ${!part.isActive ? 'enabled' : 'disabled'}`);
        fetchInitialData();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Failed to update part status");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white font-outfit flex items-center gap-3">
            <Package className="w-8 h-8 text-orange-600" />
            Inventory Management
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Track and manage your vehicle parts stock.</p>
        </div>
        <button 
          onClick={handleAddPart}
          className="flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-semibold shadow-lg shadow-orange-500/30 transition-all active:scale-95 w-fit"
        >
          <Plus className="w-5 h-5" />
          Add New Part
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          label="Total Parts" 
          value={stats.totalItems} 
          icon={Package}
          variant="default"
        />
        <StatsCard 
          label="Low Stock" 
          value={stats.lowStock} 
          icon={AlertTriangle}
          variant="danger"
          description={stats.lowStock > 0 ? "Reorder required" : "Stock healthy"}
        />
        <StatsCard 
          label="Inventory Value" 
          value={`Rs. ${stats.totalValue.toLocaleString()}`} 
          icon={ArrowUpRight}
          variant="success"
        />
        <StatsCard 
          label="Categories" 
          value={stats.totalCategories} 
          icon={Filter}
          variant="info"
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedPart ? "Edit Part Details" : "Add New Vehicle Part"}
      >
        <InventoryForm 
          initialData={selectedPart}
          categories={categories}
          vendors={vendors}
          onSubmit={handleSubmit}
          isLoading={submitting}
        />
      </Modal>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Disable Part"
        description="Are you sure you want to disable this part? It will no longer be available for sales or purchase orders."
        confirmText="Yes, Disable"
        isLoading={submitting}
        variant="destructive"
      />

        <DataTable
          columns={[
            {
              key: "partDetails",
              header: "Part Details",
              render: (part) => (
                <div className="flex flex-col">
                  <span className="font-medium text-zinc-900 dark:text-white">{part.name}</span>
                  <span className="text-xs text-zinc-500 uppercase tracking-wider">{part.sku}</span>
                </div>
              ),
            },
            {
              key: "category",
              header: "Category",
              render: (part) => (
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                  {part.categoryName || "Uncategorized"}
                </span>
              ),
            },
            {
              key: "stockLevel",
              header: "Stock Level",
              render: (part) => (
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
              ),
            },
            {
              key: "pricing",
              header: "Pricing",
              render: (part) => (
                <div className="flex flex-col text-sm">
                  <span className="text-zinc-900 dark:text-zinc-100">Sell: Rs. {part.unitPrice.toLocaleString()}</span>
                  <span className="text-xs text-zinc-500 text-[10px]">Cost: Rs. {part.costPrice.toLocaleString()}</span>
                </div>
              ),
            },
            {
              key: "status",
              header: "Status",
              render: (part) => (
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={part.isActive} 
                    onChange={() => handleTogglePartStatus(part)}
                  />
                  <span className={`text-[10px] font-bold uppercase ${part.isActive ? "text-green-500" : "text-zinc-500"}`}>
                    {part.isActive ? "Active" : "Disabled"}
                  </span>
                </div>
              ),
            },
            {
              key: "actions",
              header: "Actions",
              className: "text-right",
              render: (part) => (
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleEditPart(part)}
                    className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-orange-500 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(part.id)}
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
              ),
            },
          ]}
          data={filteredParts}
          loading={loading}
          keyExtractor={(p) => p.id}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search by name or SKU..."
          onRefresh={fetchInitialData}
          emptyIcon={Package}
          emptyMessage="No parts found matching your criteria."
          headerActions={
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
          }
        />
    </div>
  );
}
