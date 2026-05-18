'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { Review, ApiResponse } from '@/types';
import {
  Star, Search, RefreshCw, MessageSquare, User as UserIcon,
  Calendar, BarChart3, Award, ThumbsDown, ThumbsUp,
} from 'lucide-react';
import toast from 'react-hot-toast';
import DataTable from '@/components/ui/DataTable';
import { StatsCard } from '@/components/ui/StatsCard';

function StarDisplay({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={star <= rating ? 'text-amber-400 fill-amber-400' : 'text-zinc-600'}
        />
      ))}
    </div>
  );
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | 'All'>('All');

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const res: ApiResponse<Review[]> = await api.get('/api/Reviews');
      if (res.success) setReviews(res.data || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length)
    : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  const filtered = reviews.filter((r) => {
    const matchSearch =
      r.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.comment?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRating = ratingFilter === 'All' || r.rating === ratingFilter;
    return matchSearch && matchRating;
  });

  const positiveCount = reviews.filter((r) => r.rating >= 4).length;
  const negativeCount = reviews.filter((r) => r.rating <= 2).length;

  const columns = [
    {
      key: 'customer',
      header: 'Customer',
      render: (row: Review) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/30 flex items-center justify-center text-orange-600 font-bold text-sm">
            {row.customerName?.charAt(0).toUpperCase()}
          </div>
          <p className="font-semibold text-zinc-900 dark:text-white">{row.customerName}</p>
        </div>
      ),
    },
    {
      key: 'rating',
      header: 'Rating',
      render: (row: Review) => (
        <div className="flex flex-col gap-1">
          <StarDisplay rating={row.rating} />
          <span className={`text-xs font-semibold ${
            row.rating >= 4 ? 'text-green-500' : row.rating >= 3 ? 'text-amber-500' : 'text-red-500'
          }`}>
            {row.rating}/5
          </span>
        </div>
      ),
    },
    {
      key: 'comment',
      header: 'Comment',
      render: (row: Review) => (
        row.comment
          ? <p className="text-sm text-zinc-600 dark:text-zinc-300 max-w-sm line-clamp-2">{row.comment}</p>
          : <span className="text-xs text-zinc-500 italic">No comment</span>
      ),
    },
    {
      key: 'linked',
      header: 'Linked To',
      render: (row: Review) => (
        <span className="text-xs text-zinc-500">
          {row.appointmentId
            ? <span className="flex items-center gap-1 text-blue-500"><Calendar size={11} /> Appointment</span>
            : row.salesInvoiceId
            ? <span className="flex items-center gap-1 text-green-500"><Star size={11} /> Invoice</span>
            : <span className="text-zinc-600">General</span>}
        </span>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      render: (row: Review) => (
        <p className="text-sm text-zinc-500">
          {new Date(row.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
        </p>
      ),
    },
  ];

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-orange-600" /> Customer Reviews
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Monitor all customer feedback and ratings
          </p>
        </div>
        <button
          onClick={fetchReviews}
          className="flex items-center gap-2 px-5 py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-2xl font-semibold transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <p className="text-zinc-500 text-sm font-medium uppercase tracking-wider mb-1">Avg Rating</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-amber-500">{avgRating.toFixed(1)}</h3>
            <Star size={18} className="text-amber-400 fill-amber-400 mb-1" />
          </div>
          <StarDisplay rating={Math.round(avgRating)} size={12} />
        </div>
        <StatsCard label="Total Reviews" value={reviews.length} icon={MessageSquare} variant="default" />
        <StatsCard label="Positive (4-5★)" value={positiveCount} icon={ThumbsUp} variant="success" />
        <StatsCard label="Negative (1-2★)" value={negativeCount} icon={ThumbsDown} variant="danger" />
      </div>

      {/* Rating Distribution */}
      {reviews.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
          <h2 className="font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 size={18} className="text-orange-500" />
            Rating Distribution
          </h2>
          <div className="space-y-3">
            {ratingCounts.map(({ star, count }) => (
              <div key={star} className="flex items-center gap-4">
                <div className="flex items-center gap-1 w-16 shrink-0">
                  <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 w-3">{star}</span>
                  <Star size={13} className="text-amber-400 fill-amber-400" />
                </div>
                <div className="flex-1 h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-700"
                    style={{ width: reviews.length > 0 ? `${(count / reviews.length) * 100}%` : '0%' }}
                  />
                </div>
                <span className="text-sm text-zinc-500 w-8 text-right">{count}</span>
                <span className="text-xs text-zinc-400 w-10 text-right">
                  {reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rating Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setRatingFilter('All')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
            ratingFilter === 'All'
              ? 'bg-orange-600 text-white border-orange-600 shadow-lg shadow-orange-500/20'
              : 'bg-white dark:bg-zinc-900 text-zinc-500 border-zinc-200 dark:border-zinc-800 hover:border-orange-300 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          All ({reviews.length})
        </button>
        {[5, 4, 3, 2, 1].map((star) => {
          const count = reviews.filter((r) => r.rating === star).length;
          return (
            <button
              key={star}
              onClick={() => setRatingFilter(star)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                ratingFilter === star
                  ? 'bg-orange-600 text-white border-orange-600 shadow-lg shadow-orange-500/20'
                  : 'bg-white dark:bg-zinc-900 text-zinc-500 border-zinc-200 dark:border-zinc-800 hover:border-orange-300 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Star size={13} className={ratingFilter === star ? 'fill-white text-white' : 'text-amber-400 fill-amber-400'} />
              {star} Star ({count})
            </button>
          );
        })}
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        loading={loading}
        keyExtractor={(r) => r.id}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search by customer name or comment..."
        onRefresh={fetchReviews}
        emptyIcon={Star}
        emptyMessage="No reviews found."
      />
    </div>
  );
}
