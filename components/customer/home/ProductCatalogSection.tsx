"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Package, ChevronDown, Check, List, LayoutGrid, Plus, Minus, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { InquiryModal, InquiryProduct } from "@/components/customer/home/InquiryModal";
import { BrandCarousel } from "@/components/customer/home/BrandCarousel";
import { useCartStore } from "@/lib/store/cartStore";
import { useWishlistStore } from "@/lib/store/wishlistStore";
import { useCustomerAuth } from "@/lib/hooks/useCustomerAuth";

import { filterProducts, getPopularProducts } from "@/lib/api/products";
import { getPublicBrands, PublicBrand } from "@/lib/api/brands";
import { getPublicCategories, PublicCategory } from "@/lib/api/categories";
import { Select } from "@/components/ui/Select";

interface ProductCatalogSectionProps {
  initialProducts?: any[];
  defaultSortBy?: string;
}

export function ProductCatalogSection({ initialProducts = [], defaultSortBy }: ProductCatalogSectionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoggedIn } = useCustomerAuth();

  const [brands, setBrands] = useState<PublicBrand[]>([]);
  const [categories, setCategories] = useState<PublicCategory[]>([]);
  const [subCategories, setSubCategories] = useState<PublicCategory[]>([]);

  const [selectedBrandId, setSelectedBrandId] = useState<string>(searchParams?.get("brand_id") || searchParams?.get("brand") || "");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(searchParams?.get("category_id") || searchParams?.get("category") || "");
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string>(searchParams?.get("sub_category_id") || searchParams?.get("sub_category") || "");
  const [inStockOnly, setInStockOnly] = useState<boolean>(
    searchParams?.has("is_stock") ? searchParams.get("is_stock") === "1" || searchParams.get("is_stock") === "true" : false
  );

  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<InquiryProduct | null>(null);
  
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);

  const formatProducts = (list: any[]) => {
    return list.map((p) => ({
      id: p.id,
      product_variant_id: p.default_variant_id || p.product_variant_id || p.variant_id || (Array.isArray(p.variants) && p.variants[0] ? p.variants[0].id : null),
      name: p.name,
      slug_url: p.slug_url || (p.slug ? `${p.slug}-${p.id}` : `${p.id}`),
      brand: typeof p.brand === "object" ? p.brand?.name : p.brand,
      category: typeof p.category === "object" ? p.category?.name : (p.category || "Skincare"),
      image: p.thumbnail || p.image || "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=1080&h=1080&auto=format&fit=crop&q=80",
      barcode: p.barcode || p.sku || `8809447256${String(221 + (Number(p.id) || 1)).padStart(3, '0')}`,
      total_stock: p.total_stock !== undefined ? p.total_stock : 0,
      price: Number(p.price || p.min_price || 0),
    }));
  };

  const [productsList, setProductsList] = useState<any[]>(() => {
    if (initialProducts && initialProducts.length > 0) {
      return formatProducts(initialProducts);
    }
    return [];
  });

  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const wishlistItems = useWishlistStore((state) => state.items);
  const isInWishlist = useCallback(
    (id: string | number) => wishlistItems.some((i) => String(i.id) === String(id) || (i.productId && String(i.productId) === String(id))),
    [wishlistItems]
  );

  useEffect(() => {
    getPublicBrands().then((res) => {
      if (res.success && res.resources) {
        setBrands(res.resources);
      }
    });
    getPublicCategories().then((res) => {
      if (res.success && res.resources) {
        setCategories(res.resources);
        const subCats: PublicCategory[] = [];
        res.resources.forEach((cat) => {
          if (cat.children && cat.children.length > 0) {
            subCats.push(...cat.children);
          }
        });
        setSubCategories(subCats);
      }
    });
  }, []);

  useEffect(() => {
    // Default to grid view on mobile devices
    if (window.innerWidth < 1024) {
      setViewMode("grid");
    }
  }, []);

  const [sortBy, setSortBy] = useState<string>(defaultSortBy || "");

  useEffect(() => {
    if (defaultSortBy) {
      setSortBy(defaultSortBy);
    }
  }, [defaultSortBy]);

  const executeFilter = useCallback(async (
    targetPage = 1, 
    isLoadMore = false, 
    overrideSortBy?: string,
    overrideParams?: { brand_id?: string; category_id?: string; sub_category_id?: string; is_stock?: boolean }
  ) => {
    if (isLoadMore) {
      setIsLoadingMore(true);
    } else {
      setIsFiltering(true);
    }

    const searchTextParam = searchParams?.get("search_text") || "";
    const brandIdParam = overrideParams?.brand_id !== undefined ? overrideParams.brand_id : selectedBrandId;
    const categoryIdParam = overrideParams?.category_id !== undefined ? overrideParams.category_id : selectedCategoryId;
    const subCategoryIdParam = overrideParams?.sub_category_id !== undefined ? overrideParams.sub_category_id : selectedSubCategoryId;
    const isStockParam = overrideParams?.is_stock !== undefined ? overrideParams.is_stock : inStockOnly;
    const currentSort = overrideSortBy !== undefined ? overrideSortBy : sortBy;

    try {
      const res = await filterProducts({
        search_text: searchTextParam || undefined,
        brand_id: brandIdParam || undefined,
        category_id: categoryIdParam || undefined,
        sub_category_id: subCategoryIdParam || undefined,
        is_stock: isStockParam ? 1 : 0,
        sort_by: currentSort || undefined,
        page: targetPage,
        per_page: 20,
      });

      if (res.success && res.resources) {
        const rawProducts = Array.isArray(res.resources)
          ? res.resources
          : (res.resources as any)?.products || (res.resources as any)?.items || [];
        const formatted = formatProducts(rawProducts);
        if (isLoadMore) {
          setProductsList((prev) => [...prev, ...formatted]);
        } else {
          setProductsList(formatted);
        }
        setPage(targetPage);
        if (rawProducts.length < 20 || (res.pagination && res.pagination.current_page >= res.pagination.last_page)) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      } else {
        if (!isLoadMore) setProductsList([]);
        setHasMore(false);
      }
    } catch {
      if (!isLoadMore) setProductsList([]);
      setHasMore(false);
    } finally {
      setIsFiltering(false);
      setIsLoadingMore(false);
    }
  }, [searchParams, selectedBrandId, selectedCategoryId, selectedSubCategoryId, inStockOnly, sortBy]);

  useEffect(() => {
    const searchTextParam = searchParams?.get("search_text") || "";
    const brandIdParam = searchParams?.get("brand_id") || searchParams?.get("brand") || "";
    const categoryIdParam = searchParams?.get("category_id") || searchParams?.get("category") || "";
    const subCategoryIdParam = searchParams?.get("sub_category_id") || searchParams?.get("sub_category") || "";

    if (brandIdParam) setSelectedBrandId(brandIdParam);
    if (categoryIdParam) setSelectedCategoryId(categoryIdParam);
    if (subCategoryIdParam) setSelectedSubCategoryId(subCategoryIdParam);

    if (searchTextParam || brandIdParam || categoryIdParam || subCategoryIdParam) {
      executeFilter(1, false);
    } else if (!initialProducts || initialProducts.length === 0) {
      executeFilter(1, false);
    }
  }, [searchParams]);

  const handleSearchClick = () => {
    executeFilter(1, false);
  };

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    executeFilter(page + 1, true);
  };

  const handleQuantityChange = (id: number, delta: number) => {
    setQuantities(prev => {
      const current = prev[id] || 1;
      const next = Math.max(1, current + delta);
      return { ...prev, [id]: next };
    });
  };

  const visibleProducts = productsList;

  const handleOpenInquiry = (product?: InquiryProduct) => {
    setSelectedProduct(product as any || null);
    setIsInquiryModalOpen(true);
  };

  const toggleSelectRow = (id: number) => {
    setSelectedRows(prev => 
      prev.includes(id) ? prev.filter(rId => rId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedRows.length === visibleProducts.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(visibleProducts.map(p => p.id));
    }
  };

  return (
    <section id="catalog" className="py-16 relative z-10 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FDF2F8] border border-[#FBCFE8] text-[#9F3375] text-xs font-semibold mb-3 self-start shadow-2xs">
            <Package size={13} className="text-[#BA478F]" />
            <span>100% Authentic Korean Stock</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Korean Cosmetics & Skincare Catalog
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Direct import authentic Korean beauty collections with competitive pricing and fast delivery across Bangladesh.
          </p>
        </div>

        {/* 1. Advanced Filter Bar (Responsive Grid Layout) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 lg:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-6 shadow-xs w-full">
          <div suppressHydrationWarning className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap items-center gap-3 lg:gap-x-6 lg:gap-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium flex-1">
            
            {/* Brand Dropdown */}
            <div className="flex items-center justify-between sm:justify-start gap-2 w-full lg:w-auto">
              <span className="font-bold text-slate-900 dark:text-slate-200 shrink-0 w-16 sm:w-auto">Brand</span>
              <div className="relative flex-1 lg:w-36 xl:w-44">
                <Select
                  value={selectedBrandId}
                  onChange={(e) => {
                    const newBrandId = e.target.value;
                    setSelectedBrandId(newBrandId);
                    executeFilter(1, false, undefined, { brand_id: newBrandId });
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-medium py-2 px-2.5"
                >
                  <option value="">Select Brand</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </Select>
              </div>
            </div>
            
            {/* Category Dropdown */}
            <div className="flex items-center justify-between sm:justify-start gap-2 w-full lg:w-auto">
              <span className="font-bold text-slate-900 dark:text-slate-200 shrink-0 w-16 sm:w-auto">Category</span>
              <div className="relative flex-1 lg:w-36 xl:w-44">
                <Select
                  value={selectedCategoryId}
                  onChange={(e) => {
                    const newCatId = e.target.value;
                    setSelectedCategoryId(newCatId);
                    executeFilter(1, false, undefined, { category_id: newCatId });
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-medium py-2 px-2.5"
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Function Dropdown (Sub Category) */}
            <div className="flex items-center justify-between sm:justify-start gap-2 w-full lg:w-auto">
              <span className="font-bold text-slate-900 dark:text-slate-200 shrink-0 w-16 sm:w-auto">Function</span>
              <div className="relative flex-1 lg:w-36 xl:w-44">
                <Select
                  value={selectedSubCategoryId}
                  onChange={(e) => {
                    const newSubCatId = e.target.value;
                    setSelectedSubCategoryId(newSubCatId);
                    executeFilter(1, false, undefined, { sub_category_id: newSubCatId });
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-medium py-2 px-2.5"
                >
                  <option value="">Select Function</option>
                  {(selectedCategoryId 
                    ? categories.find(c => String(c.id) === selectedCategoryId)?.children || subCategories
                    : subCategories
                  ).map((sc) => (
                    <option key={sc.id} value={sc.id}>{sc.name}</option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Available Stock Checkbox */}
            <div 
              className="flex items-center justify-between sm:justify-start gap-2 cursor-pointer group py-1 sm:py-0 shrink-0" 
              onClick={() => {
                const newInStock = !inStockOnly;
                setInStockOnly(newInStock);
                executeFilter(1, false, undefined, { is_stock: newInStock });
              }}
            >
              <span className="font-bold text-slate-900 dark:text-slate-200 group-hover:text-slate-700 dark:group-hover:text-white transition-colors whitespace-nowrap">Available Stock</span>
              <div className={`w-4 h-4 rounded-sm flex items-center justify-center transition-colors border ${inStockOnly ? 'bg-[#BA478F] border-[#BA478F] text-white' : 'bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-600 group-hover:border-slate-400'}`}>
                 {inStockOnly && <Check size={12} strokeWidth={4} />}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full lg:w-auto shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
            {(selectedBrandId || selectedCategoryId || selectedSubCategoryId || inStockOnly || searchParams?.get("search_text")) && (
              <button
                onClick={() => {
                  setSelectedBrandId("");
                  setSelectedCategoryId("");
                  setSelectedSubCategoryId("");
                  setInStockOnly(false);
                  if (searchParams?.get("search_text")) {
                    router.push(window.location.pathname);
                  }
                  executeFilter(1, false, undefined, {
                    brand_id: "",
                    category_id: "",
                    sub_category_id: "",
                    is_stock: false
                  });
                }}
                title="Clear all filters"
                className="py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold rounded-md transition-colors shadow-2xs shrink-0 flex items-center justify-center gap-1.5 flex-1 lg:flex-none"
              >
                <X size={15} />
                <span>Clear</span>
              </button>
            )}
            <button 
              onClick={handleSearchClick}
              disabled={isFiltering}
              className="bg-[#BA478F] hover:bg-[#9F3375] text-white font-semibold py-2.5 px-6 sm:px-10 rounded-md transition-colors shadow-xs disabled:opacity-60 text-xs sm:text-sm flex-1 lg:flex-none text-center cursor-pointer"
            >
              {isFiltering ? "Filtering..." : "Search"}
            </button>
          </div>
        </div>

        {/* 2. Promotional Banners */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-card">
          <div className="relative aspect-[3/1] rounded-xl overflow-hidden border border-slate-800 group">
            <Image 
              src="/20241108095015_bwx6xhttlt.jpg" 
              alt="Promo Banner 1" 
              fill 
              className="object-cover group-hover:scale-105 transition-transform duration-700" 
            />
          </div>
          <div className="relative aspect-[3/1] rounded-xl overflow-hidden border border-slate-800 group">
            <Image 
              src="/20250121103504_dbpcfzmjhh.jpg" 
              alt="Promo Banner 2" 
              fill 
              className="object-cover group-hover:scale-105 transition-transform duration-700" 
            />
          </div>
        </div>

        {/* 3. Toolbar & View Toggles */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800/50">
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <div className="flex">
              <button 
                onClick={() => {
                  const newSort = sortBy === 'latest' ? '' : 'latest';
                  setSortBy(newSort);
                  executeFilter(1, false, newSort);
                }}
                className={`px-3 sm:px-5 py-2 text-xs sm:text-sm font-medium border border-slate-200 dark:border-slate-700 rounded-l-sm transition-colors shadow-sm ${
                  sortBy === 'latest' || (!sortBy && defaultSortBy !== 'best_selling')
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 bg-white dark:bg-slate-900'
                }`}
              >
                Latest
              </button>
              <button 
                onClick={() => {
                  const newSort = sortBy === 'best_selling' ? '' : 'best_selling';
                  setSortBy(newSort);
                  executeFilter(1, false, newSort);
                }}
                className={`px-3 sm:px-5 py-2 text-xs sm:text-sm font-bold border border-slate-200 dark:border-slate-700 border-l-0 transition-colors shadow-sm ${
                  sortBy === 'best_selling'
                    ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-extrabold border-amber-300 dark:border-amber-500/40'
                    : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 bg-white dark:bg-slate-900'
                }`}
              >
                Top Sales
              </button>
            </div>
            
            <div className="relative flex-1 lg:flex-none lg:w-48">
              <Select
                value={sortBy === 'price_low_to_high' || sortBy === 'price_high_to_low' ? sortBy : ''}
                onChange={(e) => {
                  const newSort = e.target.value;
                  setSortBy(newSort);
                  executeFilter(1, false, newSort);
                }}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-medium"
              >
                <option value="">Price Sort</option>
                <option value="price_low_to_high">Price: Low to High</option>
                <option value="price_high_to_low">Price: High to Low</option>
              </Select>
            </div>

            <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-sm overflow-hidden h-[36px] sm:h-[38px] shrink-0 bg-white dark:bg-slate-900 shadow-sm">
              <button 
                className={`w-9 sm:w-10 h-full flex items-center justify-center transition-colors ${viewMode === 'list' ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                onClick={() => setViewMode('list')}
                title="List View"
              >
                <List size={16} />
              </button>
              <button 
                className={`w-9 sm:w-10 h-full flex items-center justify-center border-l border-slate-200 dark:border-slate-700 transition-colors ${viewMode === 'grid' ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                onClick={() => setViewMode('grid')}
                title="Grid View"
              >
                <LayoutGrid size={16} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full lg:w-auto">
            <button 
              onClick={() => {
                if (selectedRows.length === 0) return;
                if (!isLoggedIn) {
                  import("react-hot-toast").then((mod) => {
                    mod.toast.error("Please log in to add items to cart", {
                      style: { background: "#0f172a", color: "#f8fafc", border: "1px solid #1e293b" },
                    });
                  });
                  router.push("/login");
                  return;
                }
                let added = 0;
                selectedRows.forEach(id => {
                  const p = productsList.find(x => x.id === id);
                  if (p) {
                    const qty = quantities[p.id] || 1;
                    useCartStore.getState().addToCart({
                      id: p.id.toString(),
                      product_id: p.id,
                      product_variant_id: p.product_variant_id,
                      name: p.name,
                      price: p.price || 0,
                      image: p.image,
                      brand: p.brand,
                      sku: p.barcode,
                      slug_url: p.slug_url,
                      quantity: qty
                    });
                    added += qty;
                  }
                });
                setSelectedRows([]);
              }}
              className="bg-[#BA478F] hover:bg-[#9F3375] text-white font-semibold py-2 px-2 sm:px-6 text-xs sm:text-sm transition-colors shadow-2xs rounded-md flex-1 sm:flex-none text-center whitespace-nowrap cursor-pointer"
            >
              Add to Cart
            </button>
            <button 
              onClick={() => {
                if (selectedRows.length === 0) return;
                let added = 0;
                selectedRows.forEach(id => {
                  const p = productsList.find(x => x.id === id);
                  if (p && !isInWishlist(p.id.toString())) {
                    toggleWishlist({ id: p.id.toString(), name: p.name, price: p.price || 0, image: p.image, brand: p.brand, sku: p.barcode, slug_url: p.slug_url });
                    added++;
                  }
                });
                if (added > 0) {
                  import("react-hot-toast").then((mod) => {
                    mod.toast.success(`Added ${added} items to wishlist`, { style: { background: '#0f172a', color: '#f8fafc', border: '1px solid #1e293b' }, iconTheme: { primary: '#BA478F', secondary: '#fff' }});
                  });
                }
                setSelectedRows([]);
              }}
              className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium py-2 px-2 sm:px-6 text-xs sm:text-sm transition-colors rounded-md border border-slate-200 dark:border-slate-700 flex-1 sm:flex-none text-center whitespace-nowrap shadow-2xs"
            >
              Wishlist
            </button>
            <button className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium py-2 px-2 sm:px-6 text-xs sm:text-sm transition-colors rounded-md border border-slate-200 dark:border-slate-700 flex-1 sm:flex-none text-center whitespace-nowrap shadow-2xs">
              Cancel
            </button>
          </div>
        </div>

        {/* 4. Data Table (List View) */}
        {viewMode === 'list' && (
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-sm bg-white dark:bg-slate-900/50 shadow-2xs">
            <table className="w-full text-sm text-left text-slate-700 dark:text-slate-300 whitespace-nowrap min-w-[800px]" suppressHydrationWarning>
              <thead className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 uppercase">
                <tr>
                  <th className="p-4 w-12 text-center border-r border-slate-200 dark:border-slate-800/60">
                    <div 
                      className={`w-4 h-4 rounded-sm flex items-center justify-center transition-colors border mx-auto cursor-pointer ${selectedRows.length === visibleProducts.length && visibleProducts.length > 0 ? 'bg-[#BA478F] border-[#BA478F] text-white' : 'bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-600'}`}
                      onClick={toggleSelectAll}
                    >
                      {selectedRows.length === visibleProducts.length && visibleProducts.length > 0 && <Check size={12} strokeWidth={4} />}
                    </div>
                  </th>
                  <th className="p-4 text-center border-r border-slate-200 dark:border-slate-800/60 w-36">Image</th>
                  <th className="p-4 text-center border-r border-slate-200 dark:border-slate-800/60 w-44">Product Code</th>
                  <th className="p-4 border-r border-slate-200 dark:border-slate-800/60">Product Name</th>
                  <th className="p-4 text-center border-r border-slate-200 dark:border-slate-800/60 w-36">Retail Price</th>
                  <th className="p-4 text-center w-36">Select</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {visibleProducts.map((p) => (
                  <tr key={p.id} onClick={() => router.push(`/product/${p.slug_url || p.id}`)} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer">
                    <td className="p-4 text-center border-r border-slate-200 dark:border-slate-800/60" onClick={(e) => e.stopPropagation()}>
                      <div 
                        className={`w-4 h-4 rounded-sm flex items-center justify-center transition-colors border mx-auto cursor-pointer ${selectedRows.includes(p.id) ? 'bg-[#BA478F] border-[#BA478F] text-white' : 'bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-600 hover:border-slate-400'}`}
                        onClick={() => toggleSelectRow(p.id)}
                      >
                        {selectedRows.includes(p.id) && <Check size={12} strokeWidth={4} />}
                      </div>
                    </td>
                    
                    <td className="p-4 text-center border-r border-slate-200 dark:border-slate-800/60">
                       <div className="w-20 h-20 mx-auto relative bg-white rounded-md p-1 border border-slate-200 group cursor-crosshair">
                         <div className="w-full h-full overflow-hidden rounded-sm relative">
                           <Image src={p.image} alt={p.name} width={80} height={80} unoptimized className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                         </div>
                         
                         <div className="fixed inset-0 z-[100] flex items-center justify-center opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 pointer-events-none bg-slate-950/60 backdrop-blur-[2px]">
                           <div className="bg-white p-3 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-slate-200 w-[320px] h-[320px] sm:w-[480px] sm:h-[480px] flex items-center justify-center relative transform scale-90 group-hover:scale-100 transition-transform duration-500 ease-out">
                             <Image src={p.image} alt={p.name} width={480} height={480} unoptimized className="w-full h-full object-contain rounded-xl" />
                             
                             <div className="absolute bottom-4 left-4 right-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl p-4 border border-slate-200 dark:border-slate-700/50 shadow-2xl transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                               <p className="text-slate-900 dark:text-white text-[15px] font-black leading-tight whitespace-normal text-left">{p.name}</p>
                               <div className="flex items-center mt-3">
                                 <p className="text-[#BA478F] text-xs font-bold uppercase tracking-widest">{p.brand}</p>
                               </div>
                             </div>
                           </div>
                         </div>
                       </div>
                    </td>
                    
                    <td className="p-4 text-center border-r border-slate-200 dark:border-slate-800/60">
                      {isLoggedIn ? (
                        <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">{p.barcode}</span>
                      ) : (
                        <Link href="/login" className="inline-block bg-[#BA478F] hover:bg-[#9F3375] text-white font-semibold py-1.5 px-5 text-[11px] rounded-full transition-colors shadow-2xs">
                          Log In
                        </Link>
                      )}
                    </td>
                    
                    <td className="p-4 border-r border-slate-200 dark:border-slate-800/60 whitespace-normal">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-slate-900 dark:text-slate-200 text-sm">
                          {p.brand ? <span className="text-[#BA478F] font-bold mr-1">[{p.brand}]</span> : null}
                          <span className="font-medium text-slate-600 dark:text-slate-300">{p.name}</span>
                        </span>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">In Stock: {p.total_stock ?? 0}</span>
                          </div>

                          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 rounded-md overflow-hidden h-7 shadow-sm" onClick={(e) => e.stopPropagation()}>
                            <button 
                              onClick={() => handleQuantityChange(p.id, -1)}
                              className="w-7 h-full flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
                            >
                              <Minus size={12} strokeWidth={2.5} />
                            </button>
                            <div className="w-10 h-full flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-950/50 border-x border-slate-200 dark:border-slate-800">
                              {quantities[p.id] || 1}
                            </div>
                            <button 
                              onClick={() => handleQuantityChange(p.id, 1)}
                              className="w-7 h-full flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
                            >
                              <Plus size={12} strokeWidth={2.5} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-4 text-center border-r border-slate-200 dark:border-slate-800/60" onClick={(e) => e.stopPropagation()}>
                      {isLoggedIn ? (
                        <span className="font-extrabold text-[#f14e60] dark:text-rose-400 text-sm">
                          ৳{Number(p.price || 2450).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </span>
                      ) : (
                        <Link href="/login" className="inline-block bg-[#f14e60] hover:bg-rose-600 text-white font-bold py-1.5 px-5 text-[11px] rounded-full transition-colors shadow-sm">
                          Log In
                        </Link>
                      )}
                    </td>
                    
                    <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex flex-col gap-2" suppressHydrationWarning>
                         <button 
                           onClick={() => {
                             if (!isLoggedIn) {
                               import("react-hot-toast").then((mod) => {
                                 mod.toast.error("Please log in to add items to cart", {
                                   style: { background: "#0f172a", color: "#f8fafc", border: "1px solid #1e293b" },
                                 });
                               });
                               router.push("/login");
                               return;
                             }
                             const qty = quantities[p.id] || 1;
                             useCartStore.getState().addToCart({
                               id: p.id.toString(),
                               product_id: p.id,
                               product_variant_id: p.product_variant_id,
                               name: p.name,
                               price: p.price || 0,
                               image: p.image,
                               brand: p.brand,
                               sku: p.barcode,
                               slug_url: p.slug_url,
                               quantity: qty
                             });
                           }}
                           className="bg-[#BA478F] hover:bg-[#9F3375] text-white text-xs font-semibold py-1.5 px-3 rounded-md transition-colors w-full shadow-2xs cursor-pointer"
                         >
                           Add to Cart
                         </button>
                         <button 
                           onClick={(e) => {
                             e.stopPropagation();
                             toggleWishlist({ id: p.id.toString(), productId: p.id, name: p.name, price: p.price || 0, image: p.image, brand: p.brand, sku: p.barcode, slug_url: p.slug_url });
                           }}
                           className={`text-xs font-medium py-1.5 px-3 rounded-md transition-colors w-full shadow-2xs border ${
                             isInWishlist(p.id.toString())
                               ? 'bg-[#FDF2F8] text-[#9F3375] border-[#FBCFE8]'
                               : 'bg-transparent border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                           }`}
                         >
                           {isInWishlist(p.id.toString()) ? 'Saved' : 'Wishlist'}
                         </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {visibleProducts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500 dark:text-slate-400">
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. Data Grid (Grid View) */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-card">
            {visibleProducts.map((p) => (
              <div key={p.id} onClick={() => router.push(`/product/${p.slug_url || p.id}`)} className="bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/60 hover:border-slate-300 transition-colors rounded-lg p-4 flex flex-col relative group/card shadow-2xs hover:shadow-xs cursor-pointer">
                
                {/* Checkbox */}
                <div className="absolute top-4 right-4 z-10" onClick={(e) => e.stopPropagation()}>
                  <div 
                    className={`w-5 h-5 rounded flex items-center justify-center transition-colors border cursor-pointer shadow-2xs ${selectedRows.includes(p.id) ? 'bg-[#BA478F] border-[#BA478F] text-white' : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 hover:border-slate-400'}`}
                    onClick={() => toggleSelectRow(p.id)}
                  >
                    {selectedRows.includes(p.id) && <Check size={14} strokeWidth={4} />}
                  </div>
                </div>

                {/* Image Section */}
                <div className="w-full aspect-square relative bg-neutral-50 rounded-lg p-2 border border-slate-200/80 mb-4 group cursor-pointer overflow-hidden">
                   <Image src={p.image} alt={p.name} width={300} height={300} unoptimized className="w-full h-full object-contain rounded-md transition-transform duration-300 group-hover:scale-105" />
                   
                   {/* Full Screen Hover Popover */}
                   <div className="fixed inset-0 z-[100] flex items-center justify-center opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 pointer-events-none bg-slate-950/60 backdrop-blur-[2px]">
                     <div className="bg-white p-3 rounded-2xl shadow-xl border border-slate-200 w-[320px] h-[320px] sm:w-[480px] sm:h-[480px] flex items-center justify-center relative transform scale-95 group-hover:scale-100 transition-transform duration-300 ease-out">
                       <Image src={p.image} alt={p.name} width={480} height={480} unoptimized className="w-full h-full object-contain rounded-xl" />
                       
                       {/* Product details inside the popover */}
                       <div className="absolute bottom-4 left-4 right-4 bg-slate-900/95 backdrop-blur-md rounded-xl p-4 border border-slate-700/50 shadow-2xl transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 delay-75">
                         <p className="text-white text-[15px] font-bold leading-tight whitespace-normal text-left">{p.name}</p>
                         <div className="flex items-center mt-3">
                           <p className="text-[#BA478F] text-xs font-bold uppercase tracking-widest">{p.brand}</p>
                         </div>
                       </div>
                     </div>
                   </div>
                </div>

                {/* Content */}
                <div className="flex flex-col flex-grow gap-3">
                  {/* Product Name */}
                  <div className="min-h-[38px]">
                    <span className="font-bold text-slate-900 dark:text-slate-200 text-[13px] leading-snug line-clamp-2">
                      {p.brand ? <span className="text-[#BA478F] font-bold mr-1">[{p.brand}]</span> : null}
                      {p.name}
                    </span>
                  </div>

                  {/* Product Code & Price */}
                  <div className="grid grid-cols-2 gap-2 text-xs" onClick={(e) => e.stopPropagation()}>
                    <div className="bg-slate-50 dark:bg-slate-900/40 p-1.5 2xl:p-2 rounded-md border border-slate-200 dark:border-slate-800/60 flex flex-col items-center justify-center gap-1">
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[8px] 2xl:text-[9px] whitespace-nowrap">Product Code</span>
                      {isLoggedIn ? (
                        <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300 truncate max-w-full">{p.barcode}</span>
                      ) : (
                        <Link href="/login" className="bg-[#BA478F] hover:bg-[#9F3375] text-white font-semibold py-1 px-2 text-[9px] rounded-md transition-colors w-full text-center whitespace-nowrap">Log In</Link>
                      )}
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/40 p-1.5 2xl:p-2 rounded-md border border-slate-200 dark:border-slate-800/60 flex flex-col items-center justify-center gap-1">
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[8px] 2xl:text-[9px] whitespace-nowrap">Retail Price</span>
                      {isLoggedIn ? (
                        <span className="font-bold text-[#BA478F] text-xs 2xl:text-sm">
                          ৳{Number(p.price || 2450).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </span>
                      ) : (
                        <Link href="/login" className="bg-[#BA478F] hover:bg-[#9F3375] text-white font-semibold py-1 px-2 text-[9px] rounded-md transition-colors w-full text-center whitespace-nowrap">Log In</Link>
                      )}
                    </div>
                  </div>

                  {/* Stock & Quantity */}
                  <div className="flex flex-col gap-3 mt-auto pt-3 border-t border-slate-200 dark:border-slate-800/50">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-2xs shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                        <span className="text-[9px] font-bold uppercase tracking-wider whitespace-nowrap">In Stock: {p.total_stock ?? 0}</span>
                      </div>

                      <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 rounded-md overflow-hidden h-[30px] shadow-2xs shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => handleQuantityChange(p.id, -1)}
                          className="w-[30px] h-full flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Minus size={12} strokeWidth={2.5} />
                        </button>
                        <div className="w-[38px] h-full flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-950/50 border-x border-slate-200 dark:border-slate-800">
                          {quantities[p.id] || 1}
                        </div>
                        <button 
                          onClick={() => handleQuantityChange(p.id, 1)}
                          className="w-[30px] h-full flex items-center justify-center text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Plus size={12} strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2 mt-1" onClick={(e) => e.stopPropagation()}>
                       <button 
                         onClick={(e) => {
                           e.stopPropagation();
                           if (!isLoggedIn) {
                             import("react-hot-toast").then((mod) => {
                               mod.toast.error("Please log in to add items to cart", {
                                 style: { background: "#0f172a", color: "#f8fafc", border: "1px solid #1e293b" },
                               });
                             });
                             router.push("/login");
                             return;
                           }
                           const qty = quantities[p.id] || 1;
                           useCartStore.getState().addToCart({
                             id: p.id.toString(),
                             product_id: p.id,
                             product_variant_id: p.product_variant_id,
                             name: p.name,
                             price: p.price || 0,
                             image: p.image,
                             brand: p.brand,
                             sku: p.barcode,
                             slug_url: p.slug_url,
                             quantity: qty
                           });

                         }}
                         className="bg-[#BA478F] hover:bg-[#9F3375] text-white text-[11px] font-semibold py-2 px-3 rounded-md transition-colors shadow-2xs cursor-pointer"
                       >
                         Add to Cart
                       </button>
                       <button 
                         onClick={(e) => {
                           e.stopPropagation();
                           toggleWishlist({ id: p.id.toString(), productId: p.id, name: p.name, price: p.price || 0, image: p.image, brand: p.brand, sku: p.barcode, slug_url: p.slug_url });
                         }}
                         className={`text-[11px] font-medium py-2 px-3 rounded-md transition-colors shadow-2xs border ${
                           isInWishlist(p.id.toString())
                             ? 'bg-[#FDF2F8] text-[#9F3375] border-[#FBCFE8]'
                             : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                         }`}
                       >
                         {isInWishlist(p.id.toString()) ? 'Saved' : 'Wishlist'}
                       </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {visibleProducts.length === 0 && (
              <div className="col-span-full text-center py-20 bg-slate-900/30 rounded-xl border border-slate-800 border-dashed">
                <LayoutGrid className="mx-auto text-slate-600 mb-4" size={32} />
                <p className="text-slate-400 font-medium">No products found.</p>
              </div>
            )}
          </div>
        )}

        {/* Load More Section */}
        {hasMore && (
          <div className="mt-12 flex flex-col items-center justify-center relative z-10">
            <div className="absolute top-8 left-0 w-full h-px bg-slate-200 dark:bg-slate-800 -z-10" />
            
            <button 
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="flex items-center gap-2.5 px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-[#BA478F] rounded-full text-slate-900 dark:text-slate-200 hover:text-[#BA478F] font-semibold text-sm transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
            >
              <span className="tracking-wide">
                {isLoadingMore ? "Loading..." : "Load More Products"}
              </span>
              <ChevronDown size={15} className={`text-slate-500 ${isLoadingMore ? 'animate-spin' : ''}`} />
            </button>
            
            <p className="mt-4 text-[11px] text-slate-500 font-medium uppercase tracking-wider">
              Showing {visibleProducts.length} products
            </p>
          </div>
        )}
        {/* 6. Brand Carousel */}
        <BrandCarousel />

      </div>

      <InquiryModal
        isOpen={isInquiryModalOpen}
        onClose={() => setIsInquiryModalOpen(false)}
        product={selectedProduct as any}
      />
    </section>
  );
}
