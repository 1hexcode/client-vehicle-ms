"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import toast from "react-hot-toast";
import {
  Mail,
  Play,
  Pencil,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar as CalendarIcon,
  RefreshCcw,
} from "lucide-react";
import { api } from "@/lib/api";
import { ApiResponse } from "@/types";
import ReminderScheduleForm, {
  ReminderFrequency,
  ReminderScheduleFormValues,
} from "@/components/admin/ReminderScheduleForm";

interface ReminderSchedule {
  jobKey: string;
  displayName?: string | null;
  description?: string | null;
  frequency: ReminderFrequency;
  hour: number;
  minute: number;
  dayOfWeek?: number | null;
  dayOfMonth?: number | null;
  isEnabled: boolean;
  customMessage?: string | null;
  cronExpression?: string | null;
  nextFireTimeUtc?: string | null;
  previousFireTimeUtc?: string | null;
}

const fetcher = (url: string) =>
  api.get(url).then((res) => {
    if (!res.success) throw new Error(res.message || "Failed to load reminder schedules");
    return res.data;
  });

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function formatScheduleSummary(s: ReminderSchedule) {
  const time = `${pad(s.hour)}:${pad(s.minute)}`;
  if (s.frequency === "Daily") return `Every day at ${time}`;
  if (s.frequency === "Weekly") {
    const day = s.dayOfWeek != null ? DAY_NAMES[s.dayOfWeek] : "—";
    return `Every ${day} at ${time}`;
  }
  if (s.frequency === "Monthly") {
    return `Day ${s.dayOfMonth ?? "—"} of every month at ${time}`;
  }
  return time;
}

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

function humanizeJobKey(key: string) {
  return key
    .replace(/[-_.]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function AdminRemindersPage() {
  const { data, error, isLoading, isValidating, mutate } = useSWR<ReminderSchedule[]>(
    "/api/reminder-schedules",
    fetcher,
  );

  useEffect(() => {
    if (error) toast.error(error.message || "Failed to load reminder schedules");
  }, [error]);

  const schedules = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
            <Mail className="w-8 h-8 text-orange-600" />
            Email Reminders
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Configure automated email reminder schedules. Adjust frequency and time, or trigger a job manually.
          </p>
        </div>
        <button
          onClick={() => mutate()}
          disabled={isValidating}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-[#222] bg-white dark:bg-[#141414] text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-[#1A1A1A] transition-all text-sm font-medium disabled:opacity-50"
        >
          <RefreshCcw className={`w-4 h-4 ${isValidating ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {isLoading && schedules.length === 0 ? (
        <SkeletonList />
      ) : schedules.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
          {schedules.map((schedule) => (
            <ScheduleCard
              key={schedule.jobKey}
              schedule={schedule}
              onUpdated={(updated) => {
                mutate(
                  (prev) =>
                    (prev || []).map((s) => (s.jobKey === updated.jobKey ? { ...s, ...updated } : s)),
                  false,
                );
                mutate();
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ScheduleCard({
  schedule,
  onUpdated,
}: {
  schedule: ReminderSchedule;
  onUpdated: (s: ReminderSchedule) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);

  const title = schedule.displayName?.trim() || humanizeJobKey(schedule.jobKey);

  const handleSave = async (values: ReminderScheduleFormValues) => {
    try {
      setSaving(true);
      const trimmedMessage = values.customMessage?.trim();
      const payload = {
        frequency: values.frequency,
        hour: values.hour,
        minute: values.minute,
        dayOfWeek: values.frequency === "Weekly" ? values.dayOfWeek ?? null : null,
        dayOfMonth: values.frequency === "Monthly" ? values.dayOfMonth ?? null : null,
        isEnabled: values.isEnabled,
        customMessage: trimmedMessage ? trimmedMessage : null,
      };
      const res: ApiResponse<ReminderSchedule> = await api.put(
        `/api/reminder-schedules/${encodeURIComponent(schedule.jobKey)}`,
        payload,
      );
      if (res.success) {
        toast.success(res.message || "Schedule updated");
        onUpdated(res.data ?? { ...schedule, ...payload });
        setEditing(false);
      } else {
        toast.error(res.message || "Failed to update schedule");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to update schedule");
    } finally {
      setSaving(false);
    }
  };

  const handleRunNow = async () => {
    try {
      setRunning(true);
      const res: ApiResponse<unknown> = await api.post(
        `/api/reminder-schedules/${encodeURIComponent(schedule.jobKey)}/run`,
        {},
      );
      if (res.success) {
        toast.success(res.message || "Reminder job triggered");
      } else {
        toast.error(res.message || "Failed to trigger job");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to trigger job");
    } finally {
      setRunning(false);
    }
  };

  const formInitial: ReminderScheduleFormValues = {
    frequency: schedule.frequency,
    hour: schedule.hour,
    minute: schedule.minute,
    dayOfWeek: schedule.dayOfWeek ?? null,
    dayOfMonth: schedule.dayOfMonth ?? null,
    isEnabled: schedule.isEnabled,
    customMessage: schedule.customMessage ?? "",
  };

  return (
    <div className="bg-white dark:bg-[#0F0F0F] rounded-2xl border border-zinc-200 dark:border-[#222] p-6 shadow-xl shadow-black/5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{title}</h3>
            <StatusBadge enabled={schedule.isEnabled} />
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">{schedule.jobKey}</p>
          {schedule.description && (
            <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-1">{schedule.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRunNow}
            disabled={running}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium transition-all disabled:opacity-50"
          >
            <Play className="w-4 h-4" />
            {running ? "Triggering..." : "Run now"}
          </button>
          <button
            onClick={() => setEditing((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 dark:border-[#222] bg-white dark:bg-[#141414] text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-[#1A1A1A] text-sm font-medium transition-all"
          >
            <Pencil className="w-4 h-4" />
            {editing ? "Cancel" : "Edit"}
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <InfoTile icon={Clock} label="Schedule" value={formatScheduleSummary(schedule)} />
        <InfoTile icon={CalendarIcon} label="Frequency" value={schedule.frequency} />
        <InfoTile icon={CalendarIcon} label="Next run" value={formatDate(schedule.nextFireTimeUtc)} />
        <InfoTile icon={Clock} label="Last run" value={formatDate(schedule.previousFireTimeUtc)} />
      </div>

      {schedule.cronExpression && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-3">
          Cron: <span className="font-mono text-zinc-700 dark:text-zinc-300">{schedule.cronExpression}</span>
        </p>
      )}

      {schedule.customMessage && (
        <div className="mt-4 rounded-xl border border-zinc-100 dark:border-[#1f1f1f] bg-zinc-50 dark:bg-[#141414] px-4 py-3">
          <div className="text-[11px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mb-1">
            Custom message
          </div>
          <p className="text-sm text-zinc-800 dark:text-zinc-100 whitespace-pre-wrap">
            {schedule.customMessage}
          </p>
        </div>
      )}

      {editing && (
        <div className="border-t border-zinc-100 dark:border-[#222] mt-6 pt-6">
          <ReminderScheduleForm
            initialData={formInitial}
            onSubmit={handleSave}
            isLoading={saving}
          />
        </div>
      )}
    </div>
  );
}

function StatusBadge({ enabled }: { enabled: boolean }) {
  return enabled ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
      <CheckCircle2 className="w-3 h-3" /> Enabled
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
      <XCircle className="w-3 h-3" /> Disabled
    </span>
  );
}

function InfoTile({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-100 dark:border-[#1f1f1f] bg-zinc-50 dark:bg-[#141414] px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </div>
      <div className="text-sm font-medium text-zinc-800 dark:text-zinc-100 mt-0.5 truncate">
        {value}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-white dark:bg-[#0F0F0F] rounded-2xl border border-dashed border-zinc-200 dark:border-[#222] p-12 text-center">
      <Mail className="w-10 h-10 text-zinc-400 mx-auto mb-3" />
      <p className="text-zinc-700 dark:text-zinc-200 font-medium">No reminder schedules configured</p>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
        Schedules registered by the server will appear here.
      </p>
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="space-y-4">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="bg-white dark:bg-[#0F0F0F] rounded-2xl border border-zinc-200 dark:border-[#222] p-6 animate-pulse"
        >
          <div className="h-5 w-48 bg-zinc-100 dark:bg-zinc-800 rounded mb-3" />
          <div className="h-3 w-72 bg-zinc-100 dark:bg-zinc-800 rounded mb-6" />
          <div className="grid grid-cols-4 gap-3">
            <div className="h-14 bg-zinc-100 dark:bg-zinc-800 rounded-xl" />
            <div className="h-14 bg-zinc-100 dark:bg-zinc-800 rounded-xl" />
            <div className="h-14 bg-zinc-100 dark:bg-zinc-800 rounded-xl" />
            <div className="h-14 bg-zinc-100 dark:bg-zinc-800 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}
