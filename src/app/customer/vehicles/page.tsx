'use client';

import React from 'react';
import { Car, PlusCircle, Search } from 'lucide-react';

export default function VehiclesPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-outfit">My Vehicles</h2>
          <p className="text-zinc-500 mt-1">Manage and track service history for your fleet.</p>
        </div>
        <button className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2">
          <PlusCircle size={20} />
          Add New Vehicle
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
        <input 
          className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" 
          placeholder="Search vehicles..." 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="glass p-8 flex flex-col items-center justify-center text-center border-dashed border-white/10 hover:border-primary/50 transition-all group">
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Car size={32} className="text-zinc-500 group-hover:text-primary transition-colors" />
          </div>
          <h3 className="font-bold text-lg">No vehicles found</h3>
          <p className="text-sm text-zinc-500 mt-1 max-w-[200px]">You haven't added any vehicles yet. Let's get started!</p>
        </div>
      </div>
    </div>
  );
}
