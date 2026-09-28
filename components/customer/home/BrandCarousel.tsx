"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getPopularBrands, PublicBrand } from "@/lib/api/brands";

const brandColors = [
  "bg-gradient-to-br from-rose-500/10 to-orange-500/10 border-rose-500/20 hover:border-rose-500/60 hover:shadow-[0_0_30px_rgba(244,63,94,0.15)]",
  "bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 hover:border-blue-500/60 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]",
  "bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20 hover:border-emerald-500/60 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]",
  "bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 hover:border-purple-500/60 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]",
  "bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-amber-500/20 hover:border-amber-500/60 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]",
  "bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border-indigo-500/20 hover:border-indigo-500/60 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)]",
  "bg-gradient-to-br from-cyan-500/10 to-teal-500/10 border-cyan-500/20 hover:border-cyan-500/60 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]",
  "bg-gradient-to-br from-fuchsia-500/10 to-rose-500/10 border-fuchsia-500/20 hover:border-fuchsia-500/60 hover:shadow-[0_0_30px_rgba(217,70,239,0.15)]",
];

export function BrandCarousel() {
  const [brands, setBrands] = useState<PublicBrand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchPopularBrands() {
      try {
        const res = await getPopularBrands(20);
        if (res.success && Array.isArray(res.resources)) {
          setBrands(res.resources);
        }
      } catch (err) {
        console.error("Failed to fetch popular brands:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPopularBrands();
  }, []);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  if (isLoading || brands.length === 0) return null;

  return (
    <div className="w-full mt-12 py-8 border-t border-slate-200 dark:border-slate-800/60 relative">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          Shop by Brand
        </h3>
        <div className="flex items-center gap-2">
          <button 
            onClick={scrollLeft}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={scrollRight}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <div 
          ref={scrollRef}
          className="flex items-center gap-4 sm:gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory py-4 px-2 -mx-2 w-full"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {brands.map((b, i) => {
            const colorClass = brandColors[i % brandColors.length];
            return (
              <Link
                key={b.id}
                href={`/${b.slug || b.slug_url || b.id}`}
                className={`group relative flex-shrink-0 w-32 h-32 sm:w-40 sm:h-40 rounded-2xl flex flex-col items-center justify-center p-4 sm:p-6 transition-all duration-500 border ${colorClass} bg-white/50 dark:bg-slate-900/40 backdrop-blur-sm overflow-hidden snap-center`}
                title={b.name}
              >
                {b.icon ? (
                  <div className="w-full h-full flex items-center justify-center relative">
                    <Image
                      src={b.icon}
                      alt={b.name}
                      width={120}
                      height={60}
                      unoptimized
                      className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-110 drop-shadow-sm"
                    />
                  </div>
                ) : (
                  <span className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 text-center uppercase tracking-wider transition-colors group-hover:scale-105 duration-300">
                    {b.name}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
