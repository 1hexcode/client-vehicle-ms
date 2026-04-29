import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Vendor } from "@/types";
import { FormInput, SubmitButton } from "@/components/ui/FormElements";

const vendorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  contactPerson: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  address: z.string().optional(),
  openingBalance: z.number().min(0, "Opening balance cannot be negative"),
});

type VendorFormValues = z.infer<typeof vendorSchema>;

interface VendorFormProps {
  initialData?: Vendor;
  onSubmit: (data: VendorFormValues) => void;
  isLoading?: boolean;
}

export default function VendorForm({
  initialData,
  onSubmit,
  isLoading,
}: VendorFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VendorFormValues>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      name: initialData?.name || "",
      contactPerson: initialData?.contactPerson || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      address: initialData?.address || "",
      openingBalance: initialData?.openingBalance || 0,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Vendor Name"
          required
          registration={register("name")}
          error={errors.name?.message}
          placeholder="e.g., Auto Parts Inc."
        />

        <FormInput
          label="Contact Person"
          registration={register("contactPerson")}
          error={errors.contactPerson?.message}
          placeholder="e.g., John Doe"
        />

        <FormInput
          label="Email"
          type="email"
          registration={register("email")}
          error={errors.email?.message}
          placeholder="contact@autoparts.com"
        />

        <FormInput
          label="Phone Number"
          required
          registration={register("phone")}
          error={errors.phone?.message}
          placeholder="+1 234 567 890"
        />

        <div className="md:col-span-2">
          <FormInput
            label="Address"
            registration={register("address")}
            error={errors.address?.message}
            placeholder="123 Main St, City"
          />
        </div>

        <div className="md:col-span-2">
          <FormInput
            label="Opening Balance (Rs.)"
            type="number"
            step="0.01"
            registration={register("openingBalance", { valueAsNumber: true })}
            error={errors.openingBalance?.message}
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <SubmitButton isLoading={isLoading}>
          {initialData ? "Update Vendor" : "Create Vendor"}
        </SubmitButton>
      </div>
    </form>
  );
}
