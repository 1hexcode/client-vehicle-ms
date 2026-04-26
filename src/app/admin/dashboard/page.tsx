'use client';

import React from 'react';
import { Users, Package, AlertTriangle, PlusCircle, BarChart3, Settings, DollarSign, ClipboardList } from 'lucide-react';
import AdminKPIs from '@/components/dashboard/admin/AdminKPIs';
import AdminQuickActions from '@/components/dashboard/admin/AdminQuickActions';
import SystemHealth from '@/components/dashboard/admin/SystemHealth';

const adminStats = [
  { label: 'Active Staff', value: '12', icon: Users, color: '#3B82F6', trend: '+2 this month' },
  { label: 'Total Revenue', value: 'Rs. 245K', icon: DollarSign, color: '#22C55E', trend: '+18% vs last month' },
  { label: 'Inventory Items', value: '1,284', icon: Package, color: '#F97316', trend: '32 low stock' },
  { label: 'Low Stock Alerts', value: '7', icon: AlertTriangle, color: '#EF4444', trend: 'Needs attention' },
];

const quickActions = [
  { label: 'Add Staff Member', icon: PlusCircle, href: '/admin/staff' },
  { label: 'Manage Inventory', icon: Package, href: '/admin/inventory' },
  { label: 'View Reports', icon: BarChart3, href: '/admin/reports' },
  { label: 'System Settings', icon: Settings, href: '/admin/settings' },
];

const healthMetrics = [
  { label: 'Server Uptime', value: 99.9, color: '#22C55E' },
  { label: 'Database Load', value: 42, color: '#3B82F6' },
  { label: 'API Latency', value: 78, color: '#F97316' },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-outfit">Admin Control Center</h2>
          <p className="text-gray-500 text-sm mt-1">System overview and management tools</p>
        </div>
        <button className="bg-[#F97316] hover:bg-[#EA580C] text-white px-6 py-3 rounded-xl font-semibold text-sm shadow-lg shadow-[#F97316]/20 transition-all inline-flex items-center gap-2">
          <ClipboardList size={18} /> Generate Report
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
