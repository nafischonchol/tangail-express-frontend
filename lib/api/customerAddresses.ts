import { requestApi, ApiResponse } from "@/lib/api/client";

export interface ClientAddress {
  id: number;
  client_id: number;
  name: string;
  phone: string;
  address: string;
  city: string;
  label?: string | null;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ClientAddressPayload {
  name: string;
  phone: string;
  address: string;
  city: string;
  label?: string | null;
  is_default?: boolean;
}

export async function fetchCustomerAddressesApi(): Promise<ApiResponse<ClientAddress[]>> {
  return requestApi<ClientAddress[]>("/customer/me/addresses", {
    method: "GET",
    cache: "no-store",
    fallbackData: [],
  });
}

export async function createCustomerAddressApi(
  payload: ClientAddressPayload
): Promise<ApiResponse<ClientAddress>> {
  return requestApi<ClientAddress>("/customer/me/addresses", {
    method: "POST",
    body: payload,
  });
}

export async function updateCustomerAddressApi(
  id: number,
  payload: ClientAddressPayload
): Promise<ApiResponse<ClientAddress>> {
  return requestApi<ClientAddress>(`/customer/me/addresses/${id}`, {
    method: "PUT",
    body: payload,
  });
}

export async function deleteCustomerAddressApi(
  id: number
): Promise<ApiResponse<null>> {
  return requestApi<null>(`/customer/me/addresses/${id}`, {
    method: "DELETE",
  });
}

export async function setDefaultCustomerAddressApi(
  id: number
): Promise<ApiResponse<ClientAddress>> {
  return requestApi<ClientAddress>(`/customer/me/addresses/${id}/set-default`, {
    method: "PUT",
  });
}
