"use server";

import { requestApi } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/client";

export interface CourierCredential {
  id: number;
  courier: "pathao" | "steadfast" | "redx" | "carrybee";
  credential: Record<string, any>;
  status: "active" | "rate_limited" | "inactive";
  last_used_at: string | null;
  last_error: string | null;
  created_at: string;
  updated_at: string;
}

export async function getCourierCredentials(): Promise<ApiResponse<CourierCredential[]>> {
  return requestApi<CourierCredential[]>("/admin/courier-fraud-checker-credentials", {
    fallbackData: [],
  });
}

export async function createCourierCredential(payload: {
  courier: "pathao" | "steadfast" | "redx" | "carrybee";
  credential: Record<string, any>;
  status?: string;
}): Promise<ApiResponse<CourierCredential | null>> {
  return requestApi<CourierCredential | null>("/admin/courier-fraud-checker-credentials", {
    method: "POST",
    body: payload,
  });
}

export async function updateCourierCredential(
  id: number,
  payload: {
    courier?: "pathao" | "steadfast" | "redx" | "carrybee";
    credential?: Record<string, any>;
    status?: string;
  }
): Promise<ApiResponse<CourierCredential | null>> {
  return requestApi<CourierCredential | null>(`/admin/courier-fraud-checker-credentials/${id}`, {
    method: "PUT",
    body: payload,
  });
}

