"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PartCategory } from "@/types";
import { FormInput, FormTextarea, FormCheckbox, SubmitButton, FormSelect } from "@/components/ui/FormElements";

const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  vehicleType: z.string().min(1, "Please select a vehicle type"),
  isActive: z.boolean(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  initialData?: PartCategory;
  onSubmit: (data: CategoryFormValues) => Promise<void>;
  onCancel?: () => void;
  isLoading: boolean;
}

export default function CategoryForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}: CategoryFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      vehicleType: initialData?.vehicleType || "Car",
      isActive: initialData?.isActive ?? true,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Category Name"
          required
          registration={register("name")}
          error={errors.name?.message}
          placeholder="e.g., Engine Parts"
        />

        <FormSelect
          label="Vehicle Type"
          required
          registration={register("vehicleType")}
          error={errors.vehicleType?.message}
          options={[
            { value: "Bike", label: "Bike" },
            { value: "Car", label: "Car" },
            { value: "Bus", label: "Bus" },
            { value: "Auto", label: "Auto" },
            { value: "Truck", label: "Truck" },
            { value: "Jeep", label: "Jeep" },
          ]}
        />
      </div>

      <FormTextarea
        label="Description"
        registration={register("description")}
        error={errors.description?.message}
        placeholder="Optional details about this category..."
        rows={3}
      />

      <FormCheckbox
        label="Active Status"
        registration={register("isActive")}
      />

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <SubmitButton isLoading={isLoading}>
          {initialData ? "Update Category" : "Create Category"}
        </SubmitButton>
      </div>
    </form>
  );
}
