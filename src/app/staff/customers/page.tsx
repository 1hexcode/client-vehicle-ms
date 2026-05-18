"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { User, ApiResponse } from "@/types";
import {
  Plus, Mail, Phone, MapPin, UserCog2,
  Users, ShieldCheck, ShieldAlert, Trash2, MoreVertical,
  CheckCircle2, XCircle, Eye,
} from "lucide-react";
import toast from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import DataTable from "@/components/ui/DataTable";
import { StatsCard } from "@/components/ui/StatsCard";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import CustomerForm from "@/components/staff/CustomerForm";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function StaffCustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDisableOpen, setIsDisableOpen] = useState(false);
  const [isActivateOpen, setIsActivateOpen] = useState(false);
  const [targetCustomer, setTargetCustomer] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const res: ApiResponse<User[]> = await api.get("/api/Customers");
      if (res.success) setCustomers(res.data || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load customers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const handleRegister = async (data: any) => {
    try {
      setSubmitting(true);
      const res: ApiResponse<any> = await api.post("/api/Customers/with-vehicle", data);
      if (res.success) {
        toast.success("Customer registered successfully");
        setIsModalOpen(false);
        fetchCustomers();
      } else {
        toast.error(res.message || "Registration failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDisableConfirm = async () => {
    if (!targetCustomer) return;
    try {
      setSubmitting(true);
      const res: ApiResponse<any> = await api.patch(`/api/Users/${targetCustomer.id}/status`, { isActive: false });
      if (res.success) {
        toast.success("Customer disabled");
        setIsDisableOpen(false);
        fetchCustomers();
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to disable");
    } finally {
      setSubmitting(false);
      setTargetCustomer(null);
    }
  };

  const handleActivateConfirm = async () => {
    if (!targetCustomer) return;
    try {
      setSubmitting(true);
      const res: ApiResponse<any> = await api.patch(`/api/Users/${targetCustomer.id}/status`, { isActive: true });
      if (res.success) {
        toast.success("Customer activated");
        setIsActivateOpen(false);
        fetchCustomers();
      } else {
        toast.error(res.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to activate");
    } finally {
      setSubmitting(false);
      setTargetCustomer(null);
    }
  };

  const columns = [
    {
      key: "customer",
      header: "Customer",
      render: (row: User) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center text-orange-600 font-bold text-sm border border-orange-200 dark:border-orange-800/30">
            {row.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-zinc-900 dark:text-white">{row.fullName}</p>
            <p className="text-xs text-zinc-500 flex items-center gap-1">
              <Mail className="w-3 h-3" /> {row.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      render: (row: User) => (
        <div className="text-sm space-y-0.5">
          <p className="text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
            <Phone className="w-3 h-3 text-zinc-400" /> {row.phoneNumber}
          </p>
          <p className="text-zinc-500 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-zinc-400" /> {row.address}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row: User) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
          row.isActive
            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
        }`}>
          {row.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (row: User) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <MoreVertical className="w-4 h-4 text-zinc-500" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => router.push(`/staff/customers/${row.id}`)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Eye className="w-4 h-4" /> View Details
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {row.isActive ? (
              <DropdownMenuItem
                onClick={() => { setTargetCustomer(row); setIsDisableOpen(true); }}
                className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
              >
                <Trash2 className="w-4 h-4" /> Disable Account
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={() => { setTargetCustomer(row); setIsActivateOpen(true); }}
                className="flex items-center gap-2 cursor-pointer text-green-600 focus:text-green-600 focus:bg-green-50 dark:focus:bg-green-900/20"
              >
                <CheckCircle2 className="w-4 h-4" /> Activate Account
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const filtered = customers.filter(
    (c) =>
      c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phoneNumber.includes(searchTerm)
  );

  return (
    <>
      <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
              <UserCog2 className="w-8 h-8 text-orange-600" /> Customer Management
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">
              Register customers and manage their vehicle accounts
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-semibold shadow-lg shadow-orange-500/20 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" /> Register Customer
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard label="Total Customers" value={customers.length} icon={Users} variant="default" />
          <StatsCard label="Active" value={customers.filter((c) => c.isActive).length} icon={ShieldCheck} variant="success" />
          <StatsCard label="Inactive" value={customers.filter((c) => !c.isActive).length} icon={ShieldAlert} variant="danger" />
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          keyExtractor={(c) => c.id}
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search by name, email, or phone..."
          onRefresh={fetchCustomers}
          emptyIcon={Users}
          emptyMessage="No customers found."
        />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register New Customer">
        <CustomerForm onSubmit={handleRegister} isLoading={submitting} />
      </Modal>

      <ConfirmDialog
        isOpen={isDisableOpen}
        onClose={() => { setIsDisableOpen(false); setTargetCustomer(null); }}
        onConfirm={handleDisableConfirm}
        title="Disable Customer Account"
        description={`Are you sure you want to disable ${targetCustomer?.fullName}'s account? They won't be able to log in until reactivated.`}
        confirmText="Yes, Disable"
        isLoading={submitting}
        variant="destructive"
      />

      <ConfirmDialog
        isOpen={isActivateOpen}
        onClose={() => { setIsActivateOpen(false); setTargetCustomer(null); }}
        onConfirm={handleActivateConfirm}
        title="Activate Customer Account"
        description={`Activate ${targetCustomer?.fullName}'s account? They will be able to log in again.`}
        confirmText="Yes, Activate"
        isLoading={submitting}
        variant="info"
      />
    </>
  );
}
