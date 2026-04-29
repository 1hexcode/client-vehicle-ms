"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FormInput, FormSelect, SubmitButton } from "@/components/ui/FormElements";

const customerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  // Vehicle Details
  vehicleNumber: z.string().min(4, "Vehicle number is required"),
  vehicleType: z.enum(["Bike", "Car", "Bus", "Auto", "Truck", "Jeep"]),
  make: z.string().min(2, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  color: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  onSubmit: (data: CustomerFormValues) => Promise<void>;
  isLoading: boolean;
  initialData?: any;
}

export default function CustomerForm({
  onSubmit,
  isLoading,
  initialData,
}: CustomerFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: initialData || {
      vehicleType: "Car",
      year: new Date().getFullYear(),
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white border-b border-zinc-800 pb-2">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Full Name"
            required
            registration={register("fullName")}
            error={errors.fullName?.message}
            placeholder="John Doe"
          />
          <FormInput
            label="Email Address"
            required
            type="email"
            registration={register("email")}
            error={errors.email?.message}
            placeholder="john@example.com"
          />
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
            placeholder="City, Country"
          />
          {!initialData && (
            <FormInput
              label="Password"
              type="password"
              required
              registration={register("password")}
              error={errors.password?.message}
              placeholder="******"
            />
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white border-b border-zinc-800 pb-2">Vehicle Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Vehicle Number"
            required
            registration={register("vehicleNumber")}
            error={errors.vehicleNumber?.message}
            placeholder="BA 1 PA 1234"
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
          <FormInput
            label="Make"
            required
            registration={register("make")}
            error={errors.make?.message}
            placeholder="Toyota"
          />
          <FormInput
            label="Model"
            required
            registration={register("model")}
            error={errors.model?.message}
            placeholder="Corolla"
          />
          <FormInput
            label="Year"
            type="number"
            registration={register("year", { valueAsNumber: true })}
            error={errors.year?.message}
          />
          <FormInput
            label="Color"
            registration={register("color")}
            error={errors.color?.message}
            placeholder="White"
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <SubmitButton isLoading={isLoading}>
          {initialData ? "Update Customer" : "Register Customer"}
        </SubmitButton>
      </div>
    </form>
  );
}
