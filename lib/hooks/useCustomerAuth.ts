"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export function useCustomerAuth() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [customerUser, setCustomerUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("customer_token") : null;
      const userStr = typeof window !== "undefined" ? localStorage.getItem("customer_user") : null;
      const pathAuth = pathname?.startsWith("/account") ?? false;

      if (token || pathAuth) {
        setIsLoggedIn(true);
        if (userStr) {
          try {
            setCustomerUser(JSON.parse(userStr));
          } catch {
            setCustomerUser(null);
          }
        }
      } else {
        setIsLoggedIn(false);
        setCustomerUser(null);
      }
      setLoading(false);
    };

    checkAuth();

    const handleCustomAuthChange = () => checkAuth();
    window.addEventListener("storage", checkAuth);
    window.addEventListener("customer-auth-changed", handleCustomAuthChange);

    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("customer-auth-changed", handleCustomAuthChange);
    };
  }, [pathname]);

  return { isLoggedIn, customerUser, loading };
}
