import { requestApi } from "@/lib/api/client";

const VISITOR_ID_KEY = "visitor_id";
const THIRTY_DAYS_IN_SECONDS = 30 * 24 * 60 * 60; // 2592000 seconds

export function setVisitorId(visitorId: string): void {
  if (typeof window === "undefined" || !visitorId) {
    return;
  }

  try {
    // Save to Cookie (30 days max-age)
    document.cookie = `${VISITOR_ID_KEY}=${visitorId}; path=/; max-age=${THIRTY_DAYS_IN_SECONDS}; SameSite=Lax`;
    // Save to localStorage as secondary backup
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
  } catch (error) {
    console.error("Failed to set visitor ID:", error);
  }
}

export function getVisitorId(): string {
  if (typeof window === "undefined") {
    return "";
  }

  // 1. Try reading from cookie
  const match = document.cookie.match(
    new RegExp("(^| )" + VISITOR_ID_KEY + "=([^;]+)")
  );
  if (match && match[2]) {
    return match[2];
  }

  // 2. Fallback to localStorage if cookie is missing
  try {
    const localId = localStorage.getItem(VISITOR_ID_KEY);
    if (localId) {
      // Re-sync cookie
      setVisitorId(localId);
      return localId;
    }
  } catch {
    // Ignore localStorage errors
  }

  return "";
}

export function syncVisitorIdFromResponse(response: Response): void {
  if (typeof window === "undefined" || !response || !response.headers) {
    return;
  }

  const receivedId =
    response.headers.get("X-Visitor-Id") ||
    response.headers.get("x-visitor-id");

  if (receivedId) {
    const currentId = getVisitorId();
    if (!currentId || currentId !== receivedId) {
      setVisitorId(receivedId);
    }
  }
}

export function clearVisitorId(): void {
  if (typeof window === "undefined") {
    return;
  }
  document.cookie = `${VISITOR_ID_KEY}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
  try {
    localStorage.removeItem(VISITOR_ID_KEY);
  } catch {}
}

export async function ensureVisitorSession(): Promise<string> {
  if (typeof window === "undefined") {
    return "";
  }

  let visitorId = getVisitorId();
  if (visitorId) {
    // Renew / slide expiration
    setVisitorId(visitorId);
    return visitorId;
  }

  try {
    const response = await requestApi<{ guest_token?: string }>(
      "/customer/visitor/session",
      {
        method: "GET",
        isPublic: true,
      }
    );

    const token =
      response.resources?.guest_token || (response as any)?.guest_token;
    if (token) {
      setVisitorId(token);
      return token;
    }
  } catch (error) {
    console.error("Failed to initialize visitor session:", error);
  }

  return "";
}
