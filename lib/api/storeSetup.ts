"use server";

import { revalidateTag, revalidatePath } from "next/cache";
import { requestApi } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/client";

export interface StoreSetup {
  id: number;
  store_name: string | null;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  bin_number: string | null;
  street_address: string | null;
  division_id: number | null;
  division_name: string | null;
  district_id: number | null;
  district_name: string | null;
  upazila_id: number | null;
  upazila_name: string | null;
  facebook: string | null;
  instagram: string | null;
  youtube: string | null;
  tiktok: string | null;
  logo: string | null;
}

export async function getPublicStoreSetup(): Promise<
  ApiResponse<StoreSetup | null>
> {
  return requestApi<StoreSetup | null>("/customer/business-profile", {
    isPublic: true,
    next: { revalidate: 60 * 30, tags: ["business-profile"] },
  });
}

export async function getStoreSetup(): Promise<ApiResponse<StoreSetup | null>> {
  return requestApi<StoreSetup | null>("/admin/business-profile");
}

export async function updateStoreSetup(
  formData: FormData,
): Promise<ApiResponse<StoreSetup | null>> {
  const res = await requestApi<StoreSetup | null>("/admin/business-profile", {
    method: "POST",
    body: formData,
  });
  if (res.success) {
    try {
      revalidateTag("business-profile", "default");
    } catch {}
    try {
      revalidatePath("/", "layout");
    } catch {}
  }
  return res;
}

export async function deleteStoreLogo(): Promise<ApiResponse<null>> {
  const res = await requestApi<null>("/admin/business-profile/logo", {
    method: "DELETE",
  });
  if (res.success) {
    try {
      revalidateTag("business-profile", "default");
    } catch {}
    try {
      revalidatePath("/", "layout");
    } catch {}
  }
  return res;
}
