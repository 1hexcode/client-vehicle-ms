import React, { useState } from 'react';
import { X, Car } from 'lucide-react';
import { api } from '@/lib/api';

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (vehicle: any) => void;
}

export default function AddVehicleModal({ isOpen, onClose, onSuccess }: AddVehicleModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    type: 'Car',
    make: '',
    model: '',
    year: '',
    color: '',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Pass the year as a number if provided
      const payload = {
        ...formData,
        year: formData.year ? parseInt(formData.year) : undefined
      };
      
      const response = await api.post('/api/Vehicles', payload);
      const newVehicle = response.data?.data || payload; // Fallback to payload if backend doesn't return it directly
      
      // We'll give it a fake ID if it wasn't returned, just for UI mapping until a refresh
      if (!newVehicle.id) newVehicle.id = Math.random().toString(36).substring(7);
      
      onSuccess(newVehicle);
      onClose();
    } catch (error) {
      console.error('Failed to add vehicle:', error);
      alert('Failed to add vehicle. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#141414] border border-[#333] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
        <div className="flex items-center justify-between p-6 border-b border-[#222]">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Car className="text-[#F97316]" />
            Add New Vehicle
          </h3>
          <button 
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors p-1 bg-white/5 hover:bg-white/10 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Vehicle Number / License Plate *</label>
            <input
              required
              name="vehicleNumber"
              value={formData.vehicleNumber}
              onChange={handleChange}
              className="w-full bg-[#1A1A1A] border border-[#333] focus:border-[#F97316] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-[#F97316] transition-all"
              placeholder="e.g. BA 1 PA 1234"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Vehicle Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full bg-[#1A1A1A] border border-[#333] focus:border-[#F97316] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-[#F97316] transition-all"
              >
                <option value="Car">Car</option>
                <option value="Motorcycle">Motorcycle</option>
                <option value="Truck">Truck</option>
                <option value="Van">Van</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Make / Brand</label>
              <input
                name="make"
                value={formData.make}
                onChange={handleChange}
                className="w-full bg-[#1A1A1A] border border-[#333] focus:border-[#F97316] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-[#F97316] transition-all"
                placeholder="e.g. Toyota"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Model</label>
              <input
                name="model"
                value={formData.model}
                onChange={handleChange}
                className="w-full bg-[#1A1A1A] border border-[#333] focus:border-[#F97316] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-[#F97316] transition-all"
                placeholder="e.g. Corolla"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Year</label>
              <input
                name="year"
                type="number"
                value={formData.year}
                onChange={handleChange}
                className="w-full bg-[#1A1A1A] border border-[#333] focus:border-[#F97316] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-[#F97316] transition-all"
                placeholder="e.g. 2022"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Color</label>
            <input
              name="color"
              value={formData.color}
              onChange={handleChange}
              className="w-full bg-[#1A1A1A] border border-[#333] focus:border-[#F97316] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-[#F97316] transition-all"
              placeholder="e.g. Black"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#222]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#F97316] hover:bg-[#ea580c] disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-bold transition-colors flex items-center gap-2 shadow-lg shadow-[#F97316]/20"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : null}
              {loading ? 'Adding...' : 'Add Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
