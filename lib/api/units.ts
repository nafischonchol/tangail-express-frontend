"use server";

import { requestApi } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/client";

export interface Unit {
  id: number;
  name: string;
  short_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export async function getUnits(): Promise<ApiResponse<Unit[]>> {
  return requestApi<Unit[]>("/admin/units", { fallbackData: [] });
}

export async function createUnit(payload: {
  name: string;
  short_name: string;
  is_active: boolean;
}): Promise<ApiResponse<Unit | null>> {
  return requestApi<Unit | null>("/admin/units", {
    method: "POST",
    body: payload,
  });
}

export async function updateUnit(
  id: number | string,
  payload: {
    name: string;
    short_name: string;
    is_active: boolean;
  }
): Promise<ApiResponse<Unit | null>> {
  return requestApi<Unit | null>(`/admin/units/${id}`, {
    method: "PUT",
    body: payload,
  });
}

