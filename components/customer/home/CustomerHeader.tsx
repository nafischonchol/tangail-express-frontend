"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, ChevronDown, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { BrandMegaMenu } from "@/components/customer/home/BrandMegaMenu";
import { CategoryMegaMenu } from "@/components/customer/home/CategoryMegaMenu";
import { MobileSidebar } from "@/components/customer/home/MobileSidebar";
import { HeaderAuth } from "@/components/customer/home/HeaderAuth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useStoreSetup } from "@/context/StoreSetupContext";
import { getSearchSuggestions, trackSearchClick, ProductSearchSuggestion } from "@/lib/api/products";
import { useCustomerAuth } from "@/lib/hooks/useCustomerAuth";

export function CustomerHeader() {
  const router = useRouter();
  const { isLoggedIn } = useCustomerAuth();
  const { storeSetup } = useStoreSetup();
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState<ProductSearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Debounced live search
  useEffect(() => {
    const query = searchInput.trim();
    if (!query) {
      setSearchResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await getSearchSuggestions(query);
        if (res.success && res.resources) {
          const items = Array.isArray(res.resources) ? res.resources : [];
          setSearchResults(items.slice(0, 10));
          setIsOpen(true);
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        console.error("Live search failed:", err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProductClick = (slugUrl?: string, id?: number) => {
    setIsOpen(false);
    if (id) {
      trackSearchClick(id, searchInput.trim()).catch(() => {});
    }
    const targetSlug = slugUrl || (id ? String(id) : "");
    if (targetSlug) {
      router.push(`/product/${targetSlug}`);
    }
  };

  const handleSearchSubmit = (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    setIsOpen(false);
    const trimmed = searchInput.trim();
    if (trimmed) {
      router.push(`/catalog?search_text=${encodeURIComponent(trimmed)}`);
    } else {
      router.push(`/catalog`);
    }
  };

  const logoUrl = storeSetup?.logo || "/logo.jpeg";
  const storeName = storeSetup?.store_name || "Tangail Express";
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8001";

  const renderDropdown = () => {
    if (!isOpen) return null;

    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-zinc-200 z-50 max-h-[480px] overflow-y-auto divide-y divide-zinc-100 transition-all text-left">
        {isLoading ? (
          <div className="flex items-center justify-center p-6 text-zinc-500 gap-2">
            <Loader2 className="animate-spin text-[#BA478F]" size={20} />
            <span className="text-sm font-medium">Searching products...</span>
          </div>
        ) : searchResults.length > 0 ? (
          <>
            <div className="py-1">
              {searchResults.map((product) => {
                const imageUrl = product.image
                  ? product.image.startsWith("http")
                    ? product.image
                    : `${apiBase}${product.image}`
                  : null;

                const brandCategoryText = [product.brand, product.category]
                  .filter(Boolean)
                  .join(" • ");

                return (
                  <div
                    key={product.id}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleProductClick(product.slug_url || product.slug, product.id);
                    }}
                    className="flex items-center gap-3.5 p-3 hover:bg-[#FDF2F8]/70 cursor-pointer transition-colors group"
                  >
                    <div className="relative w-10 h-10 flex-shrink-0 bg-zinc-100 rounded-lg overflow-hidden border border-zinc-200/80">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-200"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-400 text-[10px] font-medium">
                          No Image
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Row 1: Product Name */}
                      <h4 className="text-sm font-semibold text-zinc-900 truncate group-hover:text-[#BA478F] transition-colors leading-tight">
                        {product.name}
                      </h4>
                      
                      {/* Row 2: Price & Brand/Category info */}
                      <div className="flex items-center gap-2 mt-1 min-w-0">
                        <div className="flex items-baseline gap-1.5 flex-shrink-0">
                          <span className="text-xs font-extrabold text-[#BA478F]">
                            ৳{product.price}
                          </span>
                          {product.original_price && (
                            <span className="text-[11px] text-zinc-400 line-through font-normal">
                              ৳{product.original_price}
                            </span>
                          )}
                        </div>

                        {brandCategoryText && (
                          <>
                            <span className="text-zinc-300 text-xs flex-shrink-0">•</span>
                            <span className="text-[11px] text-zinc-500 truncate min-w-0">
                              {brandCategoryText}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div
              onMouseDown={(e) => {
                e.preventDefault();
                handleSearchSubmit();
              }}
              className="p-3 bg-zinc-50 hover:bg-[#FDF2F8] text-center cursor-pointer text-xs font-bold text-[#BA478F] transition-colors border-t border-zinc-200"
            >
              See all results for "{searchInput}"
            </div>
          </>
        ) : (
          <div className="p-6 text-center text-zinc-500 text-sm">
            No products found matching "{searchInput}"
          </div>
        )}
      </div>
    );
  };

  return (
    <header className="relative z-30 flex flex-col w-full bg-white transition-colors duration-300">
      {/* Top Header Section */}
      <div className="border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Main Row */}
          <div className="flex items-center justify-between h-20 lg:h-24 gap-4 lg:gap-8">
            
            {/* Mobile Menu & Logo Group */}
            <div className="flex items-center gap-3 lg:gap-0">
              {/* Hamburger & Sidebar Drawer (Mobile Only) */}
              <MobileSidebar />

              {/* Logo Section */}
              <Link href="/" className="flex items-center flex-shrink-0">
                  <Image 
                    src={logoUrl} 
                    alt={storeName} 
                    width={280} 
                    height={80} 
                    className="object-contain max-h-20 sm:max-h-24 w-auto max-w-[180px] sm:max-w-[220px] lg:max-w-[280px]"
                    priority
                    unoptimized
                  />
              </Link>
            </div>

            {/* Search Bar (Desktop Only) */}
            <div className="hidden lg:block flex-1 max-w-2xl px-8 relative" ref={searchContainerRef}>
              <form 
                onSubmit={handleSearchSubmit}
                className="relative group"
              >
                <input
                  type="text"
                  placeholder="Search Korean skincare, makeup, brands..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onFocus={() => {
                    if (searchResults.length > 0 && searchInput.trim()) {
                      setIsOpen(true);
                    }
                  }}
                  className="w-full bg-transparent border-b border-zinc-300 text-zinc-900 px-2 py-2.5 focus:outline-none focus:border-[#BA478F] transition-colors placeholder:text-zinc-400 text-base"
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 group-hover:text-[#BA478F] transition-colors cursor-pointer">
                  <Search size={20} />
                </button>
              </form>

              {renderDropdown()}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3 sm:gap-4 lg:gap-6 text-[11px] sm:text-xs lg:text-sm font-bold lg:font-medium text-zinc-800 whitespace-nowrap">
              <HeaderAuth />
              
              <ThemeToggle />
              
              <div className="hidden lg:flex items-center gap-1 cursor-pointer hover:text-[#BA478F] transition-colors px-3 py-1.5 border border-zinc-200 rounded-md bg-zinc-50 text-zinc-700 text-xs">
                <span>ENGLISH</span>
                <ChevronDown size={14} />
              </div>
            </div>
          </div>

          {/* Search Bar (Mobile Only - shown below main row) */}
          <div className="lg:hidden pb-4 relative" ref={searchContainerRef}>
            <form 
              onSubmit={handleSearchSubmit}
              className="relative group bg-zinc-50 rounded-full border border-zinc-200 px-4 py-2 flex items-center shadow-xs"
            >
              <input
                type="text"
                placeholder="Search Korean cosmetics..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onFocus={() => {
                  if (searchResults.length > 0 && searchInput.trim()) {
                    setIsOpen(true);
                  }
                }}
                className="w-full bg-transparent text-zinc-900 text-sm focus:outline-none placeholder:text-zinc-400"
              />
              <button type="submit" className="text-zinc-400 hover:text-[#BA478F] transition-colors">
                <Search size={18} />
              </button>
            </form>

            {renderDropdown()}
          </div>

        </div>
      </div>

      {/* Navigation Bar - Utilitarian Minimalist K-Beauty Navbar */}
      <div className="hidden lg:block bg-zinc-50 border-b border-zinc-200 shadow-xs">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex items-center justify-between h-11 text-[13px] font-semibold text-zinc-700 whitespace-nowrap">
            <BrandMegaMenu />
            <CategoryMegaMenu />
            <li>
              <Link href="/catalog" className="hover:text-[#BA478F] transition-colors px-2.5 py-2">
                Products
              </Link>
            </li>
            <li>
              <Link href="/best-sellings" className="hover:text-[#BA478F] transition-colors px-2.5 py-2">
                Best Sellers
              </Link>
            </li>
            <li>
              <Link href="/new-arrivals" className="hover:text-[#BA478F] transition-colors px-2.5 py-2">
                New Arrival
              </Link>
            </li>
            <li>
              <Link href="/how-to-use" className="hover:text-[#BA478F] transition-colors px-2.5 py-2">
                How to Use
              </Link>
            </li>
            <li>
              <Link href="/faq" className="hover:text-[#BA478F] transition-colors px-2.5 py-2">
                FAQ
              </Link>
            </li>
            <li>
              <Link href="/why-us" className="hover:text-[#BA478F] transition-colors px-2.5 py-2">
                Why Mohimaa?
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

