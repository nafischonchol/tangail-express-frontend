"use server";

import { revalidateTag, revalidatePath } from "next/cache";
import { requestApi } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/client";

export interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id?: number | null;
  parent?: { id: number; name: string } | null;
  icon?: string | null;
  icon_relative?: string | null;
  is_active: boolean;
  is_header_menu: boolean;
  meta_title?: string | null;
  meta_keyword?: string[] | null;
  meta_description?: string | null;
  meta_image?: string | null;
  meta_image_relative?: string | null;
  created_at: string;
  updated_at: string;
}

export async function getCategories(): Promise<ApiResponse<Category[]>> {
  return requestApi<Category[]>("/admin/categories", { fallbackData: [] });
}

export async function getCategory(id: number | string): Promise<ApiResponse<Category | null>> {
  return requestApi<Category | null>(`/admin/categories/${id}`);
}

export async function createCategory(formData: FormData): Promise<ApiResponse<Category | null>> {
  const res = await requestApi<Category | null>("/admin/categories", {
    method: "POST",
    body: formData,
  });

  if (res.success) {
    try {
      revalidateTag("menu-categories", "default");
    } catch (_) {}
    try {
      revalidatePath("/", "layout");
    } catch (_) {}
  }

  return res;
}

export async function updateCategory(
  id: number | string,
  formData: FormData
): Promise<ApiResponse<Category | null>> {
  if (!formData.has("_method")) {
    formData.append("_method", "PUT");
  }

  const res = await requestApi<Category | null>(`/admin/categories/${id}`, {
    method: "POST",
    body: formData,
  });

  if (res.success) {
    try {
      revalidateTag("menu-categories", "default");
    } catch (_) {}
    try {
      revalidatePath("/", "layout");
    } catch (_) {}
  }

  return res;
}

export async function toggleCategoryHeaderMenu(
  id: number | string,
  isHeaderMenu?: boolean
): Promise<ApiResponse<Category | null>> {
  const res = await requestApi<Category | null>(`/admin/categories/${id}/toggle-header-menu`, {
    method: "POST",
    body: isHeaderMenu !== undefined ? { is_header_menu: isHeaderMenu } : {},
  });

  if (res.success) {
    try {
      revalidateTag("menu-categories", "default");
    } catch (_) {}
    try {
      revalidatePath("/", "layout");
    } catch (_) {}
  }

  return res;
}

export interface PublicCategory {
  id: number;
  name: string;
  slug: string;
  icon?: string | null;
  is_header_menu?: boolean;
  parent_id?: number | null;
  children?: PublicCategory[];
}

export async function getPublicCategories(): Promise<ApiResponse<PublicCategory[]>> {
  return requestApi<PublicCategory[]>("/customer/popular-categories", {
    isPublic: true,
    fallbackData: [],
  });
}

export const getPopularCategories = async (): Promise<ApiResponse<PublicCategory[]>> => {
  return requestApi<PublicCategory[]>("/customer/popular-categories", {
    isPublic: true,
    fallbackData: [],
  });
};

export async function getMenuCategories(): Promise<ApiResponse<PublicCategory[]>> {
  return requestApi<PublicCategory[]>("/customer/menu-categories", {
    isPublic: true,
    next: { revalidate: 60 * 60 * 24, tags: ["menu-categories"] },
    fallbackData: [],
  });
}



