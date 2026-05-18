"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FormInput, SubmitButton } from "@/components/ui/FormElements";

const schema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    newPasswordVerify: z.string().min(1, "Please confirm the new password"),
  })
  .refine((d) => d.newPassword === d.newPasswordVerify, {
    message: "Passwords do not match",
    path: ["newPasswordVerify"],
  })
  .refine((d) => d.currentPassword !== d.newPassword, {
    message: "New password must differ from current password",
    path: ["newPassword"],
  });

export type ChangePasswordFormValues = z.infer<typeof schema>;

interface ChangePasswordFormProps {
  onSubmit: (data: ChangePasswordFormValues) => Promise<void>;
  isLoading?: boolean;
}

export default function ChangePasswordForm({ onSubmit, isLoading }: ChangePasswordFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { currentPassword: "", newPassword: "", newPasswordVerify: "" },
  });

  const submit = async (data: ChangePasswordFormValues) => {
    await onSubmit(data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <FormInput
        label="Current Password"
        type="password"
        required
        registration={register("currentPassword")}
        error={errors.currentPassword?.message}
        placeholder="Enter current password"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="New Password"
          type="password"
          required
          registration={register("newPassword")}
          error={errors.newPassword?.message}
          placeholder="Min 6 characters"
        />
        <FormInput
          label="Confirm New Password"
          type="password"
          required
          registration={register("newPasswordVerify")}
          error={errors.newPasswordVerify?.message}
          placeholder="Repeat new password"
        />
      </div>
      <div className="pt-2">
        <SubmitButton isLoading={isLoading}>Update Password</SubmitButton>
      </div>
    </form>
  );
}
