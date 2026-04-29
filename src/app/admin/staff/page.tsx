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

  const handleToggleStatus = async (member: Staff) => {
    try {
      const response: ApiResponse<any> = await api.put(`/api/Staff/${member.id}`, { ...member, isActive: !member.isActive });
      if (response.success) {
        toast.success(`Account ${!member.isActive ? 'activated' : 'deactivated'}`);
        fetchStaff();
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

          <DataTable
            columns={[
              {
                key: "member",
                header: "Member",
                render: (member) => (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#F97316] flex items-center justify-center text-white font-bold">
                      {member.fullName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-900 dark:text-white">{member.fullName}</p>
                      <p className="text-xs text-zinc-500">{member.role}</p>
                    </div>
                  </div>
                ),
              },
              {
                key: "contact",
                header: "Contact",
                render: (member) => (
                  <div className="text-sm">
                    <p className="text-zinc-900 dark:text-zinc-300">{member.email}</p>
                    <p className="text-zinc-500">{member.phoneNumber}</p>
                  </div>
                ),
              },
              {
                key: "status",
                header: "Status",
                render: (member) => (
                  <div className="flex items-center gap-3">
                    <Switch 
                      checked={member.isActive} 
                      onChange={() => handleToggleStatus(member)}
                    />
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                      member.isActive ? 'text-green-500' : 'text-zinc-500'
                    }`}>
                      {member.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                ),
              },
              {
                key: "address",
                header: "Address",
                render: (member) => (
                  <span className="text-sm text-zinc-500">{member.address}</span>
                ),
              },
              {
                key: "actions",
                header: "Actions",
                className: "text-right",
                render: (member) => (
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
                ),
              },
            ]}
            data={filteredStaff}
            loading={loading}
            keyExtractor={(s) => s.id}
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search by name or email..."
            onRefresh={fetchStaff}
            emptyIcon={UserCog}
            emptyMessage="No staff members found matching your search."
          />
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
