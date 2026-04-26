import type { Metadata } from "next";
import "./globals.css";
import PageWrapper from "@/components/PageWrapper";

export const metadata: Metadata = {
  title: "Vehicle Parts MS | Premium Inventory Management",
  description: "Advanced management system for vehicle parts, inventory, and suppliers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <PageWrapper>
          {children}
        </PageWrapper>
      </body>
    </html>
  );
}
