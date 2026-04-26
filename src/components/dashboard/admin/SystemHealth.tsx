"use client";

interface HealthItem {
  label: string;
  value: number;
  color: string;
}

interface SystemHealthProps {
  items: HealthItem[];
}

export default function SystemHealth({ items }: SystemHealthProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold font-outfit">System Health</h3>
      <div className="bg-[#141414] rounded-2xl border border-[#222] p-6 space-y-5">
        {items.map((item, i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">{item.label}</span>
              <span className="font-semibold">{item.value}%</span>
            </div>
            <div className="h-1.5 w-full bg-[#222] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${item.value}%`, backgroundColor: item.color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
