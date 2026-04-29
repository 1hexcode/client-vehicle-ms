"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { PartCategory, ApiResponse, Part } from "@/types";
import InventoryForm from "@/components/admin/InventoryForm";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function AddInventoryPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<PartCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response: ApiResponse<PartCategory[]> = await api.get("/api/PartCategories");
        if (response.success && response.data) {
          setCategories(response.data);
        }
      } catch (error) {
        toast.error("Failed to load categories");
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      const response: ApiResponse<Part> = await api.post("/api/Parts", data);
      if (response.success) {
        toast.success("Part created successfully");
        router.push("/admin/inventory");
      } else {
        toast.error(response.message || "Failed to create part");
      }
    } catch (error) {
      toast.error("An error occurred while creating the part");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/inventory"
          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Add New Part</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Register a new item in the inventory.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <InventoryForm 
          categories={categories}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
