"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Vendor, ApiResponse } from "@/types";
import {
  Plus,
  Search,
  UserCog,
  Trash2,
  MoreVertical,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Edit,
  Users,
  Store,
  DollarSign,
} from "lucide-react";
import toast from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import VendorForm from "@/components/admin/VendorForm";
import Switch from "@/components/ui/Switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatsCard } from "@/components/ui/StatsCard";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import DataTable from "@/components/ui/DataTable";
import Link from "next/link";

export default function VendorsManagementPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | undefined>();
  const [vendorToDelete, setVendorToDelete] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const response: ApiResponse<Vendor[]> = await api.get("/api/vendors");
      if (response.success) {
        setVendors(response.data || []);
      } else {
        toast.error(response.message);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch vendors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleAddVendor = () => {
    setSelectedVendor(undefined);
    setIsModalOpen(true);
  };

  const handleEditVendor = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setVendorToDelete(id);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!vendorToDelete) return;

    try {
      setSubmitting(true);
      const response: ApiResponse<string> = await api.delete(
        `/api/vendors/${vendorToDelete}`,
      );
      if (response.success) {
        toast.success("Vendor account disabled");
        setIsConfirmOpen(false);
        fetchVendors();
      } else {
        toast.error(response.message);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to disable vendor");
    } finally {
      setSubmitting(false);
      setVendorToDelete(null);
    }
  };

  const handleToggleStatus = async (vendor: Vendor) => {
    try {
      const response: ApiResponse<any> = await api.put(`/api/vendors/${vendor.id}`, { ...vendor, isActive: !vendor.isActive });
      if (response.success) {
        toast.success(`Vendor ${!vendor.isActive ? 'enabled' : 'disabled'}`);
        fetchVendors();
      } else {
        toast.error(response.message);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      setSubmitting(true);
      if (selectedVendor) {
        // Exclude openingBalance from update if backend doesn't expect it, but we can send it since dto might ignore it or allow it
        const response: ApiResponse<any> = await api.put(
          `/api/vendors/${selectedVendor.id}`,
          data,
        );
        if (response.success) {
          toast.success("Vendor details updated");
          setIsModalOpen(false);
          fetchVendors();
        } else {
          toast.error(response.message);
        }
      } else {
        const response: ApiResponse<any> = await api.post("/api/vendors", data);
        if (response.success) {
          toast.success("New vendor registered");
          setIsModalOpen(false);
          fetchVendors();
        } else {
          toast.error(response.message);
        }
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredVendors = vendors.filter(
    (v) =>
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.email && v.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      v.phone.includes(searchTerm),
  );

  const totalDue = vendors?.reduce((acc, v) => acc + (v.dueAmount || 0), 0) ?? 0;

  return (
    <>
      <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
              <Store className="w-8 h-8 text-orange-600" />
              Vendor Management
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">
              Manage your suppliers, balances, and payments
            </p>
          </div>
          <button
            onClick={handleAddVendor}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-semibold shadow-lg shadow-orange-500/20 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Add New Vendor
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            label="Total Vendors"
            value={vendors.length}
            icon={Store}
            variant="default"
          />
          <StatsCard
            label="Active Vendors"
            value={vendors.filter((v) => v.isActive).length}
            icon={CheckCircle2}
            variant="success"
          />
          <StatsCard
            label="Total Due Amount"
            value={`Rs. ${totalDue?.toLocaleString() ?? "0"}`}
            icon={DollarSign}
            variant="danger"
          />
        </div>

        <DataTable
          columns={[
            {
              key: "vendor",
              header: "Vendor",
              render: (vendor) => (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#F97316] flex items-center justify-center text-white font-bold">
                    {vendor.name.charAt(0)}
                  </div>
                  <div>
                    <Link
                      href={`/admin/vendors/${vendor.id}`}
                      className="font-semibold text-zinc-900 dark:text-white hover:text-orange-500 transition-colors"
                    >
                      {vendor.name}
                    </Link>
                    <p className="text-xs text-zinc-500">
                      {vendor.contactPerson || "No contact person"}
                    </p>
                  </div>
                </div>
              ),
            },
            {
              key: "contact",
              header: "Contact",
              render: (vendor) => (
                <div className="text-sm">
                  <p className="text-zinc-900 dark:text-zinc-300">
                    {vendor.phone}
                  </p>
                  {vendor.email && (
                    <p className="text-zinc-500">{vendor.email}</p>
                  )}
                </div>
              ),
            },
              {
                key: "status",
                header: "Status",
                render: (vendor) => (
                  <div className="flex items-center gap-3">
                    <Switch 
                      checked={vendor.isActive} 
                      onChange={() => handleToggleStatus(vendor)}
                    />
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                      vendor.isActive ? "text-green-500" : "text-zinc-500"
                    }`}>
                      {vendor.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                ),
              },
            {
              key: "dueAmount",
              header: "Due Amount",
              render: (vendor) => (
                <span className="text-sm font-semibold text-red-500">
                  Rs. {(vendor.dueAmount || 0).toLocaleString()}
                </span>
              ),
            },
            {
              key: "actions",
              header: "Actions",
              className: "text-right",
              render: (vendor) => (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                      <MoreVertical className="w-5 h-5 text-zinc-500" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link
                        href={`/admin/vendors/${vendor.id}`}
                        className="flex items-center gap-2 cursor-pointer text-zinc-700 dark:text-zinc-300"
                      >
                        <Search className="w-4 h-4 text-blue-500" />
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleEditVendor(vendor)}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Edit className="w-4 h-4 text-blue-500" />
                      Edit Details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDeleteClick(vendor.id)}
                      className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                      Disable Account
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ),
            },
          ]}
          data={filteredVendors}
          loading={loading}
          keyExtractor={(v) => v.id}
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search by name, email or phone..."
          onRefresh={fetchVendors}
          emptyIcon={Store}
          emptyMessage="No vendors found matching your search."
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedVendor ? "Update Vendor" : "Register New Vendor"}
      >
        <VendorForm
          initialData={selectedVendor}
          onSubmit={handleSubmit}
          isLoading={submitting}
        />
      </Modal>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Disable Vendor"
        description="Are you sure you want to disable this vendor? This will not delete past transactions but will prevent future ones."
        confirmText="Yes, Disable"
        isLoading={submitting}
        variant="destructive"
      />
    </>
  );
}
