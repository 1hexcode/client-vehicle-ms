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
      const response: ApiResponse<Vendor[]> = await api.get("/api/Vendors");
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
        `/api/Vendors/${vendorToDelete}`,
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

  const handleSubmit = async (data: any) => {
    try {
      setSubmitting(true);
      if (selectedVendor) {
        // Exclude openingBalance from update if backend doesn't expect it, but we can send it since dto might ignore it or allow it
        const response: ApiResponse<any> = await api.put(
          `/api/Vendors/${selectedVendor.id}`,
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
        const response: ApiResponse<any> = await api.post("/api/Vendors", data);
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

        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden">
          <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex flex-col md:flex-row gap-4 items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search by name, email or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                suppressHydrationWarning
                className="w-full pl-12 pr-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
              />
            </div>
            <button
              onClick={fetchVendors}
              className="p-3 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
              title="Refresh List"
            >
              <RefreshCw
                className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
              />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-950/50">
                  <th className="px-6 py-4 font-semibold text-zinc-600 dark:text-zinc-400 text-sm">
                    Vendor
                  </th>
                  <th className="px-6 py-4 font-semibold text-zinc-600 dark:text-zinc-400 text-sm">
                    Contact
                  </th>
                  <th className="px-6 py-4 font-semibold text-zinc-600 dark:text-zinc-400 text-sm">
                    Status
                  </th>
                  <th className="px-6 py-4 font-semibold text-zinc-600 dark:text-zinc-400 text-sm">
                    Due Amount
                  </th>
                  <th className="px-6 py-4 font-semibold text-zinc-600 dark:text-zinc-400 text-sm text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td
                        colSpan={5}
                        className="px-6 py-8 h-16 bg-zinc-50/20 dark:bg-zinc-800/20"
                      ></td>
                    </tr>
                  ))
                ) : filteredVendors.length > 0 ? (
                  filteredVendors.map((vendor) => (
                    <tr
                      key={vendor.id}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold">
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
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <p className="text-zinc-900 dark:text-zinc-300">
                          {vendor.phone}
                        </p>
                        {vendor.email && (
                          <p className="text-zinc-500">{vendor.email}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                            vendor.isActive
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          }`}
                        >
                          {vendor.isActive ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                          {vendor.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-red-500">
                        Rs. {(vendor.dueAmount || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
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
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-20 text-center text-zinc-500"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Store className="w-12 h-12 text-zinc-200" />
                        <p>No vendors found matching your search.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
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
