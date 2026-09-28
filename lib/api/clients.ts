"use server";

import { requestApi } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/client";

export interface ClientDetail {
  company_name?: string;
  country?: string;
  website_or_fb?: string;
  trade_license?: string;
  company_address?: string;
  contact_name?: string;
  position?: string;
  business_type?: string;
  hear_about_us?: string;
  interested_categories?: string[];
  business_introduction?: string;
  nda_agreed?: boolean;
}

export interface Client {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  type: "customer" | "supplier" | "both";
  balance: number;
  address: string | null;
  is_active: boolean;
  status: "pending" | "approved" | "rejected";
  username?: string | null;
  details?: ClientDetail | null;
  created_at: string;
  updated_at: string;
}

export interface ClientLookup {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  type: "customer" | "supplier" | "both";
  balance: number;
}

export interface PaginationInfo {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export async function getClientLookup(search?: string): Promise<ApiResponse<ClientLookup[]>> {
  return requestApi<ClientLookup[]>("/admin/clients/lookup", {
    params: { search },
    fallbackData: [],
  });
}

export async function getClient(id: number): Promise<ApiResponse<Client>> {
  return requestApi<Client>(`/admin/clients/${id}`);
}

export async function getClients(page: number = 1, per_page: number = 20): Promise<ApiResponse<Client[]>> {
  return requestApi<Client[]>("/admin/clients", {
    params: { page, per_page },
    fallbackData: [],
  });
}

export async function createClient(payload: {
  name: string;
  phone?: string | null;
  email?: string | null;
  password?: string | null;
  type: "customer" | "supplier" | "both";
  balance?: number;
  address?: string | null;
  is_active?: boolean;
}): Promise<ApiResponse<Client | null>> {
  return requestApi<Client | null>("/admin/clients", {
    method: "POST",
    body: payload,
  });
}

export async function updateClient(
  id: number | string,
  payload: {
    name: string;
    phone?: string | null;
    email?: string | null;
    password?: string | null;
    type: "customer" | "supplier" | "both";
    balance?: number;
    address?: string | null;
    is_active?: boolean;
    status?: "pending" | "approved" | "rejected";
  }
): Promise<ApiResponse<Client | null>> {
  return requestApi<Client | null>(`/admin/clients/${id}`, {
    method: "PUT",
    body: payload,
  });
}

export async function updateClientStatus(
  id: number | string,
  status: "approved" | "rejected" | "pending"
): Promise<ApiResponse<Client | null>> {
  return requestApi<Client | null>(`/admin/clients/${id}/status`, {
    method: "POST",
    body: { status },
  });
}

