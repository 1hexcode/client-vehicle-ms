"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Vendor, VendorPayment, ApiResponse, VendorPurchaseItem } from "@/types";
import {
  ArrowLeft,
  PackagePlus,
  CreditCard,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Wallet,
  Receipt,
  CheckCircle2,
  XCircle,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import { StatsCard } from "@/components/ui/StatsCard";
import VendorPaymentForm from "@/components/admin/VendorPaymentForm";
import VendorAddPartsForm from "@/components/admin/VendorAddPartsForm";
import Link from "next/link";

export default function VendorDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const vendorId = params.id as string;

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [payments, setPayments] = useState<VendorPayment[]>([]);
  const [purchases, setPurchases] = useState<VendorPurchaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"payments" | "parts">("payments");
  
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isAddPartsModalOpen, setIsAddPartsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [vendorRes, paymentsRes, purchasesRes] = await Promise.all([
        api.get(`/api/Vendors/${vendorId}`) as Promise<ApiResponse<Vendor>>,
        api.get(`/api/Vendors/${vendorId}/payments`).catch(() => ({ success: false, data: [] })) as Promise<ApiResponse<VendorPayment[]>>,
        api.get(`/api/Vendors/${vendorId}/purchases`).catch(() => ({ success: false, data: [] })) as Promise<ApiResponse<VendorPurchaseItem[]>>
      ]);

      if (vendorRes.success && vendorRes.data) {
        setVendor(vendorRes.data);
      } else {
        toast.error(vendorRes.message || "Failed to load vendor");
        router.push("/admin/vendors");
      }

      if (paymentsRes.success && paymentsRes.data) {
        setPayments(paymentsRes.data);
      }
      
      if (purchasesRes.success && purchasesRes.data) {
        setPurchases(purchasesRes.data);
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (vendorId) {
      fetchData();
    }
  }, [vendorId]);

  const handleCreatePayment = async (data: any) => {
    try {
      setSubmitting(true);
      const response: ApiResponse<VendorPayment> = await api.post(`/api/Vendors/${vendorId}/payments`, data);
      if (response.success) {
        toast.success(response.message || "Payment recorded successfully");
        setIsPaymentModalOpen(false);
        fetchData();
      } else {
        toast.error(response.message);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to record payment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddParts = async (data: any) => {
    try {
      setSubmitting(true);
      const response: ApiResponse<Vendor> = await api.post(`/api/Vendors/${vendorId}/parts`, data);
      if (response.success) {
        toast.success(response.message || "Parts added and due amount updated");
        setIsAddPartsModalOpen(false);
        fetchData();
      } else {
        toast.error(response.message);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to add parts");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !vendor) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!vendor) return null;

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/vendors" className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
            <ArrowLeft className="w-6 h-6 text-zinc-500" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">{vendor.name}</h1>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                vendor.isActive 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {vendor.isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                {vendor.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">Vendor ID: {vendor.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddPartsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 text-white rounded-xl font-medium shadow-lg transition-all active:scale-95"
          >
            <PackagePlus className="w-4 h-4" />
            Add Parts Recieved
          </button>
          <button
            onClick={() => setIsPaymentModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-medium shadow-lg shadow-orange-500/20 transition-all active:scale-95"
          >
            <CreditCard className="w-4 h-4" />
            Create Payment
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard 
          label="Total Due Amount"
          value={`Rs. ${(vendor.dueAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={Wallet}
          variant="danger"
          description="Amount pending to be paid to vendor"
        />
        <StatsCard 
          label="Total Paid"
          value={`Rs. ${(vendor.totalPaid || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={Receipt}
          variant="success"
          description="Total amount paid historically"
        />
        <StatsCard 
          label="Opening Balance"
          value={`Rs. ${(vendor.openingBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={Building2}
          variant="default"
          description="Initial balance on vendor creation"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info Sidebar */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 h-fit space-y-6">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Contact Information</h3>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-500">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 font-medium">Contact Person</p>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mt-0.5">{vendor.contactPerson || "N/A"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-500">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 font-medium">Phone Number</p>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mt-0.5">{vendor.phone}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-500">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 font-medium">Email Address</p>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mt-0.5">{vendor.email || "N/A"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-500">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 font-medium">Physical Address</p>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mt-0.5">{vendor.address || "N/A"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-500">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 font-medium">Registered On</p>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mt-0.5">
                  {new Date(vendor.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Table Section */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1">
              <button
                onClick={() => setActiveTab("payments")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "payments"
                    ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm"
                    : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                }`}
              >
                Payment History
              </button>
              <button
                onClick={() => setActiveTab("parts")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "parts"
                    ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm"
                    : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                }`}
              >
                Purchased Parts
              </button>
            </div>
            <span className="text-xs font-medium bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full text-zinc-600 dark:text-zinc-400">
              {activeTab === "payments" ? payments.length : purchases.length} Records
            </span>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-950/50">
                  {activeTab === "payments" ? (
                    <>
                      <th className="px-6 py-4 font-semibold text-zinc-600 dark:text-zinc-400 text-xs uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 font-semibold text-zinc-600 dark:text-zinc-400 text-xs uppercase tracking-wider">Type</th>
                      <th className="px-6 py-4 font-semibold text-zinc-600 dark:text-zinc-400 text-xs uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-4 font-semibold text-zinc-600 dark:text-zinc-400 text-xs uppercase tracking-wider">Notes/Ref</th>
                    </>
                  ) : (
                    <>
                      <th className="px-6 py-4 font-semibold text-zinc-600 dark:text-zinc-400 text-xs uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 font-semibold text-zinc-600 dark:text-zinc-400 text-xs uppercase tracking-wider">Part Name</th>
                      <th className="px-6 py-4 font-semibold text-zinc-600 dark:text-zinc-400 text-xs uppercase tracking-wider">Qty x Cost</th>
                      <th className="px-6 py-4 font-semibold text-zinc-600 dark:text-zinc-400 text-xs uppercase tracking-wider">Total</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {activeTab === "payments" ? (
                  payments.length > 0 ? (
                    payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-zinc-900 dark:text-zinc-300">
                          {new Date(payment.createdAt).toLocaleDateString()}
                          <span className="text-xs text-zinc-500 block">
                            {new Date(payment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                            {payment.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-green-600 dark:text-green-500">
                          Rs. {payment.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-500">
                          {payment.notes || "-"}
                          {payment.attachmentUrl && (
                            <a href={payment.attachmentUrl} target="_blank" rel="noopener noreferrer" className="mt-1 flex items-center gap-1 text-xs text-orange-600 hover:underline">
                              <FileText className="w-3 h-3" /> View Receipt
                            </a>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center gap-2 text-zinc-400">
                          <Receipt className="w-8 h-8 opacity-50" />
                          <p className="text-sm">No payment history found</p>
                        </div>
                      </td>
                    </tr>
                  )
                ) : (
                  purchases.length > 0 ? (
                    purchases.map((purchase) => (
                      <tr key={purchase.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-zinc-900 dark:text-zinc-300">
                          {new Date(purchase.createdAt).toLocaleDateString()}
                          <span className="text-xs text-zinc-500 block">
                            {new Date(purchase.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-zinc-900 dark:text-zinc-300">
                          {purchase.vehiclePartName}
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-500">
                          {purchase.quantity} × Rs. {purchase.unitCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-orange-600 dark:text-orange-500">
                          Rs. {purchase.lineTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center gap-2 text-zinc-400">
                          <PackagePlus className="w-8 h-8 opacity-50" />
                          <p className="text-sm">No purchased parts found</p>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Create Vendor Payment"
      >
        <VendorPaymentForm
          onSubmit={handleCreatePayment}
          isLoading={submitting}
        />
      </Modal>

      <Modal
        isOpen={isAddPartsModalOpen}
        onClose={() => setIsAddPartsModalOpen(false)}
        title="Add Received Parts"
      >
        <VendorAddPartsForm onSubmit={handleAddParts} isLoading={submitting} />
      </Modal>
    </div>
  );
}
