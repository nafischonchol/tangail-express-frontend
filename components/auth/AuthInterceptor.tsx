"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export function AuthInterceptor() {
  const router = useRouter();
  const currentPathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const originalFetch = window.fetch;
    let isLoggingOut = false;

    window.fetch = async function (...args) {
      const response = await originalFetch(...args);

      if (response.status === 401 && !isLoggingOut) {
        isLoggingOut = true;

        const url = typeof args[0] === "string" ? args[0] : (args[0] as Request).url;

        if (
          !url.includes("/admin/login") &&
          !url.includes("/customer/login") &&
          !url.includes("/login") &&
          !url.includes("/logout")
        ) {
          if (currentPathname.startsWith("/admin")) {
            document.cookie = "user_type=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
            document.cookie = "admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
            router.push("/admin/login");
          } else if (url.includes("/customer/me/") || currentPathname.startsWith("/account")) {
            localStorage.removeItem("customer_token");
            localStorage.removeItem("customer_user");
            window.dispatchEvent(new Event("customer-auth-changed"));
          }
        }
      }

      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [router]);

  return null;
}
