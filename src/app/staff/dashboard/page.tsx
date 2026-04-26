'use client';

import React from 'react';
import { 
  ShoppingCart, 
  Package, 
  Calendar, 
  Users, 
  PlusCircle,
  ArrowRight,
  Clock,
  CheckCircle2
} from 'lucide-react';

const staffStats = [
  { label: 'Today\'s Sales', value: '$1,240', icon: ShoppingCart, color: 'text-blue-400' },
  { label: 'Pending Appointments', value: '4', icon: Calendar, color: 'text-amber-400' },
  { label: 'New Customers', value: '3', icon: Users, color: 'text-purple-400' },
  { label: 'Stock Alerts', value: '2', icon: Package, color: 'text-red-400' },
];

export default function StaffDashboard() {
  return (
    <div className="space-y-10 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold font-outfit">Staff Operations</h2>
          <p className="text-zinc-500 mt-1">Manage POS, appointments, and inventory from your terminal.</p>
        </div>
        <button className="bg-primary hover:bg-primary-hover text-white px-8 py-3.5 rounded-2xl font-bold shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3 active:scale-95">
          <PlusCircle size={22} />
          New Sale (POS)
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {staffStats.map((stat, i) => (
          <div key={i} className="glass p-6 group hover:border-white/20 transition-all cursor-default">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-white/10 transition-colors`}>
                <stat.icon className={stat.color} size={24} />
              </div>
              <div>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
                <h3 className="text-xl font-bold mt-0.5">{stat.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold font-outfit">Today's Appointments</h3>
            <button className="text-primary text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
              Manage Queue <ArrowRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { time: '10:00 AM', customer: 'John Smith', car: 'Toyota RAV4', service: 'Brake Check' },
              { time: '11:30 AM', customer: 'Sarah Connor', car: 'Jeep Wrangler', service: 'Oil Change' },
            ].map((appt, i) => (
              <div key={i} className="glass p-6 border-white/5 hover:border-primary/20 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-zinc-400 bg-white/5 px-3 py-1 rounded-full">
                    <Clock size={14} />
                    <span className="text-xs font-bold">{appt.time}</span>
                  </div>
                  <button className="p-2 hover:bg-emerald-500/10 rounded-lg text-emerald-500">
                    <CheckCircle2 size={18} />
                  </button>
                </div>
                <h4 className="font-bold text-lg">{appt.customer}</h4>
                <p className="text-sm text-zinc-500">{appt.car}</p>
                <div className="mt-4 pt-4 border-t border-white/5 font-medium text-sm text-primary">
                  {appt.service}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold font-outfit">Quick Inventory Check</h3>
          <div className="glass p-6 space-y-5">
             {[
               { name: 'Engine Oil (5L)', stock: 5, min: 10 },
               { name: 'Brake Pads (Pair)', stock: 2, min: 5 },
               { name: 'Air Filters', stock: 15, min: 8 },
             ].map((part, i) => (
               <div key={i} className="space-y-2">
                 <div className="flex justify-between text-sm">
                   <span className="font-medium">{part.name}</span>
                   <span className={part.stock <= part.min ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                     {part.stock} left
                   </span>
                 </div>
                 <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                   <div 
                    className={`h-full rounded-full ${part.stock <= part.min ? 'bg-red-500' : 'bg-emerald-500'}`} 
                    style={{ width: `${(part.stock / 20) * 100}%` }}
                   />
                 </div>
               </div>
             ))}
             <button className="w-full mt-4 py-3 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold rounded-xl transition-all">
               Request Low Stock Items
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
