'use client';

import React, { useEffect, useState } from 'react';
import { ShoppingCart, Package, Calendar, Users, PlusCircle, Loader2 } from 'lucide-react';
import StaffStats from '@/components/dashboard/staff/StaffStats';
import DailyQueue from '@/components/dashboard/staff/DailyQueue';
import InventoryPulse from '@/components/dashboard/staff/InventoryPulse';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function StaffDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [apptRes, invRes, partsRes, salesRes] = await Promise.all([
          api.get("/api/Appointments"),
          api.get("/api/Customers"),
          api.get("/api/Parts"),
          api.get("/api/sales-invoices")
        ]);

        const today = new Date().toISOString().split('T')[0];
        const todaySales = (salesRes.data || [])
          .filter((s: any) => s.status !== 'Void' && s.issuedAt?.startsWith(today))
          .reduce((acc: number, s: any) => acc + s.total, 0);

        setStats([
          { label: "Today's Sales", value: `Rs. ${todaySales.toLocaleString()}`, icon: ShoppingCart, color: '#3B82F6' },
          { label: 'Pending Appointments', value: (apptRes.data || []).filter((a: any) => a.status === 'Pending').length.toString(), icon: Calendar, color: '#F97316' },
          { label: 'Total Customers', value: (invRes.data || []).length.toString(), icon: Users, color: '#A855F7' },
          { label: 'Stock Alerts', value: (partsRes.data || []).filter((p: any) => p.stockQuantity <= p.reorderLevel).length.toString(), icon: Package, color: '#EF4444' },
        ]);

        setAppointments((apptRes.data || []).slice(0, 5).map((a: any) => ({
          time: new Date(a.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          customer: a.customerName,
          car: a.vehicleNumber || 'No Vehicle',
          service: a.serviceType
        })));

        setLowStockItems((partsRes.data || [])
          .filter((p: any) => p.stockQuantity <= p.reorderLevel)
          .slice(0, 5)
          .map((p: any) => ({
            name: p.name,
            stock: p.stockQuantity,
            min: p.reorderLevel
          })));

      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-outfit text-white">Staff Operations</h2>
          <p className="text-gray-500 text-sm mt-1">Manage POS, appointments, and inventory</p>
        </div>
        <Link 
          href="/staff/pos"
          className="bg-[#F97316] hover:bg-[#EA580C] text-white px-6 py-3 rounded-xl font-semibold text-sm shadow-lg shadow-[#F97316]/20 transition-all inline-flex items-center gap-2 active:scale-95"
        >
          <PlusCircle size={18} /> New Sale (POS)
        </Link>
      </div>

      <StaffStats stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DailyQueue appointments={appointments} />
        </div>
        <div>
          <InventoryPulse items={lowStockItems} />
        </div>
      </div>
    </div>
  );
}
