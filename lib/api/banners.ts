"use server";

import { requestApi } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/client";

export interface Banner {
  id: number;
  name: string;
  type: string;
  type_label: string;
  short_description?: string | null;
  redirect_url?: string | null;
  banner_image?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BannerType {
  value: string;
  label: string;
}

export async function getBannerTypes(): Promise<ApiResponse<BannerType[]>> {
  return requestApi<BannerType[]>("/admin/banner-types", { fallbackData: [] });
}

export async function getBanners(): Promise<ApiResponse<Banner[]>> {
  return requestApi<Banner[]>("/admin/banners", { fallbackData: [] });
}

export async function createBanner(formData: FormData): Promise<ApiResponse<Banner | null>> {
  return requestApi<Banner | null>("/admin/banners", {
    method: "POST",
    body: formData,
  });
}

export async function updateBanner(
  id: number | string,
  formData: FormData
): Promise<ApiResponse<Banner | null>> {
  if (!formData.has("_method")) {
    formData.append("_method", "PUT");
  }

  return requestApi<Banner | null>(`/admin/banners/${id}`, {
    method: "POST",
    body: formData,
  });
}

export async function getPublicBanners(type: string = "hero"): Promise<ApiResponse<Banner[]>> {
  return requestApi<Banner[]>(`/customer/banners/${type}`, {
    isPublic: true,
    fallbackData: [],
  });
}

export async function updateBannerStatus(
  id: number | string,
  isActive?: boolean
): Promise<ApiResponse<Banner | null>> {
  return requestApi<Banner | null>(`/admin/banners/${id}/status`, {
    method: "POST",
    body: isActive !== undefined ? { is_active: isActive } : {},
  });
}

export const getHeroBanners = async (): Promise<ApiResponse<Banner[]>> => {
  return requestApi<Banner[]>("/customer/banners/hero", {
    isPublic: true,
    next: { revalidate: 60 * 60, tags: ["hero-banners"] },
    fallbackData: [],
  });
};




