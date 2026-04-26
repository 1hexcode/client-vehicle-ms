"use client";

import { useAuth } from "@/store/AuthContext";
import Hero from "@/components/home/Hero";
import Categories from "@/components/home/Categories";
import ProductGrid from "@/components/home/ProductGrid";
import PromoBanners from "@/components/home/PromoBanners";
import HotDeals from "@/components/home/HotDeals";
import TrustStrip from "@/components/home/TrustStrip";
import Newsletter from "@/components/home/Newsletter";
import Footer from "@/components/Footer";

export default function Home() {
  const { user } = useAuth();

  const dashboardHref = user
    ? user.role === "Admin" ? "/admin/dashboard" : user.role === "Staff" ? "/staff/dashboard" : "/customer/dashboard"
    : "/auth/register";

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white">
      <Hero dashboardHref={dashboardHref} />
      <Categories />
      <ProductGrid />
      <PromoBanners />
      <HotDeals />
      <TrustStrip />
      <Newsletter />
    </main>
  );
}
