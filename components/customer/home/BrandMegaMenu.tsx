"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Loader2 } from "lucide-react";
import { getPublicBrands, PublicBrand } from "@/lib/api/brands";

const alphabet = "#ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const getBrandGroupKey = (name: string) => {
  const firstChar = name.trim().charAt(0).toUpperCase();
  if (/[A-Z]/.test(firstChar)) return firstChar;
  if (/\d/.test(firstChar)) return firstChar;
  return "#";
};

export function BrandMegaMenu() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [brands, setBrands] = useState<PublicBrand[]>([]);
  const [popularBrands, setPopularBrands] = useState<PublicBrand[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchBrandsData = useCallback(async (query: string) => {
    setIsLoading(true);
    try {
      const res = await getPublicBrands(query);
      if (res.success && Array.isArray(res.resources)) {
        setBrands(res.resources);
        if (!query) {
          const withIcon = res.resources.filter((b) => b.icon);
          const popular =
            withIcon.length >= 12
              ? withIcon.slice(0, 12)
              : [...withIcon, ...res.resources.filter((b) => !b.icon)].slice(0, 12);
          setPopularBrands(popular);
        }
      }
    } catch (err) {
      console.error("Failed to fetch brands:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch initial brand list when menu opens or mounts
  useEffect(() => {
    if (isHovered && !hasFetched) {
      setHasFetched(true);
      fetchBrandsData("");
    }
  }, [isHovered, hasFetched, fetchBrandsData]);

  // Debounced search query when typing
  useEffect(() => {
    if (!hasFetched) return;

    const timer = setTimeout(() => {
      fetchBrandsData(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, hasFetched, fetchBrandsData]);

  const handleLetterClick = (letter: string) => {
    setSelectedLetter((prev) => (prev === letter ? null : letter));
  };

  const displayedBrands = selectedLetter
    ? brands.filter((b) => getBrandGroupKey(b.name) === selectedLetter)
    : brands;

  const groupedBrands = displayedBrands.reduce((acc, brand) => {
    const letter = getBrandGroupKey(brand.name);
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(brand);
    return acc;
  }, {} as Record<string, PublicBrand[]>);

  return (
    <li
      className="relative list-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href="/brands" className="hover:text-slate-900 transition-colors px-2 py-4 block">
        Brands
      </Link>

      {/* Mega Menu Dropdown */}
      {isHovered && (
        <div className="absolute left-0 top-full z-[100] cursor-default animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Invisible buffer bridge to prevent hover loss */}
          <div className="absolute -top-4 left-0 right-0 h-4 bg-transparent" />

          <div className="w-[850px] bg-white text-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 flex overflow-hidden rounded-b-2xl">
            {/* Left Panel - Brand List & Search */}
            <div className="w-[300px] bg-slate-50/80 p-6 border-r border-slate-100 flex flex-col h-[480px]">
              {/* Search */}
              <div className="relative mb-5">
                <input
                  type="text"
                  placeholder="Search the name of brand"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-rose-500 bg-white text-slate-800 placeholder:text-slate-400 transition-colors shadow-sm"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedLetter(null);
                  }}
                />
                {isLoading ? (
                  <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#BA478F] animate-spin" />
                ) : (
                  <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                )}
              </div>

              {/* Alphabet Filter */}
              <div className="flex flex-wrap gap-x-2 gap-y-1 mb-5 text-[11px] font-medium text-slate-500">
                {alphabet.map((letter) => (
                  <button
                    key={letter}
                    onClick={() => handleLetterClick(letter)}
                    className={`w-[14px] text-center cursor-pointer transition-colors ${
                      selectedLetter === letter
                        ? "text-[#BA478F] font-bold scale-110"
                        : "text-slate-500 hover:text-[#BA478F] hover:font-bold"
                    }`}
                  >
                    {letter}
                  </button>
                ))}
              </div>

              {/* Scrollable List */}
              <div className="flex-1 overflow-y-auto pr-3 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                {Object.entries(groupedBrands)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([letter, items]) => (
                    <div key={letter} className="mb-5">
                      <div className="text-xs font-bold border-b border-slate-200 pb-1 mb-3 text-slate-400">
                        {letter}
                      </div>
                      <ul className="space-y-2.5">
                        {items.map((b) => (
                          <li key={b.id}>
                            <Link
                              href={`/${b.slug || b.slug_url || b.id}`}
                              prefetch={false}
                              className="text-[14px] font-medium text-slate-600 hover:text-[#BA478F] hover:font-semibold transition-colors block"
                            >
                              {b.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                {displayedBrands.length === 0 && !isLoading && (
                  <div className="text-sm text-slate-500 italic mt-4 text-center">
                    No brands found.
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel - All Brands Grid with Scrolling */}
            <div className="flex-1 p-8 bg-white overflow-y-auto h-[480px] scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
              <div className="grid grid-cols-3 gap-x-6 gap-y-6">
                {(displayedBrands.length > 0 ? displayedBrands : brands).map((b) => (
                  <Link
                    key={b.id}
                    href={`/${b.slug || b.slug_url || b.id}`}
                    prefetch={false}
                    className="group/logo flex flex-col items-center justify-center p-2 h-24 relative rounded-xl border border-slate-100 bg-white hover:border-[#FBCFE8] hover:bg-[#FDF2F8]/50 transition-all duration-300 shadow-xs"
                  >
                    {b.icon ? (
                      <Image
                        src={b.icon}
                        alt={b.name}
                        width={120}
                        height={60}
                        unoptimized
                        className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover/logo:scale-105 drop-shadow-xs"
                      />
                    ) : null}
                    <div
                      className={`${
                        b.icon ? "hidden" : "block"
                      } text-sm font-black text-slate-400 text-center uppercase tracking-wider group-hover/logo:text-[#BA478F] transition-colors`}
                    >
                      {b.name}
                    </div>
                  </Link>
                ))}
              </div>
              {displayedBrands.length === 0 && !isLoading && (
                <div className="text-sm text-slate-500 italic mt-8 text-center">
                  No brands available.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </li>
  );
}
