import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import ProductsBrowser from "@/components/products/ProductsBrowser";

export const metadata = {
  title: "Shop Vehicle Parts | VehicleHub",
  description: "Browse our full catalogue of vehicle parts. Filter by category, vehicle type, price, and stock availability.",
};

export default function ProductsPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white">
      <Suspense fallback={<LoadingShell />}>
        <ProductsBrowser />
      </Suspense>
    </main>
  );
}

function LoadingShell() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-16 flex items-center justify-center gap-3 text-gray-400">
      <Loader2 className="w-5 h-5 animate-spin text-[#F97316]" />
      Loading shop…
    </div>
  );
}
