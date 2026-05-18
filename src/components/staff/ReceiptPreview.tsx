"use client";

import React, { useRef } from "react";
import Modal from "@/components/ui/Modal";
import { Download, Printer, X, CheckCircle2 } from "lucide-react";
import { SalesInvoiceDto } from "@/types";

interface ReceiptPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: any; // Using any for simplicity or properly typed SalesInvoiceDto
}

export function ReceiptPreview({ isOpen, onClose, invoice }: ReceiptPreviewProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!invoice) return null;

  const handlePrint = () => {
    const printContent = receiptRef.current;
    const windowUrl = 'about:blank';
    const uniqueName = new Date();
    const windowName = 'Print' + uniqueName.getTime();
    const printWindow = window.open(windowUrl, windowName, 'left=50000,top=50000,width=0,height=0');
    
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Receipt - ${invoice.invoiceNumber}</title>
            <style>
              body { font-family: 'Inter', sans-serif; padding: 40px; color: #18181b; }
              .header { text-align: center; margin-bottom: 30px; }
              .company-name { font-size: 24px; font-weight: bold; color: #ea580c; margin-bottom: 5px; }
              .invoice-info { display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 14px; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
              th { border-bottom: 2px solid #e4e4e7; text-align: left; padding: 10px; font-size: 13px; color: #71717a; }
              td { padding: 10px; border-bottom: 1px solid #f4f4f5; font-size: 14px; }
              .totals { margin-left: auto; width: 250px; }
              .total-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 14px; }
              .grand-total { font-size: 18px; font-weight: bold; border-top: 2px solid #e4e4e7; margin-top: 10px; padding-top: 10px; color: #ea580c; }
              .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #a1a1aa; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="company-name">Vehicle Parts MS</div>
              <div>Point of Sale Receipt</div>
            </div>
            <div class="invoice-info">
              <div>
                <p><strong>Customer:</strong> ${invoice.customerName}</p>
                ${invoice.vehicleNumber ? `<p><strong>Vehicle:</strong> ${invoice.vehicleNumber}</p>` : ''}
              </div>
              <div style="text-align: right">
                <p><strong>Invoice #:</strong> ${invoice.invoiceNumber}</p>
                <p><strong>Date:</strong> ${new Date(invoice.issuedAt || invoice.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th style="text-align: center">Qty</th>
                  <th style="text-align: right">Unit Price</th>
                  <th style="text-align: right">Total</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.lines.map((l: any) => `
                  <tr>
                    <td>${l.partName}</td>
                    <td style="text-align: center">${l.quantity}</td>
                    <td style="text-align: right">Rs. ${l.unitPrice.toLocaleString()}</td>
                    <td style="text-align: right">Rs. ${l.lineTotal.toLocaleString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="totals">
              <div class="total-row">
                <span>Subtotal</span>
                <span>Rs. ${invoice.subtotal.toLocaleString()}</span>
              </div>
              ${invoice.serviceCharge > 0 ? `
              <div class="total-row">
                <span>Service Charge</span>
                <span>Rs. ${invoice.serviceCharge.toLocaleString()}</span>
              </div>` : ''}
              ${invoice.discount > 0 ? `
              <div class="total-row">
                <span>Discount (${invoice.discountRate}%)</span>
                <span>- Rs. ${invoice.discount.toLocaleString()}</span>
              </div>` : ''}
              ${invoice.tax > 0 ? `
              <div class="total-row">
                <span>Tax (${invoice.taxRate}%)</span>
                <span>Rs. ${invoice.tax.toLocaleString()}</span>
              </div>` : ''}
              <div class="total-row grand-total">
                <span>Total</span>
                <span>Rs. ${invoice.total.toLocaleString()}</span>
              </div>
            </div>
            <div class="footer">
              <p>Thank you for your business!</p>
              <p>Generated on ${new Date().toLocaleString()}</p>
            </div>
            <script>
              window.onload = function() { window.print(); window.close(); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Receipt Preview" maxWidth="max-w-2xl">
      <div className="p-6">
        <div ref={receiptRef} className="bg-white dark:bg-zinc-950 p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm mb-6">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-2xl font-bold text-orange-600">Vehicle Parts MS</h2>
              <p className="text-sm text-zinc-500">Official Sales Receipt</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-sm text-zinc-900 dark:text-white">#{invoice.invoiceNumber}</p>
              <p className="text-xs text-zinc-500">{new Date(invoice.issuedAt || invoice.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Customer Details</p>
              <p className="font-semibold text-zinc-900 dark:text-white">{invoice.customerName}</p>
              {invoice.vehicleNumber && (
                <p className="text-sm text-zinc-500 mt-1">Vehicle: {invoice.vehicleNumber}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Status</p>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded text-[10px] font-bold uppercase">
                {invoice.status}
              </span>
            </div>
          </div>

          <table className="w-full mb-8">
            <thead>
              <tr className="text-left text-xs font-bold text-zinc-400 uppercase border-b border-zinc-100 dark:border-zinc-800">
                <th className="pb-3">Item</th>
                <th className="pb-3 text-center">Qty</th>
                <th className="pb-3 text-right">Price</th>
                <th className="pb-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {invoice.lines.map((l: any) => (
                <tr key={l.id} className="border-b border-zinc-50 dark:border-zinc-900">
                  <td className="py-4 font-medium text-zinc-900 dark:text-white">{l.partName}</td>
                  <td className="py-4 text-center text-zinc-500">{l.quantity}</td>
                  <td className="py-4 text-right text-zinc-500">Rs. {l.unitPrice.toLocaleString()}</td>
                  <td className="py-4 text-right font-semibold text-zinc-900 dark:text-white">Rs. {l.lineTotal.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="ml-auto w-64 space-y-3">
            <div className="flex justify-between text-sm text-zinc-500">
              <span>Subtotal</span>
              <span className="text-zinc-900 dark:text-white font-medium">Rs. {invoice.subtotal.toLocaleString()}</span>
            </div>
            {invoice.serviceCharge > 0 && (
              <div className="flex justify-between text-sm text-zinc-500">
                <span>Service Charge</span>
                <span className="text-zinc-900 dark:text-white font-medium">Rs. {invoice.serviceCharge.toLocaleString()}</span>
              </div>
            )}
            {invoice.discount > 0 && (
              <div className="flex justify-between text-sm text-zinc-500">
                <span>Discount ({invoice.discountRate}%)</span>
                <span className="text-red-500 font-medium">- Rs. {invoice.discount.toLocaleString()}</span>
              </div>
            )}
            {invoice.tax > 0 && (
              <div className="flex justify-between text-sm text-zinc-500">
                <span>Tax ({invoice.taxRate}%)</span>
                <span className="text-zinc-900 dark:text-white font-medium">Rs. {invoice.tax.toLocaleString()}</span>
              </div>
            )}
            <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
              <span className="font-bold text-zinc-900 dark:text-white">Total</span>
              <span className="text-lg font-bold text-orange-600">Rs. {invoice.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-xl font-bold hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <Printer className="w-5 h-5" />
            Print / Download PDF
          </button>
        </div>
      </div>
    </Modal>
  );
}
