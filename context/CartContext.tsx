"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useCartStore, CartItem } from "@/lib/store/cartStore";
import { fetchWishlistApi, toggleWishlistApi } from "@/lib/api/wishlist";

export interface Product {
  id: string;
  product_variant_id?: number | null;
  slug_url?: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviewsCount: number;
  concern: string;
  isBestSeller?: boolean;
  isNew?: boolean;
}

export type { CartItem };

interface CartContextType {
  cart: CartItem[];
  wishlist: string[];
  cartOpen: boolean;
  isLoaded: boolean;
  addToCart: (product: Product, quantity?: number, openCart?: boolean) => void;
  removeFromCart: (id: string) => void;
  updateCartQty: (id: string, qty: number) => void;
  clearCart: () => void;
  toggleWishlist: (id: string) => void;
  setCartOpen: (isOpen: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const cartStore = useCartStore();
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Fetch DB cart items on mount for all users (guests and logged in)
  useEffect(() => {
    cartStore.fetchCart().finally(() => {
      setIsLoaded(true);
      setIsMounted(true);
    });

    const savedWishlist = localStorage.getItem("mohima_wishlist");
    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist));
      } catch (e) {
        console.error("Error parsing wishlist storage", e);
      }
    }

    const token = typeof window !== "undefined" ? localStorage.getItem("customer_token") : null;
    if (token) {
      fetchWishlistApi()
        .then((res) => {
          if (res.success && Array.isArray(res.resources) && res.resources.length > 0) {
            const apiIds = res.resources.map((item: any) => String(item.product_id));
            setWishlist((prev) => Array.from(new Set([...prev, ...apiIds])));
          }
        })
        .catch((err) => {
          console.warn("Backend API fetch for wishlist failed, using local state.", err);
        });
    }

    const handleAuthChange = () => {
      cartStore.fetchCart();
      const currentToken = typeof window !== "undefined" ? localStorage.getItem("customer_token") : null;
      if (currentToken) {
        fetchWishlistApi()
          .then((res) => {
            if (res.success && Array.isArray(res.resources) && res.resources.length > 0) {
              const apiIds = res.resources.map((item: any) => String(item.product_id));
              setWishlist((prev) => Array.from(new Set([...prev, ...apiIds])));
            }
          })
          .catch(() => {});
      }
    };

    window.addEventListener("customer-auth-changed", handleAuthChange);
    return () => {
      window.removeEventListener("customer-auth-changed", handleAuthChange);
    };
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("mohima_wishlist", JSON.stringify(wishlist));
    }
  }, [wishlist, isMounted]);

  const addToCart = async (product: Product, quantity = 1, openCart = false) => {
    const numId = Number(product.id);
    const productId = !isNaN(numId) ? numId : undefined;
    const variantId = product.product_variant_id || null;

    await cartStore.addToCart({
      id: product.id,
      product_id: productId,
      product_variant_id: variantId,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity,
      slug_url: product.slug_url,
    });

    if (openCart) {
      setCartOpen(true);
    }
  };

  const removeFromCart = (id: string) => {
    cartStore.removeFromCart(id);
  };

  const updateCartQty = (id: string, qty: number) => {
    if (qty <= 0) {
      cartStore.removeFromCart(id);
      return;
    }
    cartStore.updateQuantity(id, qty);
  };

  const clearCart = () => {
    cartStore.clearCart();
  };

  const toggleWishlist = (id: string) => {
    setWishlist((prevWishlist) =>
      prevWishlist.includes(id)
        ? prevWishlist.filter((wId) => wId !== id)
        : [...prevWishlist, id]
    );

    const token = typeof window !== "undefined" ? localStorage.getItem("customer_token") : null;
    if (token) {
      const numId = Number(id);
      if (!isNaN(numId)) {
        toggleWishlistApi(numId).catch((err) => {
          console.warn("Could not sync wishlist with backend API:", err);
        });
      }
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart: cartStore.items,
        wishlist,
        cartOpen,
        isLoaded,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        toggleWishlist,
        setCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
