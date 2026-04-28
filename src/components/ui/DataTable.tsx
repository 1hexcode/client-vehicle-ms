"use client";

import React from "react";
import { Search, RefreshCw, Loader2, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Column Definition ─────────────────────────────────────
export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
}

// ─── DataTable Props ────────────────────────────────────────
interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  keyExtractor: (row: T) => string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  onRefresh?: () => void;
  emptyIcon?: LucideIcon;
  emptyMessage?: string;
  headerActions?: React.ReactNode;
}

export default function DataTable<T>({
  columns,
  data,
  loading = false,
  keyExtractor,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  onRefresh,
  emptyIcon: EmptyIcon,
  emptyMessage = "No records found.",
  headerActions,
}: DataTableProps<T>) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      {/* Toolbar */}
      {(onSearchChange || onRefresh || headerActions) && (
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex flex-col md:flex-row gap-4 items-center justify-between">
          {onSearchChange && (
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchValue ?? ""}
                onChange={(e) => onSearchChange(e.target.value)}
                suppressHydrationWarning
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:ring-2 focus:ring-orange-500 outline-none transition-all text-sm"
              />
            </div>
          )}
          <div className="flex items-center gap-2">
            {headerActions}
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title="Refresh"
              >
                <RefreshCw
                  className={cn("w-4 h-4", loading && "animate-spin")}
                />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-zinc-50 dark:bg-zinc-950/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-6 py-3.5 font-semibold text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider",
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <Loader2 className="w-7 h-7 animate-spin mx-auto text-orange-500" />
                  <p className="text-zinc-500 mt-2 text-sm">Loading...</p>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-16 text-center text-zinc-500"
                >
                  <div className="flex flex-col items-center gap-2">
                    {EmptyIcon && (
                      <EmptyIcon className="w-10 h-10 text-zinc-300 dark:text-zinc-700" />
                    )}
                    <p className="text-sm">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={keyExtractor(row)}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn("px-6 py-4", col.className)}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
