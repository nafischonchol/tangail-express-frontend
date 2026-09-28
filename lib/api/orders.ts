"use server";

import { requestApi } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/client";

export interface CreateOrderPayload {
  items: Array<{
    product_variant_id: number;
    quantity: number;
    unit_price: number;
  }>;
  account_id?: number | null;
  client_id?: number | null;
  discount_amount?: number;
  tax_rate?: number;
  paid_amount: number;
}

export interface ProductSnapshot {
  name: string;
  sku: string;
  variant_title: string;
}

export interface OrderItem {
  id: string;
  name: string;
  product_snapshot: ProductSnapshot;
  unit_price: number;
  quantity: number;
  total: number;
}

export interface Order {
  id: number;
  invoice_no: string;
  date: string;
  customer_name: string;
  customer_phone: string | null;
  client_id: number | null;
  status: string;
  items_count: number;
  items: OrderItem[];
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  delivery_charge?: number | null;
  grand_total: number;
  paid_amount: number;
  change_amount: number;
  due: number;
  payment_method: string;
  created_by: string;
  created_at: string;
}

export interface OrderStatusHistoryItem {
  id: number;
  status: string;
  note: string | null;
  changed_by: string;
  created_at: string;
}

export interface OrderDetail extends Order {
  customer_address: string | null;
  customer_city?: string | null;
  status_histories?: OrderStatusHistoryItem[];
}

export interface UpdateOrderPayload {
  delivery_charge?: number | null;
  customer_name?: string;
  customer_phone?: string;
  customer_address?: string;
  customer_city?: string;
}

export interface OrderLookup {
  id: number;
  invoice_no: string;
  customer_name: string;
  status: string;
  grand_total: number;
  date: string;
}

export async function getOrderLookup(search?: string): Promise<ApiResponse<OrderLookup[]>> {
  return requestApi<OrderLookup[]>("/admin/orders/lookup", {
    params: { search },
    fallbackData: [],
  });
}

export async function getOrders(clientId?: number): Promise<ApiResponse<Order[]>> {
  return requestApi<Order[]>("/admin/orders", {
    params: { client_id: clientId },
    fallbackData: [],
  });
}

export async function getOrder(id: number): Promise<ApiResponse<OrderDetail>> {
  return requestApi<OrderDetail>(`/admin/orders/${id}`);
}

export async function updateOrder(id: number, payload: UpdateOrderPayload): Promise<ApiResponse<any>> {
  return requestApi<any>(`/admin/orders/${id}`, {
    method: "PUT",
    body: payload,
  });
}

export async function createOrder(payload: CreateOrderPayload): Promise<ApiResponse<any>> {
  return requestApi<any>("/admin/orders", {
    method: "POST",
    body: payload,
  });
}

export async function updateOrderStatus(id: number, payload: { status: string; note?: string; courier_name?: string; delivery_charge?: number }): Promise<ApiResponse<any>> {
  return requestApi<any>(`/admin/orders/${id}/status`, {
    method: "POST",
    body: payload,
  });
}

