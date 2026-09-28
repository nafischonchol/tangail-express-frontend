"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Filter,
  X,
  Check,
  ChevronDown,
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import ProductCard from "@/components/ProductCard";
import {
  getFilterableData,
  filterProducts,
  FilterableData,
} from "@/lib/api/products";

interface CatalogFilterClientProps {
  initialCategorySlug?: string;
  initialBrandSlug?: string;
}

export function CatalogFilterClientContent({
  initialCategorySlug = "",
  initialBrandSlug = "",
}: CatalogFilterClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Extract URL search parameters
  const categorySlugParam =
    initialCategorySlug || searchParams.get("category_slug") || "";
  const brandSlugParam =
    initialBrandSlug || searchParams.get("brand_slug") || "";
  const concernIdParam = searchParams.get("concern_id") || "";
  const attrValParam = searchParams.get("attribute_value_id") || "";
  const searchTextParam =
    searchParams.get("search_text") || searchParams.get("q") || "";
  const minPriceParam = searchParams.get("min_price") || "";
  const maxPriceParam = searchParams.get("max_price") || "";
  const isStockParam = searchParams.get("is_stock") || "";
  const sortByParam = searchParams.get("sort_by") || "latest";

  const [filterData, setFilterData] = useState<FilterableData | null>(null);
  const [loadingFilters, setLoadingFilters] = useState(true);

  // Active Filter state
  const [selectedCategorySlug, setSelectedCategorySlug] =
    useState<string>(categorySlugParam);
  const [selectedBrandSlug, setSelectedBrandSlug] =
    useState<string>(brandSlugParam);
  const [selectedConcern, setSelectedConcern] =
    useState<string>(concernIdParam);
  const [selectedAttrValues, setSelectedAttrValues] = useState<string[]>(
    attrValParam ? attrValParam.split(",").filter(Boolean) : [],
  );
  const [minPrice, setMinPrice] = useState<string>(minPriceParam);
  const [maxPrice, setMaxPrice] = useState<string>(maxPriceParam);
  const [inStockOnly, setInStockOnly] = useState<boolean>(
    isStockParam === "true" || isStockParam === "1",
  );
  const [sortBy, setSortBy] = useState<string>(sortByParam);
  const [searchText, setSearchText] = useState<string>(searchTextParam);

  // Products state & pagination & SEO data
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [pagination, setPagination] = useState<any>(null);
  const [seoData, setSeoData] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Mobile filter drawer toggle
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Accordion toggle states
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    categories: true,
    brands: true,
    concerns: true,
    price: true,
  });

  // Sync state when props or searchParams change
  useEffect(() => {
    setSelectedCategorySlug(
      initialCategorySlug || searchParams.get("category_slug") || "",
    );
    setSelectedBrandSlug(
      initialBrandSlug || searchParams.get("brand_slug") || "",
    );
    setSelectedConcern(searchParams.get("concern_id") || "");
    const attrParam = searchParams.get("attribute_value_id") || "";
    setSelectedAttrValues(
      attrParam ? attrParam.split(",").filter(Boolean) : [],
    );
    setMinPrice(searchParams.get("min_price") || "");
    setMaxPrice(searchParams.get("max_price") || "");
    const stock = searchParams.get("is_stock");
    setInStockOnly(stock === "true" || stock === "1");
    setSortBy(searchParams.get("sort_by") || "latest");
    setSearchText(
      searchParams.get("search_text") || searchParams.get("q") || "",
    );
  }, [initialCategorySlug, initialBrandSlug, searchParams]);

  // Load filter options
  useEffect(() => {
    async function loadFilterableData() {
      setLoadingFilters(true);
      const res = await getFilterableData();
      if (res && res.success && res.resources) {
        setFilterData(res.resources);
      }
      setLoadingFilters(false);
    }
    loadFilterableData();
  }, []);

  // Fetch products whenever filters change
  useEffect(() => {
    async function loadFilteredProducts() {
      setLoadingProducts(true);
      const apiBase =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

      const res = await filterProducts({
        search_text: searchText || undefined,
        category_slug: selectedCategorySlug || undefined,
        brand_slug: selectedBrandSlug || undefined,
        concern_id: selectedConcern || undefined,
        attribute_value_id:
          selectedAttrValues.length > 0
            ? selectedAttrValues.join(",")
            : undefined,
        min_price: minPrice ? Number(minPrice) : undefined,
        max_price: maxPrice ? Number(maxPrice) : undefined,
        is_stock: inStockOnly ? 1 : undefined,
        sort_by: sortBy || undefined,
        page: currentPage,
        per_page: 50,
      });

      if (res && res.success && res.resources) {
        const rawSeo = (res as any)?.resources?.seo || (res as any)?.seo;
        if (rawSeo) {
          setSeoData(rawSeo);
          if (
            typeof document !== "undefined" &&
            (rawSeo.meta_title || rawSeo.title || rawSeo.name)
          ) {
            document.title = rawSeo.meta_title || rawSeo.title || rawSeo.name;
          }
        } else {
          setSeoData(null);
        }

        const rawProducts = Array.isArray(res.resources)
          ? res.resources
          : (res.resources as any)?.products ||
            (res.resources as any)?.items ||
            [];

        const mappedProducts = rawProducts.map((item: any) => {
          const price =
            item.discount_price ||
            item.min_discount_price ||
            item.price ||
            item.min_price ||
            0;
          const originalPrice = item.price || item.min_price || 0;
          return {
            id: String(item.id),
            slug_url: item.slug_url,
            name: item.name,
            category: item.category?.name || "Uncategorized",
            price: Number(price),
            originalPrice:
              originalPrice > price ? Number(originalPrice) : undefined,
            image: item.thumbnail
              ? item.thumbnail.startsWith("http")
                ? item.thumbnail
                : `${apiBase}${item.thumbnail}`
              : "/images/product_snail.png",
            rating: item.rating || 4.8,
            reviewsCount: item.reviews_count || 12,
            concern: "Skincare",
            isBestSeller: item.is_bestseller || false,
            isNew: false,
          };
        });
        setProducts(mappedProducts);
        setPagination(res.pagination || null);
      } else {
        setProducts([]);
        setPagination(null);
        setSeoData(null);
      }
      setLoadingProducts(false);
    }

    loadFilteredProducts();
  }, [
    selectedCategorySlug,
    selectedBrandSlug,
    selectedConcern,
    selectedAttrValues,
    minPrice,
    maxPrice,
    inStockOnly,
    sortBy,
    searchText,
    currentPage,
  ]);

  // Sync canonical tag, robots tag, meta description, Open Graph, and Twitter tags in document head dynamically
  useEffect(() => {
    if (typeof document === "undefined") return;

    let path = "/catalog";
    if (selectedCategorySlug && selectedBrandSlug) {
      path = `/${selectedCategorySlug}/${selectedBrandSlug}`;
    } else if (selectedCategorySlug) {
      path = `/${selectedCategorySlug}`;
    } else if (selectedBrandSlug) {
      path = `/${selectedBrandSlug}`;
    }

    const canonicalUrl = `${window.location.origin}${path}`;
    const pageTitle = document.title || "Mohima Premium Beauty";
    const pageDesc =
      seoData?.meta_description ||
      "Discover curated authentic Korean beauty and luxury skincare products.";
    const rawImg = seoData?.meta_image;
    const ogImg = rawImg
      ? rawImg.startsWith("http")
        ? rawImg
        : `${window.location.origin}${rawImg}`
      : `${window.location.origin}/images/hero_banner_1.png`;

    const setMetaTag = (
      attrName: string,
      attrValue: string,
      content: string,
    ) => {
      let element = document.querySelector<HTMLMetaElement>(
        `meta[${attrName}='${attrValue}']`,
      );
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    // Canonical link tag
    let link = document.querySelector<HTMLLinkElement>("link[rel='canonical']");
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", canonicalUrl);

    // Robots meta tag
    setMetaTag("name", "robots", "index, follow");

    // Description meta tag
    setMetaTag("name", "description", pageDesc);

    // Open Graph meta tags
    setMetaTag("property", "og:title", pageTitle);
    setMetaTag("property", "og:description", pageDesc);
    setMetaTag("property", "og:url", canonicalUrl);
    setMetaTag("property", "og:site_name", "Mohima Premium Beauty");
    setMetaTag("property", "og:type", "website");
    setMetaTag("property", "og:image", ogImg);

    // Twitter meta tags
    setMetaTag("name", "twitter:card", "summary_large_image");
    setMetaTag("name", "twitter:title", pageTitle);
    setMetaTag("name", "twitter:description", pageDesc);
    setMetaTag("name", "twitter:image", ogImg);
  }, [selectedCategorySlug, selectedBrandSlug, seoData]);

  // Construct updated URL and update browser history
  const updateUrl = (updatedState: {
    categorySlug?: string;
    brandSlug?: string;
    search?: string;
    minP?: string;
    maxP?: string;
    stock?: boolean;
    sort?: string;
    concern?: string;
    attrVals?: string;
  }) => {
    const catSlug =
      updatedState.categorySlug !== undefined
        ? updatedState.categorySlug
        : selectedCategorySlug;
    const brSlug =
      updatedState.brandSlug !== undefined
        ? updatedState.brandSlug
        : selectedBrandSlug;
    const sText =
      updatedState.search !== undefined ? updatedState.search : searchText;
    const minP = updatedState.minP !== undefined ? updatedState.minP : minPrice;
    const maxP = updatedState.maxP !== undefined ? updatedState.maxP : maxPrice;
    const stock =
      updatedState.stock !== undefined ? updatedState.stock : inStockOnly;
    const sort = updatedState.sort !== undefined ? updatedState.sort : sortBy;
    const concern =
      updatedState.concern !== undefined
        ? updatedState.concern
        : selectedConcern;
    const attrVals =
      updatedState.attrVals !== undefined
        ? updatedState.attrVals
        : selectedAttrValues.join(",");

    // Path calculation
    let basePath = "/catalog";
    if (catSlug && brSlug) {
      basePath = `/${catSlug}/${brSlug}`;
    } else if (catSlug) {
      basePath = `/${catSlug}`;
    } else if (brSlug) {
      basePath = `/${brSlug}`;
    }

    // Query parameters
    const queryParams = new URLSearchParams();
    if (sText) queryParams.set("search_text", sText);
    if (minP) queryParams.set("min_price", minP);
    if (maxP) queryParams.set("max_price", maxP);
    if (stock) queryParams.set("is_stock", "true");
    if (sort && sort !== "latest") queryParams.set("sort_by", sort);
    if (concern) queryParams.set("concern_id", concern);
    if (attrVals) queryParams.set("attribute_value_id", attrVals);

    const queryString = queryParams.toString();
    const finalUrl = queryString ? `${basePath}?${queryString}` : basePath;
    router.push(finalUrl);
  };

  const handleCategorySelect = (slug: string) => {
    const nextSlug = selectedCategorySlug === slug ? "" : slug;
    setSelectedCategorySlug(nextSlug);
    setCurrentPage(1);
    updateUrl({ categorySlug: nextSlug });
  };

  const handleBrandSelect = (slug: string) => {
    const nextSlug = selectedBrandSlug === slug ? "" : slug;
    setSelectedBrandSlug(nextSlug);
    setCurrentPage(1);
    updateUrl({ brandSlug: nextSlug });
  };

  const handleAttributeValueSelect = (id: string) => {
    const exists = selectedAttrValues.includes(id);
    const updated = exists
      ? selectedAttrValues.filter((v) => v !== id)
      : [...selectedAttrValues, id];
    setSelectedAttrValues(updated);
    setCurrentPage(1);
    updateUrl({ attrVals: updated.join(",") });
  };

  const handlePriceApply = () => {
    setCurrentPage(1);
    updateUrl({ minP: minPrice, maxP: maxPrice });
  };

  const handleStockToggle = () => {
    const nextVal = !inStockOnly;
    setInStockOnly(nextVal);
    setCurrentPage(1);
    updateUrl({ stock: nextVal });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSortBy(val);
    setCurrentPage(1);
    updateUrl({ sort: val });
  };

  const handleResetFilters = () => {
    setSelectedCategorySlug("");
    setSelectedBrandSlug("");
    setSelectedConcern("");
    setSelectedAttrValues([]);
    setMinPrice("");
    setMaxPrice("");
    setInStockOnly(false);
    setSortBy("latest");
    setSearchText("");
    setCurrentPage(1);
    router.push("/catalog");
  };

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !(prev[section] ?? true),
    }));
  };

  const activeFiltersCount =
    (selectedCategorySlug ? 1 : 0) +
    (selectedBrandSlug ? 1 : 0) +
    (selectedConcern ? 1 : 0) +
    selectedAttrValues.length +
    (minPrice || maxPrice ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (searchText ? 1 : 0);

  // Active category & brand names for display
  const activeCategoryObj = filterData?.categories?.find(
    (c) => c.slug === selectedCategorySlug,
  );
  const activeBrandObj = filterData?.brands?.find(
    (b) => b.slug === selectedBrandSlug,
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF9F6] text-[#121212] font-sans">
      <Suspense fallback={<div className="h-20 bg-white"></div>}>
        <Header />
      </Suspense>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-3 pb-8 sm:pt-4 sm:pb-8">
        {/* Main Grid: Sidebar + Products */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Desktop Left Sidebar Filter Column */}
          <aside className="hidden lg:block lg:col-span-3 space-y-4 bg-white p-4 rounded-2xl border border-black/[0.04] shadow-xs sticky top-20">
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
              <div className="flex items-center gap-2 text-sm font-bold text-[#121212] tracking-wide uppercase">
                <Filter size={16} className="text-[#BA478F]" />
                <span>Filters</span>
              </div>
              {activeFiltersCount > 0 && (
                <button
                  onClick={handleResetFilters}
                  className="flex items-center gap-1 text-[11px] font-semibold text-[#BA478F] hover:underline"
                >
                  <RotateCcw size={12} />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {loadingFilters ? (
              <div className="space-y-4 py-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-100 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-8 bg-gray-100 rounded w-full"></div>
              </div>
            ) : (
              <>
                {/* 1. Categories Accordion */}
                <div className="border-b border-black/[0.06] pb-4">
                  <button
                    onClick={() => toggleSection("categories")}
                    className="flex items-center justify-between w-full text-xs font-bold uppercase tracking-wider text-[#121212] py-1"
                  >
                    <span>Categories</span>
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${
                        openSections.categories ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openSections.categories && (
                    <div className="mt-3 space-y-1 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                      {filterData?.categories?.map((cat) => {
                        const isSelected = cat.slug === selectedCategorySlug;
                        return (
                          <div key={cat.id} className="space-y-1">
                            <button
                              onClick={() => handleCategorySelect(cat.slug)}
                              className={`flex items-center justify-between w-full text-xs py-1.5 px-2 rounded-lg transition-colors text-left font-medium ${
                                isSelected
                                  ? "bg-[#BA478F]/10 text-[#BA478F] font-bold"
                                  : "text-[#565656] hover:bg-black/5 hover:text-[#121212]"
                              }`}
                            >
                              <span>{cat.name}</span>
                              {isSelected && (
                                <Check size={12} className="text-[#BA478F]" />
                              )}
                            </button>
                            {/* Children categories */}
                            {cat.children && cat.children.length > 0 && (
                              <div className="pl-3 space-y-1 border-l-2 border-[#BA478F]/20 ml-2">
                                {cat.children.map((child) => {
                                  const isChildSelected =
                                    child.slug === selectedCategorySlug;
                                  return (
                                    <button
                                      key={child.id}
                                      onClick={() =>
                                        handleCategorySelect(child.slug)
                                      }
                                      className={`block w-full text-left text-[11px] py-1 px-2 rounded transition-colors ${
                                        isChildSelected
                                          ? "text-[#BA478F] font-bold"
                                          : "text-[#565656] hover:text-[#121212]"
                                      }`}
                                    >
                                      {child.name}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 2. Brands Filter */}
                <div className="border-b border-black/[0.06] pb-4">
                  <button
                    onClick={() => toggleSection("brands")}
                    className="flex items-center justify-between w-full text-xs font-bold uppercase tracking-wider text-[#121212] py-1"
                  >
                    <span>Brands</span>
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${
                        openSections.brands ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openSections.brands && (
                    <div className="mt-3 space-y-1 max-h-52 overflow-y-auto custom-scrollbar pr-2">
                      {filterData?.brands?.map((brand) => {
                        const isSelected = brand.slug === selectedBrandSlug;
                        return (
                          <button
                            key={brand.id}
                            onClick={() => handleBrandSelect(brand.slug)}
                            className={`flex items-center justify-between w-full text-xs py-1.5 px-2 rounded-lg transition-colors text-left font-medium ${
                              isSelected
                                ? "bg-[#BA478F]/10 text-[#BA478F] font-bold"
                                : "text-[#565656] hover:bg-black/5 hover:text-[#121212]"
                            }`}
                          >
                            <span>{brand.name}</span>
                            {isSelected && (
                              <Check size={12} className="text-[#BA478F]" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 3. Dynamic Attributes Filters */}
                {filterData?.attributes &&
                  filterData.attributes.length > 0 &&
                  filterData.attributes.map((attr) => {
                    const sectionKey = `attr_${attr.id}`;
                    const isOpen = openSections[sectionKey] ?? true;
                    return (
                      <div
                        key={attr.id}
                        className="border-b border-black/[0.06] pb-4"
                      >
                        <button
                          onClick={() => toggleSection(sectionKey)}
                          className="flex items-center justify-between w-full text-xs font-bold uppercase tracking-wider text-[#121212] py-1"
                        >
                          <span>{attr.name}</span>
                          <ChevronDown
                            size={14}
                            className={`transition-transform duration-200 ${
                              isOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        {isOpen &&
                          attr.attribute_values &&
                          attr.attribute_values.length > 0 && (
                            <div className="mt-3 space-y-1 max-h-52 overflow-y-auto custom-scrollbar pr-2">
                              {attr.attribute_values.map((val) => {
                                const valIdStr = String(val.id);
                                const isSelected =
                                  selectedAttrValues.includes(valIdStr);
                                return (
                                  <button
                                    key={val.id}
                                    onClick={() =>
                                      handleAttributeValueSelect(valIdStr)
                                    }
                                    className={`flex items-center justify-between w-full text-xs py-1.5 px-2 rounded-lg transition-colors text-left font-medium ${
                                      isSelected
                                        ? "bg-[#BA478F]/10 text-[#BA478F] font-bold"
                                        : "text-[#565656] hover:bg-black/5 hover:text-[#121212]"
                                    }`}
                                  >
                                    <span>{val.value}</span>
                                    {isSelected && (
                                      <Check
                                        size={12}
                                        className="text-[#BA478F]"
                                      />
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                      </div>
                    );
                  })}

                {/* 4. Price Range */}
                <div className="border-b border-black/[0.06] pb-4">
                  <button
                    onClick={() => toggleSection("price")}
                    className="flex items-center justify-between w-full text-xs font-bold uppercase tracking-wider text-[#121212] py-1"
                  >
                    <span>Price Range (৳)</span>
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${
                        openSections.price ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openSections.price && (
                    <div className="mt-3 space-y-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          placeholder="Min"
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-black/10 rounded-md text-xs focus:outline-none focus:border-[#BA478F]"
                        />
                        <span className="text-xs text-[#565656]">-</span>
                        <input
                          type="number"
                          placeholder="Max"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-black/10 rounded-md text-xs focus:outline-none focus:border-[#BA478F]"
                        />
                      </div>
                      <button
                        onClick={handlePriceApply}
                        className="w-full py-1.5 bg-[#BA478F] text-white rounded-md text-xs font-semibold hover:bg-[#9F3375] transition-colors cursor-pointer"
                      >
                        Apply Price
                      </button>
                    </div>
                  )}
                </div>

                {/* 5. Stock Status Toggle */}
                <div className="pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#121212]">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={handleStockToggle}
                      className="rounded border-gray-300 text-[#BA478F] focus:ring-[#BA478F] cursor-pointer"
                    />
                    <span>In Stock Only</span>
                  </label>
                </div>
              </>
            )}
          </aside>

          {/* Right Product Grid Area - Always a Single Unified Card */}
          <div className="col-span-1 lg:col-span-9 bg-white rounded-2xl border border-black/[0.04] shadow-xs overflow-hidden">
            {/* Top Bar: Active Filters / Item Count + Sort Select */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 sm:px-4 sm:py-2.5 border-b border-black/[0.06]">
              <div className="flex flex-wrap items-center gap-2">
                {activeFiltersCount > 0 ? (
                  <>
                    <span className="text-xs font-semibold text-[#565656]">
                      Active Filters:
                    </span>
                    {selectedCategorySlug && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#BA478F]/10 text-[#BA478F] rounded-full text-xs font-medium">
                        Category:{" "}
                        {activeCategoryObj?.name || selectedCategorySlug}
                        <X
                          size={12}
                          className="cursor-pointer hover:text-black"
                          onClick={() =>
                            handleCategorySelect(selectedCategorySlug)
                          }
                        />
                      </span>
                    )}
                    {selectedBrandSlug && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#BA478F]/10 text-[#BA478F] rounded-full text-xs font-medium">
                        Brand: {activeBrandObj?.name || selectedBrandSlug}
                        <X
                          size={12}
                          className="cursor-pointer hover:text-black"
                          onClick={() => handleBrandSelect(selectedBrandSlug)}
                        />
                      </span>
                    )}
                    {selectedAttrValues.map((valId) => {
                      let chipLabel = valId;
                      filterData?.attributes?.forEach((attr) => {
                        const found = attr.attribute_values?.find(
                          (v) => String(v.id) === valId,
                        );
                        if (found) chipLabel = `${attr.name}: ${found.value}`;
                      });
                      return (
                        <span
                          key={valId}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#BA478F]/10 text-[#BA478F] rounded-full text-xs font-medium"
                        >
                          {chipLabel}
                          <X
                            size={12}
                            className="cursor-pointer hover:text-black"
                            onClick={() => handleAttributeValueSelect(valId)}
                          />
                        </span>
                      );
                    })}
                    {searchText && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#BA478F]/10 text-[#BA478F] rounded-full text-xs font-medium">
                        Search: "{searchText}"
                        <X
                          size={12}
                          className="cursor-pointer hover:text-black"
                          onClick={() => {
                            setSearchText("");
                            updateUrl({ search: "" });
                          }}
                        />
                      </span>
                    )}
                    {(minPrice || maxPrice) && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#BA478F]/10 text-[#BA478F] rounded-full text-xs font-medium">
                        ৳{minPrice || 0} - ৳{maxPrice || "Max"}
                        <X
                          size={12}
                          className="cursor-pointer hover:text-black"
                          onClick={() => {
                            setMinPrice("");
                            maxPrice && setMaxPrice("");
                            updateUrl({ minP: "", maxP: "" });
                          }}
                        />
                      </span>
                    )}
                    {inStockOnly && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#BA478F]/10 text-[#BA478F] rounded-full text-xs font-medium">
                        In Stock
                        <X
                          size={12}
                          className="cursor-pointer hover:text-black"
                          onClick={handleStockToggle}
                        />
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-xs font-medium text-[#565656]">
                    {pagination?.total !== undefined
                      ? `Showing ${pagination.total} products`
                      : "Showing products"}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => setMobileFilterOpen(true)}
                  className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 bg-white border border-black/10 rounded-lg text-xs font-semibold shadow-xs hover:border-[#BA478F] cursor-pointer"
                >
                  <SlidersHorizontal size={13} className="text-[#BA478F]" />
                  <span>
                    Filters{" "}
                    {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                  </span>
                </button>
                <span className="text-xs text-[#565656] font-medium hidden sm:inline">
                  Sort By:
                </span>
                <select
                  value={sortBy}
                  onChange={handleSortChange}
                  className="px-3 py-1.5 bg-white border border-black/10 rounded-lg text-xs font-medium text-[#121212] focus:outline-none focus:border-[#BA478F] cursor-pointer shadow-xs"
                >
                  <option value="latest">Latest Arrivals</option>
                  <option value="best_selling">Best Selling</option>
                  <option value="price_low_to_high">Price: Low to High</option>
                  <option value="price_high_to_low">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Products Grid / Loading State / Empty State */}
            {loadingProducts ? (
              <div className="p-3 sm:p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3">
                  {Array.from({ length: 8 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-100 rounded-xl h-72 animate-pulse border border-black/5"
                    ></div>
                  ))}
                </div>
              </div>
            ) : products.length > 0 ? (
              <div className="p-3 sm:p-4 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination Controls */}
                {pagination && pagination.last_page > 1 && (
                  <div className="flex justify-center items-center gap-2 pt-4 border-t border-black/[0.04]">
                    <button
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage((prev) => prev - 1)}
                      className="px-3 py-1.5 border border-black/10 rounded-md text-xs font-semibold disabled:opacity-40 hover:bg-black/5 cursor-pointer transition-colors"
                    >
                      Prev
                    </button>
                    <span className="text-xs font-medium text-[#565656]">
                      Page {pagination.current_page} of {pagination.last_page}
                    </span>
                    <button
                      disabled={currentPage >= pagination.last_page}
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                      className="px-3 py-1.5 border border-black/10 rounded-md text-xs font-semibold disabled:opacity-40 hover:bg-black/5 cursor-pointer transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 sm:p-12 text-center space-y-4">
                <div className="w-16 h-16 bg-[#BA478F]/10 text-[#BA478F] rounded-full flex items-center justify-center mx-auto">
                  <Filter size={32} />
                </div>
                <h3 className="text-lg font-serif font-semibold text-[#121212]">
                  No products match your filters
                </h3>
                <p className="text-xs text-[#565656] max-w-sm mx-auto">
                  Try adjusting or resetting your category, brand, or price
                  range filters to discover more items.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-6 py-2.5 bg-[#BA478F] text-white text-xs font-semibold rounded-full hover:bg-[#9F3375] transition-colors shadow-xs cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Drawer Filter */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileFilterOpen(false)}
          ></div>
          <div className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between z-10">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-black/10 pb-4">
                <div className="flex items-center gap-2 text-sm font-bold text-[#121212] uppercase">
                  <Filter size={16} className="text-[#BA478F]" />
                  <span>Filter Products</span>
                </div>
                <button onClick={() => setMobileFilterOpen(false)}>
                  <X size={20} className="text-[#121212]" />
                </button>
              </div>

              {/* Filter List for Mobile */}
              <div className="space-y-5">
                {/* Categories */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#121212] mb-2">
                    Categories
                  </h4>
                  <div className="space-y-1 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                    {filterData?.categories?.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => handleCategorySelect(cat.slug)}
                        className={`block w-full text-left text-xs py-1.5 px-2 rounded ${
                          cat.slug === selectedCategorySlug
                            ? "bg-[#BA478F]/10 text-[#BA478F] font-bold"
                            : "text-[#565656]"
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Brands */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#121212] mb-2">
                    Brands
                  </h4>
                  <div className="space-y-1 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                    {filterData?.brands?.map((brand) => (
                      <button
                        key={brand.id}
                        onClick={() => handleBrandSelect(brand.slug)}
                        className={`block w-full text-left text-xs py-1.5 px-2 rounded ${
                          brand.slug === selectedBrandSlug
                            ? "bg-[#BA478F]/10 text-[#BA478F] font-bold"
                            : "text-[#565656]"
                        }`}
                      >
                        {brand.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Attributes for Mobile */}
                {filterData?.attributes &&
                  filterData.attributes.length > 0 &&
                  filterData.attributes.map((attr) => (
                    <div key={attr.id}>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#121212] mb-2">
                        {attr.name}
                      </h4>
                      <div className="space-y-1 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                        {attr.attribute_values?.map((val) => {
                          const valIdStr = String(val.id);
                          const isSelected =
                            selectedAttrValues.includes(valIdStr);
                          return (
                            <button
                              key={val.id}
                              onClick={() =>
                                handleAttributeValueSelect(valIdStr)
                              }
                              className={`block w-full text-left text-xs py-1.5 px-2 rounded ${
                                isSelected
                                  ? "bg-[#BA478F]/10 text-[#BA478F] font-bold"
                                  : "text-[#565656]"
                              }`}
                            >
                              {val.value}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                {/* Price */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#121212] mb-2">
                    Price Range
                  </h4>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full px-2 py-1 border rounded text-xs"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full px-2 py-1 border rounded text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-black/10 space-y-2">
              <button
                onClick={() => {
                  handlePriceApply();
                  setMobileFilterOpen(false);
                }}
                className="w-full py-2.5 bg-[#121212] text-white rounded-full text-xs font-semibold"
              >
                Apply Filters
              </button>
              <button
                onClick={() => {
                  handleResetFilters();
                  setMobileFilterOpen(false);
                }}
                className="w-full py-2.5 bg-gray-100 text-[#121212] rounded-full text-xs font-semibold"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      <CartDrawer />
      <Footer />
    </div>
  );
}

export default function CatalogFilterClient(props: CatalogFilterClientProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center text-xs">
          Loading products catalog...
        </div>
      }
    >
      <CatalogFilterClientContent {...props} />
    </Suspense>
  );
}
