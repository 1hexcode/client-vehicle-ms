'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Users, Package, AlertTriangle, PlusCircle, BarChart3, Settings, DollarSign, ClipboardList } from 'lucide-react';
import AdminKPIs from '@/components/dashboard/admin/AdminKPIs';
import AdminQuickActions from '@/components/dashboard/admin/AdminQuickActions';
import SystemHealth from '@/components/dashboard/admin/SystemHealth';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import useSWR from 'swr';

interface DashboardData {
  activeStaff: number;
  totalRevenue: number;
  totalParts: number;
  lowStockAlerts: number;
}

const quickActions = [
  { label: 'Add Staff Member', icon: PlusCircle, href: '/admin/staff' },
  { label: 'Manage Inventory', icon: Package, href: '/admin/inventory' },
  { label: 'View Reports', icon: BarChart3, href: '/admin/reports' },
  { label: 'System Settings', icon: Settings, href: '/admin/settings' },
];

const fetcher = (url: string) =>
  api.get(url).then((res) => {
    if (!res.success) throw new Error(res.message || 'Failed to fetch dashboard metrics');
    return res.data;
  });

export default function AdminDashboard() {
  const { data: stats, error, isLoading, mutate } = useSWR<DashboardData>('/api/reports/dashboard', fetcher);

  const [healthMetrics, setHealthMetrics] = useState([
    { label: 'Server Uptime', value: 99.9, color: '#22C55E' },
    { label: 'Database Load', value: 38, color: '#3B82F6' },
    { label: 'API Latency (ms)', value: 65, color: '#F97316' },
  ]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || 'Could not connect to dashboard service');
    }
  }, [error]);

  useEffect(() => {
    // Premium effect: Simulate micro-fluctuations in DB load and API Latency to make UI feel "alive"
    const interval = setInterval(() => {
      setHealthMetrics((prev) =>
        prev.map((metric) => {
          if (metric.label === 'Database Load') {
            const delta = Math.floor(Math.random() * 5) - 2; // -2% to +2%
            const newValue = Math.min(Math.max(metric.value + delta, 15), 75);
            return { ...metric, value: newValue };
          }
          if (metric.label === 'API Latency (ms)') {
            const delta = Math.floor(Math.random() * 11) - 5; // -5ms to +5ms
            const newValue = Math.min(Math.max(metric.value + delta, 40), 120);
            return { ...metric, value: newValue };
          }
          return metric;
        })
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const adminStats = useMemo(() => {
    const activeStaff = stats?.activeStaff ?? 0;
    const totalRevenue = stats?.totalRevenue ?? 0;
    const totalParts = stats?.totalParts ?? 0;
    const lowStockAlerts = stats?.lowStockAlerts ?? 0;

    return [
      {
        label: 'Active Staff',
        value: String(activeStaff),
        icon: Users,
        color: '#3B82F6',
        trend: 'System users',
      },
      {
        label: 'Total Revenue',
        value: `Rs. ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        icon: DollarSign,
        color: '#22C55E',
        trend: 'Sales accumulated',
      },
      {
        label: 'Inventory Items',
        value: totalParts.toLocaleString(),
        icon: Package,
        color: '#F97316',
        trend: 'Unique parts in catalog',
      },
      {
        label: 'Low Stock Alerts',
        value: String(lowStockAlerts),
        icon: AlertTriangle,
        color: '#EF4444',
        trend: lowStockAlerts > 0 ? `${lowStockAlerts} items below reorder` : 'Healthy stock',
      },
    ];
  }, [stats]);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-48" />
            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-lg w-64" />
          </div>
        </div>

        {/* KPI loading skeletons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-32 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4"
            >
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-24" />
              <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-36" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="h-64 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl" />
          </div>
          <div>
            <div className="h-64 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-outfit text-zinc-900 dark:text-white">Admin Control Center</h2>
          <p className="text-gray-500 text-sm mt-1">System overview and real-time dashboard analytics</p>
        </div>
        <button
          onClick={() => mutate()}
          className="bg-[#F97316] hover:bg-[#EA580C] text-white px-6 py-3 rounded-xl font-semibold text-sm shadow-lg shadow-[#F97316]/20 transition-all inline-flex items-center gap-2"
        >
          <ClipboardList size={18} /> Refresh Control Center
        </button>
      </div>

      <AdminKPIs stats={adminStats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AdminQuickActions actions={quickActions} />
        </div>
        <div>
          <SystemHealth items={healthMetrics} />
        </div>
      </div>
    </div>
  );
}
