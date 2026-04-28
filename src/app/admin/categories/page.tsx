"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { PartCategory, ApiResponse } from "@/types";
import { 
  Plus, 
  LayoutGrid, 
  Edit, 
  Trash2, 
  MoreVertical,
  AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import DataTable from "@/components/ui/DataTable";
import CategoryForm from "@/components/admin/CategoryForm";
import Switch from "@/components/ui/Switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<PartCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState<PartCategory | undefined>();
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/part-categories");
      if (res.success) {
        setCategories(res.data || []);
      }
    } catch (error) {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

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
        const response: ApiResponse<PartCategory> = await api.put(`/api/part-categories/${selectedCat.id}`, data);
        if (response.success) {
          toast.success("Category updated");
          setIsModalOpen(false);
          fetchCategories();
        }
      } else {
        const response: ApiResponse<PartCategory> = await api.post("/api/part-categories", data);
        if (response.success) {
          toast.success("Category created");
          setIsModalOpen(false);
          fetchCategories();
        }
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (cat: PartCategory) => {
    try {
      const updatedData = { ...cat, isActive: !cat.isActive };
      const response: ApiResponse<PartCategory> = await api.put(`/api/part-categories/${cat.id}`, updatedData);
      if (response.success) {
        toast.success(`Category ${!cat.isActive ? 'enabled' : 'disabled'}`);
        fetchCategories();
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this category?")) return;
    try {
      const response: ApiResponse<string> = await api.delete(`/api/part-categories/${id}`);
      if (response.success) {
        toast.success("Category deleted");
        fetchCategories();
      } else {
        toast.error(response.message || "Failed to delete category");
      }
    } catch (error) {
      toast.error("An error occurred during deletion");
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white font-outfit flex items-center gap-3">
            <LayoutGrid className="w-8 h-8 text-orange-600" />
            Categories Management
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">Organize and manage part categories.</p>
        </div>
        <button 
          onClick={handleAdd}
          className="flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-semibold shadow-lg shadow-orange-500/30 transition-all active:scale-95 w-fit"
        >
          <Plus className="w-5 h-5" />
          Add Category
        </button>
      </div>

      <DataTable
        columns={[
          {
            key: "name",
            header: "Category Name",
            render: (cat) => (
              <div className="flex flex-col">
                <span className="font-semibold text-zinc-900 dark:text-white">{cat.name}</span>
                <span className="text-xs text-zinc-500">ID: {cat.id.slice(0, 8)}...</span>
              </div>
            ),
          },
          {
            key: "description",
            header: "Description",
            render: (cat) => (
              <span className="text-sm text-zinc-500 max-w-xs block truncate">
                {cat.description || "No description provided"}
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
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-wider",
                  cat.isActive ? "text-green-500" : "text-zinc-500"
                )}>
                  {cat.isActive ? "Active" : "Inactive"}
                </span>
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
                  <button className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
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
                    onClick={() => handleDelete(cat.id)}
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
        searchPlaceholder="Search categories by name..."
        onRefresh={fetchCategories}
        emptyIcon={LayoutGrid}
        emptyMessage="No categories found. Start by adding one!"
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedCat ? "Edit Category" : "Create New Category"}
      >
        <CategoryForm 
          initialData={selectedCat}
          onSubmit={handleSubmit}
          isLoading={submitting}
        />
      </Modal>

      {loading && categories.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800">
          <div className="relative">
            <LayoutGrid className="w-12 h-12 text-zinc-200 animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
          <p className="mt-4 text-zinc-500 text-sm font-medium">Fetching categories...</p>
        </div>
      )}
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
