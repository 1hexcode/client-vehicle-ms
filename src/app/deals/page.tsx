import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import DealsBrowser from "./DealsBrowser";

export const metadata = {
  title: "Hot Deals | VehicleHub",
  description: "Limited-time discounts on vehicle parts. Grab them before they expire.",
};

export default function DealsPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white">
      <Suspense fallback={<LoadingShell />}>
        <DealsBrowser />
      </Suspense>
    </main>
  );
}

function LoadingShell() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-16 flex items-center justify-center gap-3 text-gray-400">
      <Loader2 className="w-5 h-5 animate-spin text-[#F97316]" />
      Loading hot deals…
    </div>
  );
}
