import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Vendor } from "@/types";

const vendorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  contactPerson: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().optional(),
  openingBalance: z.coerce.number().min(0, "Opening balance cannot be negative"),
});

type VendorFormValues = z.infer<typeof vendorSchema>;

interface VendorFormProps {
  initialData?: Vendor;
  onSubmit: (data: VendorFormValues) => void;
  isLoading?: boolean;
}

export default function VendorForm({ initialData, onSubmit, isLoading }: VendorFormProps) {
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
        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Vendor Name *
          </label>
          <input
            {...register("name")}
            className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
            placeholder="e.g., Auto Parts Inc."
          />
          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Contact Person
          </label>
          <input
            {...register("contactPerson")}
            className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
            placeholder="e.g., John Doe"
          />
          {errors.contactPerson && <p className="text-xs text-red-500">{errors.contactPerson.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Email
          </label>
          <input
            {...register("email")}
            type="email"
            className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
            placeholder="contact@autoparts.com"
          />
          {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Phone Number *
          </label>
          <input
            {...register("phone")}
            className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
            placeholder="+1 234 567 890"
          />
          {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
        </div>

        <div className="space-y-1 md:col-span-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Address
          </label>
          <input
            {...register("address")}
            className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
            placeholder="123 Main St, City"
          />
          {errors.address && <p className="text-xs text-red-500">{errors.address.message}</p>}
        </div>

        <div className="space-y-1 md:col-span-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Opening Balance (Rs.)
          </label>
          <input
            {...register("openingBalance")}
            type="number"
            step="0.01"
            className="w-full px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
            placeholder="0.00"
          />
          {errors.openingBalance && <p className="text-xs text-red-500">{errors.openingBalance.message}</p>}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
        >
          {isLoading ? "Saving..." : initialData ? "Update Vendor" : "Create Vendor"}
        </button>
      </div>
    </form>
  );
}
