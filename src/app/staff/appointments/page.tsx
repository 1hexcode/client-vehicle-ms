"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { User, Vehicle, Appointment, ApiResponse } from "@/types";
import { Plus, Search, Calendar, Clock, User as UserIcon, Car, Tag, ChevronRight, FileText } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import DataTable from "@/components/ui/DataTable";
import AppointmentForm from "@/components/staff/AppointmentForm";

export default function StaffAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [apptsRes, custsRes, vehsRes] = await Promise.all([
        api.get("/api/Appointments") as Promise<ApiResponse<Appointment[]>>,
        api.get("/api/Customers") as Promise<ApiResponse<User[]>>,
        api.get("/api/Vehicles") as Promise<ApiResponse<Vehicle[]>>,
      ]);

      if (apptsRes.success) setAppointments(apptsRes.data || []);
      if (custsRes.success) setCustomers(custsRes.data || []);
      if (vehsRes.success) setVehicles(vehsRes.data || []);
    } catch (error: any) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (data: any) => {
    try {
      setSubmitting(true);
      const response: ApiResponse<Appointment> = await api.post("/api/Appointments/staff", data);
      if (response.success) {
        toast.success("Appointment booked successfully");
        setIsModalOpen(false);
        fetchData();
      } else {
        toast.error(response.message || "Failed to book appointment");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAppointments = appointments.filter(
    (a) =>
      a.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.serviceType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    {
      header: "Customer & Vehicle",
      accessor: (row: Appointment) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500">
            <UserIcon size={20} />
          </div>
          <div>
            <div className="font-medium text-zinc-900 dark:text-white">{row.customerName}</div>
            <div className="text-xs text-zinc-500 flex items-center gap-1">
              <Car size={12} /> {row.vehicleNumber}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Service Details",
      accessor: (row: Appointment) => (
        <div>
          <div className="text-sm font-medium text-zinc-900 dark:text-white flex items-center gap-1">
            <Tag size={14} className="text-orange-500" /> {row.serviceType}
          </div>
          {row.notes && (
            <div className="text-xs text-zinc-500 line-clamp-1 max-w-[200px]">
              {row.notes}
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Scheduled For",
      accessor: (row: Appointment) => {
        const date = new Date(row.requestedAt);
        return (
          <div className="space-y-1">
            <div className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
              <Calendar size={14} /> {date.toLocaleDateString()}
            </div>
            <div className="text-xs text-zinc-500 flex items-center gap-1">
              <Clock size={12} /> {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        );
      },
    },
    {
      header: "Status",
      accessor: (row: Appointment) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.status === "Pending"
              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
              : row.status === "Confirmed"
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
              : row.status === "Completed"
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          {row.status}
        </span>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Appointment Management</h1>
          <p className="text-zinc-500 text-sm">View and schedule customer service appointments</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl transition-all shadow-lg shadow-orange-600/20 active:scale-95"
        >
          <Plus size={20} />
          <span>Book Appointment</span>
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
        <input
          type="text"
          placeholder="Search by customer, vehicle or service..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        <DataTable columns={columns} data={filteredAppointments} isLoading={loading} />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Book New Appointment"
      >
        <AppointmentForm 
          onSubmit={handleCreate} 
          isLoading={submitting} 
          customers={customers}
          vehicles={vehicles}
        />
      </Modal>
    </div>
  );
}
