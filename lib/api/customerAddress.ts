import { requestApi, ApiResponse } from "@/lib/api/client";

export interface CustomerAddress {
  id: number;
  client_id: number;
  name: string;
  phone: string;
  address: string;
  city: string;
  label: string;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CustomerAddressPayload {
  name: string;
  phone: string;
  address: string;
  city: string;
  label?: string;
  is_default?: boolean;
}

function getAuthHeader(): Record<string, string> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("customer_token")
      : null;

  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function getCustomerAddressesApi(): Promise<ApiResponse<CustomerAddress[]>> {
  return requestApi<CustomerAddress[]>("/customer/me/addresses", {
    method: "GET",
    isPublic: true,
    headers: getAuthHeader(),
  });
}

export async function createCustomerAddressApi(
  payload: CustomerAddressPayload,
): Promise<ApiResponse<CustomerAddress>> {
  return requestApi<CustomerAddress>("/customer/me/addresses", {
    method: "POST",
    body: payload,
    isPublic: true,
    headers: getAuthHeader(),
  });
}

export async function updateCustomerAddressApi(
  id: number,
  payload: CustomerAddressPayload,
): Promise<ApiResponse<CustomerAddress>> {
  return requestApi<CustomerAddress>(`/customer/me/addresses/${id}`, {
    method: "PUT",
    body: payload,
    isPublic: true,
    headers: getAuthHeader(),
  });
}

export async function deleteCustomerAddressApi(
  id: number,
): Promise<ApiResponse<any>> {
  return requestApi<any>(`/customer/me/addresses/${id}`, {
    method: "DELETE",
    isPublic: true,
    headers: getAuthHeader(),
  });
}

export async function setDefaultCustomerAddressApi(
  id: number,
): Promise<ApiResponse<CustomerAddress>> {
  return requestApi<CustomerAddress>(`/customer/me/addresses/${id}/set-default`, {
    method: "PUT",
    isPublic: true,
    headers: getAuthHeader(),
  });
}

