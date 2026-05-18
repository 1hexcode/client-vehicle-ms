'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { User, Vehicle, Appointment, PartRequest, ApiResponse } from '@/types';
import {
  ArrowLeft, Mail, Phone, MapPin, Car, Calendar, Package,
  ShieldCheck, ShieldAlert, User as UserIcon, Clock,
  Tag, Wrench, FileText, CheckCircle2, XCircle, RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

const APPT_STATUS_STYLES: Record<string, string> = {
  Pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const PART_STATUS_STYLES: Record<string, string> = {
  Pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Fulfilled: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

type Tab = 'overview' | 'vehicles' | 'appointments' | 'requests';

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [customer, setCustomer] = useState<User | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [partRequests, setPartRequests] = useState<PartRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const [isDisableOpen, setIsDisableOpen] = useState(false);
  const [isActivateOpen, setIsActivateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [custRes, vehRes, apptRes, reqRes] = await Promise.all([
        api.get('/api/Customers') as Promise<ApiResponse<User[]>>,
        api.get(`/api/Vehicles?customerId=${id}`) as Promise<ApiResponse<Vehicle[]>>,
        api.get('/api/Appointments') as Promise<ApiResponse<Appointment[]>>,
        api.get('/api/part-requests') as Promise<ApiResponse<PartRequest[]>>,
      ]);

      if (custRes.success) {
        const found = (custRes.data || []).find((c) => c.id === id);
        setCustomer(found || null);
      }
      if (vehRes.success) setVehicles(vehRes.data || []);
      if (apptRes.success) setAppointments((apptRes.data || []).filter((a) => a.customerId === id));
      if (reqRes.success) setPartRequests((reqRes.data || []).filter((r) => r.customerId === id));
    } catch (err: any) {
      toast.error(err.message || 'Failed to load customer data');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleToggleStatus = async (activate: boolean) => {
    if (!customer) return;
    try {
      setSubmitting(true);
      const res: ApiResponse<any> = await api.patch(`/api/Users/${customer.id}/status`, { isActive: activate });
      if (res.success) {
        toast.success(activate ? 'Customer activated' : 'Customer disabled');
        setIsDisableOpen(false);
        setIsActivateOpen(false);
        fetchAll();
      } else {
        toast.error(res.message || 'Failed to update status');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-8 bg-zinc-800 rounded w-1/4" />
        <div className="h-32 bg-zinc-800 rounded-2xl" />
        <div className="h-64 bg-zinc-800 rounded-2xl" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-8 flex flex-col items-center justify-center py-20 text-center">
        <UserIcon size={48} className="text-zinc-600 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Customer not found</h2>
        <p className="text-zinc-500 mb-6">The customer you're looking for doesn't exist.</p>
        <button onClick={() => router.back()} className="flex items-center gap-2 text-orange-500 font-semibold hover:text-orange-400 transition-colors">
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: any; count?: number }[] = [
    { key: 'overview', label: 'Overview', icon: UserIcon },
    { key: 'vehicles', label: 'Vehicles', icon: Car, count: vehicles.length },
    { key: 'appointments', label: 'Appointments', icon: Calendar, count: appointments.length },
    { key: 'requests', label: 'Part Requests', icon: Package, count: partRequests.length },
  ];

  return (
    <>
      <div className="p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Back + Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Customer Details</h1>
            <p className="text-zinc-500 text-sm">Viewing profile for {customer.fullName}</p>
          </div>
          <button
            onClick={fetchAll}
            className="ml-auto p-2 rounded-xl hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white"
          >
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-3xl font-bold text-orange-500 shrink-0">
              {customer.fullName.charAt(0).toUpperCase()}
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-white">{customer.fullName}</h2>
                  <div className="flex flex-wrap items-center gap-4 mt-2">
                    <span className="flex items-center gap-1.5 text-sm text-zinc-400">
                      <Mail size={14} className="text-zinc-600" /> {customer.email}
                    </span>
                    <span className="flex items-center gap-1.5 text-sm text-zinc-400">
                      <Phone size={14} className="text-zinc-600" /> {customer.phoneNumber}
                    </span>
                    <span className="flex items-center gap-1.5 text-sm text-zinc-400">
                      <MapPin size={14} className="text-zinc-600" /> {customer.address}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                    customer.isActive
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {customer.isActive ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                    {customer.isActive ? 'Active' : 'Inactive'}
                  </span>
                  {customer.isActive ? (
                    <button
                      onClick={() => setIsDisableOpen(true)}
                      className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-sm font-semibold transition-all"
                    >
                      Disable
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsActivateOpen(true)}
                      className="px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 rounded-xl text-sm font-semibold transition-all"
                    >
                      Activate
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-zinc-800">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{vehicles.length}</p>
              <p className="text-xs text-zinc-500 mt-0.5">Vehicles</p>
            </div>
            <div className="text-center border-x border-zinc-800">
              <p className="text-2xl font-bold text-white">{appointments.length}</p>
              <p className="text-xs text-zinc-500 mt-0.5">Appointments</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{partRequests.length}</p>
              <p className="text-xs text-zinc-500 mt-0.5">Part Requests</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === tab.key
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                <Icon size={15} />
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                    activeTab === tab.key ? 'bg-white/20' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Appointment */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Calendar size={16} className="text-orange-500" /> Recent Appointments
              </h3>
              {appointments.length === 0 ? (
                <p className="text-zinc-600 text-sm text-center py-6">No appointments yet</p>
              ) : (
                <div className="space-y-3">
                  {appointments.slice(0, 3).map((a) => (
                    <div key={a.id} className="flex items-center justify-between gap-3 py-2 border-b border-zinc-800 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-white">{a.serviceType}</p>
                        <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                          <Car size={10} /> {a.vehicleNumber} · {new Date(a.requestedAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${APPT_STATUS_STYLES[a.status] || ''}`}>
                        {a.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Part Requests */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Package size={16} className="text-orange-500" /> Recent Part Requests
              </h3>
              {partRequests.length === 0 ? (
                <p className="text-zinc-600 text-sm text-center py-6">No part requests yet</p>
              ) : (
                <div className="space-y-3">
                  {partRequests.slice(0, 3).map((r) => (
                    <div key={r.id} className="flex items-start justify-between gap-3 py-2 border-b border-zinc-800 last:border-0">
                      <p className="text-sm text-zinc-300 line-clamp-2 flex-1">{r.description}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ${PART_STATUS_STYLES[r.status] || ''}`}>
                        {r.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'vehicles' && (
          <div>
            {vehicles.length === 0 ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 flex flex-col items-center text-center">
                <Car size={40} className="text-zinc-600 mb-3" />
                <p className="text-zinc-400 font-semibold">No vehicles registered</p>
                <p className="text-zinc-600 text-sm mt-1">This customer has no vehicles on record.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vehicles.map((v) => (
                  <div key={v.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center text-2xl">
                        {v.type === 'Bike' ? '🏍️' : v.type === 'Truck' ? '🚛' : v.type === 'Bus' ? '🚌' : '🚗'}
                      </div>
                      <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-1 rounded-lg">{v.type}</span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 bg-zinc-800 rounded-lg px-3 py-1.5 mb-3">
                      <span className="font-mono text-sm font-bold text-white">{v.vehicleNumber}</span>
                    </div>
                    <div className="space-y-1 text-sm text-zinc-400">
                      {v.make && <p><span className="text-zinc-600">Make:</span> {v.make} {v.model}</p>}
                      {v.year && <p><span className="text-zinc-600">Year:</span> {v.year}</p>}
                      {v.color && <p><span className="text-zinc-600">Color:</span> {v.color}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            {appointments.length === 0 ? (
              <div className="p-12 flex flex-col items-center text-center">
                <Calendar size={40} className="text-zinc-600 mb-3" />
                <p className="text-zinc-400 font-semibold">No appointments found</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left px-5 py-3 text-xs font-bold text-zinc-500 uppercase">Service</th>
                    <th className="text-left px-5 py-3 text-xs font-bold text-zinc-500 uppercase">Vehicle</th>
                    <th className="text-left px-5 py-3 text-xs font-bold text-zinc-500 uppercase">Date</th>
                    <th className="text-left px-5 py-3 text-xs font-bold text-zinc-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {appointments.map((a) => (
                    <tr key={a.id} className="hover:bg-zinc-800/50 transition-colors">
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-white">{a.serviceType}</p>
                        {a.notes && <p className="text-xs text-zinc-600 truncate max-w-[200px]">{a.notes}</p>}
                      </td>
                      <td className="px-5 py-4 text-sm text-zinc-400">{a.vehicleNumber}</td>
                      <td className="px-5 py-4 text-sm text-zinc-400">
                        {new Date(a.requestedAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${APPT_STATUS_STYLES[a.status] || ''}`}>
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            {partRequests.length === 0 ? (
              <div className="p-12 flex flex-col items-center text-center">
                <Package size={40} className="text-zinc-600 mb-3" />
                <p className="text-zinc-400 font-semibold">No part requests found</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left px-5 py-3 text-xs font-bold text-zinc-500 uppercase">Description</th>
                    <th className="text-left px-5 py-3 text-xs font-bold text-zinc-500 uppercase">Vehicle</th>
                    <th className="text-left px-5 py-3 text-xs font-bold text-zinc-500 uppercase">Date</th>
                    <th className="text-left px-5 py-3 text-xs font-bold text-zinc-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {partRequests.map((r) => (
                    <tr key={r.id} className="hover:bg-zinc-800/50 transition-colors">
                      <td className="px-5 py-4">
                        <p className="text-sm text-zinc-300 max-w-xs line-clamp-2">{r.description}</p>
                      </td>
                      <td className="px-5 py-4 text-sm text-zinc-400">{r.vehicleNumber}</td>
                      <td className="px-5 py-4 text-sm text-zinc-400">
                        {new Date(r.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${PART_STATUS_STYLES[r.status] || ''}`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={isDisableOpen}
        onClose={() => setIsDisableOpen(false)}
        onConfirm={() => handleToggleStatus(false)}
        title="Disable Customer Account"
        description={`Disable ${customer?.fullName}'s account? They won't be able to log in until reactivated.`}
        confirmText="Yes, Disable"
        isLoading={submitting}
        variant="destructive"
      />
      <ConfirmDialog
        isOpen={isActivateOpen}
        onClose={() => setIsActivateOpen(false)}
        onConfirm={() => handleToggleStatus(true)}
        title="Activate Customer Account"
        description={`Activate ${customer?.fullName}'s account? They will be able to log in again.`}
        confirmText="Yes, Activate"
        isLoading={submitting}
        variant="info"
      />
    </>
  );
}
