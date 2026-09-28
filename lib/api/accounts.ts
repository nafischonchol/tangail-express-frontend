"use server";

import { requestApi } from "@/lib/api/client";
import type { ApiResponse } from "@/lib/api/client";

export interface Account {
  id: number;
  name: string;
  type: "cash" | "bank" | "mobile_banking" | "credit_card";
  balance: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  account_number?: string | null;
}

export async function getAccounts(): Promise<ApiResponse<Account[]>> {
  return requestApi<Account[]>("/admin/accounts", { fallbackData: [] });
}

export async function createAccount(payload: {
  name: string;
  type: "cash" | "bank" | "mobile_banking" | "credit_card";
  account_number?: string | null;
  is_active?: boolean;
}): Promise<ApiResponse<Account | null>> {
  return requestApi<Account | null>("/admin/accounts", {
    method: "POST",
    body: payload,
  });
}

export async function updateAccount(
  id: number | string,
  payload: {
    name: string;
    type: "cash" | "bank" | "mobile_banking" | "credit_card";
    account_number?: string | null;
    is_active?: boolean;
  }
): Promise<ApiResponse<Account | null>> {
  return requestApi<Account | null>(`/admin/accounts/${id}`, {
    method: "PUT",
    body: payload,
  });
}

