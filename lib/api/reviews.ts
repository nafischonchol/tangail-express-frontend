"use server";

import { requestApi } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/client";

export interface ReviewReply {
  author: string;
  content: string;
  date: string;
}

export interface ReviewItem {
  id: string;
  name: string;
  rating: number;
  date: string;
  title: string;
  content: string;
  verified: boolean;
  helpfulCount: number;
  tags?: string[];
  reply?: ReviewReply | null;
}

export interface ReviewSummary {
  average_rating: number;
  total_reviews: number;
  breakdown: Record<number, number>;
}

export interface ProductReviewsResponse {
  reviews: ReviewItem[];
  summary: ReviewSummary;
  pagination?: any;
}

export interface GetProductReviewsParams {
  rating?: number | null;
  sort?: "recent" | "highest" | "lowest";
  page?: number;
  per_page?: number;
}

export interface CreateReviewPayload {
  order_id: number;
  order_item_id: number;
  rating: number;
  title?: string;
  content: string;
}

export async function getProductReviews(
  slugOrId: string,
  params?: GetProductReviewsParams
): Promise<ApiResponse<ProductReviewsResponse | null>> {
  return requestApi<ProductReviewsResponse | null>(`/customer/product/${slugOrId}/reviews`, {
    isPublic: true,
    params: {
      rating: params?.rating ?? undefined,
      sort: params?.sort ?? undefined,
      page: params?.page ?? undefined,
      per_page: params?.per_page ?? undefined,
    },
    fallbackData: null,
  });
}

export async function submitProductReview(
  slugOrId: string,
  payload: CreateReviewPayload
): Promise<ApiResponse<ReviewItem | null>> {
  const token = typeof window !== "undefined" ? localStorage.getItem("customer_token") : null;

  return requestApi<ReviewItem | null>(`/customer/product/${slugOrId}/reviews`, {
    method: "POST",
    body: payload,
    isPublic: true,
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : undefined,
  });
}

export async function voteHelpfulReview(
  reviewId: string | number
): Promise<ApiResponse<{ id: string; helpfulCount: number } | null>> {
  return requestApi<{ id: string; helpfulCount: number } | null>(`/customer/reviews/${reviewId}/helpful`, {
    method: "POST",
    isPublic: true,
  });
}
