"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Trash2, Package } from "lucide-react";
import { api } from "@/lib/api";
import { ApiResponse, Part, Vendor } from "@/types";
import { FormInput, FormSelect, FormTextarea, SubmitButton } from "@/components/ui/FormElements";

const itemSchema = z.object({
  vehiclePartId: z.string().min(1, "Select a part"),
  quantity: z.number({ message: "Required" }).min(1, "Min 1"),
  unitCost: z.number({ message: "Required" }).min(0.01, "Required"),
});

const invoiceSchema = z.object({
  vendorId: z.string().min(1, "Select a vendor"),
  receivedAt: z.string().min(1, "Required"),
  tax: z.number({ message: "Required" }).min(0, "Must be 0 or more"),
  notes: z.string().optional(),
  items: z.array(itemSchema).min(1, "Add at least one item"),
});

export type PurchaseInvoiceFormValues = z.infer<typeof invoiceSchema>;

interface PurchaseInvoiceFormProps {
  onSubmit: (data: PurchaseInvoiceFormValues) => Promise<void>;
  isLoading?: boolean;
}

const toLocalInput = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function PurchaseInvoiceForm({ onSubmit, isLoading }: PurchaseInvoiceFormProps) {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(true);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PurchaseInvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      vendorId: "",
      receivedAt: toLocalInput(new Date()),
      tax: 0,
      notes: "",
      items: [{ vehiclePartId: "", quantity: 1, unitCost: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const watchedItems = watch("items");
  const watchedTax = watch("tax");

  const subtotal = (watchedItems || []).reduce(
    (sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.unitCost) || 0),
    0
  );
  const taxAmount = Number(watchedTax) || 0;
  const grandTotal = subtotal + taxAmount;

  useEffect(() => {
    (async () => {
      try {
        const [vRes, pRes] = await Promise.allSettled([
          api.get("/api/Vendors") as Promise<ApiResponse<Vendor[]>>,
          api.get("/api/Parts") as Promise<ApiResponse<Part[]>>,
        ]);
        if (vRes.status === "fulfilled" && vRes.value.success && vRes.value.data) {
          setVendors(vRes.value.data.filter((v) => v.isActive));
        }
        if (pRes.status === "fulfilled" && pRes.value.success && pRes.value.data) {
          setParts(pRes.value.data.filter((p) => p.isActive));
        }
      } finally {
        setLoadingMeta(false);
      }
    })();
  }, []);

  const vendorOptions = vendors.map((v) => ({ value: v.id, label: v.name }));

  const handleSelectPart = (idx: number, partId: string) => {
    setValue(`items.${idx}.vehiclePartId`, partId);
    const part = parts.find((p) => p.id === partId);
    if (part && part.costPrice) {
      setValue(`items.${idx}.unitCost`, part.costPrice);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormSelect
          label="Vendor"
          required
          registration={register("vendorId")}
          error={errors.vendorId?.message}
          options={vendorOptions}
          placeholder={loadingMeta ? "Loading vendors..." : "Select a vendor"}
          disabled={loadingMeta}
        />
        <FormInput
          label="Received At"
          type="datetime-local"
          required
          registration={register("receivedAt")}
          error={errors.receivedAt?.message}
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Items <span className="text-orange-500">*</span>
          </label>
          <button
            type="button"
            onClick={() => append({ vehiclePartId: "", quantity: 1, unitCost: 0 })}
            className="flex items-center gap-1.5 text-xs font-semibold text-orange-500 hover:text-orange-400 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>

        <div className="rounded-2xl border border-zinc-200 dark:border-[#222] overflow-hidden bg-zinc-50 dark:bg-[#0F0F0F]">
          <div className="grid grid-cols-12 gap-2 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-200 dark:border-[#222] bg-white dark:bg-[#141414]">
            <div className="col-span-6">Part</div>
            <div className="col-span-2 text-right">Qty</div>
            <div className="col-span-2 text-right">Unit Cost</div>
            <div className="col-span-1 text-right">Total</div>
            <div className="col-span-1" />
          </div>

          {fields.map((field, idx) => {
            const item = watchedItems?.[idx];
            const lineTotal = (Number(item?.quantity) || 0) * (Number(item?.unitCost) || 0);
            const itemErr = errors.items?.[idx];
            return (
              <div
                key={field.id}
                className="grid grid-cols-12 gap-2 px-4 py-2.5 items-center border-b border-zinc-100 dark:border-[#1A1A1A] last:border-b-0"
              >
                <div className="col-span-6">
                  <Controller
                    control={control}
                    name={`items.${idx}.vehiclePartId`}
                    render={({ field: f }) => (
                      <select
                        value={f.value}
                        onChange={(e) => handleSelectPart(idx, e.target.value)}
                        disabled={loadingMeta}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-[#222] bg-white dark:bg-[#141414] text-sm text-zinc-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                      >
                        <option value="">{loadingMeta ? "Loading..." : "Select part"}</option>
                        {parts.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} {p.sku ? `(${p.sku})` : ""}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                  {itemErr?.vehiclePartId && (
                    <p className="text-[10px] text-red-500 mt-1">{itemErr.vehiclePartId.message}</p>
                  )}
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    min={1}
                    step={1}
                    {...register(`items.${idx}.quantity`, { valueAsNumber: true })}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-[#222] bg-white dark:bg-[#141414] text-sm text-right text-zinc-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  />
                  {itemErr?.quantity && (
                    <p className="text-[10px] text-red-500 mt-1 text-right">{itemErr.quantity.message}</p>
                  )}
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    {...register(`items.${idx}.unitCost`, { valueAsNumber: true })}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-[#222] bg-white dark:bg-[#141414] text-sm text-right text-zinc-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  />
                  {itemErr?.unitCost && (
                    <p className="text-[10px] text-red-500 mt-1 text-right">{itemErr.unitCost.message}</p>
                  )}
                </div>
                <div className="col-span-1 text-right text-sm font-semibold text-zinc-900 dark:text-white tabular-nums">
                  {lineTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => fields.length > 1 && remove(idx)}
                    disabled={fields.length === 1}
                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {errors.items && typeof errors.items.message === "string" && (
          <p className="text-xs text-red-500">{errors.items.message}</p>
        )}

        {!loadingMeta && parts.length === 0 && (
          <div className="flex items-center gap-2 text-xs text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
            <Package className="w-4 h-4" />
            No parts in inventory yet. Add parts before creating a purchase invoice.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <FormTextarea
            label="Notes"
            registration={register("notes")}
            error={errors.notes?.message}
            placeholder="Reference no, payment terms, etc."
            rows={3}
          />
        </div>
        <div className="space-y-3">
          <FormInput
            label="Tax (Rs.)"
            type="number"
            step="0.01"
            min={0}
            registration={register("tax", { valueAsNumber: true })}
            error={errors.tax?.message}
          />
          <div className="rounded-xl border border-zinc-200 dark:border-[#222] bg-zinc-50 dark:bg-[#0F0F0F] p-4 space-y-1.5">
            <div className="flex justify-between text-xs text-zinc-500">
              <span>Subtotal</span>
              <span className="tabular-nums">Rs. {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-xs text-zinc-500">
              <span>Tax</span>
              <span className="tabular-nums">Rs. {taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-zinc-200 dark:border-[#222]">
              <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Grand Total</span>
              <span className="text-base font-bold text-orange-500 tabular-nums">
                Rs. {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <SubmitButton isLoading={isLoading} className="w-full md:w-auto">
          Create Purchase Invoice
        </SubmitButton>
      </div>
    </form>
  );
}
