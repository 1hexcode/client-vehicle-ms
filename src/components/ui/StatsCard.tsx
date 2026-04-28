import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  label: string
  value: string | number
  icon?: LucideIcon
  description?: string
  trend?: string
  trendValue?: string
  variant?: "default" | "success" | "warning" | "danger" | "info"
  className?: string
}

export function StatsCard({
  label,
  value,
  icon: Icon,
  description,
  trend,
  trendValue,
  variant = "default",
  className,
}: StatsCardProps) {
  const variants = {
    default: "text-zinc-900 dark:text-white",
    success: "text-green-600 dark:text-green-400",
    warning: "text-amber-600 dark:text-amber-400",
    danger: "text-red-600 dark:text-red-400",
    info: "text-blue-600 dark:text-blue-400",
  }

  return (
    <div className={cn(
      "bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md group",
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium uppercase tracking-wider">{label}</p>
          <div className="flex items-baseline gap-2">
            <h3 className={cn("text-3xl font-bold tracking-tight", variants[variant])}>
              {value}
            </h3>
            {trendValue && (
              <span className={cn(
                "text-xs font-medium",
                trend === "up" ? "text-green-500" : "text-red-500"
              )}>
                {trendValue}
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">{description}</p>
          )}
        </div>
        {Icon && (
          <div className={cn(
            "p-3 rounded-xl transition-colors group-hover:scale-110 duration-300",
            variant === "default" && "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
            variant === "success" && "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
            variant === "warning" && "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
            variant === "danger" && "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
            variant === "info" && "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
          )}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  )
}
