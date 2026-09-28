"use client";

import React from "react";
import { X, Plus, Minus, Trash2, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

const SHIPPING_THRESHOLD = 1500;

export default function CartDrawer() {
  const { cart: cartItems, cartOpen: isOpen, setCartOpen, updateCartQty: onUpdateQuantity, removeFromCart: onRemoveItem } = useCart();
  const onClose = () => setCartOpen(false);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const remainingForFreeShipping = SHIPPING_THRESHOLD - subtotal;
  const shippingProgress = Math.min((subtotal / SHIPPING_THRESHOLD) * 100, 100);

  return (
    <div className="fixed inset-0 z-100 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-2xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full transform transition-transform duration-300 ease-out select-none border-l border-zinc-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <ShoppingCart size={18} className="text-[#BA478F]" />
              <h2 className="text-sm font-bold tracking-wider uppercase text-zinc-900">
                Shopping Cart ({cartItems.length})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-900 transition-colors p-1"
              aria-label="Close cart"
            >
              <X size={18} />
            </button>
          </div>

          {/* Main Area */}
          <div className="flex-1 overflow-y-auto px-6 py-4 no-scrollbar bg-white">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-20">
                <div className="w-14 h-14 rounded-full bg-[#FDF2F8] border border-[#FBCFE8] flex items-center justify-center mb-4">
                  <ShoppingCart size={22} className="text-[#BA478F]" />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-wider mb-1 text-zinc-900">
                  Your cart is empty
                </h3>
                <p className="text-xs text-zinc-500 max-w-xs mb-6 leading-relaxed">
                  Browse our authentic Korean skincare and cosmetics catalog to discover your daily glow routine.
                </p>
                <button
                  onClick={onClose}
                  className="bg-[#BA478F] text-white text-xs font-semibold uppercase tracking-wider px-6 py-2.5 rounded-md hover:bg-[#9F3375] transition-colors shadow-2xs cursor-pointer"
                >
                  Explore Products
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Shipping Progress */}
                {remainingForFreeShipping > 0 && (
                  <div className="bg-[#FDF2F8] p-3 rounded-lg border border-[#FBCFE8]">
                    <p className="text-xs text-zinc-700 mb-1.5 font-medium">
                      Add{" "}
                      <span className="text-[#BA478F] font-bold">
                        ৳{remainingForFreeShipping.toLocaleString()}
                      </span>{" "}
                      more for <span className="font-bold text-zinc-900">FREE shipping</span>
                    </p>
                    <div className="w-full bg-white h-1.5 rounded-full overflow-hidden border border-[#FBCFE8]">
                      <div
                        className="bg-[#BA478F] h-full rounded-full transition-all duration-300"
                        style={{ width: `${shippingProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Items List */}
                <div className="divide-y divide-zinc-100">
                  {cartItems.map((item) => (
                    <div key={item.id} className="py-3.5 flex gap-3.5">
                      {/* Product Image */}
                      <div className="w-18 h-18 bg-neutral-50 rounded-md border border-zinc-200 overflow-hidden relative flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="72px"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="text-xs font-semibold text-zinc-900 line-clamp-1">
                            {item.name}
                          </h4>
                          <p className="text-[10px] text-zinc-500 uppercase mt-0.5">
                            Authentic Care
                          </p>
                        </div>

                        {/* Quantity and Price */}
                        <div className="flex justify-between items-center mt-2">
                          <div className="flex items-center border border-zinc-200 rounded-md px-1.5 py-0.5 bg-white">
                            <button
                              onClick={() =>
                                onUpdateQuantity(item.id, item.quantity - 1)
                              }
                              className="text-zinc-500 hover:text-[#BA478F] p-0.5 disabled:opacity-40"
                              disabled={item.quantity <= 1}
                            >
                              <Minus size={11} />
                            </button>
                            <span className="text-xs font-semibold px-2 w-6 text-center text-zinc-900">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                onUpdateQuantity(item.id, item.quantity + 1)
                              }
                              className="text-zinc-500 hover:text-[#BA478F] p-0.5"
                            >
                              <Plus size={11} />
                            </button>
                          </div>

                          <div className="flex items-center gap-2.5">
                            <span className="text-xs font-bold text-zinc-900">
                              ৳{(item.price * item.quantity).toLocaleString()}
                            </span>
                            <button
                              onClick={() => onRemoveItem(item.id)}
                              className="text-zinc-400 hover:text-red-500 transition-colors p-1"
                              aria-label="Remove item"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Checkout Section (Fixed at bottom) */}
          {cartItems.length > 0 && (
            <div className="border-t border-zinc-100 bg-white px-6 py-4 space-y-3">
              <div className="flex justify-between text-zinc-900 font-semibold text-sm">
                <span className="uppercase tracking-wider font-medium text-xs text-zinc-500">
                  Subtotal
                </span>
                <span className="font-bold text-base text-[#BA478F]">
                  ৳{subtotal.toLocaleString()}
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 text-center">
                Delivery and taxes calculated at checkout.
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                <Link
                  href="/view-cart"
                  prefetch={false}
                  onClick={onClose}
                  className="bg-white border border-zinc-300 text-zinc-800 text-xs font-semibold uppercase tracking-wider py-2.5 rounded-md hover:bg-zinc-50 transition-colors shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer text-center"
                >
                  View Cart
                </Link>
                <Link
                  href="/checkout"
                  prefetch={false}
                  onClick={onClose}
                  className="bg-[#BA478F] hover:bg-[#9F3375] text-white text-xs font-semibold uppercase tracking-wider py-2.5 rounded-md transition-colors shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer text-center"
                >
                  Checkout
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
