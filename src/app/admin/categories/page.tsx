"use client";

import { useState, useEffect, useMemo } from "react";
import { api } from "@/lib/api";
import { PartCategory, ApiResponse } from "@/types";
import {
  Plus,
  LayoutGrid,
  Edit,
  Trash2,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Calendar,
} from "lucide-react";
import toast from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import DataTable from "@/components/ui/DataTable";
import CategoryForm from "@/components/admin/CategoryForm";
import Switch from "@/components/ui/Switch";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { StatsCard } from "@/components/ui/StatsCard";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const VEHICLE_TYPES = ["All", "Bike", "Car", "Bus", "Auto", "Truck", "Jeep"] as const;

const VEHICLE_TYPE_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  Bike:  { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-700 dark:text-purple-300", dot: "bg-purple-500" },
  Car:   { bg: "bg-blue-100 dark:bg-blue-900/30",   text: "text-blue-700 dark:text-blue-300",     dot: "bg-blue-500" },
  Bus:   { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-300",   dot: "bg-amber-500" },
  Auto:  { bg: "bg-teal-100 dark:bg-teal-900/30",   text: "text-teal-700 dark:text-teal-300",     dot: "bg-teal-500" },
  Truck: { bg: "bg-rose-100 dark:bg-rose-900/30",   text: "text-rose-700 dark:text-rose-300",     dot: "bg-rose-500" },
  Jeep:  { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-300", dot: "bg-emerald-500" },
};

const AVATAR_COLORS = [
  "bg-gradient-to-br from-orange-400 to-orange-600",
  "bg-gradient-to-br from-blue-400 to-blue-600",
  "bg-gradient-to-br from-purple-400 to-purple-600",
  "bg-gradient-to-br from-emerald-400 to-emerald-600",
  "bg-gradient-to-br from-rose-400 to-rose-600",
  "bg-gradient-to-br from-amber-400 to-amber-600",
  "bg-gradient-to-br from-teal-400 to-teal-600",
  "bg-gradient-to-br from-indigo-400 to-indigo-600",
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<PartCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("All");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState<PartCategory | undefined>();
  const [catToDelete, setCatToDelete] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async (vehicleType?: string) => {
    try {
      setLoading(true);
      const query = vehicleType && vehicleType !== "All" ? `?vehicleType=${vehicleType}` : "";
      const res = await api.get(`/api/part-categories${query}`);
      if (res.success) {
        setCategories(res.data || []);
      }
    } catch {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories(activeTab);
  }, [activeTab]);

  // Stats
  const stats = useMemo(() => {
    const total = categories.length;
    const active = categories.filter((c) => c.isActive).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [categories]);

  // Search filter
  const filteredCategories = useMemo(
    () =>
      categories.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
      ),
    [categories, searchQuery]
  );

  const handleAdd = () => {
    setSelectedCat(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (cat: PartCategory) => {
    setSelectedCat(cat);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: any) => {
    try {
      setSubmitting(true);
      if (selectedCat) {
        const response: ApiResponse<PartCategory> = await api.put(
          `/api/part-categories/${selectedCat.id}`,
          data
        );
        if (response.success) {
          toast.success("Category updated successfully");
          setIsModalOpen(false);
          fetchCategories(activeTab);
        }
      } else {
        const response: ApiResponse<PartCategory> = await api.post(
          "/api/part-categories",
          data
        );
        if (response.success) {
          toast.success("Category created successfully");
          setIsModalOpen(false);
          fetchCategories(activeTab);
        }
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (cat: PartCategory) => {
    try {
      const updatedData = {
        name: cat.name,
        description: cat.description,
        vehicleType: cat.vehicleType,
        parentId: cat.parentId || null,
        isActive: !cat.isActive,
      };
      const response: ApiResponse<PartCategory> = await api.put(
        `/api/part-categories/${cat.id}`,
        updatedData
      );
      if (response.success) {
        toast.success(`Category ${!cat.isActive ? "activated" : "deactivated"}`);
        fetchCategories(activeTab);
      } else {
        toast.error(response.message);
      }
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDeleteClick = (id: string) => {
    setCatToDelete(id);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!catToDelete) return;
    try {
      setSubmitting(true);
      const response: ApiResponse<string> = await api.delete(
        `/api/part-categories/${catToDelete}`
      );
      if (response.success) {
        toast.success("Category deleted successfully");
        setIsConfirmOpen(false);
        fetchCategories(activeTab);
      } else {
        toast.error(response.message || "Failed to delete category");
      }
    } catch {
      toast.error("An error occurred during deletion");
    } finally {
      setSubmitting(false);
      setCatToDelete(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white font-outfit flex items-center gap-3">
            <LayoutGrid className="w-8 h-8 text-orange-600" />
            Categories Management
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Organize and manage vehicle part categories
          </p>
        </div>
        <button
          id="add-category-btn"
          onClick={handleAdd}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-semibold shadow-lg shadow-orange-500/20 transition-all active:scale-95 w-fit"
        >
          <Plus className="w-5 h-5" />
          Add Category
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          label="Total Categories"
          value={stats.total}
          icon={LayoutGrid}
          variant="default"
        />
        <StatsCard
          label="Active Categories"
          value={stats.active}
          icon={CheckCircle2}
          variant="success"
        />
        <StatsCard
          label="Inactive Categories"
          value={stats.inactive}
          icon={XCircle}
          variant="danger"
        />
      </div>

      {/* Vehicle Type Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {VEHICLE_TYPES.map((type) => (
          <button
            key={type}
            id={`filter-tab-${type.toLowerCase()}`}
            onClick={() => setActiveTab(type)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200",
              activeTab === type
                ? "bg-orange-600 text-white shadow-md shadow-orange-500/25"
                : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:border-orange-300 dark:hover:border-orange-700 hover:text-orange-600 dark:hover:text-orange-400"
            )}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Data Table */}
      <DataTable
        columns={[
          {
            key: "name",
            header: "Category",
            render: (cat) => (
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm",
                    getAvatarColor(cat.name)
                  )}
                >
                  {cat.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-zinc-900 dark:text-white truncate">
                    {cat.name}
                  </p>
                  <p className="text-[11px] text-zinc-400 font-mono">
                    {cat.id.slice(0, 8)}...
                  </p>
                </div>
              </div>
            ),
          },
          {
            key: "vehicleType",
            header: "Vehicle Type",
            render: (cat) => {
              const colors = VEHICLE_TYPE_COLORS[cat.vehicleType] || {
                bg: "bg-zinc-100 dark:bg-zinc-800",
                text: "text-zinc-600 dark:text-zinc-400",
                dot: "bg-zinc-500",
              };
              return (
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold",
                    colors.bg,
                    colors.text
                  )}
                >
                  <span className={cn("w-1.5 h-1.5 rounded-full", colors.dot)} />
                  {cat.vehicleType}
                </span>
              );
            },
          },
          {
            key: "description",
            header: "Description",
            render: (cat) => (
              <span className="text-sm text-zinc-500 dark:text-zinc-400 max-w-[200px] block truncate">
                {cat.description || "No description"}
              </span>
            ),
          },
          {
            key: "status",
            header: "Status",
            render: (cat) => (
              <div className="flex items-center gap-3">
                <Switch
                  checked={cat.isActive}
                  onChange={() => handleToggleStatus(cat)}
                />
                <span
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-wider",
                    cat.isActive ? "text-green-500" : "text-zinc-500"
                  )}
                >
                  {cat.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            ),
          },
          {
            key: "createdAt",
            header: "Created",
            render: (cat) => (
              <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDate(cat.createdAt)}</span>
              </div>
            ),
          },
          {
            key: "actions",
            header: "Actions",
            className: "text-right",
            render: (cat) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    id={`actions-${cat.id}`}
                    className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <MoreVertical className="w-5 h-5 text-zinc-500" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Category Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleEdit(cat)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Edit className="w-4 h-4 text-blue-500" />
                    Edit Details
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDeleteClick(cat.id)}
                    className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Category
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ),
          },
        ]}
        data={filteredCategories}
        loading={loading}
        keyExtractor={(c) => c.id}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search categories by name or description..."
        onRefresh={() => fetchCategories(activeTab)}
        emptyIcon={LayoutGrid}
        emptyMessage="No categories found. Start by adding one!"
      />

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedCat ? "Edit Category" : "Create New Category"}
      >
        <CategoryForm
          initialData={selectedCat}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
          isLoading={submitting}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Category"
        description="Are you sure you want to delete this category? This action cannot be undone if no parts are linked to it."
        confirmText="Yes, Delete"
        isLoading={submitting}
        variant="destructive"
      />
    </div>
  );
}
