'use client';

import React from 'react';
import { 
  Car, 
  Calendar, 
  Clock, 
  PlusCircle, 
  ChevronRight, 
  AlertCircle,
  TrendingUp,
  MapPin,
  Smartphone,
  User
} from 'lucide-react';
import { useAuth } from '@/store/AuthContext';

const stats = [
  { label: 'Registered Vehicles', value: '2', icon: Car, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { label: 'Active Appointments', value: '1', icon: Calendar, color: 'text-amber-400', bg: 'bg-amber-400/10' },
  { label: 'Saved Requests', value: '0', icon: Clock, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  { label: 'Avg Rating Given', value: '5.0', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
];

const recentAppointments = [
  { service: 'Full Body Service', date: 'Oct 24, 2023', status: 'Confirmed', vehicle: 'Toyota Corolla' },
  { service: 'Oil Change', date: 'Oct 15, 2023', status: 'Completed', vehicle: 'Honda Civic' },
];

export default function CustomerDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-indigo-600 p-10 text-white">
        <div className="relative z-10">
          <h2 className="text-3xl font-bold font-outfit mb-2">Ready to hit the road, {user?.fullName?.split(' ')[0]}?</h2>
          <p className="text-indigo-100 max-w-md">Manage your vehicles, track service history, and book appointments in one place.</p>
          <div className="mt-8 flex gap-4">
            <button className="bg-white text-primary px-6 py-2.5 rounded-xl font-bold hover:bg-zinc-100 transition-colors flex items-center gap-2">
              <PlusCircle size={20} />
              Book Service
            </button>
            <button className="bg-black/20 backdrop-blur-md border border-white/20 px-6 py-2.5 rounded-xl font-bold hover:bg-white/10 transition-colors">
              View History
            </button>
          </div>
        </div>
        <Car className="absolute top-1/2 right-0 -translate-y-1/2 text-white/10 w-96 h-96 -rotate-12 pointer-events-none" />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="glass p-6 group hover:shadow-primary/5 hover:border-primary/20 transition-all cursor-default">
            <div className={`w-12 h-12 ${stat.bg} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <stat.icon className={stat.color} size={24} />
            </div>
            <p className="text-zinc-500 text-sm font-medium">{stat.label}</p>
            <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Appointments */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold font-outfit">Upcoming Appointments</h3>
            <button className="text-primary text-sm font-semibold hover:underline flex items-center">
              View all <ChevronRight size={16} />
            </button>
          </div>

          <div className="space-y-4">
            {recentAppointments.map((app, i) => (
              <div key={i} className="glass p-5 flex items-center justify-between hover:bg-white/5 transition-colors border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center">
                    <Calendar size={20} className="text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-zinc-100">{app.service}</h4>
                    <p className="text-sm text-zinc-500">{app.vehicle} • {app.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    app.status === 'Confirmed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/10 text-primary'
                  }`}>
                    {app.status}
                  </span>
                  <button className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white transition-all">
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Profile / Info Card */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold font-outfit">My Profile</h3>
          <div className="glass p-6 space-y-6">
            <div className="flex items-center gap-4 border-b border-white/5 pb-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <User size={32} className="text-primary" />
              </div>
              <div>
                <h4 className="font-bold text-lg">{user?.fullName}</h4>
                <p className="text-sm text-zinc-500">{user?.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-zinc-400">
                <Smartphone size={18} className="text-zinc-500" />
                <span>{user?.phoneNumber}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-zinc-400">
                <MapPin size={18} className="text-zinc-500" />
                <span>{user?.address}</span>
              </div>
            </div>

            <button className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold transition-all border border-white/10">
              Edit Profile Info
            </button>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-6 flex gap-4">
            <AlertCircle className="text-amber-500 shrink-0" size={24} />
            <div>
              <h4 className="font-bold text-amber-500 text-sm">System Tip</h4>
              <p className="text-xs text-amber-500/80 mt-1">Make sure to add your vehicle details to enable quick service booking.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
