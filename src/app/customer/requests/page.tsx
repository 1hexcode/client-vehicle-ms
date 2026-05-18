'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { Vehicle, ApiResponse } from '@/types';
import {
  ShoppingBag, PlusCircle, Clock, Car, Tag, Search,
  RefreshCw, MoreVertical, CheckCircle2, AlertCircle, XCircle,
  FileText, Package,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '@/components/ui/Modal';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FormSelect, FormTextarea, SubmitButton } from '@/components/ui/FormElements';

interface PartRequest {
  id: string;
  customerId: string;
  customerName: string;
  vehicleId: string;
  vehicleNumber: string;
  description: string;
  status: string;
  handledByName?: string;
  createdAt: string;
  updatedAt?: string;
}

const STATUS_STYLES: Record<string, { badge: string; dot: string; icon: any }> = {
  Pending: {
    badge: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    dot: 'bg-amber-400',
    icon: Clock,
  },
  Processing: {
    badge: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    dot: 'bg-blue-400',
    icon: Package,
  },
  Fulfilled: {
    badge: 'bg-green-500/10 text-green-400 border border-green-500/20',
    dot: 'bg-green-400',
    icon: CheckCircle2,
  },
  Rejected: {
    badge: 'bg-red-500/10 text-red-400 border border-red-500/20',
    dot: 'bg-red-400',
    icon: XCircle,
  },
};

const requestSchema = z.object({
  vehicleId: z.string().min(1, 'Please select a vehicle'),
  description: z.string().min(10, 'Please describe the part(s) you need (min 10 characters)'),
});
type RequestFormValues = z.infer<typeof requestSchema>;

interface RequestFormProps {
  vehicles: Vehicle[];
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
}

function PartRequestForm({ vehicles, onSubmit, isLoading }: RequestFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormSelect
        label="Vehicle" required
        registration={register('vehicleId')}
        error={errors.vehicleId?.message}
        options={vehicles.map((v) => ({
          value: v.id,
          label: `${v.vehicleNumber}${v.make ? ` — ${v.make} ${v.model || ''}` : ''}`,
        }))}
        placeholder={vehicles.length === 0 ? 'No vehicles registered' : 'Select your vehicle'}
        disabled={vehicles.length === 0}
      />
      {vehicles.length === 0 && (
        <p className="text-sm text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
          You need to add a vehicle first before submitting a part request.
        </p>
      )}
      <FormTextarea
        label="Part Description" required
        registration={register('description')}
        error={errors.description?.message}
        placeholder="Describe the vehicle part(s) you need — include part number, brand, specifications, or any other relevant details..."
        rows={5}
      />
      <div className="bg-[#1A1A1A] border border-[#333] rounded-xl p-4 text-sm text-zinc-400">
        <div className="flex items-start gap-2">
          <AlertCircle size={16} className="text-[#F97316] mt-0.5 shrink-0" />
          <p>
            Our staff will review your request and contact you with availability and pricing.
            Be as specific as possible for faster processing.
          </p>
        </div>
      </div>
      <div className="flex justify-end pt-2">
        <SubmitButton isLoading={isLoading} disabled={vehicles.length === 0}>
          Submit Request
        </SubmitButton>
      </div>
    </form>
  );
}

export default function CustomerPartRequestsPage() {
  const [requests, setRequests] = useState<PartRequest[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<string>('All');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [reqRes, vehRes] = await Promise.all([
        api.get('/api/part-requests') as Promise<ApiResponse<PartRequest[]>>,
        api.get('/api/Vehicles') as Promise<ApiResponse<Vehicle[]>>,
      ]);
      if (reqRes.success) setRequests(reqRes.data || []);
      if (vehRes.success) setVehicles(vehRes.data || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleCreate = async (data: RequestFormValues) => {
    try {
      setSubmitting(true);
      const res: ApiResponse<PartRequest> = await api.post('/api/part-requests', data);
      if (res.success) {
        toast.success('Part request submitted! We\'ll get back to you soon.');
        setIsCreateOpen(false);
        fetchAll();
      } else {
        toast.error(res.message || 'Failed to submit request');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = requests.filter((r) => {
    const matchSearch =
      r.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = filter === 'All' || r.status === filter;
    return matchSearch && matchFilter;
  });

  const counts = {
    All: requests.length,
    Pending: requests.filter((r) => r.status === 'Pending').length,
    Processing: requests.filter((r) => r.status === 'Processing').length,
    Fulfilled: requests.filter((r) => r.status === 'Fulfilled').length,
    Rejected: requests.filter((r) => r.status === 'Rejected').length,
  };

  return (
    <>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold font-outfit flex items-center gap-3">
              <ShoppingBag className="text-[#F97316]" size={28} />
              Part Requests
            </h2>
            <p className="text-zinc-500 mt-1">Request specific vehicle parts and track their status.</p>
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
              New Request
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
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
            placeholder="Search by description or vehicle..."
          />
        </div>

        {/* Requests List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#141414] border border-[#222] rounded-2xl p-6 animate-pulse">
                <div className="h-5 bg-white/5 rounded w-2/3 mb-3" />
                <div className="h-4 bg-white/5 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mb-5">
              <Package size={36} className="text-zinc-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              {searchTerm || filter !== 'All' ? 'No matching requests' : 'No part requests yet'}
            </h3>
            <p className="text-zinc-500 max-w-xs">
              {searchTerm || filter !== 'All'
                ? 'Try clearing your filters.'
                : 'Submit your first part request and our team will assist you.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((req) => {
                const style = STATUS_STYLES[req.status] || STATUS_STYLES['Pending'];
                const StatusIcon = style.icon;
                return (
                  <div
                    key={req.id}
                    className="bg-[#141414] border border-[#222] rounded-2xl p-5 hover:border-[#333] transition-all"
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="w-12 h-12 bg-[#F97316]/10 rounded-xl flex items-center justify-center shrink-0">
                        <FileText size={20} className="text-[#F97316]" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm leading-relaxed line-clamp-2">
                              {req.description}
                            </p>
                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                              <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                                <Car size={12} />
                                {req.vehicleNumber}
                              </span>
                              <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                                <Clock size={12} />
                                {new Date(req.createdAt).toLocaleDateString('en-US', {
                                  day: '2-digit', month: 'short', year: 'numeric',
                                })}
                              </span>
                              {req.handledByName && (
                                <span className="text-xs text-zinc-500">
                                  Handler: <span className="text-zinc-300">{req.handledByName}</span>
                                </span>
                              )}
                            </div>
                          </div>

                          <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shrink-0 ${style.badge}`}>
                            <StatusIcon size={12} />
                            {req.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Submit Part Request" maxWidth="max-w-lg">
        <PartRequestForm vehicles={vehicles} onSubmit={handleCreate} isLoading={submitting} />
      </Modal>
    </>
  );
}
