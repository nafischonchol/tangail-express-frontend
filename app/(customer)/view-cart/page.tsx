"use client";

import React, { useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  CreditCard,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";
import { productsDatabase } from "@/data/products";

export default function ViewCartPage() {
  const {
    cart,
    wishlist,
    cartOpen,
    addToCart,
    removeFromCart,
    updateCartQty,
    toggleWishlist,
    setCartOpen,
  } = useCart();

  // Page Title Setup
  useEffect(() => {
    document.title = "Shopping Cart | Mohima Premium Beauty";
  }, []);

  // Calculations
  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const total = subtotal;

  const cartTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Recommendations (Curate other best sellers or related items)
  const recommendedProducts = productsDatabase
    .filter((p) => !cart.some((item) => item.id === p.id))
    .slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF9F6] text-[#121212] font-sans">
      <Suspense fallback={<div className="h-20 bg-white"></div>}>
        <Header />
      </Suspense>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 select-none">
        {cart.length === 0 ? (
          /* Empty Cart State */
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-6 shadow-sm border border-black/[0.03]">
              <ShoppingCart size={32} className="text-[#BA478F]" />
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-normal uppercase tracking-wider mb-3">
              Your Cart is Empty
            </h2>
            <p className="text-xs sm:text-sm text-[#565656] max-w-md mb-8 leading-relaxed font-light">
              It looks like you haven't added any luxury skincare items to your
              cart yet. Visit our shop to discover premium curated collections.
            </p>
            <Link
              href="/"
              className="bg-[#BA478F] text-white text-xs font-bold uppercase tracking-widest px-10 py-4 rounded-full hover:bg-[#9F3375] transition-colors shadow-md cursor-pointer"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          /* Cart Content Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
            {/* Left: Cart Items List */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white rounded-2xl border border-black/[0.03] p-4 sm:p-6 shadow-xs divide-y divide-black/[0.04]">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="py-6 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-4 sm:items-center"
                  >
                    {/* Product Image */}
                    <div className="w-24 h-24 sm:w-28 sm:h-28 bg-[#FAF9F6] rounded-xl border border-[#E5E5E5] overflow-hidden relative flex-shrink-0 mx-auto sm:mx-0">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="(max-w-28) 100vw, 120px"
                      />
                    </div>

                    {/* Details Column */}
                    <div className="flex-1 flex flex-col justify-between text-left">
                      <div className="space-y-1">
                        <span className="text-[9px] text-[#565656]/50 font-bold uppercase tracking-widest">
                          Premium Skincare
                        </span>
                        <h4 className="text-sm font-semibold tracking-wide text-[#121212] uppercase hover:text-[#BA478F] transition-colors">
                          <Link href={`/products/${item.slug_url || item.id}`}>
                            {item.name}
                          </Link>
                        </h4>
                        <p className="text-[10px] text-[#565656] uppercase">
                          Authentic Care
                        </p>
                      </div>

                      {/* Quantity Selector & Single Price */}
                      <div className="flex flex-wrap items-center gap-4 mt-4">
                        <div className="flex items-center border border-[#E5E5E5] rounded-full px-2.5 py-1 bg-white">
                          <button
                            onClick={() =>
                              updateCartQty(item.id, item.quantity - 1)
                            }
                            className="text-[#565656] hover:text-[#BA478F] p-1 disabled:opacity-30 transition-colors"
                            disabled={item.quantity <= 1}
                            aria-label="Decrease quantity"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="text-xs font-bold px-3 w-8 text-center text-[#121212]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateCartQty(item.id, item.quantity + 1)
                            }
                            className="text-[#565656] hover:text-[#BA478F] p-1 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                        <span className="text-[11px] text-[#565656]/60">
                          ৳{item.price.toLocaleString()} each
                        </span>
                      </div>
                    </div>

                    {/* Total Price and Remove Action */}
                    <div className="flex sm:flex-col justify-between sm:justify-center items-center sm:items-end gap-3 min-w-[100px] border-t sm:border-t-0 border-black/[0.04] pt-4 sm:pt-0 mt-2 sm:mt-0">
                      <div className="text-left sm:text-right">
                        <span className="block text-[9px] text-[#565656]/50 font-bold uppercase tracking-widest sm:hidden">
                          Total Price:
                        </span>
                        <span className="text-sm font-bold text-[#121212] tracking-wider">
                          ৳{(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="flex items-center gap-1 text-[11px] font-semibold text-[#565656]/60 hover:text-red-500 transition-colors cursor-pointer"
                        aria-label="Remove item"
                      >
                        <Trash2 size={13} />
                        <span className="hidden sm:inline">Remove</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Checkout & Order Summary panel */}
            <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24 text-left">
              {/* Summary Card */}
              <div className="bg-white rounded-2xl border border-black/[0.03] p-6 shadow-xs space-y-5">
                <h3 className="font-serif text-lg font-normal tracking-wider uppercase text-[#121212] border-b border-black/[0.04] pb-3.5">
                  Order Summary
                </h3>

                <div className="space-y-3 text-xs text-[#565656] font-medium border-b border-black/[0.04] pb-4">
                  {/* Subtotal */}
                  <div className="flex justify-between items-center">
                    <span>Subtotal</span>
                    <span className="text-[#121212] font-semibold">
                      ৳{subtotal.toLocaleString()}
                    </span>
                  </div>

                  {/* Shipping Charge */}
                  <div className="flex justify-between items-center">
                    <span>Shipping Charge</span>
                    <span className="text-[#565656]/70 text-[11px] font-normal italic">
                      Calculated at checkout page
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between text-[#121212] font-bold text-sm pt-1">
                  <span className="uppercase tracking-widest font-normal text-xs text-[#565656]">
                    Estimated Total
                  </span>
                  <span className="text-lg font-black tracking-wider">
                    ৳{total.toLocaleString()}
                  </span>
                </div>

                {/* Checkout CTA */}
                <Link
                  href="/checkout"
                  className="w-full bg-[#BA478F] text-white text-xs font-bold uppercase tracking-widest py-4.5 rounded-full hover:bg-[#9F3375] transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer mt-4"
                >
                  <CreditCard size={14} />
                  <span>Proceed to Checkout</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Related/Recommendations Section */}
        {recommendedProducts.length > 0 && (
          <div className="mt-16 sm:mt-24 border-t border-[#E5E5E5] pt-12 md:pt-16">
            <div className="flex flex-col gap-2 text-left mb-8">
              <span className="text-[9px] tracking-[0.3em] font-bold text-[#BA478F] uppercase">
                COMPLETE YOUR ROUTINE
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-normal tracking-wide text-[#121212] uppercase">
                You May Also Like
              </h2>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-card">
              {recommendedProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
