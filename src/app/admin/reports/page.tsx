"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { ApiResponse } from "@/types";
import { 
  BarChart3, 
  Calendar, 
  Download, 
  TrendingUp, 
  PieChart,
  ArrowRight,
  TrendingDown,
  Loader2
} from "lucide-react";
import toast from "react-hot-toast";

interface FinancialReport {
  from: string;
  to: string;
  invoiceCount: number;
  totalPurchases: number;
  byVendor: {
    vendorId: string;
    vendorName: string;
    invoiceCount: number;
    total: number;
  }[];
}

export default function ReportsPage() {
  const [report, setReport] = useState<FinancialReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"daily" | "monthly" | "yearly">("monthly");

  const fetchReport = async () => {
    try {
      setLoading(true);
      let from = new Date();
      if (period === "daily") from.setDate(from.getDate() - 1);
      else if (period === "monthly") from.setMonth(from.getMonth() - 1);
      else if (period === "yearly") from.setFullYear(from.getFullYear() - 1);

      const fromStr = from.toISOString();
      const toStr = new Date().toISOString();

      const response: ApiResponse<FinancialReport> = await api.get(`/api/reports/financial?from=${fromStr}&to=${toStr}`);
      if (response.success && response.data) {
        setReport(response.data);
      }
    } catch (error) {
      toast.error("Failed to fetch financial report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [period]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white font-outfit">Financial Reports</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Analyze your purchase expenses and vendor performance.</p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-zinc-950 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
          {(["daily", "monthly", "yearly"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${period === p ? "bg-orange-600 text-white shadow-md shadow-orange-500/20" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-500 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-500">Total Purchase Value</p>
                  <h3 className="text-2xl font-bold text-zinc-900 dark:text-white font-outfit">
                    Rs. {report?.totalPurchases.toLocaleString() || "0"}
                  </h3>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-green-500 font-medium">
                <TrendingUp className="w-3 h-3" />
                <span>+12.5% from previous {period}</span>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-500 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-500">Invoices Processed</p>
                  <h3 className="text-2xl font-bold text-zinc-900 dark:text-white font-outfit">
                    {report?.invoiceCount || "0"}
                  </h3>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-blue-500 font-medium">
                <span>Updated just now</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <h3 className="font-bold text-zinc-900 dark:text-white">Spending by Vendor</h3>
              <button className="text-xs text-orange-600 font-semibold hover:underline flex items-center gap-1">
                <Download className="w-3 h-3" />
                Export CSV
              </button>
            </div>
            <div className="p-0 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-900/50 text-left">
                    <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase">Vendor Name</th>
                    <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase text-center">Invoices</th>
                    <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase text-right">Total Spent (Rs.)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {loading ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-10 text-center">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-500" />
                      </td>
                    </tr>
                  ) : report?.byVendor.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-10 text-center text-zinc-500">No data available.</td>
                    </tr>
                  ) : (
                    report?.byVendor.map((v) => (
                      <tr key={v.vendorId} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                        <td className="px-6 py-4 font-medium">{v.vendorName}</td>
                        <td className="px-6 py-4 text-center text-zinc-500">{v.invoiceCount}</td>
                        <td className="px-6 py-4 text-right font-bold">Rs. {v.total.toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <h3 className="font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-orange-500" />
              Summary Analysis
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl">
                <span className="text-zinc-500">Peak Spending Period</span>
                <span className="font-bold">Week 2</span>
              </div>
              <div className="flex justify-between items-center text-sm p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl">
                <span className="text-zinc-500">Most Used Vendor</span>
                <span className="font-bold">{report?.byVendor[0]?.vendorName || "N/A"}</span>
              </div>
              <div className="flex justify-between items-center text-sm p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl">
                <span className="text-zinc-500">Average Invoice</span>
                <span className="font-bold">Rs. {report && report.invoiceCount > 0 ? (report.totalPurchases / report.invoiceCount).toLocaleString(undefined, {maximumFractionDigits: 0}) : "0"}</span>
              </div>
            </div>
            <button className="w-full mt-6 py-3 border border-zinc-200 dark:border-zinc-800 hover:border-orange-500 text-zinc-600 dark:text-zinc-400 hover:text-orange-600 rounded-xl text-sm font-semibold transition-all">
              View Detailed Analytics
            </button>
          </div>

          <div className="bg-orange-600 rounded-2xl p-6 text-white shadow-xl shadow-orange-600/20">
            <h3 className="text-lg font-bold mb-2">Inventory Sync</h3>
            <p className="text-orange-100 text-sm mb-4 opacity-80">Check current stock value vs purchase history to identify discrepancies.</p>
            <button className="w-full py-3 bg-white text-orange-600 rounded-xl text-sm font-bold flex items-center justify-center gap-2">
              Sync Now
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
