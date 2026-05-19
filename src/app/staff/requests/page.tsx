'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { PartRequest, ApiResponse } from '@/types';
import {
  Package, Clock, Car, CheckCircle2, XCircle, MoreVertical,
  RefreshCw, Search, FileText, User as UserIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '@/components/ui/DataTable';
import { StatsCard } from '@/components/ui/StatsCard';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const STATUS_STYLES: Record<string, string> = {
  Requested: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Fulfilled: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export default function StaffPartRequestsPage() {
  const [requests, setRequests] = useState<PartRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [targetId, setTargetId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<'Fulfilled' | 'Rejected' | 'Processing' | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const res: ApiResponse<PartRequest[]> = await api.get('/api/part-requests');
      if (res.success) setRequests(res.data || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load part requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const handleStatusUpdate = async () => {
    if (!targetId || !confirmAction) return;
    try {
      setSubmitting(true);
      const res: ApiResponse<any> = await api.patch(`/api/part-requests/${targetId}/status`, { status: confirmAction });
      if (res.success) {
        toast.success(`Request marked as ${confirmAction}`);
        setConfirmAction(null);
        setTargetId(null);
        fetchRequests();
      } else {
        toast.error(res.message || 'Failed to update status');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setSubmitting(false);
    }
  };

  const counts = {
    All: requests.length,
    Requested: requests.filter((r) => r.status === 'Requested').length,
    Processing: requests.filter((r) => r.status === 'Processing').length,
    Fulfilled: requests.filter((r) => r.status === 'Fulfilled').length,
    Rejected: requests.filter((r) => r.status === 'Rejected').length,
  };

  const filtered = requests.filter((r) => {
    const matchSearch =
      r.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const columns = [
    {
      key: 'customer',
      header: 'Customer',
      render: (row: PartRequest) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/30 flex items-center justify-center text-orange-600 font-bold text-sm">
            {row.customerName?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-zinc-900 dark:text-white">{row.customerName}</p>
            <p className="text-xs text-zinc-500 flex items-center gap-1">
              <Car className="w-3 h-3" /> {row.vehicleNumber}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (row: PartRequest) => (
        <p className="text-sm text-zinc-700 dark:text-zinc-300 max-w-sm line-clamp-2">
          {row.description}
        </p>
      ),
    },
    {
      key: 'date',
      header: 'Submitted',
      render: (row: PartRequest) => (
        <p className="text-sm text-zinc-500 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          {new Date(row.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
        </p>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: PartRequest) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[row.status] || ''}`}>
          {row.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (row: PartRequest) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <MoreVertical className="w-4 h-4 text-zinc-500" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Update Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {(row.status === 'Requested' || row.status === 'Processing') ? (
              <>
                <DropdownMenuItem
                  onClick={() => { setTargetId(row.id); setConfirmAction('Fulfilled'); }}
                  className="flex items-center gap-2 cursor-pointer text-green-600 focus:text-green-600 focus:bg-green-50 dark:focus:bg-green-900/20 font-medium"
                >
                  <CheckCircle2 className="w-4 h-4" /> Accept
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => { setTargetId(row.id); setConfirmAction('Rejected'); }}
                  className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20 font-medium"
                >
                  <XCircle className="w-4 h-4" /> Reject
                </DropdownMenuItem>
                {row.status === 'Requested' && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => { setTargetId(row.id); setConfirmAction('Processing'); }}
                      className="flex items-center gap-2 cursor-pointer text-blue-600 focus:text-blue-600 focus:bg-blue-50 dark:focus:bg-blue-900/20"
                    >
                      <Package className="w-4 h-4" /> Mark Processing
                    </DropdownMenuItem>
                  </>
                )}
              </>
            ) : (
              <DropdownMenuItem disabled className="text-zinc-400 text-xs">
                No further actions
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <>
      <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
              <Package className="w-8 h-8 text-orange-600" /> Part Requests
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">
              Review and manage customer part requests
            </p>
          </div>
          <button
            onClick={fetchRequests}
            className="flex items-center gap-2 px-5 py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-2xl font-semibold transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard label="Requested" value={counts.Requested} icon={Clock} variant="warning" />
          <StatsCard label="Processing" value={counts.Processing} icon={Package} variant="info" />
          <StatsCard label="Fulfilled" value={counts.Fulfilled} icon={CheckCircle2} variant="success" />
          <StatsCard label="Rejected" value={counts.Rejected} icon={XCircle} variant="danger" />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {(['All', 'Requested', 'Processing', 'Fulfilled', 'Rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                statusFilter === status
                  ? 'bg-orange-600 text-white border-orange-600 shadow-lg shadow-orange-500/20'
                  : 'bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-orange-300 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              {status}
              <span className="ml-1.5 opacity-70">({counts[status]})</span>
            </button>
          ))}
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          keyExtractor={(r) => r.id}
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search by customer, vehicle or description..."
          onRefresh={fetchRequests}
          emptyIcon={FileText}
          emptyMessage="No part requests found."
        />
      </div>

      <ConfirmDialog
        isOpen={!!confirmAction && confirmAction === 'Processing'}
        onClose={() => { setConfirmAction(null); setTargetId(null); }}
        onConfirm={handleStatusUpdate}
        title="Mark as Processing"
        description="Mark this part request as currently being processed?"
        confirmText="Yes, Processing"
        isLoading={submitting}
        variant="info"
      />
      <ConfirmDialog
        isOpen={!!confirmAction && confirmAction === 'Fulfilled'}
        onClose={() => { setConfirmAction(null); setTargetId(null); }}
        onConfirm={handleStatusUpdate}
        title="Accept Part Request"
        description="Confirm that you want to accept this part request and mark it as fulfilled?"
        confirmText="Yes, Accept"
        isLoading={submitting}
        variant="info"
      />
      <ConfirmDialog
        isOpen={!!confirmAction && confirmAction === 'Rejected'}
        onClose={() => { setConfirmAction(null); setTargetId(null); }}
        onConfirm={handleStatusUpdate}
        title="Reject Part Request"
        description="Are you sure you want to reject this part request? The customer will be notified."
        confirmText="Yes, Reject"
        isLoading={submitting}
        variant="destructive"
      />
    </>
  );
}
