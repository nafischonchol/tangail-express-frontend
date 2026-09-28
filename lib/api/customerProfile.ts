import { requestApi, ApiResponse } from "@/lib/api/client";

export interface CustomerProfile {
  id: number;
  name: string;
  email?: string | null;
  phone: string;
  gender?: "male" | "female" | "other" | null;
  avatar?: string | null;
  address?: string | null;
  has_password?: boolean;
  status: string;
  is_active: boolean;
}

export async function fetchCustomerProfile(): Promise<ApiResponse<CustomerProfile>> {
  return requestApi<CustomerProfile>("/customer/me/profile", {
    method: "GET",
    cache: "no-store",
  });
}

export async function updateCustomerProfileApi(
  data: FormData | Record<string, any>
): Promise<ApiResponse<CustomerProfile>> {
  return requestApi<CustomerProfile>("/customer/me/profile", {
    method: "POST",
    body: data,
  });
}

export async function sendPasswordOtpApi(): Promise<
  ApiResponse<{ phone: string; expires_in_seconds: number; dev_otp?: string }>
> {
  return requestApi<{ phone: string; expires_in_seconds: number; dev_otp?: string }>(
    "/customer/me/profile/password/send-otp",
    {
      method: "POST",
    }
  );
}

export async function updatePasswordApi(payload: {
  current_password?: string;
  otp?: string;
  new_password: string;
}): Promise<ApiResponse<null>> {
  return requestApi<null>("/customer/me/profile/password", {
    method: "POST",
    body: payload,
  });
}
