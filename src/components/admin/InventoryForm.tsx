"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Part, PartCategory } from "@/types";
import { Loader2 } from "lucide-react";

const inventorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  sku: z.string().min(3, "SKU must be at least 3 characters"),
  categoryId: z.string().min(1, "Please select a category"),
  description: z.string().optional(),
  costPrice: z.number().min(0, "Cost price cannot be negative"),
  unitPrice: z.number().min(0, "Unit price cannot be negative"),
  stockQuantity: z.number().int().min(0, "Stock cannot be negative"),
  reorderLevel: z.number().int().min(0, "Reorder level cannot be negative"),
});

type InventoryFormValues = z.infer<typeof inventorySchema>;

interface InventoryFormProps {
  initialData?: Part;
  categories: PartCategory[];
  onSubmit: (data: InventoryFormValues) => Promise<void>;
  isLoading: boolean;
}

export default function InventoryForm({
  initialData,
  categories,
  onSubmit,
  isLoading,
}: InventoryFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InventoryFormValues>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      name: initialData?.name || "",
      sku: initialData?.sku || "",
      categoryId: initialData?.categoryId || "",
      description: initialData?.description || "",
      costPrice: initialData?.costPrice || 0,
      unitPrice: initialData?.unitPrice || 0,
      stockQuantity: initialData?.stockQuantity || 0,
      reorderLevel: initialData?.reorderLevel || 10,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Part Name *
          </label>
          <input
            {...register("name")}
            className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
            placeholder="e.g., Brake Pad - Front"
          />
          {errors.name && (
            <p className="text-xs text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            SKU / Part Number *
          </label>
          <input
            {...register("sku")}
            className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
            placeholder="e.g., BRK-001"
          />
          {errors.sku && (
            <p className="text-xs text-red-500">{errors.sku.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Category *
          </label>
          <select
            {...register("categoryId")}
            className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="text-xs text-red-500">{errors.categoryId.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Reorder Level (Alert at)
          </label>
          <input
            {...register("reorderLevel", { valueAsNumber: true })}
            type="number"
            className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
          />
          {errors.reorderLevel && (
            <p className="text-xs text-red-500">{errors.reorderLevel.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Cost Price (Rs.) *
          </label>
          <input
            {...register("costPrice", { valueAsNumber: true })}
            type="number"
            step="0.01"
            className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
          />
          {errors.costPrice && (
            <p className="text-xs text-red-500">{errors.costPrice.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Unit Price (Selling Rs.) *
          </label>
          <input
            {...register("unitPrice", { valueAsNumber: true })}
            type="number"
            step="0.01"
            className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
          />
          {errors.unitPrice && (
            <p className="text-xs text-red-500">{errors.unitPrice.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Initial Stock Quantity
          </label>
          <input
            {...register("stockQuantity", { valueAsNumber: true })}
            type="number"
            className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
          />
          {errors.stockQuantity && (
            <p className="text-xs text-red-500">{errors.stockQuantity.message}</p>
          )}
        </div>

        <div className="space-y-1 md:col-span-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Description
          </label>
          <textarea
            {...register("description")}
            rows={3}
            className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
            placeholder="Optional details about the part..."
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-semibold shadow-lg shadow-orange-500/30 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
          {initialData ? "Update Part" : "Create Part"}
        </button>
      </div>
    </form>
  );
}
