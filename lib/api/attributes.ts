"use server";

import { revalidateTag } from "next/cache";
import { requestApi } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/client";

export interface AttributeValueOption {
  id?: number;
  value: string;
  image?: string | null;
  image_relative?: string | null;
  remove_image?: boolean;
  meta_title?: string | null;
  meta_description?: string | null;
  is_active?: boolean;
}

export interface Attribute {
  id: number;
  name: string;
  type: "text" | "rich_text" | "select" | "multi_select";
  values?: AttributeValueOption[] | string[] | null;
  is_active: boolean;
  is_default_specification?: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateOrUpdateAttributePayload {
  name: string;
  type: string;
  values?: Array<{
    id?: number;
    value: string;
    image?: string | null;
    image_relative?: string | null;
    remove_image?: boolean;
    meta_title?: string | null;
    meta_description?: string | null;
    is_active?: boolean;
  }> | null;
  is_active: boolean;
  is_default_specification?: boolean;
}

export async function getAttributes(): Promise<ApiResponse<Attribute[]>> {
  return requestApi<Attribute[]>("/admin/attributes", { fallbackData: [] });
}

export async function getAttribute(id: number | string): Promise<ApiResponse<Attribute | null>> {
  return requestApi<Attribute | null>(`/admin/attributes/${id}`);
}

export async function createAttribute(formData: FormData): Promise<ApiResponse<Attribute | null>> {
  const res = await requestApi<Attribute | null>("/admin/attributes", {
    method: "POST",
    body: formData,
  });

  if (res && res.success) {
    revalidateTag("attribute-values", "default");
  }

  return res;
}

export async function updateAttribute(
  id: number | string,
  formData: FormData
): Promise<ApiResponse<Attribute | null>> {
  if (!formData.has("_method")) {
    formData.append("_method", "PUT");
  }

  const res = await requestApi<Attribute | null>(`/admin/attributes/${id}`, {
    method: "POST",
    body: formData,
  });

  if (res && res.success) {
    revalidateTag("attribute-values", "default");
  }

  return res;
}

export async function getAttributeValues(
  slug: string,
): Promise<ApiResponse<any>> {
  return requestApi<any>(`/customer/attributes/${slug}/values`, {
    isPublic: true,
    next: {
      revalidate: 3600,
      tags: ["attribute-values", `attribute-values:${slug}`],
    },
    fallbackData: null,
  });
}
