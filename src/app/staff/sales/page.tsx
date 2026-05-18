"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { SalesInvoice, ApiResponse } from "@/types";
import { 
  FileText, 
  Search, 
  Calendar, 
  User as UserIcon, 
  Car, 
  Eye, 
  History,
  Download,
  AlertCircle,
  CheckCircle2,
  Printer
} from "lucide-react";
import toast from "react-hot-toast";
import DataTable from "@/components/ui/DataTable";
import Modal from "@/components/ui/Modal";
import { StatsCard } from "@/components/ui/StatsCard";

export default function StaffSalesHistoryPage() {
  const [invoices, setInvoices] = useState<SalesInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<SalesInvoice | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const res: ApiResponse<SalesInvoice[]> = await api.get("/api/sales-invoices");
      if (res.success) {
        setInvoices(res.data || []);
      } else {
        toast.error(res.message || "Failed to load sales history");
      }
    } catch (err: any) {
      toast.error("An error occurred while fetching sales");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const filteredInvoices = invoices.filter(inv => 
    inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (inv.vehicleNumber && inv.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalSalesCount = invoices.length;
  const totalRevenue = invoices.reduce((acc, inv) => acc + (inv.status !== "Void" ? inv.total : 0), 0);
  const voidedCount = invoices.filter(inv => inv.status === "Void").length;

  const handleViewDetails = (invoice: SalesInvoice) => {
    setSelectedInvoice(invoice);
    setIsModalOpen(true);
  };

  const columns = [
    {
      key: "invoiceNumber",
      header: "Invoice #",
      render: (inv: SalesInvoice) => (
        <span className="font-mono font-bold text-zinc-900 dark:text-white">{inv.invoiceNumber}</span>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      render: (inv: SalesInvoice) => (
        <div className="flex flex-col">
          <span className="font-semibold text-zinc-900 dark:text-white">{inv.customerName}</span>
          {inv.vehicleNumber && (
            <span className="text-xs text-zinc-500 flex items-center gap-1">
              <Car className="w-3 h-3" /> {inv.vehicleNumber}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "date",
      header: "Date",
      render: (inv: SalesInvoice) => (
        <div className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-zinc-400" />
          {new Date(inv.issuedAt || inv.createdAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      key: "total",
      header: "Total Amount",
      render: (inv: SalesInvoice) => (
        <span className="font-bold text-orange-600">
          Rs. {inv.total.toLocaleString()}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (inv: SalesInvoice) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
          inv.status === "Void" 
            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
        }`}>
          {inv.status}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (inv: SalesInvoice) => (
        <button
          onClick={() => handleViewDetails(inv)}
          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-orange-600 transition-colors"
        >
          <Eye className="w-5 h-5" />
        </button>
      ),
    },
  ];

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
            <History className="w-8 h-8 text-orange-600" />
            Sales History
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Track and review all part sales and invoices.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard 
          label="Total Invoices" 
          value={totalSalesCount} 
          icon={FileText} 
          variant="default" 
        />
        <StatsCard 
          label="Total Revenue" 
          value={`Rs. ${totalRevenue.toLocaleString()}`} 
          icon={CheckCircle2} 
          variant="success" 
        />
        <StatsCard 
          label="Voided Invoices" 
          value={voidedCount} 
          icon={AlertCircle} 
          variant="danger" 
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredInvoices}
        loading={loading}
        keyExtractor={(inv) => inv.id}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by invoice #, customer or vehicle..."
        onRefresh={fetchInvoices}
        emptyIcon={FileText}
        emptyMessage="No sales invoices found."
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Invoice Details: ${selectedInvoice?.invoiceNumber}`}
        // size="lg"
      >
        {selectedInvoice && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-8 p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Customer Details</label>
                  <p className="font-semibold text-lg text-zinc-900 dark:text-white">{selectedInvoice.customerName}</p>
                </div>
                {selectedInvoice.vehicleNumber && (
                  <div>
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Vehicle</label>
                    <p className="text-zinc-700 dark:text-zinc-300 font-medium">{selectedInvoice.vehicleNumber}</p>
                  </div>
                )}
              </div>
              <div className="space-y-4 text-right">
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Invoice Date</label>
                  <p className="font-medium text-zinc-900 dark:text-white">
                    {new Date(selectedInvoice.issuedAt || selectedInvoice.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Status</label>
                  <p className={`font-bold ${selectedInvoice.status === "Void" ? "text-red-600" : "text-green-600"}`}>
                    {selectedInvoice.status}
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-hidden border border-zinc-200 dark:border-zinc-800 rounded-2xl">
              <table className="w-full text-left">
                <thead className="bg-zinc-100 dark:bg-zinc-800/50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase">Part Name / SKU</th>
                    <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase text-center">Qty</th>
                    <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase text-right">Unit Price</th>
                    <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {selectedInvoice.lines.map((line) => (
                    <tr key={line.id} className="text-sm">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-zinc-900 dark:text-white">{line.partName}</p>
                        <p className="text-xs text-zinc-500 font-mono">{line.sku}</p>
                      </td>
                      <td className="px-6 py-4 text-center font-medium text-zinc-700 dark:text-zinc-300">
                        {line.quantity}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-zinc-700 dark:text-zinc-300">
                        Rs. {line.unitPrice.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-zinc-900 dark:text-white">
                        Rs. {line.lineTotal.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-zinc-50 dark:bg-zinc-800/30 font-semibold">
                  <tr>
                    <td colSpan={3} className="px-6 py-3 text-right text-zinc-500">Subtotal</td>
                    <td className="px-6 py-3 text-right text-zinc-900 dark:text-white">Rs. {selectedInvoice.subtotal.toLocaleString()}</td>
                  </tr>
                  {selectedInvoice.discount > 0 && (
                    <tr className="text-green-600">
                      <td colSpan={3} className="px-6 py-3 text-right">Loyalty Discount</td>
                      <td className="px-6 py-3 text-right">- Rs. {selectedInvoice.discount.toLocaleString()}</td>
                    </tr>
                  )}
                  <tr>
                    <td colSpan={3} className="px-6 py-3 text-right text-zinc-500">Tax</td>
                    <td className="px-6 py-3 text-right text-zinc-900 dark:text-white">Rs. {selectedInvoice.tax.toLocaleString()}</td>
                  </tr>
                  <tr className="text-lg bg-orange-600 text-white font-bold">
                    <td colSpan={3} className="px-6 py-4 text-right">Total</td>
                    <td className="px-6 py-4 text-right underline underline-offset-4 decoration-2">
                      Rs. {selectedInvoice.total.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              {selectedInvoice.status !== "Void" && (
                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to void this invoice? This will restore stock levels and cannot be undone.")) {
                      api.patch(`/api/sales-invoices/${selectedInvoice.id}/void`, {}).then(res => {
                        if (res.success) {
                          toast.success("Invoice voided successfully");
                          setIsModalOpen(false);
                          fetchInvoices();
                        } else {
                          toast.error(res.message || "Failed to void invoice");
                        }
                      });
                    }
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 border border-red-200 rounded-xl font-bold hover:bg-red-100 transition-all active:scale-95"
                >
                  <AlertCircle className="w-5 h-5" />
                  Void Invoice
                </button>
              )}
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-6 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl font-bold hover:opacity-90 transition-all active:scale-95"
              >
                <Printer className="w-5 h-5" />
                Print
              </button>
            </div>

          </div>
        )}
      </Modal>
    </div>
  );
}
