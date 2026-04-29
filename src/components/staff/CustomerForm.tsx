"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FormInput, FormSelect, SubmitButton } from "@/components/ui/FormElements";

const customerSchema = z.object({
  fullName: z.string().min(2, "Full name required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(10, "Phone number required"),
  address: z.string().min(3, "Address required"),
  password: z.string().min(6, "Min 6 characters").optional().or(z.literal("")),
  vehicleNumber: z.string().min(2, "Vehicle number required"),
  vehicleType: z.enum(["Bike", "Car", "Bus", "Auto", "Truck", "Jeep"]),
  make: z.string().optional(),
  model: z.string().optional(),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional().or(z.nan()),
  color: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
}

export default function CustomerForm({ onSubmit, isLoading }: CustomerFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: { vehicleType: "Car", year: new Date().getFullYear() },
  });

  const handleFormSubmit = (data: CustomerFormValues) => {
    // Clean up empty optional fields
    const payload = {
      ...data,
      password: data.password || undefined,
      year: isNaN(data.year as any) ? undefined : data.year,
    };
    return onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
      {/* Personal Info */}
      <div>
        <h3 className="text-sm font-bold text-orange-500 uppercase tracking-wider mb-3">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Full Name" required
            registration={register("fullName")}
            error={errors.fullName?.message}
            placeholder="Anurodh Prasain"
          />
          <FormInput
            label="Email Address" required type="email"
            registration={register("email")}
            error={errors.email?.message}
            placeholder="user@example.com"
          />
          <FormInput
            label="Phone Number" required
            registration={register("phoneNumber")}
            error={errors.phoneNumber?.message}
            placeholder="98XXXXXXXX"
          />
          <FormInput
            label="Address" required
            registration={register("address")}
            error={errors.address?.message}
            placeholder="Kathmandu, Nepal"
          />
          <div className="md:col-span-2">
            <FormInput
              label="Password" type="password"
              registration={register("password")}
              error={errors.password?.message}
              placeholder="Minimum 6 characters (default: Customer@123)"
            />
          </div>
        </div>
      </div>

      {/* Vehicle Details */}
      <div>
        <h3 className="text-sm font-bold text-orange-500 uppercase tracking-wider mb-3">Vehicle Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Vehicle Number" required
            registration={register("vehicleNumber")}
            error={errors.vehicleNumber?.message}
            placeholder="BA 1 PA 1234"
          />
          <FormSelect
            label="Vehicle Type" required
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
            label="Make (Brand)"
            registration={register("make")}
            error={errors.make?.message}
            placeholder="Toyota"
          />
          <FormInput
            label="Model"
            registration={register("model")}
            error={errors.model?.message}
            placeholder="Corolla"
          />
          <FormInput
            label="Year" type="number"
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

      <div className="flex justify-end pt-2">
        <SubmitButton isLoading={isLoading}>Register Customer</SubmitButton>
      </div>
    </form>
  );
}
