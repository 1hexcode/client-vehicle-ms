"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FormInput, FormSelect, FormTextarea, SubmitButton } from "@/components/ui/FormElements";
import { User, Vehicle } from "@/types";

const schema = z.object({
  customerId: z.string().min(1, "Please select a customer"),
  vehicleId: z.string().min(1, "Please select a vehicle"),
  serviceType: z.string().min(2, "Service type required"),
  requestedAt: z.string().min(1, "Date & time required"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface AppointmentFormProps {
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
  customers: User[];
  vehicles: Vehicle[];
  initialData?: Partial<FormValues>;
}

export default function AppointmentForm({
  onSubmit, isLoading, customers, vehicles, initialData,
}: AppointmentFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialData || {},
  });

  const selectedCustomerId = watch("customerId");
  const customerVehicles = vehicles.filter((v) => v.customerId === selectedCustomerId);

  const handleFormSubmit = (data: FormValues) => {
    return onSubmit({
      ...data,
      requestedAt: new Date(data.requestedAt).toISOString(),
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <FormSelect
        label="Customer" required
        registration={register("customerId")}
        error={errors.customerId?.message}
        options={customers.map((c) => ({ value: c.id, label: `${c.fullName} - ${c.phoneNumber}` }))}
        placeholder="Select a customer"
      />

      <FormSelect
        label="Vehicle" required
        registration={register("vehicleId")}
        error={errors.vehicleId?.message}
        options={customerVehicles.map((v) => ({
          value: v.id,
          label: `${v.vehicleNumber}${v.make ? ` - ${v.make} ${v.model || ""}` : ""}`,
        }))}
        placeholder={selectedCustomerId ? "Select vehicle" : "Select customer first"}
        disabled={!selectedCustomerId || customerVehicles.length === 0}
      />

      <FormInput
        label="Service Type" required
        registration={register("serviceType")}
        error={errors.serviceType?.message}
        placeholder="e.g. Oil Change, Brake Inspection"
      />

      <FormInput
        label="Requested Date & Time" required
        type="datetime-local"
        registration={register("requestedAt")}
        error={errors.requestedAt?.message}
      />

      <FormTextarea
        label="Notes"
        registration={register("notes")}
        error={errors.notes?.message}
        placeholder="Any additional details or instructions..."
        rows={3}
      />

      <div className="flex justify-end pt-2">
        <SubmitButton isLoading={isLoading}>
          {initialData ? "Update Appointment" : "Book Appointment"}
        </SubmitButton>
      </div>
    </form>
  );
}
