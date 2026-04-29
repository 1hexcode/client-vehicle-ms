"use client";

import React from "react";
import { UseFormRegisterReturn } from "react-hook-form";
import { cn } from "@/lib/utils";

// ─── FormInput ──────────────────────────────────────────────
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  registration?: UseFormRegisterReturn;
  required?: boolean;
}

export function FormInput({
  label,
  error,
  registration,
  required,
  className,
  ...props
}: FormInputProps) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label} {required && <span className="text-orange-500">*</span>}
      </label>
      <input
        {...registration}
        {...props}
        className={cn(
          "w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder-zinc-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed",
          error && "border-red-400 dark:border-red-600 focus:ring-red-500",
          className
        )}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ─── FormSelect ─────────────────────────────────────────────
interface SelectOption {
  value: string;
  label: string;
}

interface FormSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  registration?: UseFormRegisterReturn;
  required?: boolean;
  options: SelectOption[];
  placeholder?: string;
}

export function FormSelect({
  label,
  error,
  registration,
  required,
  options,
  placeholder = "Select an option",
  className,
  ...props
}: FormSelectProps) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label} {required && <span className="text-orange-500">*</span>}
      </label>
      <select
        {...registration}
        {...props}
        className={cn(
          "w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed",
          error && "border-red-400 dark:border-red-600 focus:ring-red-500",
          className
        )}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ─── FormTextarea ───────────────────────────────────────────
interface FormTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  registration?: UseFormRegisterReturn;
  required?: boolean;
}

export function FormTextarea({
  label,
  error,
  registration,
  required,
  className,
  ...props
}: FormTextareaProps) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label} {required && <span className="text-orange-500">*</span>}
      </label>
      <textarea
        {...registration}
        {...props}
        className={cn(
          "w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder-zinc-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all disabled:opacity-50 resize-y",
          error && "border-red-400 dark:border-red-600 focus:ring-red-500",
          className
        )}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ─── FormCheckbox ───────────────────────────────────────────
interface FormCheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  registration?: UseFormRegisterReturn;
}

export function FormCheckbox({
  label,
  error,
  registration,
  ...props
}: FormCheckboxProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        {...registration}
        {...props}
        className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 text-orange-600 focus:ring-orange-500 bg-zinc-50 dark:bg-zinc-900"
      />
      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </label>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ─── SubmitButton ───────────────────────────────────────────
interface SubmitButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  children: React.ReactNode;
}

export function SubmitButton({
  isLoading,
  children,
  className,
  ...props
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className={cn(
        "px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]",
        className
      )}
      {...props}
    >
      {isLoading && (
        <svg
          className="w-5 h-5 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
