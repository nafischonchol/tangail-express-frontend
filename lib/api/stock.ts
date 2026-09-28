"use server";

import { requestApi } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/client";

export interface AdjustmentPayload {
  product_variant_id: number;
  type: "addition" | "deduction" | "damage";
  quantity: number;
  unit_price?: number;
  purchase_price?: number;
  reason?: string;
}

export interface StockMovement {
  id: number;
  product_id: number;
  product_variant_id: number;
  type: string;
  quantity: number;
  stock_before: number;
  stock_after: number;
  reason: string | null;
  created_at: string;
  reference_type: string | null;
  reference_id: number | null;
  variant?: { id: number; sku: string; price: string };
  creator?: { id: string; name: string };
  reference?: {
    id: number;
    unit_price?: string | number | null;
    purchase_price?: string | number | null;
    invoice_no?: string | null;
    client_snapshot?: { name: string; phone?: string; address?: string } | null;
    status?: string | null;
    order_id?: number | null;
    client_id?: number | null;
    order?: {
      id: number;
      invoice_no: string;
      client_snapshot?: { name: string; phone?: string; address?: string } | null;
      status: string;
      client_id?: number | null;
    } | null;
  } | null;
}

export async function createAdjustment(payload: AdjustmentPayload): Promise<ApiResponse<any>> {
  return requestApi<any>("/admin/adjustments", {
    method: "POST",
    body: payload,
  });
}

export async function getStockMovements(productId: number): Promise<ApiResponse<any>> {
  return requestApi<any>(`/admin/products/${productId}/stock-movements`, {
    fallbackData: { data: [] },
  });
}

