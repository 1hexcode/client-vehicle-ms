"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PartCategory } from "@/types";
import { FormInput, FormTextarea, FormCheckbox, SubmitButton } from "@/components/ui/FormElements";

const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
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
      isActive: initialData?.isActive ?? true,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormInput
        label="Category Name"
        required
        registration={register("name")}
        error={errors.name?.message}
        placeholder="e.g., Engine Parts"
      />

      <FormTextarea
        label="Description"
        registration={register("description")}
        error={errors.description?.message}
        placeholder="Optional details..."
        rows={3}
      />

      {initialData && (
        <FormCheckbox
          label="Active Status"
          registration={register("isActive")}
        />
      )}

      <div className="flex justify-end pt-4">
        <SubmitButton isLoading={isLoading}>
          {initialData ? "Update Category" : "Create Category"}
        </SubmitButton>
      </div>
    </form>
  );
}
