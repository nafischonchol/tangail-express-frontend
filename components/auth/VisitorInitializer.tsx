"use client";

import { useEffect } from "react";
import { ensureVisitorSession } from "@/lib/utils/visitorId";
import { useWishlistStore } from "@/lib/store/wishlistStore";

export function VisitorInitializer() {
  useEffect(() => {
    ensureVisitorSession().then(() => {
      useWishlistStore.getState().fetchWishlist();
    });
  }, []);

  return null;
}
