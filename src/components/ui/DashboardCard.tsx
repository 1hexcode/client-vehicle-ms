import { LucideIcon, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface DashboardCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  color: string
  trend?: string
  className?: string
}

export function DashboardCard({
  label,
  value,
  icon: Icon,
  color,
  trend,
  className,
}: DashboardCardProps) {
  return (
    <div className={cn(
      "bg-[#141414] rounded-3xl border border-[#222] p-7 hover:border-[#333] transition-all group overflow-hidden relative",
      className
    )}>
      {/* Background glow effect */}
      <div 
        className="absolute -right-4 -top-4 w-24 h-24 blur-[60px] opacity-20 transition-opacity group-hover:opacity-30" 
        style={{ backgroundColor: color }}
      />
      
      <div className="flex items-start justify-between relative z-10">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500" 
          style={{ backgroundColor: color + '15' }}>
          <Icon size={26} style={{ color: color }} />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20 uppercase tracking-tighter">
            <TrendingUp size={12} />
            {trend}
          </div>
        )}
      </div>

      <div className="mt-8 relative z-10">
        <h3 className="text-4xl font-black tracking-tighter text-white mb-1">{value}</h3>
        <p className="text-sm font-medium text-zinc-500 uppercase tracking-[0.2em]">{label}</p>
      </div>

      {/* Modern bottom accent */}
      <div 
        className="absolute bottom-0 left-0 h-[2px] transition-all duration-500 w-0 group-hover:w-full"
        style={{ backgroundColor: color }}
      />
    </div>
  )
}
