'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Vendor, PartCategory, ApiResponse } from '@/types';
import {
  ArrowLeft, Plus, Trash2, Paperclip, Package,
  ChevronDown, ChevronUp, ChevronRight, Upload, X,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface LineItem {
  id: string;
  partName: string;
  categoryId: string;
  sku: string;
  unit: string;
  costPrice: number;     // Unit Cost / Rate
  reorderLevel: number;  // Alert At
  unitPrice: number;     // Selling Price
  qty: number;
  discountPct: number;
  taxPct: number;
  status: 'Active' | 'Inactive';
  amount: number;
}

function mkLine(): LineItem {
  return {
    id: crypto.randomUUID(),
    partName: '', categoryId: '', sku: '', unit: 'pcs',
    costPrice: 0, reorderLevel: 0, unitPrice: 0,
    qty: 0, discountPct: 0, taxPct: 13,
    status: 'Active', amount: 0,
  };
}

function calcAmount(l: LineItem): number {
  const base = l.costPrice * l.qty;
  const disc = base * (l.discountPct / 100);
  const taxable = base - disc;
  return taxable + taxable * (l.taxPct / 100);
}

async function uploadToCloudinary(file: File): Promise<string> {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('/api/upload', { method: 'POST', body: fd });
  if (!res.ok) throw new Error('Upload failed');
  const json = await res.json();
  return json.url as string;
}

const inputCls = 'w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-zinc-400';


function StockInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preVendorId = searchParams.get('vendorId') || '';

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [categories, setCategories] = useState<PartCategory[]>([]);
  const [vendorId, setVendorId] = useState(preVendorId);
  const [receivedDate, setReceivedDate] = useState(new Date().toISOString().slice(0, 10));
  const [invoiceNo, setInvoiceNo] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [referenceNo, setReferenceNo] = useState('');
  const [remarks, setRemarks] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [lines, setLines] = useState<LineItem[]>([mkLine()]);
  const [submitting, setSubmitting] = useState(false);
  const [collapsedItems, setCollapsedItems] = useState<Record<string, boolean>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  const toggleItem = (id: string) => {
    setCollapsedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    api.get('/api/vendors').then((r: any) => setVendors(r.data || [])).catch(() => {});
    api.get('/api/part-categories').then((r: any) => setCategories(r.data || [])).catch(() => {});
  }, []);

  const handleFileChange = async (file: File) => {
    setAttachment(file);
    try {
      setUploading(true);
      const url = await uploadToCloudinary(file);
      setAttachmentUrl(url);
      toast.success('Attachment uploaded');
    } catch {
      toast.error('Upload failed');
      setAttachment(null);
    } finally {
      setUploading(false);
    }
  };

  const updateLine = (id: string, field: keyof LineItem, value: any) => {
    setLines(prev => prev.map(l => {
      if (l.id !== id) return l;
      const updated = { ...l, [field]: value };
      return { ...updated, amount: calcAmount(updated) };
    }));
  };

  // Summaries
  const subTotal = lines.reduce((s, l) => {
    const base = l.costPrice * l.qty;
    return s + base - base * (l.discountPct / 100);
  }, 0);
  const totalDiscount = lines.reduce((s, l) => s + l.costPrice * l.qty * (l.discountPct / 100), 0);
  const taxableAmount = lines.filter(l => l.taxPct > 0).reduce((s, l) => {
    const base = l.costPrice * l.qty;
    return s + base - base * (l.discountPct / 100);
  }, 0);
  const nonTaxableAmount = subTotal - taxableAmount;
  const totalVat = lines.reduce((s, l) => {
    const base = l.costPrice * l.qty;
    const after = base - base * (l.discountPct / 100);
    return s + after * (l.taxPct / 100);
  }, 0);
  const grandTotal = subTotal + totalVat;
  const totalItems = lines.filter(l => l.partName.trim()).length;
  const totalQty = lines.reduce((s, l) => s + (l.qty || 0), 0);

  const handleSubmit = async (isDraft = false) => {
    if (!vendorId) { toast.error('Select a vendor'); return; }
    const validLines = lines.filter(l => l.partName.trim() && l.qty > 0);
    if (validLines.length === 0) { toast.error('Add at least one item with name and quantity'); return; }

    try {
      setSubmitting(true);

      // Build payload - creates new parts AND records purchase
      const payload = {
        vendorId,
        receivedAt: new Date(receivedDate).toISOString(),
        invoiceNo: invoiceNo || undefined,
        invoiceDate: invoiceDate ? new Date(invoiceDate).toISOString() : undefined,
        referenceNo: referenceNo || undefined,
        notes: remarks || undefined,
        attachmentUrl: attachmentUrl || undefined,
        isDraft,
        tax: totalVat,
        items: validLines.map(l => ({
          partName: l.partName,
          categoryId: l.categoryId || undefined,
          sku: l.sku || undefined,
          unit: l.unit,
          costPrice: l.costPrice,
          unitPrice: l.unitPrice,
          reorderLevel: l.reorderLevel,
          isActive: l.status === 'Active',
          quantity: l.qty,
          discountPct: l.discountPct,
          taxPct: l.taxPct,
        })),
      };

      const res: ApiResponse<any> = await api.post('/api/purchase-invoices', payload);
      if (res.success) {
        toast.success(isDraft ? 'Saved as draft' : 'Stock-in saved! Parts added to inventory.');
        router.back();
      } else {
        toast.error(res.message || 'Failed to save');
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to save');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Top Bar */}
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-8 py-4 flex items-center gap-4 sticky top-0 z-10">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
          <ArrowLeft className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-orange-600" />
            Stock In - Add Parts Received
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">Record incoming inventory from vendor / supplier</p>
        </div>
      </div>

      <div className="p-6 max-w-[1400px] mx-auto space-y-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* LEFT: Supplier & Invoice Details */}
          <div className="xl:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
            <h2 className="text-base font-bold text-zinc-800 dark:text-white flex items-center gap-2 mb-5">
              <span className="w-7 h-7 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <Package className="w-4 h-4 text-orange-600" />
              </span>
              Vendor &amp; Invoice Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Vendor */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Vendor / Supplier <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select value={vendorId} onChange={e => setVendorId(e.target.value)} className={inputCls + ' pr-10 appearance-none'}>
                    <option value="">Select vendor / supplier</option>
                    {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                </div>
              </div>

              {/* Received Date */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Received Date <span className="text-red-500">*</span></label>
                <input type="date" value={receivedDate} onChange={e => setReceivedDate(e.target.value)} className={inputCls} />
              </div>

              {/* Invoice No */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Invoice No <span className="text-red-500">*</span></label>
                <input type="text" value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)} placeholder="Enter invoice number" className={inputCls} />
              </div>

              {/* Invoice Date */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Invoice Date <span className="text-red-500">*</span></label>
                <input type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} className={inputCls} />
              </div>

              {/* Reference No */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Reference No</label>
                <input type="text" value={referenceNo} onChange={e => setReferenceNo(e.target.value)} placeholder="Enter reference number" className={inputCls} />
              </div>

              {/* Remarks */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Remarks</label>
                <div className="relative">
                  <textarea
                    value={remarks}
                    onChange={e => setRemarks(e.target.value.slice(0, 250))}
                    rows={4}
                    placeholder="Enter remarks (optional)"
                    className={inputCls + ' resize-none pb-5'}
                  />
                  <span className="absolute bottom-2 right-3 text-[11px] text-zinc-400">{remarks.length}/250</span>
                </div>
              </div>

              {/* Attachment */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Attachment</label>
                <div
                  onClick={() => fileRef.current?.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFileChange(f); }}
                  className="w-full border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl h-[112px] flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-all"
                >
                  {uploading ? (
                    <div className="flex flex-col items-center gap-1">
                      <Upload className="w-6 h-6 text-orange-500 animate-bounce" />
                      <p className="text-xs text-orange-500 font-medium">Uploading...</p>
                    </div>
                  ) : attachment ? (
                    <div className="flex flex-col items-center gap-1" onClick={e => e.stopPropagation()}>
                      <Paperclip className="w-5 h-5 text-orange-600" />
                      <p className="text-xs text-orange-600 font-medium max-w-[200px] truncate">{attachment.name}</p>
                      <button
                        onClick={() => { setAttachment(null); setAttachmentUrl(''); }}
                        className="text-[11px] text-red-400 hover:text-red-600 flex items-center gap-0.5"
                      >
                        <X className="w-3 h-3" /> Remove
                      </button>
                    </div>
                  ) : (
                    <>
                      <Paperclip className="w-6 h-6 text-zinc-400" />
                      <p className="text-xs font-medium text-zinc-500">Click to upload or drag and drop</p>
                      <p className="text-[11px] text-zinc-400">PNG, JPG, PDF (Max 5MB)</p>
                    </>
                  )}
                </div>
                <input ref={fileRef} type="file" accept=".png,.jpg,.jpeg,.pdf" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleFileChange(f); }} />
              </div>
            </div>
          </div>

          {/* RIGHT: Summary */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 h-fit sticky top-20">
            <h2 className="text-base font-bold text-zinc-800 dark:text-white mb-5">Summary</h2>
            <div className="space-y-3">
              {[
                { label: 'Sub Total', value: subTotal },
                { label: 'Discount', value: totalDiscount },
                { label: 'Taxable Amount', value: taxableAmount },
                { label: 'Non Taxable Amount', value: nonTaxableAmount },
                { label: 'VAT (13%)', value: totalVat },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-zinc-500">{label}</span>
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">
                    {value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-700 flex justify-between">
                <span className="font-bold text-orange-600">GRAND TOTAL</span>
                <span className="font-bold text-orange-600 text-lg">
                  {grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Item Details */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <h2 className="text-base font-bold text-zinc-800 dark:text-white flex items-center gap-2">
              <span className="w-7 h-7 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <Package className="w-4 h-4 text-orange-600" />
              </span>
              Item Details
            </h2>
            <span className="text-xs text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-full">
              {lines.length} item{lines.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="p-6 space-y-4">
            {lines.map((line, idx) => (
              <div key={line.id} className="border border-zinc-200 dark:border-zinc-700 rounded-2xl overflow-hidden transition-all bg-white dark:bg-zinc-900/50">
                {/* Card Header (Accordion Click Trigger) */}
                <div 
                  className="flex items-center justify-between px-5 py-3.5 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-700 cursor-pointer select-none"
                  onClick={() => toggleItem(line.id)}
                >
                  <div className="flex items-center gap-3">
                    {collapsedItems[line.id] ? (
                      <ChevronRight className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-orange-500" />
                    )}
                    <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span>Item #{idx + 1}</span>
                      {line.partName && (
                        <span className="normal-case text-zinc-900 dark:text-white font-semibold">
                          — {line.partName}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-4" onClick={e => e.stopPropagation()}>
                    {/* Status Switch */}
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${line.status === 'Active' ? 'text-green-500' : 'text-zinc-400'}`}>
                        {line.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateLine(line.id, 'status', line.status === 'Active' ? 'Inactive' : 'Active')}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                          line.status === 'Active' ? 'bg-orange-500' : 'bg-zinc-300 dark:bg-zinc-600'
                        }`}
                      >
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                          line.status === 'Active' ? 'translate-x-4' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => setLines(prev => prev.filter(l => l.id !== line.id))}
                      disabled={lines.length === 1}
                      className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Card Body (Accordion Content - open if not collapsed) */}
                {!collapsedItems[line.id] && (
                  <div className="p-5 space-y-4 animate-in fade-in duration-200">
                    {/* Row 1: Part Name (2 cols) + Category (1 col) + SKU (1 col) + Unit (1 col) + Reorder Level (1 col) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                      <div className="space-y-1.5 lg:col-span-2 md:col-span-2">
                        <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                          Part Name <span className="text-red-400">*</span>
                        </label>
                        <input
                          value={line.partName}
                          onChange={e => updateLine(line.id, 'partName', e.target.value)}
                          placeholder="Enter part name"
                          className="w-full h-11 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-zinc-400 transition-all"
                        />
                      </div>
                      <div className="space-y-1.5 lg:col-span-1">
                        <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                          Category
                        </label>
                        <div className="relative">
                          <select
                            value={line.categoryId}
                            onChange={e => updateLine(line.id, 'categoryId', e.target.value)}
                            className="w-full h-11 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-4 pr-10 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none transition-all"
                          >
                            <option value="">Select category</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
                        </div>
                      </div>
                      <div className="space-y-1.5 lg:col-span-1">
                        <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                          SKU (Placeholder)
                        </label>
                        <input
                          value={line.sku}
                          onChange={e => updateLine(line.id, 'sku', e.target.value)}
                          placeholder="e.g. BRK-001"
                          className="w-full h-11 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-zinc-400 transition-all"
                        />
                      </div>
                      <div className="space-y-1.5 lg:col-span-1">
                        <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                          Unit
                        </label>
                        <input
                          value={line.unit}
                          onChange={e => updateLine(line.id, 'unit', e.target.value)}
                          placeholder="pcs"
                          className="w-full h-11 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                        />
                      </div>
                      <div className="space-y-1.5 lg:col-span-1">
                        <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                          Reorder Level
                        </label>
                        <input
                          type="number" min="0"
                          value={line.reorderLevel}
                          onChange={e => updateLine(line.id, 'reorderLevel', parseInt(e.target.value) || 0)}
                          className="w-full h-11 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                        />
                      </div>
                    </div>

                    {/* Row 2: Quantity (1 col) + Cost Price (1 col) + Selling Price (1 col) + Discount (1 col) + Tax (1 col) + Amount (1 col) */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                          Quantity
                        </label>
                        <input
                          type="number" min="0"
                          value={line.qty}
                          onChange={e => updateLine(line.id, 'qty', parseInt(e.target.value) || 0)}
                          className="w-full h-11 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                          Cost Price <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-medium pointer-events-none">Rs.</span>
                          <input
                            type="number" min="0" step="0.01"
                            value={line.costPrice}
                            onChange={e => updateLine(line.id, 'costPrice', parseFloat(e.target.value) || 0)}
                            className="w-full h-11 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-11 pr-4 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-right transition-all"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                          Selling Price <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-medium pointer-events-none">Rs.</span>
                          <input
                            type="number" min="0" step="0.01"
                            value={line.unitPrice}
                            onChange={e => updateLine(line.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="w-full h-11 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-11 pr-4 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-right transition-all"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                          Discount (%)
                        </label>
                        <input
                          type="number" min="0" max="100" step="0.01"
                          value={line.discountPct}
                          onChange={e => updateLine(line.id, 'discountPct', parseFloat(e.target.value) || 0)}
                          className="w-full h-11 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                          Tax % (VAT)
                        </label>
                        <input
                          type="number" min="0" max="100"
                          value={line.taxPct}
                          onChange={e => updateLine(line.id, 'taxPct', parseFloat(e.target.value) || 0)}
                          className="w-full h-11 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                          Amount
                        </label>
                        <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/30 rounded-xl px-4 text-right flex items-center justify-end h-11 transition-all">
                          <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                            Rs. {line.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add Item */}
          <div className="px-6 pb-6 flex justify-center">
            <button
              onClick={() => setLines(prev => [...prev, mkLine()])}
              className="flex items-center gap-2 px-6 py-3 border-2 border-dashed border-orange-300 dark:border-orange-700 text-orange-600 dark:text-orange-400 rounded-2xl text-sm font-semibold hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-400 transition-all w-full justify-center"
            >
              <Plus className="w-4 h-4" /> Add Another Item
            </button>
          </div>

          {/* Footer */}
          <div className="px-6 py-5 border-t border-zinc-100 dark:border-zinc-800">
            <div className="mb-5">
              <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1">NOTE:</p>
              <ul className="list-disc list-inside space-y-0.5 text-xs text-zinc-500">
                <li>All amounts are in Nrs.</li>
                <li>Stock will be updated after saving the Stock In.</li>
                <li>You can save as draft if you don't want to update stock immediately.</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="grid grid-cols-2 gap-x-10 gap-y-1 text-sm">
                {[
                  ['Total Items', totalItems],
                  ['Total Amount', grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })],
                  ['Total Quantity', totalQty],
                  ['Total Discount', totalDiscount.toLocaleString('en-US', { minimumFractionDigits: 2 })],
                ].map(([label, value]) => (
                  <div key={String(label)} className="flex items-center gap-2">
                    <span className="text-zinc-500">{label}</span>
                    <span className="text-zinc-400">:</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">{value}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 ml-auto">
                <button
                  onClick={() => router.back()}
                  className="px-6 py-2.5 border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-xl text-sm font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSubmit(true)}
                  disabled={submitting || uploading}
                  className="px-6 py-2.5 border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-xl text-sm font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all disabled:opacity-50"
                >
                  Save Draft
                </button>
                <button
                  onClick={() => handleSubmit(false)}
                  disabled={submitting || uploading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-orange-500/20 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Package className="w-4 h-4" />
                  {submitting ? 'Saving...' : 'Save Stock In'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StockInPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    }>
      <StockInContent />
    </Suspense>
  );
}
