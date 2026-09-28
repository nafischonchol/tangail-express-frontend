"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, Loader2 } from "lucide-react";
import { getPublicCategories, PublicCategory } from "@/lib/api/categories";

export function CategoryMegaMenu() {
  const [isHovered, setIsHovered] = useState(false);
  const [categories, setCategories] = useState<PublicCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    if (isHovered && !hasFetched) {
      setHasFetched(true);
      setIsLoading(true);
      getPublicCategories()
        .then((res) => {
          if (res.success && Array.isArray(res.resources)) {
            setCategories(res.resources);
          }
        })
        .finally(() => setIsLoading(false));
    }
  }, [isHovered, hasFetched]);

  // Flatten categories and subcategories into a display list or render dynamically
  const halfLength = Math.ceil(categories.length / 2);
  const col1 = categories.slice(0, halfLength);
  const col2 = categories.slice(halfLength);

  return (
    <li 
      className="relative list-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div suppressHydrationWarning className="flex items-center gap-1 cursor-pointer hover:text-slate-900 transition-colors px-2 py-4">
        Category
        <ChevronDown size={14} className={`transition-transform duration-300 ${isHovered ? 'rotate-180' : ''}`} />
      </div>

      {/* Category Dropdown */}
      {isHovered && (
        <div className="absolute left-0 top-full z-[100] cursor-default animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Invisible buffer bridge */}
          <div className="absolute -top-4 left-0 right-0 h-4 bg-transparent" />
          
          <div className="min-w-[540px] bg-white text-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 rounded-b-2xl p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8 text-slate-500 gap-2">
                <Loader2 size={18} className="animate-spin text-[#BA478F]" />
                <span className="text-sm font-medium">Loading categories...</span>
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-sm">No categories available.</div>
            ) : (
              <div className="grid grid-cols-2 gap-x-8 gap-y-3.5">
                {categories.map((cat) => (
                  <div key={cat.id}>
                    <Link 
                      href={`/${cat.slug || cat.id}`} 
                      prefetch={false}
                      className="hover:text-[#BA478F] hover:font-semibold transition-colors block text-[14px] text-slate-600 font-medium whitespace-nowrap"
                    >
                      {cat.name}
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </li>
  );
}

