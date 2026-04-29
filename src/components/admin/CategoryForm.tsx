"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PartCategory } from "@/types";
import { FormInput, FormTextarea, FormCheckbox, SubmitButton } from "@/components/ui/FormElements";

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
  isLoading: boolean;
}

export default function CategoryForm({
  initialData,
  onSubmit,
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
        placeholder="Optional details..."
        rows={3}
      />

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
          {initialData ? "Update Category" : "Create Category"}
        </SubmitButton>
      </div>
    </form>
  );
}
