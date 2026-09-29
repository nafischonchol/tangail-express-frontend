"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  ShoppingCart,
  Heart,
  Menu,
  X,
  Phone,
  FileText,
  User,
  LogOut,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useWishlistStore } from "@/lib/store/wishlistStore";
import { useCustomerAuth } from "@/lib/hooks/useCustomerAuth";
import { getSearchSuggestions, trackSearchClick, ProductSearchSuggestion } from "@/lib/api/products";
import { useStoreSetup } from "@/context/StoreSetupContext";
import { getMenuCategories, PublicCategory } from "@/lib/api/categories";
import { trackSearchEvent } from "@/lib/utils/analytics";

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
  </svg>
);

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.52 3.5 12 3.5 12 3.5s-7.52 0-9.388.555a3.002 3.002 0 0 0-2.11 2.108C0 8.028 0 12 0 12s0 3.972.502 5.837a3.003 3.003 0 0 0 2.11 2.108C4.48 20.5 12 20.5 12 20.5s7.52 0 9.388-.555a3.003 3.003 0 0 0 2.11-2.108C24 15.972 24 12 24 12s0-3.972-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const TiktokIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.01 1.62 4.2 1.25 1.48 3.04 2.4 4.95 2.6v3.85c-1.8-.1-3.52-.82-4.9-1.92-.09-.07-.17-.16-.29-.27v7.03c.03 5.48-4.56 9.87-10.02 9.77-5.07-.1-9.25-4.22-9.43-9.29C-.07 10.63 4.14 6 9.61 6.01c1.23.01 2.45.29 3.56.84V10.7c-.89-.54-1.92-.83-2.98-.82-2.73.01-4.95 2.22-4.97 4.95-.02 2.92 2.43 5.25 5.35 5.17 2.45-.06 4.54-1.89 4.79-4.32.06-.59.03-1.18.03-1.77V.02h.13z" />
  </svg>
);

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [menuCategories, setMenuCategories] = useState<PublicCategory[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const { cart, setCartOpen } = useCart();
  const { isLoggedIn, customerUser } = useCustomerAuth();
  const { storeSetup } = useStoreSetup();
  const wishlistItems = useWishlistStore((state) => state.items);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlistItems.length;
  const onCartClick = () => setCartOpen(true);

  const storeName = storeSetup?.store_name || "Tangail Express";
  const logoUrl = storeSetup?.logo || "/logo.jpeg";
  const phone = storeSetup?.phone;
  const facebookUrl = storeSetup?.facebook;
  const instagramUrl = storeSetup?.instagram;
  const youtubeUrl = storeSetup?.youtube;
  const tiktokUrl = storeSetup?.tiktok;

  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("customer_token");
    localStorage.removeItem("customer_user");
    window.dispatchEvent(new Event("customer-auth-changed"));
    router.push("/login");
  };
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams?.get("q") || "");
  const [searchResults, setSearchResults] = useState<ProductSearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8001";

  // Fetch header menu categories dynamically
  useEffect(() => {
    let isMounted = true;
    getMenuCategories()
      .then((res) => {
        if (isMounted && res.success && Array.isArray(res.resources)) {
          setMenuCategories(res.resources);
        }
      })
      .catch((err) => {
        console.error("Failed to load header menu categories:", err);
      })
      .finally(() => {
        if (isMounted) setIsCategoriesLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setSearchQuery(searchParams?.get("q") || "");
  }, [searchParams]);

  // Debounced live search
  useEffect(() => {
    const query = searchQuery.trim();
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
  }, [searchQuery]);

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
      trackSearchClick(id, searchQuery.trim()).catch(() => {});
    }
    const targetSlug = slugUrl || (id ? String(id) : "");
    if (targetSlug) {
      router.push(`/product/${targetSlug}`);
    }
  };

  const handleSearchSubmit = (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    setIsOpen(false);
    const trimmed = searchQuery.trim();
    if (trimmed) {
      trackSearchEvent(trimmed);
      router.push(
        `/catalog?search_text=${encodeURIComponent(trimmed)}`,
      );
    } else {
      router.push(`/catalog`);
    }
  };

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
              See all results for "{searchQuery}"
            </div>
          </>
        ) : (
          <div className="p-6 text-center text-zinc-500 text-sm">
            No products found matching "{searchQuery}"
          </div>
        )}
      </div>
    );
  };

  return (
    <header className="w-full flex flex-col z-50 bg-white">
      {/* 1. Top Announcement/Info Bar */}
      <div className="w-full bg-[#BA478F] text-white text-xs py-2 px-4 md:px-8 flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0">
        {/* Left Side: Call & Social Media */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {phone ? (
            <a
              href={`tel:${phone}`}
              className="flex items-center gap-1 hover:opacity-90 font-medium whitespace-nowrap transition-opacity text-white"
            >
              <Phone size={13} className="fill-current" />
              <span>Call Now: {phone}</span>
            </a>
          ) : (
            <a
              href="tel:+8801790-270066"
              className="flex items-center gap-1 hover:opacity-90 font-medium whitespace-nowrap transition-opacity text-white"
            >
              <Phone size={13} className="fill-current" />
              <span>Call Now: +8801790-270066</span>
            </a>
          )}
          <span className="text-white/40 hidden sm:inline">|</span>
          <div className="flex items-center gap-2.5">
            <span className="text-white/90">Follow us on</span>
            {(facebookUrl || (!instagramUrl && !youtubeUrl && !tiktokUrl)) && (
              <a
                href={facebookUrl || "https://facebook.com"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:opacity-80 transition-opacity"
                aria-label="Facebook"
              >
                <FacebookIcon className="w-3.5 h-3.5 fill-current" />
              </a>
            )}
            {(instagramUrl || (!facebookUrl && !youtubeUrl && !tiktokUrl)) && (
              <a
                href={instagramUrl || "https://instagram.com"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:opacity-80 transition-opacity"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-3.5 h-3.5" />
              </a>
            )}
            {(youtubeUrl || (!facebookUrl && !instagramUrl && !tiktokUrl)) && (
              <a
                href={youtubeUrl || "https://youtube.com"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:opacity-80 transition-opacity"
                aria-label="YouTube"
              >
                <YoutubeIcon className="w-3.5 h-3.5 fill-current" />
              </a>
            )}
            {(tiktokUrl || (!facebookUrl && !instagramUrl && !youtubeUrl)) && (
              <a
                href={tiktokUrl || "https://tiktok.com"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:opacity-80 transition-opacity"
                aria-label="TikTok"
              >
                <TiktokIcon className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Right Side: FAQ, Sign In / My Account */}
        <div className="flex items-center gap-4">
          <Link
            href="/faq"
            prefetch={false}
            className="flex items-center gap-1 text-white/90 hover:text-white transition-colors font-medium"
          >
            <FileText size={13} />
            <span>FAQ</span>
          </Link>
          <span className="text-white/40">|</span>
          {isLoggedIn ? (
            <div className="flex items-center gap-2.5">
              <Link
                href="/account"
                prefetch={false}
                className="flex items-center gap-1 font-bold text-white hover:underline transition-all"
              >
                <User size={13} />
                <span>{customerUser?.name || "My Account"}</span>
              </Link>
              <span className="text-white/40">|</span>
              <button
                type="button"
                onClick={handleLogout}
                className="text-white/80 hover:text-white transition-colors font-medium flex items-center gap-1 cursor-pointer"
                title="Logout"
              >
                <LogOut size={13} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              prefetch={false}
              className="font-bold text-white hover:underline transition-all"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* 2. Main Header Row (Logo, Search, Actions) */}
      <div className="w-full border-b border-black/[0.06] bg-white py-4">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-8">
          {/* Logo & Mobile Menu Toggle */}
          <div className="w-full md:w-auto flex justify-between items-center">
            {/* Hamburger for Mobile */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden text-black hover:opacity-75 transition-opacity"
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>

            {/* Brand Logo */}
            <div className="flex items-center justify-start flex-1 md:flex-none">
              <Link
                href="/"
                prefetch={false}
                className="flex items-center select-none hover:opacity-95 transition-opacity"
              >
                <Image
                  src={logoUrl}
                  alt={storeName}
                  width={280}
                  height={80}
                  className="h-14 sm:h-16 md:h-20 w-auto object-contain"
                  priority
                  unoptimized
                />
              </Link>
            </div>

            {/* Mobile Cart Counter Shortcut */}
            <button
              onClick={onCartClick}
              className="md:hidden text-[#BA478F] flex items-center gap-1.5 px-2.5 py-1.5 rounded-full hover:bg-pink-50 active:scale-95 transition-all duration-200 cursor-pointer group"
              aria-label="Cart"
            >
              <ShoppingCart
                size={22}
                className="group-hover:scale-110 transition-transform duration-200"
              />
              <span className="text-sm font-bold text-black">{cartCount}</span>
            </button>
          </div>

          {/* Search Bar (Rounded pill) */}
          <div className="w-full md:flex-1 max-w-xl relative" ref={searchContainerRef}>
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder="What are you looking for?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchResults.length > 0 && searchQuery.trim()) {
                    setIsOpen(true);
                  }
                }}
                className="w-full bg-white border border-black/15 focus:border-[#BA478F] focus:outline-none rounded-full py-2.5 pl-6 pr-12 text-sm transition-all text-black placeholder-black/40 shadow-xs"
              />
              <button
                type="submit"
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-[#BA478F] hover:opacity-80 transition-opacity cursor-pointer"
                aria-label="Search Submit"
              >
                <Search size={18} />
              </button>
            </form>
            {renderDropdown()}
          </div>

          {/* Action Links & Badges (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {/* DEALS Link */}
            <Link
              href="/deals"
              prefetch={false}
              className="text-[#BA478F] font-extrabold text-sm tracking-wider hover:opacity-85 transition-opacity flex items-center gap-0.5 px-2 py-1"
            >
              <span>DEALS</span>
              <span className="text-xs">⚡</span>
            </Link>

            {/* Wishlist Icon with count */}
            <Link
              href="/wishlist"
              prefetch={false}
              className="flex items-center gap-1.5 text-black hover:text-[#BA478F] px-3 py-1.5 rounded-full hover:bg-pink-50 active:scale-95 transition-all duration-200 cursor-pointer group"
              aria-label="Wishlist"
            >
              <Heart
                size={22}
                className="text-[#BA478F] group-hover:scale-110 transition-transform duration-200"
              />
              <span className="text-sm font-bold">{wishlistCount}</span>
            </Link>

            {/* Shopping Cart Icon with count */}
            <button
              onClick={onCartClick}
              className="flex items-center gap-1.5 text-black hover:text-[#BA478F] px-3 py-1.5 rounded-full hover:bg-pink-50 active:scale-95 transition-all duration-200 cursor-pointer group"
              aria-label="Shopping Cart"
            >
              <ShoppingCart
                size={22}
                className="text-[#BA478F] group-hover:scale-110 transition-transform duration-200"
              />
              <span className="text-sm font-bold">{cartCount}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Sub-Navigation Bar (Categories) */}
      {(isCategoriesLoading || menuCategories.length > 0) && (
        <div className="w-full border-b border-black/[0.04] bg-white min-h-[40px]">
          <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-start overflow-x-auto no-scrollbar py-2">
            {/* Scrollable Categories List */}
            <nav className="flex items-center gap-5 lg:gap-7">
              {isCategoriesLoading && menuCategories.length === 0 ? (
                <div className="flex items-center gap-6 py-0.5 animate-pulse">
                  <div className="h-3 w-16 bg-zinc-200/70 rounded-sm" />
                  <div className="h-3 w-14 bg-zinc-200/70 rounded-sm" />
                  <div className="h-3 w-16 bg-zinc-200/70 rounded-sm" />
                  <div className="h-3 w-20 bg-zinc-200/70 rounded-sm" />
                  <div className="h-3 w-18 bg-zinc-200/70 rounded-sm" />
                </div>
              ) : (
                menuCategories.map((item) => (
                  <Link
                    key={item.id}
                    href={`/${item.slug || item.id}`}
                    prefetch={false}
                    className="text-xs font-bold text-black/70 hover:text-[#BA478F] tracking-wide uppercase transition-colors whitespace-nowrap"
                  >
                    {item.name}
                  </Link>
                ))
              )}
            </nav>
          </div>
        </div>
      )}

      {/* 4. Mobile Menu Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex justify-start">
          <div className="w-80 h-full bg-white p-6 shadow-2xl flex flex-col animate-slide-in">
            {/* Sidebar Header */}
            <div className="flex justify-between items-center border-b border-black/[0.06] pb-4 mb-6">
              <span className="font-serif text-lg font-normal tracking-widest uppercase">
                Menu
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-[#121212] p-1"
                aria-label="Close menu"
              >
                <X size={22} />
              </button>
            </div>

            {/* Sidebar Navigation */}
            <nav className="flex flex-col gap-4 text-sm font-bold tracking-wider text-black/85 uppercase overflow-y-auto no-scrollbar flex-1">
              {menuCategories.map((item) => (
                <Link
                  key={item.id}
                  href={`/${item.slug || item.id}`}
                  prefetch={false}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-left py-2 border-b border-black/[0.02] hover:text-[#BA478F] transition-colors"
                >
                  {item.name}
                </Link>
              ))}

              {/* Additional Sidebar Links */}
              <div className="border-t border-black/[0.06] pt-4 mt-2 flex flex-col gap-3">
                <Link
                  href="/deals"
                  prefetch={false}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[#BA478F] font-extrabold py-1"
                >
                  DEALS ⚡
                </Link>

                <Link
                  href="/brands"
                  prefetch={false}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-black/80 hover:text-[#BA478F] py-1"
                >
                  BRANDS
                </Link>
                <Link
                  href="/blog"
                  prefetch={false}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-black/80 hover:text-[#BA478F] py-1"
                >
                  BLOG
                </Link>
              </div>
            </nav>

            {/* Sidebar Footer */}
            <div className="mt-auto border-t border-black/[0.06] pt-6 flex flex-col gap-4">
              <div className="flex items-center justify-between text-sm text-[#565656]">
                {isLoggedIn ? (
                  <div className="flex items-center justify-between w-full">
                    <Link
                      href="/account"
                      prefetch={false}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 font-semibold text-[#121212] hover:text-[#BA478F]"
                    >
                      <User size={16} />
                      <span>{customerUser?.name || "My Account"}</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="text-rose-500 hover:text-rose-600 text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <LogOut size={14} />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    prefetch={false}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 font-semibold text-[#BA478F]"
                  >
                    <User size={16} />
                    <span>Sign In / Register</span>
                  </Link>
                )}
              </div>
              <p
                className="text-[10px] text-[#565656]/60 tracking-wider"
                suppressHydrationWarning
              >
                © {new Date().getFullYear()} {storeName}. All rights
                reserved.
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
