"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MeProfile } from "@/types";
import { FormInput, SubmitButton } from "@/components/ui/FormElements";

const profileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  initialData?: MeProfile | null;
  onSubmit: (data: ProfileFormValues) => Promise<void>;
  isLoading?: boolean;
}

export default function ProfileForm({ initialData, onSubmit, isLoading }: ProfileFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: initialData?.fullName || "",
      phoneNumber: initialData?.phoneNumber || "",
      address: initialData?.address || "",
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        fullName: initialData.fullName || "",
        phoneNumber: initialData.phoneNumber || "",
        address: initialData.address || "",
      });
    }
  }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Email"
          value={initialData?.email || ""}
          disabled
          registration={undefined}
        />
        <FormInput
          label="Role"
          value={initialData?.role || ""}
          disabled
          registration={undefined}
        />
      </div>

      <FormInput
        label="Full Name"
        required
        registration={register("fullName")}
        error={errors.fullName?.message}
        placeholder="John Doe"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Phone Number"
          required
          registration={register("phoneNumber")}
          error={errors.phoneNumber?.message}
          placeholder="98XXXXXXXX"
        />
        <FormInput
          label="Address"
          required
          registration={register("address")}
          error={errors.address?.message}
          placeholder="Kathmandu, Nepal"
        />
      </div>

      <div className="pt-2">
        <SubmitButton isLoading={isLoading}>Save Profile</SubmitButton>
      </div>
    </form>
  );
}
