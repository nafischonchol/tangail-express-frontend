"use client";

import React, { useState } from "react";
import { Star, X, Loader2, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import { submitProductReview } from "@/lib/api/reviews";

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  orderId: number;
  orderItemId: number;
  productSlug: string;
  productName: string;
}

export function WriteReviewModal({
  isOpen,
  onClose,
  onSuccess,
  orderId,
  orderItemId,
  productSlug,
  productName,
}: WriteReviewModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating < 1 || rating > 5) {
      toast.error("Please select a rating from 1 to 5 stars.");
      return;
    }

    if (!content.trim()) {
      toast.error("Please write your review content.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitProductReview(productSlug, {
        order_id: orderId,
        order_item_id: orderItemId,
        rating,
        title: title.trim() || undefined,
        content: content.trim(),
      });

      if (res.success) {
        toast.success(res.message || "Review submitted successfully!", {
          style: { background: "#18181b", color: "#f4f4f5", border: "1px solid #27272a" },
        });
        onSuccess();
        onClose();
      } else {
        toast.error(res.message || "Failed to submit review.");
      }
    } catch {
      toast.error("An unexpected error occurred while submitting your review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div 
        className="w-full max-w-lg bg-white border border-neutral-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
          <div>
            <h2 className="text-base font-bold text-neutral-900">Write a Review</h2>
            <p className="text-xs text-neutral-500 truncate max-w-xs mt-0.5">
              {productName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Star Rating Picker */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-2">
              Overall Rating <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => {
                const active = (hoverRating || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 focus:outline-hidden transition-transform active:scale-95 cursor-pointer"
                    title={`${star} Star${star > 1 ? "s" : ""}`}
                  >
                    <Star
                      size={24}
                      className={
                        active
                          ? "fill-amber-400 text-amber-400"
                          : "fill-neutral-100 text-neutral-300"
                      }
                    />
                  </button>
                );
              })}
              <span className="ml-2 text-xs font-medium text-neutral-600">
                {rating === 5 && "Excellent"}
                {rating === 4 && "Good"}
                {rating === 3 && "Average"}
                {rating === 2 && "Poor"}
                {rating === 1 && "Terrible"}
              </span>
            </div>
          </div>

          {/* Review Title */}
          <div>
            <label htmlFor="review-title" className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Review Title <span className="text-neutral-400 font-normal">(Optional)</span>
            </label>
            <input
              id="review-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience (e.g., Great texture and fast delivery)"
              maxLength={255}
              disabled={submitting}
              className="w-full px-3.5 py-2 text-xs bg-neutral-50 focus:bg-white border border-neutral-200 focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400 rounded-xl transition-all outline-hidden text-neutral-900 placeholder:text-neutral-400"
            />
          </div>

          {/* Review Content */}
          <div>
            <label htmlFor="review-content" className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Your Review <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="review-content"
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What did you like or dislike about this product? How did it feel or perform?"
              maxLength={3000}
              required
              disabled={submitting}
              className="w-full px-3.5 py-2.5 text-xs bg-neutral-50 focus:bg-white border border-neutral-200 focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400 rounded-xl transition-all outline-hidden text-neutral-900 placeholder:text-neutral-400 resize-none"
            />
          </div>

          {/* Verification Note */}
          <div className="flex items-center gap-2 p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl text-emerald-800 text-[11px]">
            <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
            <span>This review will be published as a <strong>Verified Purchase</strong> review.</span>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-xl bg-[#BA478F] hover:bg-[#94286B] disabled:bg-neutral-200 disabled:text-neutral-400 text-white transition-all cursor-pointer shadow-2xs"
            >
              {submitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit Review</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
