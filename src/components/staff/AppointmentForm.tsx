"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FormInput, FormSelect, FormTextarea, SubmitButton } from "@/components/ui/FormElements";
import { User, Vehicle } from "@/types";

const appointmentSchema = z.object({
  customerId: z.string().min(1, "Please select a customer"),
  vehicleId: z.string().min(1, "Please select a vehicle"),
  serviceType: z.string().min(2, "Service type is required"),
  requestedAt: z.string().min(1, "Date and time are required"),
  status: z.string().optional(),
  notes: z.string().optional(),
});

type AppointmentFormValues = z.infer<typeof appointmentSchema>;

interface AppointmentFormProps {
  onSubmit: (data: AppointmentFormValues) => Promise<void>;
  isLoading: boolean;
  customers: User[];
  vehicles: Vehicle[];
  initialData?: any;
}

export default function AppointmentForm({
  onSubmit,
  isLoading,
  customers,
  vehicles,
  initialData,
}: AppointmentFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: initialData || {
      status: "Pending",
    },
  });

  const selectedCustomerId = watch("customerId");
  const filteredVehicles = vehicles.filter(v => v.customerId === selectedCustomerId);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormSelect
        label="Select Customer"
        required
        registration={register("customerId")}
        error={errors.customerId?.message}
        options={customers.map(c => ({ value: c.id, label: `${c.fullName} (${c.phoneNumber})` }))}
        placeholder="Choose a customer"
      />

      <FormSelect
        label="Select Vehicle"
        required
        registration={register("vehicleId")}
        error={errors.vehicleId?.message}
        options={filteredVehicles.map(v => ({ value: v.id, label: `${v.vehicleNumber} - ${v.make} ${v.model}` }))}
        placeholder={selectedCustomerId ? "Choose a vehicle" : "Select customer first"}
        disabled={!selectedCustomerId}
      />

      <FormInput
        label="Service Type"
        required
        registration={register("serviceType")}
        error={errors.serviceType?.message}
        placeholder="e.g., Oil Change, Engine Repair"
      />

      <FormInput
        label="Requested Date & Time"
        required
        type="datetime-local"
        registration={register("requestedAt")}
        error={errors.requestedAt?.message}
      />

      <FormSelect
        label="Status"
        registration={register("status")}
        error={errors.status?.message}
        options={[
          { value: "Pending", label: "Pending" },
          { value: "Confirmed", label: "Confirmed" },
          { value: "Completed", label: "Completed" },
          { value: "Cancelled", label: "Cancelled" },
        ]}
      />

      <FormTextarea
        label="Notes"
        registration={register("notes")}
        error={errors.notes?.message}
        placeholder="Any specific instructions or complaints..."
        rows={3}
      />

      <div className="flex justify-end pt-4">
        <SubmitButton isLoading={isLoading}>
          {initialData ? "Update Appointment" : "Book Appointment"}
        </SubmitButton>
      </div>
    </form>
  );
}
