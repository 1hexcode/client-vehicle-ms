import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FormInput, FormSelect, FormTextarea, SubmitButton } from "@/components/ui/FormElements";

const paymentSchema = z.object({
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  type: z.enum(["Cash", "Card", "Online"]),
  receiptNo: z.string().optional(),
  attachmentUrl: z.string().optional(),
  notes: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface VendorPaymentFormProps {
  onSubmit: (data: PaymentFormValues) => void;
  isLoading?: boolean;
}

export default function VendorPaymentForm({ onSubmit, isLoading }: VendorPaymentFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      type: "Cash",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormInput
        label="Payment Amount (Rs.)"
        required
        type="number"
        step="0.01"
        registration={register("amount", { valueAsNumber: true })}
        error={errors.amount?.message}
        placeholder="0.00"
      />

      <FormSelect
        label="Payment Type"
        required
        registration={register("type")}
        error={errors.type?.message}
        options={[
          { value: "Cash", label: "Cash" },
          { value: "Card", label: "Card" },
          { value: "Online", label: "Online" },
        ]}
      />

      <FormInput
        label="Receipt Number (Optional)"
        registration={register("receiptNo")}
        error={errors.receiptNo?.message}
        placeholder="e.g. REC-12345"
      />

      <FormInput
        label="Attachment URL (Optional)"
        registration={register("attachmentUrl")}
        error={errors.attachmentUrl?.message}
        placeholder="https://..."
      />

      <FormTextarea
        label="Notes"
        registration={register("notes")}
        error={errors.notes?.message}
        rows={3}
        placeholder="Payment details or remarks..."
      />

      <div className="flex justify-end pt-4">
        <SubmitButton isLoading={isLoading}>
          Submit Payment
        </SubmitButton>
      </div>
    </form>
  );
}
