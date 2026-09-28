"use server";

import { requestApi } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/client";

export interface CourierSetting {
  id: number;
  courier_name: "pathao" | "steadfast";
  is_enabled: boolean;
  is_default: boolean;
  credentials: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export async function getCourierSettings(): Promise<ApiResponse<CourierSetting[]>> {
  return requestApi<CourierSetting[]>("/admin/courier-settings", {
    fallbackData: [],
  });
}

export async function updateCourierSettings(payload: {
  courier_name: "pathao" | "steadfast";
  is_enabled: boolean;
  is_default: boolean;
  credentials: Record<string, any>;
}): Promise<ApiResponse<CourierSetting | null>> {
  return requestApi<CourierSetting | null>("/admin/courier-settings", {
    method: "POST",
    body: payload,
  });
}

