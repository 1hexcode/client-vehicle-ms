"use client";

interface InventoryItem {
  name: string;
  stock: number;
  min: number;
}

interface InventoryPulseProps {
  items: InventoryItem[];
}

export default function InventoryPulse({ items }: InventoryPulseProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold font-outfit">Quick Inventory</h3>
      <div className="bg-[#141414] rounded-2xl border border-[#222] p-6 space-y-5">
        {items.map((part, i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">{part.name}</span>
              <span className={`font-bold ${part.stock <= part.min ? 'text-red-400' : 'text-green-400'}`}>
                {part.stock} left
              </span>
            </div>
            <div className="h-1.5 w-full bg-[#222] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min((part.stock / 20) * 100, 100)}%`,
                  backgroundColor: part.stock <= part.min ? '#EF4444' : '#22C55E'
                }}
              />
            </div>
          </div>
        ))}
        <button className="w-full mt-4 py-3 bg-[#F97316]/10 text-[#F97316] text-xs font-bold rounded-xl hover:bg-[#F97316]/20 transition-colors">
          Request Low Stock Items
        </button>
      </div>
    </div>
  );
}
