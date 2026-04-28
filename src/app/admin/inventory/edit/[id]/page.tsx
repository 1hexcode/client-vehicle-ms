"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { PartCategory, ApiResponse, Part } from "@/types";
import InventoryForm from "@/components/admin/InventoryForm";
import { ChevronLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function EditInventoryPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [part, setPart] = useState<Part | null>(null);
  const [categories, setCategories] = useState<PartCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetching(true);
        const [partRes, catRes]: [ApiResponse<Part>, ApiResponse<PartCategory[]>] = await Promise.all([
          api.get(`/api/Parts/${id}`),
          api.get("/api/PartCategories")
        ]);

        if (partRes.success && partRes.data) {
          setPart(partRes.data);
        }
        if (catRes.success && catRes.data) {
          setCategories(catRes.data);
        }
      } catch (error) {
        toast.error("Failed to load part details");
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      const response: ApiResponse<Part> = await api.put(`/api/Parts/${id}`, data);
      if (response.success) {
        toast.success("Part updated successfully");
        router.push("/admin/inventory");
      } else {
        toast.error(response.message || "Failed to update part");
      }
    } catch (error) {
      toast.error("An error occurred while updating the part");
    } finally {
      setIsLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!part) {
    return (
      <div className="text-center py-10">
        <p className="text-zinc-500">Part not found.</p>
        <Link href="/admin/inventory" className="text-orange-600 hover:underline mt-2 inline-block">Back to Inventory</Link>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Edit Part</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Update details for {part.name}.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <InventoryForm 
          initialData={part}
          categories={categories}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
