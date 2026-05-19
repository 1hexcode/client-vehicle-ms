"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  FormSelect,
  FormCheckbox,
  FormTextarea,
  SubmitButton,
} from "@/components/ui/FormElements";

export type ReminderFrequency = "Daily" | "Weekly" | "Monthly";

const schema = z
  .object({
    frequency: z.enum(["Daily", "Weekly", "Monthly"]),
    hour: z.number().int().min(0).max(23),
    minute: z.number().int().min(0).max(59),
    dayOfWeek: z.number().int().min(0).max(6).nullable().optional(),
    dayOfMonth: z.number().int().min(1).max(28).nullable().optional(),
    isEnabled: z.boolean(),
    customMessage: z.string().max(1000, "Keep message under 1000 characters").optional(),
  })
  .superRefine((val, ctx) => {
    if (val.frequency === "Weekly" && (val.dayOfWeek === null || val.dayOfWeek === undefined)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["dayOfWeek"], message: "Required for weekly schedules" });
    }
    if (val.frequency === "Monthly" && (val.dayOfMonth === null || val.dayOfMonth === undefined)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["dayOfMonth"], message: "Required for monthly schedules" });
    }
  });

export type ReminderScheduleFormValues = z.infer<typeof schema>;

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => ({
  value: String(i),
  label: i.toString().padStart(2, "0"),
}));
const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, i) => ({
  value: String(i),
  label: i.toString().padStart(2, "0"),
}));
const DAY_OF_WEEK_OPTIONS = [
  { value: "0", label: "Sunday" },
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
];
const DAY_OF_MONTH_OPTIONS = Array.from({ length: 28 }, (_, i) => ({
  value: String(i + 1),
  label: String(i + 1),
}));
const FREQUENCY_OPTIONS = [
  { value: "Daily", label: "Daily" },
  { value: "Weekly", label: "Weekly" },
  { value: "Monthly", label: "Monthly" },
];

interface ReminderScheduleFormProps {
  initialData: ReminderScheduleFormValues;
  onSubmit: (data: ReminderScheduleFormValues) => Promise<void>;
  isLoading?: boolean;
}

export default function ReminderScheduleForm({
  initialData,
  onSubmit,
  isLoading,
}: ReminderScheduleFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ReminderScheduleFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialData,
  });

  useEffect(() => {
    reset(initialData);
  }, [initialData, reset]);

  const frequency = watch("frequency");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 text-zinc-900 dark:text-white">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormSelect
          label="Frequency"
          required
          options={FREQUENCY_OPTIONS}
          registration={register("frequency")}
          error={errors.frequency?.message}
        />
        <FormSelect
          label="Hour (24h)"
          required
          options={HOUR_OPTIONS}
          registration={register("hour", { valueAsNumber: true })}
          error={errors.hour?.message}
        />
        <FormSelect
          label="Minute"
          required
          options={MINUTE_OPTIONS}
          registration={register("minute", { valueAsNumber: true })}
          error={errors.minute?.message}
        />
      </div>

      {frequency === "Weekly" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormSelect
            label="Day of Week"
            required
            options={DAY_OF_WEEK_OPTIONS}
            registration={register("dayOfWeek", { valueAsNumber: true })}
            error={errors.dayOfWeek?.message}
          />
        </div>
      )}

      {frequency === "Monthly" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormSelect
            label="Day of Month (1-28)"
            required
            options={DAY_OF_MONTH_OPTIONS}
            registration={register("dayOfMonth", { valueAsNumber: true })}
            error={errors.dayOfMonth?.message}
          />
        </div>
      )}

      <FormTextarea
        label="Custom Message"
        rows={3}
        placeholder="Optional message appended to the reminder email (e.g. 'Late payments incur a 2% monthly fee.')"
        registration={register("customMessage")}
        error={errors.customMessage?.message}
      />

      <div className="pt-1">
        <FormCheckbox label="Enabled" registration={register("isEnabled")} />
      </div>

      <div className="pt-2">
        <SubmitButton isLoading={isLoading}>Save Schedule</SubmitButton>
      </div>
    </form>
  );
}
