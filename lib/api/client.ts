import { getVisitorId, syncVisitorIdFromResponse } from "@/lib/utils/visitorId";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function apiFetch(path: string, options: RequestInit = {}) {
  if (!API_BASE_URL) {
    throw new Error("API base URL is not defined.");
  }

  const headers = new Headers(options.headers);
  let cookieStore: any = null;

  if (typeof window === "undefined") {
    try {
      const { cookies, headers: getNextHeaders } = await import("next/headers");
      cookieStore = await cookies();
      const token = cookieStore.get("admin_token")?.value;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      const serverVisitorId = cookieStore.get("visitor_id")?.value;
      if (serverVisitorId && !headers.has("X-Visitor-Id")) {
        headers.set("X-Visitor-Id", serverVisitorId);
      }

      const incomingHeaders = await getNextHeaders();
      const userIp =
        incomingHeaders.get("cf-connecting-ip") ||
        incomingHeaders.get("x-real-ip") ||
        incomingHeaders.get("x-forwarded-for")?.split(",")[0]?.trim();

      if (userIp && !headers.has("X-Forwarded-For")) {
        headers.set("X-Forwarded-For", userIp);
      }
      const incomingUserAgent = incomingHeaders.get("user-agent");
      if (incomingUserAgent && !headers.has("User-Agent")) {
        headers.set("User-Agent", incomingUserAgent);
      }
    } catch {
      // Ignore if called in non-server context
    }
  } else {
    const customerToken = localStorage.getItem("customer_token");
    if (customerToken && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${customerToken}`);
    }
    const visitorId = getVisitorId();
    if (visitorId && !headers.has("X-Visitor-Id")) {
      headers.set("X-Visitor-Id", visitorId);
    }
  }

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("Accept", "application/json");

  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  syncVisitorIdFromResponse(response);

  if (response.status === 401 && typeof window === "undefined") {
    if (cookieStore) {
      cookieStore.delete("admin_token");
      cookieStore.delete("user_type");
    }
    const { redirect } = await import("next/navigation");
    redirect("/admin/login");
  }

  return response;
}

export async function publicApiFetch(path: string, options: RequestInit = {}) {
  if (!API_BASE_URL) {
    throw new Error("API base URL is not defined.");
  }

  const headers = new Headers(options.headers);
  if (typeof window === "undefined") {
    try {
      const { headers: getNextHeaders } = await import("next/headers");
      const incomingHeaders = await getNextHeaders();
      const userIp =
        incomingHeaders.get("cf-connecting-ip") ||
        incomingHeaders.get("x-real-ip") ||
        incomingHeaders.get("x-forwarded-for")?.split(",")[0]?.trim();

      if (userIp && !headers.has("X-Forwarded-For")) {
        headers.set("X-Forwarded-For", userIp);
      }
      const incomingUserAgent = incomingHeaders.get("user-agent");
      if (incomingUserAgent && !headers.has("User-Agent")) {
        headers.set("User-Agent", incomingUserAgent);
      }
    } catch {
      // Ignore if called in non-server context
    }
  } else {
    const visitorId = getVisitorId();
    if (visitorId && !headers.has("X-Visitor-Id")) {
      headers.set("X-Visitor-Id", visitorId);
    }
    const customerToken = localStorage.getItem("customer_token");
    if (customerToken && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${customerToken}`);
    }
  }

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("Accept", "application/json");

  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  syncVisitorIdFromResponse(response);

  return response;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  resources: T;
  pagination?: any;
  errors?: Record<string, string[]> | null;
}

export interface RequestApiOptions extends Omit<RequestInit, "body"> {
  params?: Record<string, string | number | boolean | undefined | null>;
  body?: any;
  isPublic?: boolean;
  fallbackData?: any;
}

export async function requestApi<T = any>(
  path: string,
  options: RequestApiOptions = {}
): Promise<ApiResponse<T>> {
  const { params, body, isPublic = false, fallbackData = null, ...fetchOptions } = options;

  let urlPath = path;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      urlPath += (urlPath.includes("?") ? "&" : "?") + queryString;
    }
  }

  let requestBody: any = body;
  if (body && !(body instanceof FormData) && typeof body === "object") {
    requestBody = JSON.stringify(body);
  }

  const fetchFn = isPublic ? publicApiFetch : apiFetch;

  try {
    const res = await fetchFn(urlPath, {
      ...fetchOptions,
      ...(requestBody !== undefined ? { body: requestBody } : {}),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        success: false,
        message: data.message || `Request failed with status ${res.status}`,
        resources: fallbackData ?? (null as unknown as T),
        errors: data.errors || null,
      };
    }

    return {
      success: data.success ?? true,
      message: data.message || "Success",
      resources: data.resources !== undefined ? data.resources : (data as T),
      pagination: data.pagination,
    };
  } catch (error: any) {
    if (
      error?.message === "NEXT_REDIRECT" ||
      (typeof error?.digest === "string" && error.digest.startsWith("NEXT_REDIRECT"))
    ) {
      throw error;
    }

    return {
      success: false,
      message: error?.message || "An unexpected error occurred.",
      resources: fallbackData ?? (null as unknown as T),
    };
  }
}


