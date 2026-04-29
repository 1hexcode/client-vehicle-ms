"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { User, ApiResponse } from "@/types";
import { Plus, Search, User as UserIcon, Phone, MapPin, Mail, Car } from "lucide-react";
import toast from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import DataTable from "@/components/ui/DataTable";
import CustomerForm from "@/components/staff/CustomerForm";

export default function StaffCustomersPage() {
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response: ApiResponse<User[]> = await api.get("/api/Customers");
      if (response.success) {
        setCustomers(response.data || []);
      }
    } catch (error: any) {
      toast.error("Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleRegister = async (data: any) => {
    try {
      setSubmitting(true);
      const response: ApiResponse<any> = await api.post("/api/Customers/with-vehicle", data);
      if (response.success) {
        toast.success("Customer and vehicle registered successfully");
        setIsModalOpen(false);
        fetchCustomers();
      } else {
        toast.error(response.message || "Failed to register customer");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phoneNumber.includes(searchQuery) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    {
      header: "Customer Info",
      accessor: (row: User) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
            <UserIcon size={20} />
          </div>
          <div>
            <div className="font-medium text-zinc-900 dark:text-white">{row.fullName}</div>
            <div className="text-xs text-zinc-500 flex items-center gap-1">
              <Mail size={12} /> {row.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Contact",
      accessor: (row: User) => (
        <div className="space-y-1">
          <div className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
            <Phone size={14} /> {row.phoneNumber}
          </div>
          <div className="text-xs text-zinc-500 flex items-center gap-1">
            <MapPin size={12} /> {row.address}
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      accessor: (row: User) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            row.isActive
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          {row.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Customer Management</h1>
          <p className="text-zinc-500 text-sm">Register and manage customer profiles and vehicle info</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl transition-all shadow-lg shadow-orange-600/20 active:scale-95"
        >
          <Plus size={20} />
          <span>New Customer</span>
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
        <input
          type="text"
          placeholder="Search by name, phone or email..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        <DataTable columns={columns} data={filteredCustomers} isLoading={loading} />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register New Customer"
        size="lg"
      >
        <CustomerForm onSubmit={handleRegister} isLoading={submitting} />
      </Modal>
    </div>
  );
}
