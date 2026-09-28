"use client";

import { ShoppingCart, Heart } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/store/cartStore";
import { useWishlistStore } from "@/lib/store/wishlistStore";
import { useCustomerAuth } from "@/lib/hooks/useCustomerAuth";

export function FloatingCart() {
  const { isLoggedIn } = useCustomerAuth();
  const [isAnimating, setIsAnimating] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const getCartCount = useCartStore((state) => state.getCartCount);
  const getCartTotal = useCartStore((state) => state.getCartTotal);
  
  const getWishlistCount = useWishlistStore((state) => state.getWishlistCount);
  
  // Hydration fix
  useEffect(() => {
    setMounted(true);
  }, []);

  // Trigger a wiggle animation periodically to attract attention
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 800); // Stop animation after 0.8s
    }, 4000); // Every 4 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed right-4 sm:right-6 top-1/2 -translate-y-1/2 z-[100] flex flex-col gap-3.5">
      <Link href="/cart" aria-label="View Cart">
        <div 
          className={`relative flex flex-col items-center justify-center w-[56px] h-[56px] bg-[#BA478F] hover:bg-[#9F3375] rounded-full shadow-lg border-2 border-white/30 text-white cursor-pointer hover:scale-105 transition-all ${isAnimating ? 'animate-wiggle' : ''}`}
        >
          {/* Badge */}
          <div className="absolute -top-1 -right-1 min-w-[20px] px-1 h-[20px] bg-zinc-950 text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-[#BA478F] shadow-xs">
            {mounted ? getCartCount() : 0}
          </div>
          
          <ShoppingCart size={22} strokeWidth={2.2} className="mt-[-3px]" />
          
          {/* Price Tag */}
          <div className="absolute -bottom-2.5 bg-zinc-950 text-[#D062A5] text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap border border-[#BA478F]/40 shadow-xs">
            {mounted && isLoggedIn ? `৳${getCartTotal().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'CART'}
          </div>
        </div>
      </Link>

      <Link href="/wishlist" aria-label="View Wishlist">
        <div 
          className={`relative flex flex-col items-center justify-center w-[56px] h-[56px] bg-white dark:bg-zinc-900 rounded-full shadow-md border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 cursor-pointer hover:scale-105 transition-all`}
        >
          {/* Badge */}
          <div className="absolute -top-1 -right-1 min-w-[20px] px-1 h-[20px] bg-[#BA478F] text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-white dark:border-zinc-900 shadow-xs">
            {mounted ? getWishlistCount() : 0}
          </div>
          
          <Heart size={22} strokeWidth={2.2} className="mt-[-3px] text-[#BA478F]" />
          
          {/* Label */}
          <div className="absolute -bottom-2.5 bg-zinc-100 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap border border-zinc-200 dark:border-zinc-800 shadow-xs uppercase tracking-wider">
            Saved
          </div>
        </div>
      </Link>
    </div>
  );
}
