'use client';

import React from 'react';
import { 
  Users, 
  Package, 
  ShieldCheck, 
  BarChart3, 
  TrendingUp, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const stats = [
  { label: 'Total Staff', value: '12', icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10', trend: '+2' },
  { label: 'Low Stock Items', value: '5', icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-400/10', trend: '-1' },
  { label: 'Total Revenue', value: '$12,450', icon: BarChart3, color: 'text-emerald-400', bg: 'bg-emerald-400/10', trend: '+18%' },
  { label: 'Active Vendors', value: '8', icon: ShieldCheck, color: 'text-purple-400', bg: 'bg-purple-400/10', trend: 'Stable' },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-10 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold font-outfit">Admin Control Center</h2>
          <p className="text-zinc-500 mt-1">Real-time overview of your entire management system.</p>
        </div>
        <div className="flex bg-white/5 rounded-2xl p-1 border border-white/10">
          <button className="px-4 py-2 text-xs font-bold bg-white/10 rounded-xl">Last 24h</button>
          <button className="px-4 py-2 text-xs font-bold text-zinc-500 hover:text-white transition-colors">Last 7d</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="glass p-6 group">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <stat.icon className={stat.color} size={24} />
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                stat.trend.includes('+') ? 'bg-emerald-500/10 text-emerald-500' : 
                stat.trend.includes('-') ? 'bg-red-500/10 text-red-500' : 'bg-white/10 text-zinc-400'
              }`}>
                {stat.trend}
              </span>
            </div>
            <p className="text-zinc-500 text-sm font-medium">{stat.label}</p>
            <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass p-8 min-h-[400px] flex flex-col items-center justify-center text-center">
            <TrendingUp size={48} className="text-zinc-700 mb-4" />
            <h4 className="text-xl font-bold text-zinc-300">Revenue Analytics Pipeline</h4>
            <p className="text-zinc-500 text-sm mt-2 max-w-sm">Detailed financial charts will be available as soon as sales data begins flowing through the POS system.</p>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold font-outfit">Quick Actions</h3>
          <div className="space-y-3">
            {[
              { name: 'Add New Staff Member', icon: Users, color: 'text-blue-400' },
              { name: 'Register Vendor', icon: ShieldCheck, color: 'text-purple-400' },
              { name: 'Generate Monthly Report', icon: FileText, color: 'text-emerald-400' },
            ].map((action, i) => (
               <button key={i} className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 hover:border-white/20 transition-all group">
                <div className="flex items-center gap-3">
                  <action.icon size={18} className={action.color} />
                  <span className="text-sm font-bold">{action.name}</span>
                </div>
                <ArrowUpRight size={18} className="text-zinc-600 group-hover:text-white transition-colors" />
               </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Adding missing icon import
import { FileText } from 'lucide-react';
