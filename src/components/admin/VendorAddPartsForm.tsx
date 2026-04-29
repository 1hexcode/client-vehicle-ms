import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { Part, ApiResponse } from "@/types";

const addPartsSchema = z.object({
  partId: z.string().min(1, "Please select a part"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  pricePerUnit: z.number().min(0.01, "Price must be greater than 0"),
});

type AddPartsFormValues = z.infer<typeof addPartsSchema>;

interface VendorAddPartsFormProps {
  onSubmit: (data: AddPartsFormValues) => void;
  isLoading?: boolean;
}

export default function VendorAddPartsForm({ onSubmit, isLoading }: VendorAddPartsFormProps) {
  const [parts, setParts] = useState<Part[]>([]);
  const [loadingParts, setLoadingParts] = useState(true);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AddPartsFormValues>({
    resolver: zodResolver(addPartsSchema),
    defaultValues: {
      quantity: 1,
    },
  });

  const selectedPartId = watch("partId");
  const quantity = watch("quantity");
  const pricePerUnit = watch("pricePerUnit");
  const totalCost = (quantity || 0) * (pricePerUnit || 0);

  useEffect(() => {
    const fetchParts = async () => {
      try {
        setLoadingParts(true);
        // Assuming there is an endpoint to fetch parts. Adjust if different.
        // If not available, we handle empty gracefully.
        const response: ApiResponse<Part[]> = await api.get("/api/VehicleParts").catch(() => ({ success: false, message: "Could not load parts", data: [] }));
        if (response.success && response.data) {
          setParts(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch parts", error);
      } finally {
        setLoadingParts(false);
      }
    };

    fetchParts();
  }, []);

  // Auto-fill price if part is selected
  useEffect(() => {
    if (selectedPartId) {
      const part = parts.find((p) => p.id === selectedPartId);
      if (part && part.unitPrice) {
        // Use existing price as default suggestion
        setValue("pricePerUnit", part.unitPrice);
      }
    }
  }, [selectedPartId, parts, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Select Part *
        </label>
        <select
          {...register("partId")}
          className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
          disabled={loadingParts}
        >
          <option value="">{loadingParts ? "Loading parts..." : "Select a part"}</option>
          {parts.map((part) => (
            <option key={part.id} value={part.id}>
              {part.name} ({part.categoryName || "Uncategorized"})
            </option>
          ))}
        </select>
        {errors.partId && <p className="text-xs text-red-500">{errors.partId.message}</p>}
        {parts.length === 0 && !loadingParts && (
          <p className="text-xs text-amber-500 mt-1">Warning: No parts found in system. Please add parts to the inventory first.</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Quantity *
          </label>
          <input
            {...register("quantity", { valueAsNumber: true })}
            type="number"
            min="1"
            className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
          />
          {errors.quantity && <p className="text-xs text-red-500">{errors.quantity.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Cost Per Unit (Rs.) *
          </label>
          <input
            {...register("pricePerUnit", { valueAsNumber: true })}
            type="number"
            step="0.01"
            min="0.01"
            className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
          />
          {errors.pricePerUnit && <p className="text-xs text-red-500">{errors.pricePerUnit.message}</p>}
        </div>
      </div>

      <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl mt-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-zinc-500">Total Purchase Cost:</span>
          <span className="font-bold text-lg text-orange-600 dark:text-orange-500">
            Rs. {totalCost?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <p className="text-xs text-zinc-400 mt-1">This amount will be added to the vendor's total due balance.</p>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isLoading || parts.length === 0}
          className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
        >
          {isLoading ? "Processing..." : "Confirm & Add to Bill"}
        </button>
      </div>
    </form>
  );
}
