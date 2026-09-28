import { requestApi, ApiResponse } from "@/lib/api/client";

export interface CustomerOrderItemPayload {
  product_id: number;
  product_variant_id?: number | null;
  quantity: number;
  unit_price?: number;
}

export interface CustomerOrderPayload {
  address_id?: number;
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  district?: string;
  note?: string;
  cart_ids: number[];
  payment_method?: "cod" | "online";
  delivery_charge?: number;
  discount_amount?: number;
  coupon_code?: string;
  fbp?: string;
  fbc?: string;
  event_id?: string;
  source_url?: string;
}

export interface CustomerOrderItem {
  id: number;
  product_id?: number;
  name: string;
  sku: string;
  variant_title: string;
  unit_price: number;
  quantity: number;
  total: number;
  image?: string | null;
  product_slug?: string | null;
  has_review?: boolean;
  review?: {
    id: number;
    rating: number;
    title?: string | null;
    content: string;
  } | null;
}

export interface CustomerOrder {
  id: number;
  invoice_no: string;
  date: string;
  created_at: string;
  status: string;
  items_count: number;
  total_amount: number;
  discount_amount: number;
  tax_amount: number;
  delivery_charge?: number | null;
  grand_total: number;
}

export interface CustomerOrderStatusHistory {
  id: number;
  status: string;
  note: string | null;
  created_at: string;
}

export interface CustomerOrderDetail extends CustomerOrder {
  paid_amount: number;
  items: CustomerOrderItem[];
  client_snapshot?: {
    name?: string;
    phone?: string;
    address?: string;
    city?: string;
    label?: string;
    note?: string;
  };
  status_histories?: CustomerOrderStatusHistory[];
}

export async function createCustomerOrderApi(
  payload: CustomerOrderPayload,
  explicitToken?: string,
): Promise<ApiResponse<any>> {
  const token =
    explicitToken ||
    (typeof window !== "undefined"
      ? localStorage.getItem("customer_token")
      : null);

  return requestApi<any>("/customer/orders", {
    method: "POST",
    body: payload,
    isPublic: true,
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : undefined,
  });
}

export async function getCustomerOrdersApi(params?: {
  search?: string;
  status?: string;
}): Promise<ApiResponse<CustomerOrder[]>> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("customer_token")
      : null;

  if (!token) {
    return {
      success: false,
      message: "You must be logged in to view orders.",
      resources: [],
    };
  }

  return requestApi<CustomerOrder[]>("/customer/me/orders", {
    params,
    isPublic: true,
    fallbackData: [],
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getCustomerOrderDetailApi(
  id: string | number
): Promise<ApiResponse<CustomerOrderDetail | null>> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("customer_token")
      : null;

  if (!token) {
    return {
      success: false,
      message: "You must be logged in to view order details.",
      resources: null,
    };
  }

  return requestApi<CustomerOrderDetail>(`/customer/me/orders/${id}`, {
    isPublic: true,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

