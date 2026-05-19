'use client';

import { Part } from '@/types';
import {
  Package, Tag, DollarSign, AlertTriangle, BarChart3,
  CheckCircle2, XCircle, X, ShieldCheck, Hash,
} from 'lucide-react';

interface PartDetailDialogProps {
  part: Part | null;
  onClose: () => void;
}

function InfoRow({ label, value, accent }: { label: string; value: React.ReactNode; accent?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{label}</span>
      <span className={`text-sm font-semibold ${accent ? 'text-orange-600 dark:text-orange-400' : 'text-zinc-900 dark:text-white'}`}>
        {value}
      </span>
    </div>
  );
}

export default function PartDetailDialog({ part, onClose }: PartDetailDialogProps) {
  if (!part) return null;

  const isLowStock = part.stockQuantity <= part.reorderLevel;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/30 flex items-center justify-center overflow-hidden">
              {part.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={part.imageUrl} alt={part.name} className="w-full h-full object-cover" />
              ) : (
                <Package className="w-7 h-7 text-orange-600" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{part.name}</h2>
              <p className="text-sm font-mono text-zinc-500 mt-0.5">{part.sku}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-zinc-700 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Badge */}
        <div className="px-6 pt-4">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
            part.isActive
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {part.isActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
            {part.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Category & Vendor */}
          <div className="grid grid-cols-2 gap-4">
            <InfoRow
              label="Category"
              value={
                <span className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-zinc-400" />
                  {part.categoryName || 'Uncategorized'}
                </span>
              }
            />
            <InfoRow
              label="Vendor / Supplier"
              value={part.vendorName || '—'}
            />
          </div>

          {/* Pricing */}
          <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl p-4">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-3">Pricing</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Cost Price</p>
                <p className="text-lg font-bold text-zinc-800 dark:text-zinc-100 mt-0.5">
                  Rs. {part.costPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Selling Price</p>
                <p className="text-lg font-bold text-orange-600 mt-0.5">
                  Rs. {part.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>

          {/* Stock Info */}
          <div className={`rounded-2xl p-4 border ${
            isLowStock
              ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/30'
              : 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800/30'
          }`}>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-3 text-zinc-500">Stock Status</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Current Stock</p>
                <p className={`text-2xl font-bold mt-0.5 ${isLowStock ? 'text-red-600' : 'text-green-600'}`}>
                  {part.stockQuantity}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Reorder Level (Alert At)</p>
                <p className="text-2xl font-bold text-zinc-700 dark:text-zinc-300 mt-0.5">
                  {part.reorderLevel}
                </p>
              </div>
            </div>
            {isLowStock && (
              <div className="mt-3 flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-xs font-semibold">Stock is below reorder level — restocking required</span>
              </div>
            )}
          </div>

          {/* Stock Value */}
          <div className="flex items-center justify-between rounded-2xl bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800/30 px-4 py-3">
            <div className="flex items-center gap-2 text-zinc-500 text-sm">
              <BarChart3 className="w-4 h-4 text-orange-500" />
              <span>Total Stock Value</span>
            </div>
            <span className="font-bold text-orange-600 text-lg">
              Rs. {(part.unitPrice * part.stockQuantity).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Description */}
          {part.description && (
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Description</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{part.description}</p>
            </div>
          )}

          {/* Meta */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-400">
            <span>Added: {new Date(part.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            {part.updatedAt && (
              <span>Updated: {new Date(part.updatedAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
