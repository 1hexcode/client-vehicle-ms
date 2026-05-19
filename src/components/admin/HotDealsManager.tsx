"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { HotDeal, ApiResponse } from "@/types";
import {
  Plus,
  Flame,
  Edit,
  Trash2,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Timer,
  Calendar,
} from "lucide-react";
import toast from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import DataTable from "@/components/ui/DataTable";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { StatsCard } from "@/components/ui/StatsCard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import HotDealForm from "./HotDealForm";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function dealLifecycle(deal: HotDeal, now: number) {
  const start = new Date(deal.startsAt).getTime();
  const end = new Date(deal.endsAt).getTime();
  if (!deal.isActive) return { label: "Disabled", tone: "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300" };
  if (now < start) return { label: "Scheduled", tone: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" };
  if (now > end) return { label: "Expired", tone: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" };
  return { label: "Live", tone: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" };
}

export default function HotDealsManager() {
  const [deals, setDeals] = useState<HotDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selected, setSelected] = useState<HotDeal | undefined>();
  const [toDelete, setToDelete] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const res: ApiResponse<HotDeal[]> = await api.get("/api/hot-deals/all");
      if (res.success) setDeals(Array.isArray(res.data) ? res.data : []);
      else toast.error(res.message || "Failed to load hot deals");
    } catch (err: any) {
      toast.error(err.message || "Failed to load hot deals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const handleCreateClick = () => {
    setSelected(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (deal: HotDeal) => {
    setSelected(deal);
    setIsModalOpen(true);
  };

  const handleSubmit = async (payload: {
    partId: string;
    dealPrice: number;
    startsAt: string;
    endsAt: string;
    isActive: boolean;
  }) => {
    try {
      setSubmitting(true);
      const res: ApiResponse<HotDeal> = selected
        ? await api.put(`/api/hot-deals/${selected.id}`, payload)
        : await api.post("/api/hot-deals", payload);
      if (res.success) {
        toast.success(selected ? "Deal updated" : "Deal created");
        setIsModalOpen(false);
        setSelected(undefined);
        fetchDeals();
      } else {
        toast.error(res.message || "Failed to save deal");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save deal");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRequest = (id: string) => {
    setToDelete(id);
    setIsConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!toDelete) return;
    try {
      setSubmitting(true);
      const res: ApiResponse<any> = await api.delete(`/api/hot-deals/${toDelete}`);
      if (res.success) {
        toast.success("Deal deleted");
        setIsConfirmOpen(false);
        setToDelete(null);
        fetchDeals();
      } else {
        toast.error(res.message || "Failed to delete");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (deal: HotDeal) => {
    try {
      const res: ApiResponse<any> = await api.put(`/api/hot-deals/${deal.id}`, {
        partId: deal.partId,
        dealPrice: deal.dealPrice,
        startsAt: deal.startsAt,
        endsAt: deal.endsAt,
        isActive: !deal.isActive,
      });
      if (res.success) {
        toast.success(deal.isActive ? "Deal disabled" : "Deal enabled");
        fetchDeals();
      } else {
        toast.error(res.message || "Failed to update");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update");
    }
  };

  const stats = useMemo(() => {
    let live = 0;
    let scheduled = 0;
    let expired = 0;
    let disabled = 0;
    for (const d of deals) {
      const start = new Date(d.startsAt).getTime();
      const end = new Date(d.endsAt).getTime();
      if (!d.isActive) disabled++;
      else if (now < start) scheduled++;
      else if (now > end) expired++;
      else live++;
    }
    return { total: deals.length, live, scheduled, expired, disabled };
  }, [deals, now]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return deals;
    return deals.filter((d) =>
      `${d.partName ?? ""} ${d.partSku ?? ""} ${d.categoryName ?? ""}`
        .toLowerCase()
        .includes(q),
    );
  }, [deals, searchQuery]);

  const columns = [
    {
      key: "part",
      header: "Part",
      render: (row: HotDeal) => (
        <div>
          <p className="font-semibold text-zinc-900 dark:text-white">
            {row.partName || "—"}
          </p>
          <p className="text-xs text-zinc-500">
            {row.partSku ? `SKU ${row.partSku}` : "—"}
            {row.categoryName && <> · {row.categoryName}</>}
          </p>
        </div>
      ),
    },
    {
      key: "price",
      header: "Deal Price",
      render: (row: HotDeal) => {
        const discount =
          row.discountPercentage ??
          (row.originalPrice && row.originalPrice > 0
            ? Math.round(((row.originalPrice - row.dealPrice) / row.originalPrice) * 100)
            : null);
        return (
          <div>
            <p className="font-bold text-[#F97316]">
              Rs.{row.dealPrice.toLocaleString()}
            </p>
            <p className="text-xs text-zinc-500">
              {row.originalPrice ? (
                <>
                  <span className="line-through">Rs.{row.originalPrice.toLocaleString()}</span>
                  {discount !== null && <> · -{discount}%</>}
                </>
              ) : (
                "—"
              )}
            </p>
          </div>
        );
      },
    },
    {
      key: "window",
      header: "Window",
      render: (row: HotDeal) => (
        <div className="text-xs text-zinc-600 dark:text-zinc-400 flex items-start gap-1.5">
          <Calendar className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <div>
            <p>{formatDate(row.startsAt)}</p>
            <p className="text-zinc-500">to {formatDate(row.endsAt)}</p>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row: HotDeal) => {
        const { label, tone } = dealLifecycle(row, now);
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${tone}`}
          >
            <Timer className="w-3 h-3" /> {label}
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (row: HotDeal) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <MoreVertical className="w-4 h-4 text-zinc-500" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleEdit(row)} className="cursor-pointer">
              <Edit className="w-4 h-4 mr-2" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleToggleActive(row)}
              className="cursor-pointer"
            >
              {row.isActive ? (
                <>
                  <XCircle className="w-4 h-4 mr-2" /> Disable
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Enable
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleDeleteRequest(row.id)}
              className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <>
      <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
              <Flame className="w-8 h-8 text-orange-600" /> Hot Deals
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">
              Run limited-time discounts on selected parts.
            </p>
          </div>
          <button
            onClick={handleCreateClick}
            className="flex items-center gap-2 px-5 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-semibold transition-all shadow-lg shadow-orange-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4" /> New Deal
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatsCard label="Total" value={stats.total} icon={Flame} variant="info" />
          <StatsCard label="Live" value={stats.live} icon={CheckCircle2} variant="success" />
          <StatsCard label="Scheduled" value={stats.scheduled} icon={Calendar} variant="info" />
          <StatsCard label="Expired" value={stats.expired} icon={Timer} variant="warning" />
          <StatsCard label="Disabled" value={stats.disabled} icon={XCircle} variant="danger" />
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          keyExtractor={(d) => d.id}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search by part name, SKU, or category..."
          onRefresh={fetchDeals}
          emptyIcon={Flame}
          emptyMessage="No hot deals yet. Click 'New Deal' to add one."
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          if (!submitting) {
            setIsModalOpen(false);
            setSelected(undefined);
          }
        }}
        title={selected ? "Edit Hot Deal" : "Create Hot Deal"}
        maxWidth="max-w-2xl"
      >
        <HotDealForm
          initialData={selected}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            setSelected(undefined);
          }}
          isLoading={submitting}
        />
      </Modal>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => {
          setIsConfirmOpen(false);
          setToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Hot Deal"
        description="This deal will be permanently removed. Customers will no longer see it on the storefront."
        confirmText="Delete"
        isLoading={submitting}
        variant="destructive"
      />
    </>
  );
}
