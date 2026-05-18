'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { Appointment, ApiResponse } from '@/types';
import {
  Star, PlusCircle, MessageSquare, Clock, Calendar,
  RefreshCw, Search, Sparkles, ThumbsUp,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '@/components/ui/Modal';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FormSelect, FormTextarea, SubmitButton } from '@/components/ui/FormElements';

interface Review {
  id: string;
  customerId: string;
  customerName: string;
  appointmentId?: string;
  salesInvoiceId?: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

const reviewSchema = z.object({
  appointmentId: z.string().optional(),
  rating: z.number().int().min(1, 'Rating required').max(5),
  comment: z.string().optional(),
});
type ReviewFormValues = z.infer<typeof reviewSchema>;

function StarRatingInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(star)}
          className="transition-transform hover:scale-110 active:scale-95"
        >
          <Star
            size={32}
            className={`transition-colors ${
              star <= (hover || value)
                ? 'text-amber-400 fill-amber-400'
                : 'text-zinc-700'
            }`}
          />
        </button>
      ))}
      <span className="ml-3 text-sm text-zinc-400 font-medium">
        {value === 0
          ? 'Select rating'
          : value === 1
          ? '😞 Poor'
          : value === 2
          ? '😐 Fair'
          : value === 3
          ? '🙂 Good'
          : value === 4
          ? '😊 Very Good'
          : '🤩 Excellent!'}
      </span>
    </div>
  );
}

function StarDisplay({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={star <= rating ? 'text-amber-400 fill-amber-400' : 'text-zinc-700'}
        />
      ))}
    </div>
  );
}

interface ReviewFormProps {
  appointments: Appointment[];
  onSubmit: (data: ReviewFormValues) => Promise<void>;
  isLoading: boolean;
}

function ReviewForm({ appointments, onSubmit, isLoading }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0 },
  });

  const handleRatingChange = (v: number) => {
    setRating(v);
    setValue('rating', v, { shouldValidate: true });
  };

  const completedAppointments = appointments.filter((a) => a.status === 'Completed');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Star Rating */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Your Rating <span className="text-orange-500">*</span>
        </label>
        <input type="hidden" {...register('rating', { valueAsNumber: true })} />
        <StarRatingInput value={rating} onChange={handleRatingChange} />
        {errors.rating && <p className="text-xs text-red-500">{errors.rating.message}</p>}
      </div>

      {/* Appointment (optional) */}
      <FormSelect
        label="Link to Appointment (Optional)"
        registration={register('appointmentId')}
        options={completedAppointments.map((a) => ({
          value: a.id,
          label: `${a.serviceType} — ${new Date(a.requestedAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}`,
        }))}
        placeholder="General review (not linked to an appointment)"
      />

      <FormTextarea
        label="Comment"
        registration={register('comment')}
        error={errors.comment?.message}
        placeholder="Share your experience with our service..."
        rows={4}
      />

      <div className="flex justify-end pt-2">
        <SubmitButton isLoading={isLoading}>Submit Review</SubmitButton>
      </div>
    </form>
  );
}

export default function CustomerReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [revRes, apptRes] = await Promise.all([
        api.get('/api/Reviews') as Promise<ApiResponse<Review[]>>,
        api.get('/api/Appointments') as Promise<ApiResponse<Appointment[]>>,
      ]);
      if (revRes.success) setReviews(revRes.data || []);
      if (apptRes.success) setAppointments(apptRes.data || []);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleCreate = async (data: ReviewFormValues) => {
    try {
      setSubmitting(true);
      const payload: any = {
        rating: data.rating,
        comment: data.comment || undefined,
        appointmentId: data.appointmentId || undefined,
      };
      const res: ApiResponse<Review> = await api.post('/api/Reviews', payload);
      if (res.success) {
        toast.success('Review submitted! Thank you for your feedback.');
        setIsCreateOpen(false);
        fetchAll();
      } else {
        toast.error(res.message || 'Failed to submit review');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = reviews.filter(
    (r) => r.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ?? true
  );

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '—';

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  return (
    <>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold font-outfit flex items-center gap-3">
              <Star className="text-[#F97316] fill-[#F97316]" size={28} />
              My Reviews
            </h2>
            <p className="text-zinc-500 mt-1">Rate and review your service experiences.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchAll}
              className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-zinc-400 hover:text-white"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="bg-[#F97316] hover:bg-[#ea580c] text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-[#F97316]/20 transition-all flex items-center gap-2 active:scale-95"
            >
              <PlusCircle size={18} />
              Write Review
            </button>
          </div>
        </div>

        {/* Rating Summary Card */}
        {reviews.length > 0 && (
          <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              {/* Average */}
              <div className="flex items-center gap-4 shrink-0">
                <div className="text-center">
                  <p className="text-6xl font-bold text-white">{avgRating}</p>
                  <StarDisplay rating={Math.round(Number(avgRating))} size={18} />
                  <p className="text-xs text-zinc-500 mt-1">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
                </div>
              </div>

              {/* Bar chart */}
              <div className="flex-1 space-y-2 w-full">
                {ratingCounts.map(({ star, count }) => (
                  <div key={star} className="flex items-center gap-3">
                    <div className="flex items-center gap-0.5 w-20 shrink-0">
                      <span className="text-xs text-zinc-400 w-3">{star}</span>
                      <Star size={12} className="text-amber-400 fill-amber-400" />
                    </div>
                    <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-500"
                        style={{ width: reviews.length > 0 ? `${(count / reviews.length) * 100}%` : '0%' }}
                      />
                    </div>
                    <span className="text-xs text-zinc-500 w-6 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#141414] border border-[#222] rounded-2xl pl-12 pr-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-[#F97316]/50 focus:ring-1 focus:ring-[#F97316]/30 transition-all"
            placeholder="Search in reviews..."
          />
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#141414] border border-[#222] rounded-2xl p-6 animate-pulse">
                <div className="h-5 bg-white/5 rounded w-1/4 mb-3" />
                <div className="h-4 bg-white/5 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-5">
              <Sparkles size={36} className="text-amber-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              {searchTerm ? 'No matching reviews' : 'No reviews yet'}
            </h3>
            <p className="text-zinc-500 max-w-xs">
              {searchTerm
                ? 'Try a different search term.'
                : 'Share your experience! Write your first review and help us improve our services.'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setIsCreateOpen(true)}
                className="mt-6 bg-[#F97316] hover:bg-[#ea580c] text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2"
              >
                <Star size={16} className="fill-white" />
                Write First Review
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((review) => (
                <div
                  key={review.id}
                  className="bg-[#141414] border border-[#222] rounded-2xl p-5 hover:border-[#333] transition-all"
                >
                  <div className="flex items-start gap-4">
                    {/* Rating badge */}
                    <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center shrink-0 border ${
                      review.rating >= 4
                        ? 'bg-amber-500/10 border-amber-500/20'
                        : review.rating >= 3
                        ? 'bg-blue-500/10 border-blue-500/20'
                        : 'bg-red-500/10 border-red-500/20'
                    }`}>
                      <span className="text-xl font-bold text-white">{review.rating}</span>
                      <Star size={10} className="text-amber-400 fill-amber-400" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <StarDisplay rating={review.rating} size={15} />
                        <span className="text-xs text-zinc-600 shrink-0">
                          {new Date(review.createdAt).toLocaleDateString('en-US', {
                            day: '2-digit', month: 'short', year: 'numeric',
                          })}
                        </span>
                      </div>

                      {review.comment ? (
                        <p className="text-zinc-300 text-sm leading-relaxed">{review.comment}</p>
                      ) : (
                        <p className="text-zinc-600 text-sm italic">No comment provided</p>
                      )}

                      {review.appointmentId && (
                        <div className="flex items-center gap-1.5 mt-2">
                          <Calendar size={11} className="text-zinc-600" />
                          <span className="text-xs text-zinc-600">Linked to appointment</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Write a Review" maxWidth="max-w-lg">
        <ReviewForm appointments={appointments} onSubmit={handleCreate} isLoading={submitting} />
      </Modal>
    </>
  );
}
