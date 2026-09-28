import { publicApiFetch } from "@/lib/api/client";

export interface CustomerCartItem {
  id: string;
  product_id: number;
  product_variant_id: number | null;
  name: string;
  price: number;
  image: string;
  quantity: number;
  brand?: string;
  sku?: string;
  slug_url?: string;
}

export async function fetchCustomerCart(): Promise<{ success: boolean; resources: CustomerCartItem[]; message?: string }> {
  try {
    const res = await publicApiFetch("/customer/cart", {
      cache: "no-store",
    });
    const data = await res.json();
    return {
      success: data.success ?? res.ok,
      resources: data.resources || [],
      message: data.message,
    };
  } catch (err: any) {
    return { success: false, resources: [], message: err?.message };
  }
}

export async function addToCartApi(
  productId: number | string,
  variantId?: number | string | null,
  quantity: number = 1
): Promise<{ success: boolean; resources?: CustomerCartItem; message?: string }> {
  try {
    const res = await publicApiFetch("/customer/cart", {
      method: "POST",
      body: JSON.stringify({
        product_id: Number(productId),
        product_variant_id: variantId ? Number(variantId) : null,
        quantity,
      }),
    });
    const data = await res.json();
    return {
      success: data.success ?? res.ok,
      resources: data.resources,
      message: data.message,
    };
  } catch (err: any) {
    return { success: false, message: err?.message };
  }
}

export async function updateCartQtyApi(
  cartId: number | string,
  quantity: number
): Promise<{ success: boolean; resources?: CustomerCartItem; message?: string }> {
  try {
    const res = await publicApiFetch(`/customer/cart/${cartId}`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    });
    const data = await res.json();
    return {
      success: data.success ?? res.ok,
      resources: data.resources,
      message: data.message,
    };
  } catch (err: any) {
    return { success: false, message: err?.message };
  }
}

export async function removeCartItemApi(cartId: number | string): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await publicApiFetch(`/customer/cart/${cartId}`, {
      method: "DELETE",
    });
    const data = await res.json();
    return { success: data.success ?? res.ok, message: data.message };
  } catch (err: any) {
    return { success: false, message: err?.message };
  }
}

export async function clearCartApi(): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await publicApiFetch("/customer/cart", {
      method: "DELETE",
    });
    const data = await res.json();
    return { success: data.success ?? res.ok, message: data.message };
  } catch (err: any) {
    return { success: false, message: err?.message };
  }
}
