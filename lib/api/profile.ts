"use server";

import { requestApi } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/client";

export interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export async function getProfile(): Promise<ApiResponse<Profile | null>> {
  return requestApi<Profile | null>("/admin/profile");
}

export async function updateProfile(formData: FormData): Promise<ApiResponse<Profile | null>> {
  return requestApi<Profile | null>("/admin/profile", {
    method: "POST",
    body: formData,
  });
}

