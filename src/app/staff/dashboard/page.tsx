'use client';

import React from 'react';
import { ShoppingCart, Package, Calendar, Users, PlusCircle } from 'lucide-react';
import StaffStats from '@/components/dashboard/staff/StaffStats';
import DailyQueue from '@/components/dashboard/staff/DailyQueue';
import InventoryPulse from '@/components/dashboard/staff/InventoryPulse';

const staffStats = [
  { label: "Today's Sales", value: 'Rs. 12,400', icon: ShoppingCart, color: '#3B82F6' },
  { label: 'Pending Appointments', value: '4', icon: Calendar, color: '#F97316' },
  { label: 'New Customers', value: '3', icon: Users, color: '#A855F7' },
  { label: 'Stock Alerts', value: '2', icon: Package, color: '#EF4444' },
];

const dailyAppointments = [
  { time: '10:00 AM', customer: 'John Smith', car: 'Toyota RAV4', service: 'Brake Check' },
  { time: '11:30 AM', customer: 'Sarah Connor', car: 'Jeep Wrangler', service: 'Oil Change' },
];

const inventoryItems = [
  { name: 'Engine Oil (5L)', stock: 5, min: 10 },
  { name: 'Brake Pads (Pair)', stock: 2, min: 5 },
  { name: 'Air Filters', stock: 15, min: 8 },
];

export default function StaffDashboard() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-outfit text-white">Staff Operations</h2>
          <p className="text-gray-500 text-sm mt-1">Manage POS, appointments, and inventory</p>
        </div>
        <button className="bg-[#F97316] hover:bg-[#EA580C] text-white px-6 py-3 rounded-xl font-semibold text-sm shadow-lg shadow-[#F97316]/20 transition-all inline-flex items-center gap-2">
          <PlusCircle size={18} /> New Sale (POS)
        </button>
      </div>

      <StaffStats stats={staffStats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DailyQueue appointments={dailyAppointments} />
        </div>
        <div>
          <InventoryPulse items={inventoryItems} />
        </div>
      </div>
    </div>
  );
}
