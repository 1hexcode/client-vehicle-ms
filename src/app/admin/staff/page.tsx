"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ApiResponse, Staff } from "@/types";
import { 
  Plus, 
  Search, 
  UserCog, 
  Trash2, 
  MoreVertical, 
  UserPlus,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Edit,
  Users,
  ShieldCheck,
  ShieldAlert
} from "lucide-react";
import toast from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import StaffForm from "@/components/admin/StaffForm";
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

export default function StaffManagementPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | undefined>();
  const [staffToDelete, setStaffToDelete] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response: ApiResponse<Staff[]> = await api.get("/api/Staff");
      if (response.success) {
        setStaff(response.data || []);
      } else {
        toast.error(response.message);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch staff");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleAddStaff = () => {
    setSelectedStaff(undefined);
    setIsModalOpen(true);
  };

  const handleEditStaff = (member: Staff) => {
    setSelectedStaff(member);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setStaffToDelete(id);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!staffToDelete) return;

    try {
      setSubmitting(true);
      const response: ApiResponse<string> = await api.delete(`/api/Staff/${staffToDelete}`);
      if (response.success) {
        toast.success("Staff account disabled");
        setIsConfirmOpen(false);
        fetchStaff();
      } else {
        toast.error(response.message);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to disable staff");
    } finally {
      setSubmitting(false);
      setStaffToDelete(null);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      setSubmitting(true);
      if (selectedStaff) {
        const response: ApiResponse<any> = await api.put(`/api/Staff/${selectedStaff.id}`, data);
        if (response.success) {
          toast.success("Staff details updated");
          setIsModalOpen(false);
          fetchStaff();
        } else {
          toast.error(response.message);
        }
      } else {
        const response: ApiResponse<any> = await api.post("/api/Staff", data);
        if (response.success) {
          toast.success("New staff registered");
          setIsModalOpen(false);
          fetchStaff();
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

  const filteredStaff = staff.filter(
    (s) =>
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
              <UserCog className="w-8 h-8 text-orange-600" />
              Staff Management
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">
              Manage your team members and their permissions
            </p>
          </div>
          <button
            onClick={handleAddStaff}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-semibold shadow-lg shadow-orange-500/20 transition-all active:scale-95"
          >
            <UserPlus className="w-5 h-5" />
            Add New Staff
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard 
            label="Total Staff"
            value={staff.length}
            icon={Users}
            variant="default"
          />
          <StatsCard 
            label="Active Staff"
            value={staff.filter(s => s.isActive).length}
            icon={ShieldCheck}
            variant="success"
          />
          <StatsCard 
            label="Inactive Staff"
            value={staff.filter(s => !s.isActive).length}
            icon={ShieldAlert}
            variant="danger"
          />
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden">
          <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex flex-col md:flex-row gap-4 items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
              />
            </div>
            <button 
              onClick={fetchStaff}
              className="p-3 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
              title="Refresh List"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-950/50">
                  <th className="px-6 py-4 font-semibold text-zinc-600 dark:text-zinc-400 text-sm">Member</th>
                  <th className="px-6 py-4 font-semibold text-zinc-600 dark:text-zinc-400 text-sm">Contact</th>
                  <th className="px-6 py-4 font-semibold text-zinc-600 dark:text-zinc-400 text-sm">Status</th>
                  <th className="px-6 py-4 font-semibold text-zinc-600 dark:text-zinc-400 text-sm">Address</th>
                  <th className="px-6 py-4 font-semibold text-zinc-600 dark:text-zinc-400 text-sm text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-6 py-8 h-16 bg-zinc-50/20 dark:bg-zinc-800/20"></td>
                    </tr>
                  ))
                ) : filteredStaff.length > 0 ? (
                  filteredStaff.map((member) => (
                    <tr key={member.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold">
                            {member.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-zinc-900 dark:text-white">{member.fullName}</p>
                            <p className="text-xs text-zinc-500">{member.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <p className="text-zinc-900 dark:text-zinc-300">{member.email}</p>
                        <p className="text-zinc-500">{member.phoneNumber}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                          member.isActive 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {member.isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {member.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-500">
                        {member.address}
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
                            <DropdownMenuItem 
                              onClick={() => handleEditStaff(member)}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <Edit className="w-4 h-4 text-blue-500" />
                              Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteClick(member.id)}
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
                    <td colSpan={5} className="px-6 py-20 text-center text-zinc-500">
                      <div className="flex flex-col items-center gap-2">
                        <UserCog className="w-12 h-12 text-zinc-200" />
                        <p>No staff members found matching your search.</p>
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
        title={selectedStaff ? "Update Staff Member" : "Register New Staff"}
      >
        <StaffForm
          initialData={selectedStaff}
          onSubmit={handleSubmit}
          isLoading={submitting}
        />
      </Modal>

      <ConfirmDialog 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Disable Staff Account"
        description="Are you sure you want to disable this staff member? They will no longer be able to log into the system until their account is reactivated."
        confirmText="Yes, Disable"
        isLoading={submitting}
        variant="destructive"
      />
    </>
  );
}
