"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "@/lib/api";
import { HotDeal, Part, ApiResponse } from "@/types";
import {
  FormInput,
  FormCheckbox,
  SubmitButton,
} from "@/components/ui/FormElements";
import { Search } from "lucide-react";

const schema = z.object({
  partId: z.string().uuid("Select a valid part"),
  dealPrice: z.number().positive("Deal price must be > 0").min(0.01),
  startsAt: z.string().min(1, "Start date is required"),
  endsAt: z.string().min(1, "End date is required"),
  isActive: z.boolean(),
}).refine((d) => new Date(d.endsAt) > new Date(d.startsAt), {
  message: "End must be after start",
  path: ["endsAt"],
});

type FormValues = z.infer<typeof schema>;

function toLocalInput(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toIso(local: string): string {
  return new Date(local).toISOString();
}

interface HotDealFormProps {
  initialData?: HotDeal;
  onSubmit: (payload: {
    partId: string;
    dealPrice: number;
    startsAt: string;
    endsAt: string;
    isActive: boolean;
  }) => Promise<void>;
  onCancel?: () => void;
  isLoading: boolean;
}

export default function HotDealForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}: HotDealFormProps) {
  const [parts, setParts] = useState<Part[]>([]);
  const [partsLoading, setPartsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res: ApiResponse<Part[]> = await api.get("/api/Parts");
        if (!cancelled) {
          const list = Array.isArray(res?.data) ? res.data : [];
          setParts(list.filter((p) => p.isActive !== false));
        }
      } catch {
        if (!cancelled) setParts([]);
      } finally {
        if (!cancelled) setPartsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const defaultStart = toLocalInput(initialData?.startsAt) || toLocalInput(new Date().toISOString());
  const defaultEnd =
    toLocalInput(initialData?.endsAt) ||
    toLocalInput(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString());

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      partId: initialData?.partId || "",
      dealPrice: initialData?.dealPrice ?? 0,
      startsAt: defaultStart,
      endsAt: defaultEnd,
      isActive: initialData?.isActive ?? true,
    },
  });

  const selectedPartId = watch("partId");
  const selectedPart = useMemo(
    () => parts.find((p) => p.id === selectedPartId),
    [parts, selectedPartId],
  );

  const filteredParts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return parts.slice(0, 25);
    return parts
      .filter((p) =>
        `${p.name} ${p.sku} ${p.categoryName ?? ""}`.toLowerCase().includes(q),
      )
      .slice(0, 50);
  }, [parts, search]);

  const dealPrice = watch("dealPrice");
  const computedDiscount =
    selectedPart && dealPrice > 0 && selectedPart.unitPrice > dealPrice
      ? Math.round(((selectedPart.unitPrice - dealPrice) / selectedPart.unitPrice) * 100)
      : null;

  const submit = handleSubmit(async (v) => {
    await onSubmit({
      partId: v.partId,
      dealPrice: v.dealPrice,
      startsAt: toIso(v.startsAt),
      endsAt: toIso(v.endsAt),
      isActive: v.isActive,
    });
  });

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Part <span className="text-orange-500">*</span>
        </label>
        <input type="hidden" {...register("partId")} />

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={partsLoading ? "Loading parts..." : "Search part by name, SKU, or category…"}
            disabled={partsLoading}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder-zinc-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        {selectedPart && (
          <div className="text-xs text-zinc-500 mt-1 px-1">
            Selected: <span className="font-semibold text-zinc-800 dark:text-zinc-200">{selectedPart.name}</span>
            {selectedPart.sku && <> · SKU {selectedPart.sku}</>}
            {" · "}List price Rs.{selectedPart.unitPrice.toLocaleString()}
          </div>
        )}

        <div className="max-h-48 overflow-y-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 divide-y divide-zinc-100 dark:divide-zinc-800">
          {partsLoading ? (
            <div className="px-3 py-4 text-sm text-zinc-500 text-center">Loading parts…</div>
          ) : filteredParts.length === 0 ? (
            <div className="px-3 py-4 text-sm text-zinc-500 text-center">No matching parts.</div>
          ) : (
            filteredParts.map((p) => {
              const active = p.id === selectedPartId;
              return (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setValue("partId", p.id, { shouldValidate: true })}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-left text-sm transition-colors ${
                    active
                      ? "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300"
                      : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  <span className="truncate">
                    <span className="font-semibold">{p.name}</span>
                    {p.sku && <span className="text-zinc-500"> · {p.sku}</span>}
                  </span>
                  <span className="text-zinc-500 shrink-0">Rs.{p.unitPrice.toLocaleString()}</span>
                </button>
              );
            })
          )}
        </div>
        {errors.partId && <p className="text-xs text-red-500">{errors.partId.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Deal Price (Rs.)"
          required
          type="number"
          step="0.01"
          min="0.01"
          registration={register("dealPrice", { valueAsNumber: true })}
          error={errors.dealPrice?.message}
          placeholder="0.00"
        />
        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Discount
          </label>
          <div className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/60 text-zinc-700 dark:text-zinc-300 text-sm">
            {computedDiscount !== null ? `${computedDiscount}% off list price` : "—"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Starts At"
          required
          type="datetime-local"
          registration={register("startsAt")}
          error={errors.startsAt?.message}
        />
        <FormInput
          label="Ends At"
          required
          type="datetime-local"
          registration={register("endsAt")}
          error={errors.endsAt?.message}
        />
      </div>

      <FormCheckbox label="Active" registration={register("isActive")} />

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <SubmitButton isLoading={isLoading}>
          {initialData ? "Update Hot Deal" : "Create Hot Deal"}
        </SubmitButton>
      </div>
    </form>
  );
}
