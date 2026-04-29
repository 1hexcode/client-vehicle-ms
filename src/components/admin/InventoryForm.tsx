"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Part, PartCategory, Vendor } from "@/types";
import { FormInput, FormSelect, FormTextarea, SubmitButton } from "@/components/ui/FormElements";

const inventorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  sku: z.string().min(3, "SKU must be at least 3 characters"),
  categoryId: z.string().min(1, "Please select a category"),
  vendorId: z.string().min(1, "Please select a vendor"),
  description: z.string().optional(),
  costPrice: z.number().min(0, "Cost price cannot be negative"),
  unitPrice: z.number().min(0, "Unit price cannot be negative"),
  stockQuantity: z.number().int().min(0, "Stock cannot be negative"),
  reorderLevel: z.number().int().min(0, "Reorder level cannot be negative"),
  isActive: z.boolean(),
});

type InventoryFormValues = z.infer<typeof inventorySchema>;

interface InventoryFormProps {
  initialData?: Part;
  categories: PartCategory[];
  vendors: Vendor[];
  onSubmit: (data: InventoryFormValues) => Promise<void>;
  isLoading: boolean;
}

export default function InventoryForm({
  initialData,
  categories,
  vendors,
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
      vendorId: initialData?.vendorId || "", 
      description: initialData?.description || "",
      costPrice: initialData?.costPrice || 0,
      unitPrice: initialData?.unitPrice || 0,
      stockQuantity: initialData?.stockQuantity || 0,
      reorderLevel: initialData?.reorderLevel || 10,
      isActive: initialData?.isActive ?? true,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Part Name"
          required
          registration={register("name")}
          error={errors.name?.message}
          placeholder="e.g., Brake Pad - Front"
        />

        <FormInput
          label="SKU / Part Number"
          required
          registration={register("sku")}
          error={errors.sku?.message}
          placeholder="e.g., BRK-001"
        />

        <FormSelect
          label="Category"
          required
          registration={register("categoryId")}
          error={errors.categoryId?.message}
          options={categories.map(c => ({ value: c.id, label: c.name }))}
          placeholder="Select a category"
        />

        <FormSelect
          label="Vendor"
          required
          registration={register("vendorId")}
          error={errors.vendorId?.message}
          options={vendors.map(v => ({ value: v.id, label: v.name }))}
          placeholder="Select a vendor"
        />

        <FormInput
          label="Reorder Level (Alert at)"
          type="number"
          registration={register("reorderLevel", { valueAsNumber: true })}
          error={errors.reorderLevel?.message}
        />

        <FormInput
          label="Cost Price (Rs.)"
          required
          type="number"
          step="0.01"
          registration={register("costPrice", { valueAsNumber: true })}
          error={errors.costPrice?.message}
        />

        <FormInput
          label="Unit Price (Selling Rs.)"
          required
          type="number"
          step="0.01"
          registration={register("unitPrice", { valueAsNumber: true })}
          error={errors.unitPrice?.message}
        />

        <FormInput
          label="Initial Stock Quantity"
          type="number"
          registration={register("stockQuantity", { valueAsNumber: true })}
          error={errors.stockQuantity?.message}
        />

        <div className="md:col-span-2">
          <FormTextarea
            label="Description"
            registration={register("description")}
            error={errors.description?.message}
            placeholder="Optional details about the part..."
            rows={3}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          {...register("isActive")}
          className="w-4 h-4 rounded border-zinc-300 text-orange-600 focus:ring-orange-500"
        />
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Active Status
        </label>
      </div>

      <div className="flex justify-end pt-4">
        <SubmitButton isLoading={isLoading}>
          {initialData ? "Update Part" : "Create Part"}
        </SubmitButton>
      </div>
    </form>
  );
}
