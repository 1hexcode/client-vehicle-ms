"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Staff } from "@/types";
import { Loader2 } from "lucide-react";

const staffSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
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
    defaultValues: initialData ? {
      fullName: initialData.fullName,
      email: initialData.email,
      phoneNumber: initialData.phoneNumber,
      address: initialData.address,
      isActive: initialData.isActive,
    } : {
      isActive: true,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Full Name</label>
        <input
          {...register("fullName")}
          className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
          placeholder="John Doe"
        />
        {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Email Address</label>
        <input
          {...register("email")}
          disabled={!!initialData}
          className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-orange-500 outline-none transition-all disabled:opacity-50"
          placeholder="john@example.com"
        />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Phone Number</label>
          <input
            {...register("phoneNumber")}
            className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
            placeholder="98XXXXXXXX"
          />
          {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Address</label>
          <input
            {...register("address")}
            className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
            placeholder="Kathmandu, Nepal"
          />
          {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
        </div>
      </div>

      {!initialData && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Password</label>
            <input
              type="password"
              {...register("password")}
              className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Verify Password</label>
            <input
              type="password"
              {...register("passwordVerify")}
              className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
            />
            {errors.passwordVerify && <p className="text-red-500 text-xs mt-1">{errors.passwordVerify.message}</p>}
          </div>
        </div>
      )}

      {initialData && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            {...register("isActive")}
            id="isActive"
            className="w-4 h-4 rounded border-zinc-300 text-orange-600 focus:ring-orange-500"
          />
          <label htmlFor="isActive" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Active Account
          </label>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-semibold shadow-lg shadow-orange-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
        {initialData ? "Update Staff" : "Register Staff"}
      </button>
    </form>
  );
}
