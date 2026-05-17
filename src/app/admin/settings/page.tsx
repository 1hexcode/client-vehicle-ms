"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Settings as SettingsIcon,
  FileText,
  UserCircle,
  Plus,
  Receipt,
  Wallet,
  Hash,
  Eye,
} from "lucide-react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { ApiResponse, MeProfile, PurchaseInvoice } from "@/types";
import Modal from "@/components/ui/Modal";
import DataTable from "@/components/ui/DataTable";
import { StatsCard } from "@/components/ui/StatsCard";
import PurchaseInvoiceForm, { PurchaseInvoiceFormValues } from "@/components/admin/PurchaseInvoiceForm";
import ProfileForm, { ProfileFormValues } from "@/components/admin/ProfileForm";
import ChangePasswordForm, { ChangePasswordFormValues } from "@/components/admin/ChangePasswordForm";

type TabKey = "invoices" | "profile";

export default function AdminSettingsPage() {
  const [tab, setTab] = useState<TabKey>("invoices");

  // ── Purchase Invoices ────────────────────────────────────
  const [invoices, setInvoices] = useState<PurchaseInvoice[]>([]);
  const [invLoading, setInvLoading] = useState(true);
  const [invSearch, setInvSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [detailInvoice, setDetailInvoice] = useState<PurchaseInvoice | null>(null);

  const fetchInvoices = async () => {
    try {
      setInvLoading(true);
      const res: ApiResponse<PurchaseInvoice[]> = await api.get("/api/purchase-invoices");
      if (res.success) {
        setInvoices(res.data || []);
      } else {
        toast.error(res.message || "Failed to load invoices");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to load invoices");
    } finally {
      setInvLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "invoices") fetchInvoices();
  }, [tab]);

  const handleCreateInvoice = async (data: PurchaseInvoiceFormValues) => {
    try {
      setSubmitting(true);
      const payload = {
        vendorId: data.vendorId,
        receivedAt: new Date(data.receivedAt).toISOString(),
        tax: Number(data.tax) || 0,
        notes: data.notes || "",
        items: data.items.map((i) => ({
          vehiclePartId: i.vehiclePartId,
          quantity: Number(i.quantity),
          unitCost: Number(i.unitCost),
        })),
      };
      const res: ApiResponse<PurchaseInvoice> = await api.post("/api/purchase-invoices", payload);
      if (res.success) {
        toast.success(res.message || "Purchase invoice created");
        setIsCreateOpen(false);
        fetchInvoices();
      } else {
        toast.error(res.message || "Failed to create invoice");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to create invoice");
    } finally {
      setSubmitting(false);
    }
  };

  const openInvoice = async (id: string) => {
    try {
      const res: ApiResponse<PurchaseInvoice> = await api.get(`/api/purchase-invoices/${id}`);
      if (res.success && res.data) setDetailInvoice(res.data);
      else toast.error(res.message || "Failed to load invoice");
    } catch (e: any) {
      toast.error(e.message || "Failed to load invoice");
    }
  };

  const filteredInvoices = useMemo(() => {
    const q = invSearch.trim().toLowerCase();
    if (!q) return invoices;
    return invoices.filter(
      (i) =>
        (i.invoiceNumber || "").toLowerCase().includes(q) ||
        (i.vendorName || "").toLowerCase().includes(q)
    );
  }, [invoices, invSearch]);

  const invoiceStats = useMemo(() => {
    const totalValue = invoices.reduce((s, i) => s + (i.total || 0), 0);
    const thisMonth = invoices.filter((i) => {
      const d = new Date(i.receivedAt || i.createdAt);
      const now = new Date();
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }).length;
    return { count: invoices.length, totalValue, thisMonth };
  }, [invoices]);

  // ── Profile / Password ───────────────────────────────────
  const [profile, setProfile] = useState<MeProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const fetchProfile = async () => {
    try {
      setProfileLoading(true);
      const res: ApiResponse<MeProfile> = await api.get("/api/me");
      if (res.success && res.data) {
        setProfile(res.data);
      } else {
        toast.error(res.message || "Failed to load profile");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to load profile");
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "profile") fetchProfile();
  }, [tab]);

  const handleSaveProfile = async (data: ProfileFormValues) => {
    try {
      setSavingProfile(true);
      const res: ApiResponse<MeProfile> = await api.put("/api/me", data);
      if (res.success) {
        toast.success(res.message || "Profile updated");
        if (res.data) setProfile(res.data);
        else fetchProfile();
      } else {
        toast.error(res.message || "Failed to update profile");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (data: ChangePasswordFormValues) => {
    try {
      setSavingPassword(true);
      const res: ApiResponse<string> = await api.post("/api/me/change-password", data);
      if (res.success) {
        toast.success(res.message || "Password updated");
      } else {
        toast.error(res.message || "Failed to update password");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to update password");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-orange-600" />
            Settings
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Manage purchase invoices and your account
          </p>
        </div>

        <div className="flex bg-zinc-100 dark:bg-[#141414] border border-zinc-200 dark:border-[#222] rounded-xl p-1 w-fit">
          <TabButton active={tab === "invoices"} onClick={() => setTab("invoices")} icon={FileText}>
            Purchase Invoices
          </TabButton>
          <TabButton active={tab === "profile"} onClick={() => setTab("profile")} icon={UserCircle}>
            My Profile
          </TabButton>
        </div>

        {tab === "invoices" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatsCard label="Total Invoices" value={invoiceStats.count} icon={Hash} variant="default" />
              <StatsCard
                label="Total Purchase Value"
                value={`Rs. ${invoiceStats.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                icon={Wallet}
                variant="success"
              />
              <StatsCard label="This Month" value={invoiceStats.thisMonth} icon={Receipt} variant="info" />
            </div>

            <DataTable
              columns={[
                {
                  key: "invoiceNumber",
                  header: "Invoice #",
                  render: (i) => (
                    <span className="font-mono font-bold text-zinc-900 dark:text-white">
                      {i.invoiceNumber || i.id.slice(0, 8).toUpperCase()}
                    </span>
                  ),
                },
                {
                  key: "vendor",
                  header: "Vendor",
                  render: (i) => (
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">{i.vendorName || "—"}</span>
                  ),
                },
                {
                  key: "receivedAt",
                  header: "Received",
                  render: (i) => {
                    const d = new Date(i.receivedAt || i.createdAt);
                    return (
                      <div className="text-sm text-zinc-700 dark:text-zinc-300">
                        {d.toLocaleDateString()}
                        <span className="block text-xs text-zinc-500">
                          {d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    );
                  },
                },
                {
                  key: "items",
                  header: "Items",
                  render: (i) => (
                    <span className="text-sm text-zinc-500">{i.items?.length || 0}</span>
                  ),
                },
                {
                  key: "total",
                  header: "Total",
                  className: "text-right",
                  render: (i) => (
                    <span className="text-sm font-bold text-orange-600 dark:text-orange-500 tabular-nums">
                      Rs. {(i.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  ),
                },
                {
                  key: "actions",
                  header: "",
                  className: "text-right",
                  render: (i) => (
                    <button
                      onClick={() => openInvoice(i.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-orange-500 hover:text-orange-400"
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </button>
                  ),
                },
              ]}
              data={filteredInvoices}
              loading={invLoading}
              keyExtractor={(i) => i.id}
              searchValue={invSearch}
              onSearchChange={setInvSearch}
              searchPlaceholder="Search by invoice # or vendor..."
              onRefresh={fetchInvoices}
              emptyIcon={FileText}
              emptyMessage="No purchase invoices yet. Click 'New Invoice' to record one."
              headerActions={
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-orange-500/20 transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" /> New Invoice
                </button>
              }
            />
          </div>
        )}

        {tab === "profile" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard
              title="Personal Information"
              description="Update your name, phone and address"
            >
              {profileLoading && !profile ? (
                <SkeletonRows />
              ) : (
                <ProfileForm
                  initialData={profile}
                  onSubmit={handleSaveProfile}
                  isLoading={savingProfile}
                />
              )}
            </SectionCard>

            <SectionCard
              title="Change Password"
              description="Use a strong password you don't reuse elsewhere"
            >
              <ChangePasswordForm onSubmit={handleChangePassword} isLoading={savingPassword} />
            </SectionCard>
          </div>
        )}
      </div>

      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="New Purchase Invoice"
        size="2xl"
      >
        <PurchaseInvoiceForm onSubmit={handleCreateInvoice} isLoading={submitting} />
      </Modal>

      <Modal
        isOpen={!!detailInvoice}
        onClose={() => setDetailInvoice(null)}
        title={`Invoice ${detailInvoice?.invoiceNumber || ""}`}
        size="xl"
      >
        {detailInvoice && <InvoiceDetail invoice={detailInvoice} />}
      </Modal>
    </>
  );
}

function TabButton({
  active,
  onClick,
  children,
  icon: Icon,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon: any;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "bg-white dark:bg-[#1A1A1A] text-zinc-900 dark:text-white shadow-sm"
          : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
      }`}
    >
      <Icon className="w-4 h-4" />
      {children}
    </button>
  );
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-5">
      <div>
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{title}</h3>
        {description && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

function SkeletonRows() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
      <div className="h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
      <div className="h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
      <div className="h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 w-32" />
    </div>
  );
}

function InvoiceDetail({ invoice }: { invoice: PurchaseInvoice }) {
  const subtotal = invoice.subtotal ?? (invoice.total - (invoice.tax || 0));
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <Meta label="Vendor" value={invoice.vendorName || "—"} />
        <Meta label="Received" value={new Date(invoice.receivedAt || invoice.createdAt).toLocaleString()} />
        <Meta label="Items" value={String(invoice.items?.length || 0)} />
        <Meta label="Status" value={invoice.status || "—"} />
      </div>

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-950/50">
            <tr>
              <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-zinc-500">Part</th>
              <th className="px-4 py-2.5 text-right text-[10px] font-bold uppercase tracking-wider text-zinc-500">Qty</th>
              <th className="px-4 py-2.5 text-right text-[10px] font-bold uppercase tracking-wider text-zinc-500">Unit Cost</th>
              <th className="px-4 py-2.5 text-right text-[10px] font-bold uppercase tracking-wider text-zinc-500">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {(invoice.items || []).map((it, idx) => {
              const total = it.lineTotal ?? (it.quantity || 0) * (it.unitCost || 0);
              return (
                <tr key={it.id || idx}>
                  <td className="px-4 py-2.5 text-zinc-700 dark:text-zinc-300">{it.vehiclePartName || it.vehiclePartId}</td>
                  <td className="px-4 py-2.5 text-right text-zinc-700 dark:text-zinc-300 tabular-nums">{it.quantity}</td>
                  <td className="px-4 py-2.5 text-right text-zinc-700 dark:text-zinc-300 tabular-nums">
                    Rs. {it.unitCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold text-zinc-900 dark:text-white tabular-nums">
                    Rs. {total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {invoice.notes && (
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Notes</p>
          <p className="text-sm text-zinc-700 dark:text-zinc-300">{invoice.notes}</p>
        </div>
      )}

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0F0F0F] p-4 space-y-2 max-w-sm ml-auto">
        <Row label="Subtotal" value={subtotal} />
        <Row label="Tax" value={invoice.tax || 0} />
        <div className="border-t border-zinc-200 dark:border-zinc-800 pt-2">
          <Row label="Grand Total" value={invoice.total} highlight />
        </div>
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="text-sm text-zinc-900 dark:text-white mt-0.5">{value}</p>
    </div>
  );
}

function Row({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className={highlight ? "text-sm font-semibold text-zinc-700 dark:text-zinc-300" : "text-xs text-zinc-500"}>
        {label}
      </span>
      <span
        className={
          highlight
            ? "text-base font-bold text-orange-500 tabular-nums"
            : "text-xs text-zinc-700 dark:text-zinc-300 tabular-nums"
        }
      >
        Rs. {value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
    </div>
  );
}
