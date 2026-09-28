"use server";

import { requestApi } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/client";

export interface Brand {
  id: number;
  name: string;
  slug: string;
  icon?: string | null;
  icon_relative?: string | null;
  is_active: boolean;
  meta_title?: string | null;
  meta_keyword?: string[] | null;
  meta_description?: string | null;
  meta_image?: string | null;
  meta_image_relative?: string | null;
  created_at: string;
  updated_at: string;
}

export async function getBrands(): Promise<ApiResponse<Brand[]>> {
  return requestApi<Brand[]>("/admin/brands", { fallbackData: [] });
}

export async function getBrand(id: number | string): Promise<ApiResponse<Brand | null>> {
  return requestApi<Brand | null>(`/admin/brands/${id}`);
}

export async function createBrand(formData: FormData): Promise<ApiResponse<Brand | null>> {
  return requestApi<Brand | null>("/admin/brands", {
    method: "POST",
    body: formData,
  });
}

export async function updateBrand(
  id: number | string,
  formData: FormData
): Promise<ApiResponse<Brand | null>> {
  if (!formData.has("_method")) {
    formData.append("_method", "PUT");
  }

  return requestApi<Brand | null>(`/admin/brands/${id}`, {
    method: "POST",
    body: formData,
  });
}

export interface PublicBrand {
  id: number;
  name: string;
  slug?: string;
  slug_url?: string;
  icon?: string | null;
  meta_title?: string | null;
  meta_keyword?: string[] | null;
  meta_description?: string | null;
  meta_image?: string | null;
}

export async function getPublicBrands(search?: string): Promise<ApiResponse<PublicBrand[]>> {
  return requestApi<PublicBrand[]>("/customer/brands", {
    isPublic: true,
    params: search ? { search } : undefined,
    fallbackData: [],
  });
}

export async function getPopularBrands(perPage: number = 8): Promise<ApiResponse<PublicBrand[]>> {
  return requestApi<PublicBrand[]>("/customer/popular-brands", {
    isPublic: true,
    params: { per_page: perPage },
    fallbackData: [],
  });
}



