"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import ProductCard, { Product } from "./ProductCard";
import { getPopularProducts } from "@/lib/api/products";

interface InfiniteProductGridProps {
  initialProducts: Product[];
  initialPagination: any;
  searchQuery: string;
  selectedCategory: string | null;
  selectedConcern: string | null;
}

export default function InfiniteProductGrid({
  initialProducts,
  initialPagination,
  searchQuery,
  selectedCategory,
  selectedConcern,
}: InfiniteProductGridProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(
    initialPagination ? initialPagination.current_page < initialPagination.last_page : false
  );
  const [loading, setLoading] = useState(false);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const loadMoreProducts = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const nextPage = page + 1;
      const { products: newProducts, pagination } = await getPopularProducts(nextPage);
      
      if (newProducts.length > 0) {
        setProducts((prev) => {
          // Avoid duplicates based on id
          const existingIds = new Set(prev.map(p => p.id));
          const filteredNew = newProducts.filter(p => !existingIds.has(p.id));
          return [...prev, ...filteredNew];
        });
        setPage(nextPage);
        const hasMoreFromServer = pagination ? pagination.current_page < pagination.last_page : false;
        // Apply max page count limit of 5
        setHasMore(hasMoreFromServer && nextPage < 5);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to load more products:", error);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore]);

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMoreProducts();
        }
      },
      { threshold: 0.1 }
    );

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current && element) {
        observerRef.current.unobserve(element);
      }
    };
  }, [loadMoreProducts, hasMore, loading]);

  // Filtering products logic
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory
      ? product.category === selectedCategory
      : true;
    const matchesConcern = selectedConcern
      ? product.concern === selectedConcern
      : true;
    return matchesSearch && matchesCategory && matchesConcern;
  });

  if (filteredProducts.length === 0) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center">
        <p className="text-sm text-[#565656] max-w-sm leading-relaxed mb-6 font-light">
          No products match the selected filters. Let’s reset your search
          to discover our complete authentic collection.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-card">
        {filteredProducts.map((prod) => (
          <ProductCard key={prod.id} product={prod} />
        ))}
      </div>
      
      {hasMore && (
        <div 
          ref={loadMoreRef} 
          className="w-full py-6 flex justify-center items-center"
        >
          {loading && (
            <div className="w-8 h-8 border-4 border-[#BA478F]/30 border-t-[#BA478F] rounded-full animate-spin" />
          )}
        </div>
      )}
    </>
  );
}
