"use server";

import { requestApi } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/client";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export async function getAdminUsers(): Promise<ApiResponse<AdminUser[]>> {
  return requestApi<AdminUser[]>("/admin/users", { fallbackData: [] });
}

export async function getAdminUser(id: string): Promise<ApiResponse<AdminUser | null>> {
  return requestApi<AdminUser | null>(`/admin/users/${id}`);
}

export async function createAdminUser(data: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  is_active?: boolean;
}): Promise<ApiResponse<AdminUser | null>> {
  return requestApi<AdminUser | null>("/admin/users", {
    method: "POST",
    body: data,
  });
}

export async function updateAdminUser(
  id: string,
  data: {
    name: string;
    email: string;
    password?: string;
    phone?: string;
    is_active?: boolean;
  }
): Promise<ApiResponse<AdminUser | null>> {
  return requestApi<AdminUser | null>(`/admin/users/${id}`, {
    method: "POST",
    body: data,
  });
}

