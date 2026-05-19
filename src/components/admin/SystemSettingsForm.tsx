"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FormInput, SubmitButton } from "@/components/ui/FormElements";

const settingsSchema = z.object({
  systemName: z.string().min(2, "System name must be at least 2 characters"),
  contactEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
  contactPhone: z.string().min(7, "Phone number must be at least 7 characters").optional().or(z.literal("")),
  address: z.string().min(5, "Address must be at least 5 characters").optional().or(z.literal("")),
  currency: z.string().min(1, "Currency symbol is required"),
  taxRate: z.number().min(0, "Tax rate cannot be negative").max(100, "Tax rate cannot exceed 100%"),
});

export type SystemSettingsFormValues = z.infer<typeof settingsSchema>;

interface SystemSettingsFormProps {
  initialData?: SystemSettingsFormValues | null;
  onSubmit: (data: SystemSettingsFormValues) => Promise<void>;
  isLoading?: boolean;
}

export default function SystemSettingsForm({ initialData, onSubmit, isLoading }: SystemSettingsFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SystemSettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      systemName: initialData?.systemName || "VehicleHub Parts MS",
      contactEmail: initialData?.contactEmail || "support@vehiclehub.com",
      contactPhone: initialData?.contactPhone || "+977-9876543210",
      address: initialData?.address || "Kathmandu, Nepal",
      currency: initialData?.currency || "Rs.",
      taxRate: initialData?.taxRate ?? 13.0,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        systemName: initialData.systemName || "",
        contactEmail: initialData.contactEmail || "",
        contactPhone: initialData.contactPhone || "",
        address: initialData.address || "",
        currency: initialData.currency || "",
        taxRate: initialData.taxRate ?? 13.0,
      });
    }
  }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-zinc-900 dark:text-white">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="System Name"
          required
          registration={register("systemName")}
          error={errors.systemName?.message}
          placeholder="e.g. VehicleHub Parts MS"
        />
        <FormInput
          label="Contact Email"
          registration={register("contactEmail")}
          error={errors.contactEmail?.message}
          placeholder="e.g. info@vehiclehub.com"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Contact Phone"
          registration={register("contactPhone")}
          error={errors.contactPhone?.message}
          placeholder="e.g. +977-9876543210"
        />
        <FormInput
          label="Business Address"
          registration={register("address")}
          error={errors.address?.message}
          placeholder="e.g. Kathmandu, Nepal"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Currency Symbol"
          required
          registration={register("currency")}
          error={errors.currency?.message}
          placeholder="e.g. Rs. or $"
        />
        <FormInput
          label="VAT / Tax Rate (%)"
          required
          type="number"
          step="0.01"
          registration={register("taxRate", { valueAsNumber: true })}
          error={errors.taxRate?.message}
          placeholder="e.g. 13"
        />
      </div>

      <div className="pt-2">
        <SubmitButton isLoading={isLoading}>Save Settings</SubmitButton>
      </div>
    </form>
  );
}
