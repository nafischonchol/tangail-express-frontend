import React from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { Check, Heart } from "lucide-react";

export function showAddToCartToast(productName?: string) {
  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
        } max-w-sm w-full bg-white dark:bg-slate-900 shadow-xl rounded-2xl pointer-events-auto flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800 gap-3 transition-all duration-300`}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#10b981] flex items-center justify-center text-white shrink-0 shadow-xs">
            <Check size={18} strokeWidth={3} />
          </div>
          <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
            Product added to cart
          </span>
        </div>
        <Link
          href="/view-cart"
          onClick={() => toast.dismiss(t.id)}
          className="bg-slate-200/80 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold px-3.5 py-1.5 rounded-full transition-colors whitespace-nowrap"
        >
          View Cart
        </Link>
      </div>
    ),
    {
      position: "top-right",
      duration: 3500,
    }
  );
}

export function showWishlistToast(message?: string, isAdded: boolean = true) {
  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
        } max-w-sm w-full bg-white dark:bg-slate-900 shadow-xl rounded-2xl pointer-events-auto flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800 gap-3 transition-all duration-300`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-full ${
              isAdded ? "bg-rose-500" : "bg-slate-500"
            } flex items-center justify-center text-white shrink-0 shadow-xs`}
          >
            <Heart size={16} fill={isAdded ? "currentColor" : "none"} />
          </div>
          <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
            {message || (isAdded ? "Product added to wishlist" : "Product removed from wishlist")}
          </span>
        </div>
        {isAdded && (
          <Link
            href="/wishlist"
            onClick={() => toast.dismiss(t.id)}
            className="bg-slate-200/80 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold px-3.5 py-1.5 rounded-full transition-colors whitespace-nowrap"
          >
            View Wishlist
          </Link>
        )}
      </div>
    ),
    {
      position: "top-right",
      duration: 3500,
    }
  );
}
