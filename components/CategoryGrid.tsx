"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Droplet,
  Sun,
  Layers,
  Waves,
  Flower2,
  Box,
} from "lucide-react";
import Link from "next/link";
import { getPopularCategories } from "@/lib/api/categories";

interface Category {
  id: string | number;
  name: string;
  slug?: string;
  icon?: string | null;
}

const getCategoryIcon = (slug?: string) => {
  const iconProps = { className: "w-6 h-6 transition-colors" };
  const slugLower = (slug || "").toLowerCase();

  if (slugLower.includes("cleanser")) return <Droplet {...iconProps} />;
  if (slugLower.includes("toner") || slugLower.includes("tonner"))
    return <Waves {...iconProps} />;
  if (slugLower.includes("serum")) return <Sparkles {...iconProps} />;
  if (slugLower.includes("moisturizer") || slugLower.includes("cream"))
    return <Flower2 {...iconProps} />;
  if (slugLower.includes("sunscreen") || slugLower.includes("sun"))
    return <Sun {...iconProps} />;
  if (slugLower.includes("mask")) return <Layers {...iconProps} />;

  return <Box {...iconProps} />;
};

export default function CategoryGrid() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getPopularCategories();
        if (data.success && data.resources) {
          setCategories(data.resources);
        }
      } catch (error) {
        console.error("Failed to fetch popular categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <section className="w-full max-w-7xl mx-auto px-6 py-6 md:py-8 select-none">
      <div className="flex flex-col text-left border-b border-[#E5E5E5] pb-4 mb-6">
        <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-normal text-[#121212] tracking-wide">
          Popular Categories
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-card justify-center">
        {loading ? (
          <div className="col-span-full flex justify-center items-center py-8">
            <div className="w-6 h-6 border-2 border-[#BA478F] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          categories.slice(0, 16).map((cat) => {
            const href = `/${cat.slug || cat.id}`;
            return (
              <Link
                key={cat.id}
                href={href}
                prefetch={false}
                className="flex flex-col items-center group cursor-pointer focus-visible:outline-2 focus-visible:outline-[#BA478F] rounded-lg p-1.5"
              >
                {/* Square Container */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex items-center justify-center transition-all bg-[#FDF2F8] text-[#BA478F] border border-[#FCE7F3] group-hover:bg-[#BA478F] group-hover:text-white group-hover:border-[#BA478F] group-hover:shadow-xs">
                  <div>
                    {cat.icon ? (
                      <img
                        src={cat.icon}
                        alt={cat.name}
                        className="w-8 h-8 object-contain"
                      />
                    ) : (
                      getCategoryIcon(cat.slug)
                    )}
                  </div>
                </div>

                {/* Text details */}
                <span className="text-xs font-medium tracking-wide text-zinc-800 mt-3 text-center transition-colors group-hover:text-[#BA478F]">
                  {cat.name}
                </span>
              </Link>
            );
          })
        )}
      </div>
    </section>
  );
}
