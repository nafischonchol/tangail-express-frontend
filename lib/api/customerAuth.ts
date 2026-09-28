import { requestApi, ApiResponse } from "@/lib/api/client";

export interface CustomerAuthData {
  token: string;
  client: {
    id: number;
    name: string;
    email?: string | null;
    username?: string | null;
    phone: string;
    avatar?: string | null;
    address?: string | null;
    status: string;
    type: string;
  };
}

export interface SendOtpResponse {
  phone: string;
  expires_in_seconds: number;
  dev_otp?: string;
}

/**
 * Request OTP to be sent to a mobile number.
 */
export async function sendCustomerOtp(
  phone: string,
  purpose: "auth" | "login" | "register" = "auth"
): Promise<ApiResponse<SendOtpResponse>> {
  return requestApi<SendOtpResponse>("/customer/auth/send-otp", {
    method: "POST",
    isPublic: true,
    body: { phone, purpose },
  });
}

/**
 * Login customer using Mobile + OTP.
 */
export async function loginWithOtpApi(
  phone: string,
  otp: string,
  name?: string
): Promise<ApiResponse<CustomerAuthData>> {
  return requestApi<CustomerAuthData>("/customer/auth/login-otp", {
    method: "POST",
    isPublic: true,
    body: { phone, otp, name: name || undefined },
  });
}

/**
 * Register a customer using Mobile + OTP (with optional Name and Password).
 */
export async function registerWithOtpApi(
  phone: string,
  otp: string,
  name?: string,
  password?: string
): Promise<ApiResponse<CustomerAuthData>> {
  return requestApi<CustomerAuthData>("/customer/auth/register-otp", {
    method: "POST",
    isPublic: true,
    body: { phone, otp, name: name || undefined, password: password || undefined },
  });
}

/**
 * Login customer using Mobile / Email + Password.
 */
export async function loginWithPasswordApi(
  login: string,
  password: string
): Promise<ApiResponse<CustomerAuthData>> {
  return requestApi<CustomerAuthData>("/customer/login", {
    method: "POST",
    isPublic: true,
    body: { login, password },
  });
}

/**
 * Store customer session in browser and fire update events.
 */
export function persistCustomerSession(authData: CustomerAuthData): void {
  if (typeof window === "undefined") return;

  localStorage.setItem("customer_token", authData.token);
  localStorage.setItem("customer_user", JSON.stringify(authData.client));
  window.dispatchEvent(new Event("customer-auth-changed"));
}
