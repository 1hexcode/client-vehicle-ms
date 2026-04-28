import { DashboardCard } from "@/components/ui/DashboardCard";
import { LucideIcon } from "lucide-react";

interface KPIItem {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  trend: string;
}

interface AdminKPIsProps {
  stats: KPIItem[];
}

export default function AdminKPIs({ stats }: AdminKPIsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, i) => (
        <DashboardCard 
          key={i}
          label={stat.label}
          value={stat.value}
          icon={stat.icon}
          color={stat.color}
          trend={stat.trend}
        />
      ))}
    </div>
  );
}
