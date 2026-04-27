"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { AlertTriangle, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: "destructive" | "warning" | "info"
  isLoading?: boolean
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "destructive",
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl animate-in zoom-in-95 slide-in-from-left-1/2 slide-in-from-top-48 duration-300 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full",
                variant === "destructive" && "bg-red-100 text-red-600 dark:bg-red-900/30",
                variant === "warning" && "bg-amber-100 text-amber-600 dark:bg-amber-900/30",
                variant === "info" && "bg-blue-100 text-blue-600 dark:bg-blue-900/30"
              )}>
                <AlertTriangle className="h-6 w-6" />
              </div>
              <DialogPrimitive.Title className="text-xl font-bold text-zinc-900 dark:text-white">
                {title}
              </DialogPrimitive.Title>
            </div>
            
            <DialogPrimitive.Description className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {description}
            </DialogPrimitive.Description>

            <div className="mt-4 flex justify-end gap-3">
              <button
                disabled={isLoading}
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-600 hover:bg-zinc-100 transition-colors dark:text-zinc-400 dark:hover:bg-zinc-800 disabled:opacity-50"
              >
                {cancelText}
              </button>
              <button
                disabled={isLoading}
                onClick={onConfirm}
                className={cn(
                  "px-6 py-2 rounded-xl text-sm font-semibold text-white shadow-lg transition-all active:scale-95 disabled:opacity-50",
                  variant === "destructive" && "bg-red-600 hover:bg-red-700 shadow-red-500/20",
                  variant === "warning" && "bg-amber-600 hover:bg-amber-700 shadow-amber-500/20",
                  variant === "info" && "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"
                )}
              >
                {isLoading ? "Processing..." : confirmText}
              </button>
            </div>
          </div>
          
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 transition-all dark:hover:bg-zinc-800 dark:hover:text-zinc-50">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
