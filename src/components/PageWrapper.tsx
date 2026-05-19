"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/store/AuthContext";
import { CartProvider } from "@/store/CartContext";

export default function PageWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isDashboard =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/staff") ||
    pathname.startsWith("/customer");

  return (
    <AuthProvider>
      <CartProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#141414',
              color: '#fff',
              border: '1px solid #222',
              fontSize: '14px',
              fontWeight: '600'
            },
          }}
        />
        {!isDashboard && <Navbar />}
        {children}
        {!isDashboard && <Footer />}
      </CartProvider>
    </AuthProvider>
  );
}
