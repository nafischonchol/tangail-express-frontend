"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Minus, Plus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlistStore } from "@/lib/store/wishlistStore";

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

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({
  product,
}: ProductCardProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const toggleWishlistStore = useWishlistStore((state) => state.toggleWishlist);
  const isInWishlist = useWishlistStore((state) => state.isInWishlist);
  const isWishlisted = isInWishlist(product.id);
  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuantity((prev) => prev + 1);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, quantity);
    setQuantity(1);
  };

  const handleToggleWishlist = () => {
    const rawNum = Number(product.id);
    toggleWishlistStore({
      id: String(product.id),
      productId: !isNaN(rawNum) && rawNum > 0 ? rawNum : undefined,
      name: product.name,
      price: product.price,
      image: product.image,
      brand: product.category,
      slug_url: product.slug_url,
    });
  };

  return (
    <div className="group relative flex flex-col bg-white rounded-md overflow-hidden border border-neutral-200 hover:border-[#FBCFE8] transition-colors select-none h-full shadow-2xs">
      {/* Product Image Container */}
      <div className="relative aspect-square w-full bg-neutral-50 overflow-hidden">
        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start">
          {product.isNew && (
            <span className="bg-[#FDF2F8] text-[#9F3375] text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-sm border border-[#FBCFE8]">
              New
            </span>
          )}
          {discountPercent > 0 && (
            <span className="bg-[#BA478F] text-white text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-sm">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-2.5 right-2.5 z-10 p-1.5 rounded-md border border-neutral-200 bg-white/90 hover:bg-white transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#D062A5] ${
            isWishlisted ? "text-[#BA478F] fill-[#BA478F]" : "text-neutral-500 hover:text-[#BA478F]"
          }`}
          aria-label="Toggle wishlist"
        >
          <Heart size={14} fill={isWishlisted ? "currentColor" : "none"} />
        </button>

        {/* Main Image */}
        <Link href={`/products/${product.slug_url || product.id}`} prefetch={false} className="cursor-pointer">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 1280px) 25vw, 100vw"
          />
        </Link>
      </div>

      {/* Details Box */}
      <div className="p-3 flex-1 flex flex-col justify-between bg-white">
        <div className="flex flex-col gap-1">
          {/* Category */}
          <span className="text-[10px] text-neutral-500 font-medium uppercase tracking-wider truncate">
            {product.category}
          </span>

          {/* Name */}
          <h3 className="text-xs font-medium text-neutral-900 tracking-tight group-hover:text-[#BA478F] transition-colors line-clamp-2 min-h-8">
            <Link href={`/products/${product.slug_url || product.id}`} prefetch={false} className="block">
              {product.name}
            </Link>
          </h3>
        </div>

        {/* Price and Add button */}
        <div className="flex flex-col gap-2.5 mt-3 pt-2 border-t border-neutral-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-neutral-900 tracking-tight">
                ৳{product.price.toLocaleString()}
              </span>
              {product.originalPrice && (
                <span className="text-[10px] text-neutral-400 line-through">
                  ৳{product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Quantity Stepper */}
            <div className="flex items-center rounded border border-neutral-200 divide-x divide-neutral-200 bg-neutral-50/50 overflow-hidden shrink-0 h-7.5 sm:h-8">
              <button
                type="button"
                onClick={handleDecrement}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
                className="w-6 sm:w-7 h-full flex items-center justify-center text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <Minus size={11} strokeWidth={2.5} />
              </button>
              <span className="w-6 sm:w-7 h-full flex items-center justify-center text-[11px] sm:text-xs font-semibold text-neutral-900 bg-white select-none">
                {quantity}
              </span>
              <button
                type="button"
                onClick={handleIncrement}
                aria-label="Increase quantity"
                className="w-6 sm:w-7 h-full flex items-center justify-center text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <Plus size={11} strokeWidth={2.5} />
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              type="button"
              onClick={handleAddToCart}
              className="flex-1 h-7.5 sm:h-8 bg-[#BA478F] hover:bg-[#9F3375] active:bg-[#8B2C66] text-white text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider rounded flex items-center justify-center gap-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-[#D062A5] cursor-pointer shadow-2xs"
            >
              <ShoppingCart size={12} />
              <span>ADD</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
