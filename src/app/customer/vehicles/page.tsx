'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { Vehicle, ApiResponse } from '@/types';
import {
  Car, PlusCircle, Search, Pencil, Trash2, Tag, Hash,
  Palette, Calendar, Shield, MoreVertical, RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FormInput, FormSelect, SubmitButton } from '@/components/ui/FormElements';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

const vehicleSchema = z.object({
  vehicleNumber: z.string().min(2, 'Vehicle number required'),
  type: z.enum(['Bike', 'Car', 'Bus', 'Auto', 'Truck', 'Jeep']),
  make: z.string().optional(),
  model: z.string().optional(),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional().or(z.nan()),
  color: z.string().optional(),
});

type VehicleFormValues = z.infer<typeof vehicleSchema>;

const VEHICLE_TYPE_ICONS: Record<string, string> = {
  Bike: '🏍️',
  Car: '🚗',
  Bus: '🚌',
  Auto: '🛺',
  Truck: '🚛',
  Jeep: '🚙',
};

const VEHICLE_TYPE_COLORS: Record<string, string> = {
  Bike: 'from-purple-600/20 to-purple-800/10 border-purple-500/20',
  Car: 'from-orange-600/20 to-orange-800/10 border-orange-500/20',
  Bus: 'from-blue-600/20 to-blue-800/10 border-blue-500/20',
  Auto: 'from-green-600/20 to-green-800/10 border-green-500/20',
  Truck: 'from-red-600/20 to-red-800/10 border-red-500/20',
  Jeep: 'from-amber-600/20 to-amber-800/10 border-amber-500/20',
};

interface VehicleFormProps {
  onSubmit: (data: VehicleFormValues) => Promise<void>;
  isLoading: boolean;
  defaultValues?: Partial<VehicleFormValues>;
  submitLabel?: string;
}

function VehicleForm({ onSubmit, isLoading, defaultValues, submitLabel = 'Add Vehicle' }: VehicleFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: defaultValues || { type: 'Car', year: new Date().getFullYear() },
  });

  const handleFormSubmit = (data: VehicleFormValues) => {
    const payload = { ...data, year: isNaN(data.year as any) ? undefined : data.year };
    return onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Vehicle Number / License Plate" required
          registration={register('vehicleNumber')}
          error={errors.vehicleNumber?.message}
          placeholder="BA 1 PA 1234"
        />
        <FormSelect
          label="Vehicle Type" required
          registration={register('type')}
          error={errors.type?.message}
          options={[
            { value: 'Bike', label: '🏍️ Bike' },
            { value: 'Car', label: '🚗 Car' },
            { value: 'Bus', label: '🚌 Bus' },
            { value: 'Auto', label: '🛺 Auto' },
            { value: 'Truck', label: '🚛 Truck' },
            { value: 'Jeep', label: '🚙 Jeep' },
          ]}
        />
        <FormInput
          label="Make / Brand"
          registration={register('make')}
          error={errors.make?.message}
          placeholder="e.g. Toyota"
        />
        <FormInput
          label="Model"
          registration={register('model')}
          error={errors.model?.message}
          placeholder="e.g. Corolla"
        />
        <FormInput
          label="Year" type="number"
          registration={register('year', { valueAsNumber: true })}
          error={errors.year?.message}
          placeholder="e.g. 2022"
        />
        <FormInput
          label="Color"
          registration={register('color')}
          error={errors.color?.message}
          placeholder="e.g. White"
        />
      </div>
      <div className="flex justify-end pt-2">
        <SubmitButton isLoading={isLoading}>{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [targetVehicle, setTargetVehicle] = useState<Vehicle | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      const res: ApiResponse<Vehicle[]> = await api.get('/api/Vehicles');
      if (res.success) setVehicles(res.data || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchVehicles(); }, [fetchVehicles]);

  const handleAdd = async (data: VehicleFormValues) => {
    try {
      setSubmitting(true);
      const res: ApiResponse<Vehicle> = await api.post('/api/Vehicles', data);
      if (res.success) {
        toast.success('Vehicle added successfully!');
        setIsAddOpen(false);
        fetchVehicles();
      } else {
        toast.error(res.message || 'Failed to add vehicle');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to add vehicle');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (data: VehicleFormValues) => {
    if (!targetVehicle) return;
    try {
      setSubmitting(true);
      const res: ApiResponse<Vehicle> = await api.put(`/api/Vehicles/${targetVehicle.id}`, data);
      if (res.success) {
        toast.success('Vehicle updated successfully!');
        setIsEditOpen(false);
        setTargetVehicle(null);
        fetchVehicles();
      } else {
        toast.error(res.message || 'Failed to update vehicle');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update vehicle');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!targetVehicle) return;
    try {
      setSubmitting(true);
      const res: ApiResponse<any> = await api.delete(`/api/Vehicles/${targetVehicle.id}`);
      if (res.success) {
        toast.success('Vehicle removed successfully');
        setIsDeleteOpen(false);
        setTargetVehicle(null);
        fetchVehicles();
      } else {
        toast.error(res.message || 'Failed to remove vehicle');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to remove vehicle');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = vehicles.filter(
    (v) =>
      v.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold font-outfit flex items-center gap-3">
              <Car className="text-[#F97316]" size={28} />
              My Vehicles
            </h2>
            <p className="text-zinc-500 mt-1">Manage and track your registered vehicles.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchVehicles}
              className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-zinc-400 hover:text-white"
              title="Refresh"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => setIsAddOpen(true)}
              className="bg-[#F97316] hover:bg-[#ea580c] text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-[#F97316]/20 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <PlusCircle size={18} />
              Add Vehicle
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(['Bike', 'Car', 'Truck', 'Other'] as const).map((type) => {
            const count = type === 'Other'
              ? vehicles.filter((v) => !['Bike', 'Car', 'Truck'].includes(v.type)).length
              : vehicles.filter((v) => v.type === type).length;
            return (
              <div key={type} className="bg-[#141414] border border-[#222] rounded-2xl p-4 flex items-center gap-3">
                <span className="text-2xl">{type === 'Other' ? '🚗' : VEHICLE_TYPE_ICONS[type]}</span>
                <div>
                  <p className="text-2xl font-bold text-white">{count}</p>
                  <p className="text-xs text-zinc-500">{type}{count !== 1 ? 's' : ''}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#141414] border border-[#222] rounded-2xl pl-12 pr-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-[#F97316]/50 focus:ring-1 focus:ring-[#F97316]/30 transition-all"
            placeholder="Search by plate, make, model or type..."
          />
        </div>

        {/* Vehicles Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#141414] border border-[#222] rounded-2xl p-6 animate-pulse">
                <div className="h-24 bg-white/5 rounded-xl mb-4" />
                <div className="h-4 bg-white/5 rounded w-3/4 mb-2" />
                <div className="h-3 bg-white/5 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mb-5">
              <Car size={36} className="text-zinc-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              {searchTerm ? 'No vehicles found' : 'No vehicles yet'}
            </h3>
            <p className="text-zinc-500 max-w-xs">
              {searchTerm
                ? 'Try a different search term.'
                : "You haven't registered any vehicles yet. Click \"Add Vehicle\" to get started."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((vehicle) => {
              const typeIcon = VEHICLE_TYPE_ICONS[vehicle.type] || '🚗';
              const typeColor = VEHICLE_TYPE_COLORS[vehicle.type] || VEHICLE_TYPE_COLORS['Car'];
              return (
                <div
                  key={vehicle.id}
                  className={`bg-gradient-to-br ${typeColor} bg-[#141414] border rounded-2xl p-6 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300`}
                >
                  {/* Background emoji */}
                  <div className="absolute -right-4 -bottom-4 text-8xl opacity-10 group-hover:opacity-20 transition-opacity select-none">
                    {typeIcon}
                  </div>

                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-3xl border border-white/10">
                      {typeIcon}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-2 rounded-xl hover:bg-white/10 transition-colors text-zinc-400 hover:text-white">
                          <MoreVertical size={16} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 bg-[#1A1A1A] border border-[#333]">
                        <DropdownMenuItem
                          onClick={() => { setTargetVehicle(vehicle); setIsEditOpen(true); }}
                          className="flex items-center gap-2 cursor-pointer text-zinc-300 hover:text-white focus:text-white hover:bg-white/5 focus:bg-white/5"
                        >
                          <Pencil size={14} /> Edit Vehicle
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-[#333]" />
                        <DropdownMenuItem
                          onClick={() => { setTargetVehicle(vehicle); setIsDeleteOpen(true); }}
                          className="flex items-center gap-2 cursor-pointer text-red-400 focus:text-red-400 focus:bg-red-500/10"
                        >
                          <Trash2 size={14} /> Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Vehicle Number */}
                  <div className="mb-4">
                    <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
                      <Shield size={12} className="text-[#F97316]" />
                      <span className="text-sm font-bold font-mono tracking-wider text-white">
                        {vehicle.vehicleNumber}
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Tag size={13} className="text-zinc-500 shrink-0" />
                      <span className="text-sm text-zinc-300">
                        {vehicle.type}
                        {vehicle.make ? ` · ${vehicle.make}` : ''}
                        {vehicle.model ? ` ${vehicle.model}` : ''}
                      </span>
                    </div>
                    {vehicle.year && (
                      <div className="flex items-center gap-2">
                        <Calendar size={13} className="text-zinc-500 shrink-0" />
                        <span className="text-sm text-zinc-400">{vehicle.year}</span>
                      </div>
                    )}
                    {vehicle.color && (
                      <div className="flex items-center gap-2">
                        <Palette size={13} className="text-zinc-500 shrink-0" />
                        <span className="text-sm text-zinc-400">{vehicle.color}</span>
                      </div>
                    )}
                    {!vehicle.make && !vehicle.year && !vehicle.color && (
                      <p className="text-xs text-zinc-600 italic">No additional details</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add New Vehicle" maxWidth="max-w-2xl">
        <VehicleForm onSubmit={handleAdd} isLoading={submitting} submitLabel="Add Vehicle" />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={() => { setIsEditOpen(false); setTargetVehicle(null); }} title="Edit Vehicle" maxWidth="max-w-2xl">
        {targetVehicle && (
          <VehicleForm
            onSubmit={handleEdit}
            isLoading={submitting}
            submitLabel="Save Changes"
            defaultValues={{
              vehicleNumber: targetVehicle.vehicleNumber,
              type: targetVehicle.type as any,
              make: targetVehicle.make,
              model: targetVehicle.model,
              year: targetVehicle.year,
              color: targetVehicle.color,
            }}
          />
        )}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setTargetVehicle(null); }}
        onConfirm={handleDelete}
        title="Remove Vehicle"
        description={`Are you sure you want to remove ${targetVehicle?.vehicleNumber}? This action cannot be undone.`}
        confirmText="Yes, Remove"
        isLoading={submitting}
        variant="destructive"
      />
    </>
  );
}
