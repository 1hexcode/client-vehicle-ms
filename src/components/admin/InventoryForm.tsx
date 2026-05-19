"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ImagePlus, Loader2, X, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";
import { Part, PartCategory, Vendor } from "@/types";
import { FormInput, FormSelect, FormTextarea, SubmitButton } from "@/components/ui/FormElements";
import { uploadImage } from "@/lib/api";

const inventorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  sku: z.string().min(3, "SKU must be at least 3 characters"),
  categoryId: z.string().min(1, "Please select a category"),
  vendorId: z.string().min(1, "Please select a vendor"),
  description: z.string().optional(),
  imageUrl: z.string().optional().nullable(),
  costPrice: z.number().min(0, "Cost price cannot be negative"),
  unitPrice: z.number().min(0, "Unit price cannot be negative"),
  stockQuantity: z.number().int().min(0, "Stock cannot be negative"),
  reorderLevel: z.number().int().min(0, "Reorder level cannot be negative"),
  isActive: z.boolean(),
});

type InventoryFormValues = z.infer<typeof inventorySchema>;

interface InventoryFormProps {
  initialData?: Part;
  categories: PartCategory[];
  vendors: Vendor[];
  onSubmit: (data: InventoryFormValues) => Promise<void>;
  isLoading: boolean;
}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export default function InventoryForm({
  initialData,
  categories,
  vendors,
  onSubmit,
  isLoading,
}: InventoryFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<InventoryFormValues>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      name: initialData?.name || "",
      sku: initialData?.sku || "",
      categoryId: initialData?.categoryId || "",
      vendorId: initialData?.vendorId || "",
      description: initialData?.description || "",
      imageUrl: initialData?.imageUrl || "",
      costPrice: initialData?.costPrice || 0,
      unitPrice: initialData?.unitPrice || 0,
      stockQuantity: initialData?.stockQuantity || 0,
      reorderLevel: initialData?.reorderLevel || 10,
      isActive: initialData?.isActive ?? true,
    },
  });

  // Hidden registration so the value flows through react-hook-form.
  register("imageUrl");
  const imageUrl = watch("imageUrl") || "";

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const triggerFilePicker = () => fileInputRef.current?.click();

  const uploadFile = async (file: File) => {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Use a JPG, PNG, WEBP, or GIF image");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("Image must be 5 MB or smaller");
      return;
    }

    try {
      setUploading(true);
      const url = await uploadImage(file, "parts");
      if (!url) throw new Error("Server didn't return an image URL");
      setValue("imageUrl", url, { shouldDirty: true });
      toast.success("Image uploaded");
    } catch (err: any) {
      toast.error(err?.message || "Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset the input value so picking the same file twice still fires onChange.
    if (e.target) e.target.value = "";
    if (!file) return;
    await uploadFile(file);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of Array.from(items)) {
      if (item.kind === "file" && item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault();
          void uploadFile(file);
          return;
        }
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) void uploadFile(file);
  };

  const clearImage = () => {
    setValue("imageUrl", "", { shouldDirty: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Image picker */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Item Image
        </label>
        <div className="flex items-start gap-4">
          <div
            tabIndex={0}
            role="button"
            aria-label={imageUrl ? "Item image — paste, drop, or click to replace" : "Item image — paste, drop, or click to upload"}
            onClick={triggerFilePicker}
            onPaste={handlePaste}
            onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; }}
            onDrop={handleDrop}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                triggerFilePicker();
              }
            }}
            className="group relative w-28 h-28 shrink-0 rounded-xl overflow-hidden border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center cursor-pointer hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/10 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
          >
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt="Part preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageIcon className="w-7 h-7 text-zinc-400 group-hover:text-orange-500 transition-colors" />
            )}
            {uploading && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              </div>
            )}
          </div>

          <div className="flex-1 space-y-2">
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Click, <kbd className="px-1 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-[10px] font-mono">paste</kbd>, or drop. JPG/PNG/WEBP/GIF up to 5 MB.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={triggerFilePicker}
                disabled={uploading}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading…
                  </>
                ) : (
                  <>
                    <ImagePlus className="w-4 h-4" />
                    {imageUrl ? "Replace image" : "Upload image"}
                  </>
                )}
              </button>
              {imageUrl && !uploading && (
                <button
                  type="button"
                  onClick={clearImage}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-sm font-medium transition-colors"
                >
                  <X className="w-4 h-4" />
                  Remove
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_IMAGE_TYPES.join(",")}
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Part Name"
          required
          registration={register("name")}
          error={errors.name?.message}
          placeholder="e.g., Brake Pad - Front"
        />

        <FormInput
          label="SKU / Part Number"
          required
          registration={register("sku")}
          error={errors.sku?.message}
          placeholder="e.g., BRK-001"
        />

        <FormSelect
          label="Category"
          required
          registration={register("categoryId")}
          error={errors.categoryId?.message}
          options={categories.map(c => ({ value: c.id, label: c.name }))}
          placeholder="Select a category"
        />

        <FormSelect
          label="Vendor"
          required
          registration={register("vendorId")}
          error={errors.vendorId?.message}
          options={vendors.map(v => ({ value: v.id, label: v.name }))}
          placeholder="Select a vendor"
        />

        <FormInput
          label="Reorder Level (Alert at)"
          type="number"
          registration={register("reorderLevel", { valueAsNumber: true })}
          error={errors.reorderLevel?.message}
        />

        <FormInput
          label="Cost Price (Rs.)"
          required
          type="number"
          step="0.01"
          registration={register("costPrice", { valueAsNumber: true })}
          error={errors.costPrice?.message}
        />

        <FormInput
          label="Unit Price (Selling Rs.)"
          required
          type="number"
          step="0.01"
          registration={register("unitPrice", { valueAsNumber: true })}
          error={errors.unitPrice?.message}
        />

        <FormInput
          label="Initial Stock Quantity"
          type="number"
          registration={register("stockQuantity", { valueAsNumber: true })}
          error={errors.stockQuantity?.message}
        />

        <div className="md:col-span-2">
          <FormTextarea
            label="Description"
            registration={register("description")}
            error={errors.description?.message}
            placeholder="Optional details about the part..."
            rows={3}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          {...register("isActive")}
          className="w-4 h-4 rounded border-zinc-300 text-orange-600 focus:ring-orange-500"
        />
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Active Status
        </label>
      </div>

      <div className="flex justify-end pt-4">
        <SubmitButton isLoading={isLoading || uploading}>
          {initialData ? "Update Part" : "Create Part"}
        </SubmitButton>
      </div>
    </form>
  );
}
