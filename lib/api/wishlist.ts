import { requestApi } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/client";

export interface WishlistApiItem {
  id: number;
  client_id?: number | null;
  guest_token?: string | null;
  product_id: number;
  product_variant_id?: number | null;
  product?: {
    id: number;
    name: string;
    slug: string;
    selling_price: number;
    primary_image_url?: string | null;
  };
  variant?: {
    id: number;
    sku: string;
    price?: number | null;
  } | null;
}

let inFlightWishlistPromise: Promise<ApiResponse<WishlistApiItem[]>> | null = null;

export async function fetchWishlistApi() {
  if (inFlightWishlistPromise) {
    return inFlightWishlistPromise;
  }

  inFlightWishlistPromise = (async () => {
    try {
      return await requestApi<WishlistApiItem[]>("/customer/wishlist", {
        method: "GET",
        isPublic: true,
      });
    } finally {
      inFlightWishlistPromise = null;
    }
  })();

  return inFlightWishlistPromise;
}

export async function toggleWishlistApi(productId: number, variantId?: number) {
  return requestApi<{ attached: boolean; message: string }>("/customer/wishlist/toggle", {
    method: "POST",
    body: {
      product_id: productId,
      product_variant_id: variantId,
    },
    isPublic: true,
  });
}

export async function mergeWishlistApi(guestToken: string) {
  return requestApi<WishlistApiItem[]>("/customer/me/wishlist/merge", {
    method: "POST",
    body: {
      guest_token: guestToken,
    },
    isPublic: false,
  });
}
