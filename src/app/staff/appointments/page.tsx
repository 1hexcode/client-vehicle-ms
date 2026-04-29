"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { User, Vehicle, Appointment, ApiResponse } from "@/types";
import {
  Plus, Calendar, Clock, Car, Tag, User as UserIcon,
  CalendarCheck, CalendarClock, CheckCircle2, XCircle, MoreVertical,
} from "lucide-react";
import toast from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import DataTable from "@/components/ui/DataTable";
import { StatsCard } from "@/components/ui/StatsCard";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import AppointmentForm from "@/components/staff/AppointmentForm";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const STATUS_STYLES: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function StaffAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [apptRes, custRes, vehRes] = await Promise.all([
        api.get("/api/Appointments") as Promise<ApiResponse<Appointment[]>>,
        api.get("/api/Customers") as Promise<ApiResponse<User[]>>,
        api.get("/api/Vehicles") as Promise<ApiResponse<Vehicle[]>>,
      ]);
      if (apptRes.success) setAppointments(apptRes.data || []);
      if (custRes.success) setCustomers(custRes.data || []);
      if (vehRes.success) setVehicles(vehRes.data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleCreate = async (data: any) => {
    try {
      setSubmitting(true);
      const res: ApiResponse<Appointment> = await api.post("/api/Appointments/staff", data);
      if (res.success) {
        toast.success("Appointment booked successfully");
        setIsCreateOpen(false);
        fetchAll();
      } else {
        toast.error(res.message || "Booking failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Booking failed");
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      setSubmitting(true);
      const res: ApiResponse<any> = await api.patch(`/api/Appointments/${id}/status`, { status });
      if (res.success) {
        toast.success(`Appointment ${status.toLowerCase()}`);
        fetchAll();
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Update failed");
    } finally {
      setSubmitting(false);
      setTargetId(null);
    }
  };

  const handleCancelConfirm = () => targetId && updateStatus(targetId, "Cancelled").then(() => setIsCancelOpen(false));
  const handleCompleteConfirm = () => targetId && updateStatus(targetId, "Completed").then(() => setIsCompleteOpen(false));
  const handleConfirmAppt = () => targetId && updateStatus(targetId, "Confirmed").then(() => setIsConfirmOpen(false));

  const filtered = appointments.filter(
    (a) =>
      a.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.serviceType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      key: "customer",
      header: "Customer",
      render: (row: Appointment) => (
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
      key: "service",
      header: "Service",
      render: (row: Appointment) => (
        <div>
          <p className="text-sm font-medium text-zinc-900 dark:text-white flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-orange-500" /> {row.serviceType}
          </p>
          {row.notes && (
            <p className="text-xs text-zinc-400 mt-0.5 max-w-[180px] truncate">{row.notes}</p>
          )}
        </div>
      ),
    },
    {
      key: "datetime",
      header: "Scheduled",
      render: (row: Appointment) => {
        const dt = new Date(row.requestedAt);
        return (
          <div className="text-sm space-y-0.5">
            <p className="text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              {dt.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })}
            </p>
            <p className="text-zinc-500 flex items-center gap-1">
              <Clock className="w-3 h-3 text-zinc-400" />
              {dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      render: (row: Appointment) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[row.status] || ""}`}>
          {row.status}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (row: Appointment) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <MoreVertical className="w-4 h-4 text-zinc-500" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {row.status === "Pending" && (
              <DropdownMenuItem
                onClick={() => { setTargetId(row.id); setIsConfirmOpen(true); }}
                className="flex items-center gap-2 cursor-pointer text-blue-600 focus:text-blue-600 focus:bg-blue-50 dark:focus:bg-blue-900/20"
              >
                <CheckCircle2 className="w-4 h-4" /> Confirm
              </DropdownMenuItem>
            )}
            {row.status === "Confirmed" && (
              <DropdownMenuItem
                onClick={() => { setTargetId(row.id); setIsCompleteOpen(true); }}
                className="flex items-center gap-2 cursor-pointer text-green-600 focus:text-green-600 focus:bg-green-50 dark:focus:bg-green-900/20"
              >
                <CheckCircle2 className="w-4 h-4" /> Mark Complete
              </DropdownMenuItem>
            )}
            {(row.status === "Pending" || row.status === "Confirmed") && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => { setTargetId(row.id); setIsCancelOpen(true); }}
                  className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
                >
                  <XCircle className="w-4 h-4" /> Cancel
                </DropdownMenuItem>
              </>
            )}
            {(row.status === "Completed" || row.status === "Cancelled") && (
              <DropdownMenuItem disabled className="text-zinc-400 text-xs">
                No actions available
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const pending = appointments.filter((a) => a.status === "Pending").length;
  const confirmed = appointments.filter((a) => a.status === "Confirmed").length;
  const completed = appointments.filter((a) => a.status === "Completed").length;

  return (
    <>
      <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
              <CalendarCheck className="w-8 h-8 text-orange-600" /> Appointment Management
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">
              View and schedule customer service appointments
            </p>
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-semibold shadow-lg shadow-orange-500/20 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" /> Book Appointment
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard label="Pending" value={pending} icon={CalendarClock} variant="warning" />
          <StatsCard label="Confirmed" value={confirmed} icon={CalendarCheck} variant="info" />
          <StatsCard label="Completed" value={completed} icon={CheckCircle2} variant="success" />
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          keyExtractor={(a) => a.id}
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search by customer, vehicle or service..."
          onRefresh={fetchAll}
          emptyIcon={Calendar}
          emptyMessage="No appointments found."
        />
      </div>

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Book New Appointment">
        <AppointmentForm
          onSubmit={handleCreate}
          isLoading={submitting}
          customers={customers}
          vehicles={vehicles}
        />
      </Modal>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => { setIsConfirmOpen(false); setTargetId(null); }}
        onConfirm={handleConfirmAppt}
        title="Confirm Appointment"
        description="Confirm this appointment? The customer will be notified."
        confirmText="Yes, Confirm"
        isLoading={submitting}
        variant="info"
      />

      <ConfirmDialog
        isOpen={isCompleteOpen}
        onClose={() => { setIsCompleteOpen(false); setTargetId(null); }}
        onConfirm={handleCompleteConfirm}
        title="Mark as Completed"
        description="Mark this appointment as completed? This cannot be undone."
        confirmText="Mark Complete"
        isLoading={submitting}
        variant="warning"
      />

      <ConfirmDialog
        isOpen={isCancelOpen}
        onClose={() => { setIsCancelOpen(false); setTargetId(null); }}
        onConfirm={handleCancelConfirm}
        title="Cancel Appointment"
        description="Are you sure you want to cancel this appointment? This action cannot be undone."
        confirmText="Yes, Cancel"
        isLoading={submitting}
        variant="destructive"
      />
    </>
  );
}
