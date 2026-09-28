"use client";

import React, { useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  Trash2,
  ShoppingCart,
  ArrowRight,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";
import { useWishlistStore } from "@/lib/store/wishlistStore";
import { productsDatabase } from "@/data/products";

export default function WishlistPage() {
  const { addToCart } = useCart();
  const wishlistItems = useWishlistStore((state) => state.items);
  const removeFromWishlist = useWishlistStore(
    (state) => state.removeFromWishlist,
  );
  const isLoading = useWishlistStore((state) => state.isLoading);

  // Page Title Setup
  useEffect(() => {
    document.title = "My Wishlist | Mohima Premium Beauty";
  }, []);

  // Recommendations (Products not in wishlist)
  const wishlistedIds = wishlistItems.map((item) => String(item.id));
  const recommendedProducts = productsDatabase
    .filter((p) => !wishlistedIds.includes(String(p.id)))
    .slice(0, 5);

  const handleAddAllToCart = () => {
    wishlistItems.forEach((item) => {
      addToCart(
        {
          id: String(item.id),
          slug_url: item.slug_url,
          name: item.name,
          price: Number(item.price),
          image: item.image,
          category: item.brand || "Skincare",
          rating: 5,
          reviewsCount: 0,
          concern: "",
        },
        1,
        false,
      );
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF9F6] text-[#121212] font-sans">
      <Suspense fallback={<div className="h-20 bg-white"></div>}>
        <Header />
      </Suspense>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-3 pb-6 lg:pt-3 lg:pb-8 select-none">
        {isLoading ? (
          <div className="py-12 flex justify-center items-center">
            <div className="w-8 h-8 border-2 border-[#BA478F] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : wishlistItems.length === 0 ? (
          /* Empty Wishlist State */
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm border border-black/[0.03]">
              <Heart size={28} className="text-[#BA478F]" />
            </div>
            <h2 className="font-serif text-lg sm:text-xl font-normal uppercase tracking-wider mb-2">
              Your Wishlist is Empty
            </h2>
            <p className="text-xs text-[#565656] max-w-md mb-6 leading-relaxed font-light">
              Explore our curated luxury K-Beauty collections and tap the heart
              icon to save your favorite skincare products here.
            </p>
            <Link
              href="/"
              className="bg-[#BA478F] text-white text-xs font-bold uppercase tracking-widest px-8 py-3 rounded-full hover:bg-[#9F3375] transition-colors shadow-sm cursor-pointer inline-flex items-center gap-2"
            >
              <span>Explore Products</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          /* Wishlist Items Card */
          <div className="bg-white rounded-2xl border border-black/[0.03] p-4 sm:p-6 shadow-xs">
            {/* Card Heading */}
            <div className="pb-3 mb-3 border-b border-black/[0.05]">
              <h1 className="font-serif text-base sm:text-lg font-semibold tracking-wide uppercase text-[#121212]">
                YOUR WISHLIST PRODUCTS
              </h1>
            </div>

            {/* Wishlist Items List */}
            <div className="divide-y divide-black/[0.04]">
              {wishlistItems.map((product) => (
                <div
                  key={product.id}
                  className="py-3.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-3.5 sm:items-center justify-between"
                >
                  {/* Product Thumbnail & Details */}
                  <div className="flex gap-3.5 items-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#FAF9F6] rounded-xl border border-[#E5E5E5] overflow-hidden relative shrink-0">
                      <Image
                        src={
                          product.image ||
                          "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=1080&h=1080&auto=format&fit=crop&q=80"
                        }
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>

                    <div className="space-y-0.5 text-left">
                      <span className="text-[9px] text-[#BA478F] font-bold uppercase tracking-widest block">
                        {product.brand || "Premium Skincare"}
                      </span>
                      <h3 className="text-xs sm:text-sm font-semibold tracking-wide text-[#121212] uppercase hover:text-[#BA478F] transition-colors">
                        <Link
                          href={`/products/${product.slug_url || product.id}`}
                        >
                          {product.name}
                        </Link>
                      </h3>
                      <div className="flex items-center gap-2 text-xs pt-0.5">
                        <span className="font-bold text-[#121212]">
                          ৳{Number(product.price).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Add to Cart & Remove */}
                  <div className="flex items-center gap-2.5 self-end sm:self-center">
                    <button
                      onClick={() =>
                        addToCart(
                          {
                            id: String(product.id),
                            slug_url: product.slug_url,
                            name: product.name,
                            price: Number(product.price),
                            image: product.image,
                            category: product.brand || "Skincare",
                            rating: 5,
                            reviewsCount: 0,
                            concern: "",
                          },
                          1,
                          false,
                        )
                      }
                      className="bg-[#BA478F] text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full hover:bg-[#9F3375] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <ShoppingCart size={13} />
                      <span>Add to Cart</span>
                    </button>

                    <button
                      onClick={() => removeFromWishlist(product)}
                      className="p-2 text-[#565656]/60 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors cursor-pointer"
                      title="Remove from Wishlist"
                      aria-label="Remove item"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related/Recommendations Section */}
        {recommendedProducts.length > 0 && (
          <div className="mt-6 sm:mt-8 border-t border-black/[0.06] pt-5 sm:pt-6">
            <div className="flex flex-col gap-1 text-left mb-4">
              <span className="text-[9px] tracking-[0.3em] font-bold text-[#BA478F] uppercase">
                CURATED RECOMMENDATIONS
              </span>
              <h2 className="font-serif text-lg sm:text-xl font-normal tracking-wide text-[#121212] uppercase">
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
