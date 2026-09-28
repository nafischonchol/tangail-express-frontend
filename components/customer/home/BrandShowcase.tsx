"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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

export function BrandShowcase() {
  const [brands, setBrands] = useState<PublicBrand[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPopularBrands() {
      try {
        const res = await getPopularBrands(12);
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

  return (
    <section className="py-16 md:py-20 border-y border-slate-200 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            TOP KOREAN BEAUTY BRANDS
          </h2>
          <p className="text-sm md:text-base font-medium text-slate-500 dark:text-slate-400 max-w-2xl mx-auto uppercase tracking-widest">
            Directly Sourced from Brand Owners & Trusted Korean Suppliers
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-card">
          {isLoading
            ? Array.from({ length: 12 }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-square sm:aspect-[4/3] rounded-2xl bg-slate-200 dark:bg-slate-800/50 animate-pulse"
                />
              ))
            : brands.map((b, i) => {
                const colorClass = brandColors[i % brandColors.length];
                return (
                  <Link
                    key={b.id}
                    href={`/${b.slug || b.slug_url || b.id}`}
                    className={`group relative aspect-square sm:aspect-[4/3] rounded-2xl flex flex-col items-center justify-center p-6 transition-all duration-500 border ${colorClass} bg-white/50 dark:bg-slate-900/40 backdrop-blur-sm overflow-hidden`}
                    title={b.name}
                  >
                    {b.icon ? (
                      <div className="w-full h-full flex items-center justify-center relative">
                        <Image
                          src={b.icon}
                          alt={b.name}
                          width={140}
                          height={70}
                          unoptimized
                          className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-110 drop-shadow-sm"
                        />
                        <span className="hidden absolute text-sm font-bold text-slate-700 dark:text-slate-200 text-center uppercase tracking-wider transition-colors">
                          {b.name}
                        </span>
                      </div>
                    ) : (
                      <span className="block text-sm sm:text-base font-bold text-slate-700 dark:text-slate-200 text-center uppercase tracking-wider transition-colors group-hover:scale-105 duration-300">
                        {b.name}
                      </span>
                    )}
                  </Link>
                );
              })}
        </div>
        
        <div className="mt-12 flex justify-center">
          <Link
            href="/brands"
            className="inline-flex items-center justify-center px-8 py-3.5 border border-slate-200 dark:border-slate-800 rounded-full text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm"
          >
            Explore All Brands
          </Link>
        </div>
      </div>
    </section>
  );
}
