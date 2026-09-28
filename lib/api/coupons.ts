"use server";

import { requestApi } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/client";

export interface CouponClient {
  id: number;
  name: string;
  phone: string | null;
  email?: string | null;
}

export interface Coupon {
  id: number;
  code: string;
  name: string | null;
  type: "fixed" | "percentage";
  value: number;
  min_order_amount: number | null;
  max_discount_amount: number | null;
  target_type: "all" | "specific_clients";
  usage_limit_total: number | null;
  usage_limit_per_client: number;
  used_count: number;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_by_id: number | null;
  created_by?: { id: number; name: string } | null;
  clients?: CouponClient[];
  usages_count?: number;
  total_discount_issued?: number;
  created_at: string;
  updated_at: string;
}

export interface CouponStats {
  total_coupons: number;
  active_coupons: number;
  total_redemptions: number;
  total_discount_given: number;
}

export interface CouponListResponse {
  coupons: Coupon[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  stats: CouponStats;
}

export interface CouponUsageItem {
  id: number;
  coupon_id: number;
  order_id: number;
  client_id: number | null;
  discount_amount: number;
  created_at: string;
  order?: {
    id: number;
    invoice_no: string;
    grand_total: number;
    status: string;
    created_at: string;
  };
  client?: {
    id: number;
    name: string;
    phone: string | null;
    email: string | null;
  } | null;
}

export interface CouponUsagesResponse {
  coupon: {
    id: number;
    code: string;
    name: string | null;
    type: string;
    value: number;
    used_count: number;
  };
  usages: CouponUsageItem[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface CouponPayload {
  code: string;
  name?: string | null;
  type: "fixed" | "percentage";
  value: number;
  min_order_amount?: number | null;
  max_discount_amount?: number | null;
  target_type: "all" | "specific_clients";
  client_ids?: number[];
  usage_limit_total?: number | null;
  usage_limit_per_client: number;
  starts_at?: string | null;
  expires_at?: string | null;
  is_active: boolean;
}

export interface CustomerCouponValidationResponse {
  coupon_id: number;
  code: string;
  name: string | null;
  type: "fixed" | "percentage";
  value: number;
  min_order_amount: number | null;
  max_discount_amount: number | null;
  discount_amount: number;
  message: string;
}

export async function getCoupons(params?: {
  search?: string;
  status?: string;
  type?: string;
  page?: number;
  per_page?: number;
}): Promise<ApiResponse<CouponListResponse>> {
  return requestApi<CouponListResponse>("/admin/coupons", {
    cache: "no-store",
    params: {
      search: params?.search,
      status: params?.status,
      type: params?.type,
      page: params?.page,
      per_page: params?.per_page ?? 15,
    },
    fallbackData: {
      coupons: [],
      pagination: { current_page: 1, last_page: 1, per_page: 15, total: 0 },
      stats: { total_coupons: 0, active_coupons: 0, total_redemptions: 0, total_discount_given: 0 },
    },
  });
}

export async function getCoupon(id: number): Promise<ApiResponse<Coupon>> {
  return requestApi<Coupon>(`/admin/coupons/${id}`);
}

export async function createCoupon(data: CouponPayload): Promise<ApiResponse<Coupon>> {
  return requestApi<Coupon>("/admin/coupons", {
    method: "POST",
    body: data,
  });
}

export async function updateCoupon(id: number, data: CouponPayload): Promise<ApiResponse<Coupon>> {
  return requestApi<Coupon>(`/admin/coupons/${id}`, {
    method: "PUT",
    body: data,
  });
}

export async function updateCouponStatus(id: number, is_active: boolean): Promise<ApiResponse<Coupon>> {
  return requestApi<Coupon>(`/admin/coupons/${id}/status`, {
    method: "POST",
    body: { is_active },
  });
}

export async function deleteCoupon(id: number): Promise<ApiResponse<null>> {
  return requestApi<null>(`/admin/coupons/${id}`, {
    method: "DELETE",
  });
}

export async function getCouponUsages(id: number, page: number = 1): Promise<ApiResponse<CouponUsagesResponse>> {
  return requestApi<CouponUsagesResponse>(`/admin/coupons/${id}/usages`, {
    params: { page },
  });
}

export async function generateUniqueCouponCode(prefix?: string): Promise<ApiResponse<{ code: string }>> {
  return requestApi<{ code: string }>("/admin/coupons/generate-code", {
    params: { prefix },
  });
}

export async function validateCustomerCoupon(
  code: string,
  subtotal: number,
  phone?: string
): Promise<ApiResponse<CustomerCouponValidationResponse>> {
  return requestApi<CustomerCouponValidationResponse>("/customer/coupons/validate", {
    method: "POST",
    body: { code, subtotal, phone },
  });
}
