'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { Vehicle, Appointment, ApiResponse } from '@/types';
import {
  Calendar, PlusCircle, Clock, Car, Wrench, Tag,
  CalendarCheck, CalendarClock, CheckCircle2, XCircle,
  RefreshCw, MoreVertical, ChevronRight, Search,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FormInput, FormSelect, FormTextarea, SubmitButton } from '@/components/ui/FormElements';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const STATUS_STYLES: Record<string, { badge: string; dot: string }> = {
  Pending: {
    badge: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    dot: 'bg-amber-400',
  },
  Confirmed: {
    badge: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    dot: 'bg-blue-400',
  },
  Completed: {
    badge: 'bg-green-500/10 text-green-400 border border-green-500/20',
    dot: 'bg-green-400',
  },
  Cancelled: {
    badge: 'bg-red-500/10 text-red-400 border border-red-500/20',
    dot: 'bg-red-400',
  },
};

const appointmentSchema = z.object({
  vehicleId: z.string().min(1, 'Please select a vehicle'),
  serviceType: z.string().min(2, 'Service type required'),
  requestedAt: z.string().min(1, 'Date & time required'),
  notes: z.string().optional(),
});
type AppointmentFormValues = z.infer<typeof appointmentSchema>;

interface AppointmentFormProps {
  vehicles: Vehicle[];
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
}

function BookAppointmentForm({ vehicles, onSubmit, isLoading }: AppointmentFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
  });

  const handleFormSubmit = (data: AppointmentFormValues) =>
    onSubmit({ ...data, requestedAt: new Date(data.requestedAt).toISOString() });

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <FormSelect
        label="Vehicle" required
        registration={register('vehicleId')}
        error={errors.vehicleId?.message}
        options={vehicles.map((v) => ({
          value: v.id,
          label: `${v.vehicleNumber}${v.make ? ` — ${v.make} ${v.model || ''}` : ''}`,
        }))}
        placeholder={vehicles.length === 0 ? 'No vehicles registered yet' : 'Select your vehicle'}
        disabled={vehicles.length === 0}
      />
      {vehicles.length === 0 && (
        <p className="text-sm text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
          You need to add a vehicle first before booking an appointment.
        </p>
      )}
      <FormInput
        label="Service Type" required
        registration={register('serviceType')}
        error={errors.serviceType?.message}
        placeholder="e.g. Oil Change, Brake Inspection, General Checkup"
      />
      <FormInput
        label="Preferred Date & Time" required
        type="datetime-local"
        registration={register('requestedAt')}
        error={errors.requestedAt?.message}
        min={new Date().toISOString().slice(0, 16)}
      />
      <FormTextarea
        label="Additional Notes"
        registration={register('notes')}
        error={errors.notes?.message}
        placeholder="Any specific concerns or instructions..."
        rows={3}
      />
      <div className="flex justify-end pt-2">
        <SubmitButton isLoading={isLoading} disabled={vehicles.length === 0}>
          Book Appointment
        </SubmitButton>
      </div>
    </form>
  );
}

export default function CustomerAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<string>('All');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [apptRes, vehRes] = await Promise.all([
        api.get('/api/Appointments') as Promise<ApiResponse<Appointment[]>>,
        api.get('/api/Vehicles') as Promise<ApiResponse<Vehicle[]>>,
      ]);
      if (apptRes.success) setAppointments(apptRes.data || []);
      if (vehRes.success) setVehicles(vehRes.data || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleCreate = async (data: any) => {
    try {
      setSubmitting(true);
      const res: ApiResponse<Appointment> = await api.post('/api/Appointments', data);
      if (res.success) {
        toast.success('Appointment booked! We will confirm shortly.');
        setIsCreateOpen(false);
        fetchAll();
      } else {
        toast.error(res.message || 'Failed to book appointment');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to book appointment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!targetId) return;
    try {
      setSubmitting(true);
      const res: ApiResponse<any> = await api.post(`/api/Appointments/${targetId}/cancel`, {});
      if (res.success) {
        toast.success('Appointment cancelled');
        setIsCancelOpen(false);
        setTargetId(null);
        fetchAll();
      } else {
        toast.error(res.message || 'Failed to cancel appointment');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel appointment');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = appointments.filter((a) => {
    const matchSearch =
      a.serviceType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = filter === 'All' || a.status === filter;
    return matchSearch && matchFilter;
  });

  const counts = {
    All: appointments.length,
    Pending: appointments.filter((a) => a.status === 'Pending').length,
    Confirmed: appointments.filter((a) => a.status === 'Confirmed').length,
    Completed: appointments.filter((a) => a.status === 'Completed').length,
    Cancelled: appointments.filter((a) => a.status === 'Cancelled').length,
  };

  return (
    <>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold font-outfit flex items-center gap-3">
              <Calendar className="text-[#F97316]" size={28} />
              My Appointments
            </h2>
            <p className="text-zinc-500 mt-1">Book and track your service appointments.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchAll}
              className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-zinc-400 hover:text-white"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="bg-[#F97316] hover:bg-[#ea580c] text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-[#F97316]/20 transition-all flex items-center gap-2 active:scale-95"
            >
              <PlusCircle size={18} />
              Book Appointment
            </button>
          </div>
        </div>

        {/* Stats Filter Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {Object.entries(counts).map(([status, count]) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                filter === status
                  ? 'bg-[#F97316] text-white border-[#F97316] shadow-lg shadow-[#F97316]/20'
                  : 'bg-[#141414] text-zinc-400 border-[#222] hover:border-[#F97316]/30 hover:text-white'
              }`}
            >
              {status} <span className="ml-1.5 opacity-80">({count})</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#141414] border border-[#222] rounded-2xl pl-12 pr-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-[#F97316]/50 focus:ring-1 focus:ring-[#F97316]/30 transition-all"
            placeholder="Search by service type or vehicle..."
          />
        </div>

        {/* Appointments List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#141414] border border-[#222] rounded-2xl p-6 animate-pulse">
                <div className="h-5 bg-white/5 rounded w-1/3 mb-3" />
                <div className="h-4 bg-white/5 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mb-5">
              <Calendar size={36} className="text-zinc-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              {searchTerm || filter !== 'All' ? 'No matching appointments' : 'No appointments yet'}
            </h3>
            <p className="text-zinc-500 max-w-xs">
              {searchTerm || filter !== 'All'
                ? 'Try clearing filters.'
                : 'Book your first service appointment to get started.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((appt) => {
                const style = STATUS_STYLES[appt.status] || STATUS_STYLES['Pending'];
                const reqDate = new Date(appt.requestedAt);
                return (
                  <div
                    key={appt.id}
                    className="bg-[#141414] border border-[#222] rounded-2xl p-5 hover:border-[#333] transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="w-12 h-12 bg-[#F97316]/10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-[#F97316]/20 transition-colors">
                        <Wrench size={20} className="text-[#F97316]" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div>
                            <h3 className="font-bold text-white text-base">{appt.serviceType}</h3>
                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                              <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                                <Car size={12} className="text-zinc-600" />
                                {appt.vehicleNumber}
                              </span>
                              <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                                <Clock size={12} className="text-zinc-600" />
                                {reqDate.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                                {' · '}
                                {reqDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            {appt.notes && (
                              <p className="text-xs text-zinc-600 mt-1.5 max-w-md truncate">{appt.notes}</p>
                            )}
                            {appt.assignedStaffName && (
                              <p className="text-xs text-zinc-500 mt-1">
                                Assigned to: <span className="text-zinc-300">{appt.assignedStaffName}</span>
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${style.badge}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                              {appt.status}
                            </span>

                            {(appt.status === 'Pending' || appt.status === 'Confirmed') && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button className="p-2 rounded-xl hover:bg-white/10 transition-colors text-zinc-500 hover:text-white">
                                    <MoreVertical size={15} />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-40 bg-[#1A1A1A] border border-[#333]">
                                  <DropdownMenuItem
                                    onClick={() => { setTargetId(appt.id); setIsCancelOpen(true); }}
                                    className="flex items-center gap-2 cursor-pointer text-red-400 focus:text-red-400 focus:bg-red-500/10"
                                  >
                                    <XCircle size={14} /> Cancel
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Book Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Book a Service Appointment" maxWidth="max-w-lg">
        <BookAppointmentForm vehicles={vehicles} onSubmit={handleCreate} isLoading={submitting} />
      </Modal>

      {/* Cancel Confirm */}
      <ConfirmDialog
        isOpen={isCancelOpen}
        onClose={() => { setIsCancelOpen(false); setTargetId(null); }}
        onConfirm={handleCancel}
        title="Cancel Appointment"
        description="Are you sure you want to cancel this appointment? This action cannot be undone."
        confirmText="Yes, Cancel"
        isLoading={submitting}
        variant="destructive"
      />
    </>
  );
}
