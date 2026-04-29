"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Staff } from "@/types";
import { FormInput, FormCheckbox, SubmitButton } from "@/components/ui/FormElements";

const staffSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  password: z.string().transform(v => v === "" ? undefined : v).optional().refine(v => v === undefined || v.length >= 6, {
    message: "Password must be at least 6 characters"
  }),
  passwordVerify: z.string().optional(),
  isActive: z.boolean(),
}).refine((data) => {
  if (!data.password && !data.passwordVerify) return true;
  return data.password === data.passwordVerify;
}, {
  message: "Passwords do not match",
  path: ["passwordVerify"],
});

type StaffFormValues = z.infer<typeof staffSchema>;

interface StaffFormProps {
  initialData?: Staff;
  onSubmit: (data: StaffFormValues) => Promise<void>;
  isLoading: boolean;
}

export default function StaffForm({ initialData, onSubmit, isLoading }: StaffFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StaffFormValues>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      fullName: initialData?.fullName || "",
      email: initialData?.email || "",
      phoneNumber: initialData?.phoneNumber || "",
      address: initialData?.address || "",
      isActive: initialData?.isActive ?? true,
      password: "",
      passwordVerify: "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormInput
        label="Full Name"
        required
        registration={register("fullName")}
        error={errors.fullName?.message}
        placeholder="John Doe"
      />

      <FormInput
        label="Email Address"
        type="email"
        required
        disabled={!!initialData}
        registration={register("email")}
        error={errors.email?.message}
        placeholder="john@example.com"
      />

      <div className="grid grid-cols-2 gap-4">
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

      {!initialData && (
        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="Password"
            type="password"
            required
            registration={register("password")}
            error={errors.password?.message}
            placeholder="Min 6 characters"
          />
          <FormInput
            label="Verify Password"
            type="password"
            required
            registration={register("passwordVerify")}
            error={errors.passwordVerify?.message}
            placeholder="Confirm password"
          />
        </div>
      )}

      {initialData && (
        <FormCheckbox
          label="Active Account"
          registration={register("isActive")}
        />
      )}

      <div className="pt-2">
        <SubmitButton isLoading={isLoading}>
          {initialData ? "Update Staff" : "Register Staff"}
        </SubmitButton>
      </div>
    </form>
  );
}
