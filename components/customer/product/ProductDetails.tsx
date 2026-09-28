"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, notFound } from "next/navigation";
import { ChevronRight, ChevronLeft, Heart, Minus, Plus, Share2, Star, Truck, ShieldCheck, CheckCircle2, ChevronDown, Loader2, Maximize2, X, Youtube } from "lucide-react";
import { useCartStore } from "@/lib/store/cartStore";
import { useWishlistStore } from "@/lib/store/wishlistStore";
import { useCustomerAuth } from "@/lib/hooks/useCustomerAuth";
import { getCustomerProductDetails, getBrandProducts, getCategoryProducts, ProductDetail, Product } from "@/lib/api/products";
import { trackViewContent } from "@/lib/utils/analytics";

export function ProductDetails({
  slugUrl,
  id,
  initialData,
}: {
  slugUrl?: string;
  id?: string;
  initialData?: ProductDetail | null;
}) {
  const router = useRouter();
  const activeSlug = slugUrl || id || "";
  const { isLoggedIn } = useCustomerAuth();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [loading, setLoading] = useState(!initialData);
  const [productData, setProductData] = useState<ProductDetail | null>(initialData || null);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(
    initialData?.variants && initialData.variants.length > 0 ? initialData.variants[0].id : null
  );
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [brandProducts, setBrandProducts] = useState<Product[]>([]);
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const brandScrollRef = useRef<HTMLDivElement>(null);
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  const scrollSlider = (ref: React.RefObject<HTMLDivElement | null>, direction: "left" | "right") => {
    if (ref.current) {
      const scrollAmount = direction === "left" ? -350 : 350;
      ref.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const addToCart = useCartStore((state) => state.addToCart);
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const wishlistItems = useWishlistStore((state) => state.items);
  const isInWishlist = wishlistItems.some(
    (i) =>
      String(i.id) === String(productData?.id) ||
      (i.productId && String(i.productId) === String(productData?.id)) ||
      String(i.id) === String(activeSlug)
  );

  const [notFoundState, setNotFoundState] = useState(false);

  useEffect(() => {
    if (!activeSlug) return;
    if (initialData && (initialData.slug_url === activeSlug || String(initialData.id) === activeSlug)) {
      setProductData(initialData);
      if (initialData.variants && initialData.variants.length > 0) {
        setSelectedVariantId((prev) => prev ?? initialData.variants[0].id);
      }
      setLoading(false);
      return;
    }
    setLoading(true);
    setNotFoundState(false);
    getCustomerProductDetails(activeSlug)
      .then((res) => {
        if (res.success && res.resources) {
          setProductData(res.resources);
          if (res.resources.variants && res.resources.variants.length > 0) {
            setSelectedVariantId(res.resources.variants[0].id);
          }
        } else {
          setNotFoundState(true);
        }
      })
      .catch(() => {
        setNotFoundState(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [activeSlug, initialData]);

  // Track Meta Pixel ViewContent event
  useEffect(() => {
    if (productData && productData.id) {
      const catName = typeof productData.category === "object" ? productData.category?.name : (productData.category || "");
      const brandName = typeof productData.brand === "object" ? productData.brand?.name : (productData.brand || "");
      trackViewContent({
        id: productData.id,
        name: productData.name,
        price: Number(productData.price || (productData as any).sale_price || (productData as any).regular_price || 0),
        category: catName,
        brand: brandName,
      });
    }
  }, [productData?.id]);

  const brandId = typeof productData?.brand === "object" ? productData?.brand?.id : null;
  const categoryId = typeof productData?.category === "object" ? productData?.category?.id : null;

  useEffect(() => {
    if (!brandId) return;
    getBrandProducts(brandId, { per_page: 20, page: 1 }).then((res) => {
      if (res.success && Array.isArray(res.resources)) {
        setBrandProducts(res.resources);
      }
    });
  }, [brandId]);

  useEffect(() => {
    if (!categoryId) return;
    getCategoryProducts(categoryId, { per_page: 20, page: 1 }).then((res) => {
      if (res.success && Array.isArray(res.resources)) {
        setCategoryProducts(res.resources);
      }
    });
  }, [categoryId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-24 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-rose-500" />
      </div>
    );
  }

  if (notFoundState || !productData) {
    notFound();
  }

  const brandName = typeof productData.brand === "object" ? productData.brand?.name : (productData.brand || "");
  const categoryName = typeof productData.category === "object" ? productData.category?.name : (productData.category || "");
  const productName = productData.name;

  const selectedVariant = productData.variants?.find((v) => v.id === selectedVariantId) || productData.variants?.[0];

  const barcodeStr = selectedVariant?.sku || productData.barcode || productData.sku || "N/A";
  const stockCount = selectedVariant ? selectedVariant.stock : (productData.total_stock !== undefined ? productData.total_stock : 0);
  
  const rawPrice = selectedVariant 
    ? (selectedVariant.discount_price ?? selectedVariant.price)
    : (productData.price ?? productData.min_price ?? 0);
  const numericPrice = typeof rawPrice === "string" ? parseFloat(rawPrice) || 0 : Number(rawPrice) || 0;
  const retailPriceFormatted = `৳${numericPrice.toLocaleString("en-US", { minimumFractionDigits: 0 })}`;

  const rawImages: string[] = [];
  if (productData.thumbnail) {
    rawImages.push(productData.thumbnail);
  }
  if (productData.images && Array.isArray(productData.images)) {
    productData.images.forEach((img) => {
      if (img && !rawImages.includes(img)) {
        rawImages.push(img);
      }
    });
  }
  const images = rawImages.length > 0 ? rawImages : ["/placeholder.png"];

  const selectedImage = images[selectedImageIndex] || images[0];

  const description = productData.description || "";
  const keyIngredientSpec = productData.specifications?.find(
    (s) => s.attribute_name && s.attribute_name.trim().toLowerCase() === "key ingredient"
  )?.value;
  const ingredients = keyIngredientSpec || productData.ingredients || "";
  const productIdStr = productData.id?.toString() || activeSlug;
  const productSlugUrl = productData.slug_url || activeSlug;

  const tabs = [
    { key: "description", label: "Product Info" },
    { key: "ingredients", label: "ingredients" },
    { key: "shipping", label: "shipping" },
  ];

  const otherBrandProducts = brandProducts.filter((p) => p.id !== productData?.id);
  const otherCategoryProducts = categoryProducts.filter((p) => p.id !== productData?.id);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-24 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-rose-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 mt-1.5 sm:mt-2">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-900 font-medium mb-1.5 sm:mb-2 overflow-x-auto whitespace-nowrap">
        <Link href="/" className="hover:text-rose-500 transition-colors">Home</Link>
        <ChevronRight size={14} className="text-slate-400" />
        <Link href="/" className="hover:text-rose-500 transition-colors">{categoryName}</Link>
        <ChevronRight size={14} className="text-slate-400" />
        <Link href="/" className="hover:text-rose-500 transition-colors">{brandName}</Link>
        <ChevronRight size={14} className="text-slate-400" />
        <span className="text-slate-500">{productName}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-4">
        {/* Left: Image Gallery */}
        <div className="w-full lg:w-[35%] xl:w-[32%] flex flex-col gap-4">
          <div 
            className="relative w-full aspect-square bg-white rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-center group overflow-hidden cursor-zoom-in"
            onClick={() => setIsZoomModalOpen(true)}
          >
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-100 to-white -z-10 dark:from-slate-900 dark:to-slate-950" />
            
            <img 
              src={selectedImage} 
              alt={productName} 
              className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal transition-transform duration-700 group-hover:scale-105" 
            />
            <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-slate-800/90 p-2.5 rounded-full shadow-sm text-slate-500 dark:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
              <Maximize2 size={20} />
            </div>
          </div>
          
          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {images.map((img, i) => (
                <div 
                  key={i} 
                  onClick={() => setSelectedImageIndex(i)}
                  className={`aspect-square rounded-xl bg-white p-2 border cursor-pointer transition-all ${i === selectedImageIndex ? 'border-slate-900 ring-1 ring-slate-900 dark:border-white dark:ring-white shadow-sm' : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-500'}`}
                >
                  <img 
                    src={img} 
                    alt={`${productName} - view ${i + 1}`}
                    className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal opacity-80 hover:opacity-100 transition-opacity" 
                  />
                </div>
              ))}
            </div>
          )}

          {/* YouTube Video Section */}
          <div className="mt-4 w-full aspect-video bg-slate-900 rounded-2xl overflow-hidden relative group shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
               <Youtube size={48} className="text-white/80 group-hover:text-rose-500 group-hover:scale-110 transition-all duration-300 drop-shadow-lg" />
            </div>
            {/* Embedded YouTube Player Placeholder */}
            <iframe 
              width="100%" 
              height="100%" 
              src="https://www.youtube.com/embed/5D2-yS1p3Q0?si=O98z7u-46m6F0K_9&controls=0&mute=1&autoplay=1&loop=1" 
              title={`${productName} Video`} 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
              className="opacity-60 group-hover:opacity-100 transition-opacity duration-300 pointer-events-auto"
            ></iframe>
          </div>
        </div>

        {/* Right: Product Info */}
        <div className="w-full lg:w-[65%] xl:w-[68%] flex flex-col pt-2 lg:pt-0">
          <div className="mb-2">
            <span className="text-slate-900 dark:text-white font-bold uppercase tracking-wider text-lg sm:text-xl">{brandName}</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-black text-slate-900 dark:text-slate-100 leading-tight mb-6 tracking-tight">
            {productName}
          </h1>

          {/* Variants Selector (only if product has more than 1 variant) */}
          {productData?.variants && productData.variants.length > 1 && (
            <div className="mb-6 p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col gap-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Select Variant / Option:
                </span>
                {selectedVariant && (
                  <span className="text-xs font-semibold text-rose-500">
                    {Object.values(selectedVariant.attributes || {}).join(" / ") || selectedVariant.sku}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2.5">
                {productData.variants.map((variant) => {
                  const isSelected = selectedVariantId === variant.id;
                  const attrText = Object.values(variant.attributes || {}).join(" / ") || variant.sku;
                  const variantPrice = Number(variant.discount_price ?? variant.price);
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => setSelectedVariantId(variant.id)}
                      className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                        isSelected
                          ? "bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/25 scale-[1.02]"
                          : "bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-rose-400 dark:hover:border-rose-500"
                      }`}
                    >
                      <span>{attrText}</span>
                      <span className={`text-[11px] font-extrabold ${isSelected ? "text-rose-100" : "text-slate-500 dark:text-slate-400"}`}>
                        {isLoggedIn ? `৳${variantPrice.toLocaleString()}` : "Log In"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Price, Stock, & Quantity Row */}
          <div className="flex flex-wrap items-center gap-6 lg:gap-10 xl:gap-12 mb-8 mt-2">
            <div className="flex items-center gap-8 lg:gap-12">
              <span className="text-slate-500 font-bold uppercase tracking-wider text-sm w-16">Price</span>
              {isLoggedIn ? (
                <span className="text-2xl sm:text-3xl font-extrabold text-[#f14e60] dark:text-rose-400">
                  {retailPriceFormatted}
                </span>
              ) : (
                <Link href="/login" className="bg-[#f14e60] hover:bg-rose-600 text-white font-bold py-1.5 px-6 rounded-full transition-colors text-sm shadow-sm">
                  Log In
                </Link>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-6">
              {/* Stock Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 shadow-sm">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-emerald-400 font-bold uppercase tracking-wider text-[13px]">In Stock: {stockCount}</span>
              </div>
              
              {/* Quantity Selector */}
              <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 rounded-xl overflow-hidden h-[42px] shadow-sm shrink-0">
                 <button 
                   onClick={() => setQuantity(q => Math.max(1, q - 1))}
                   className="w-[42px] h-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                 >
                   <Minus size={16} strokeWidth={2.5} />
                 </button>
                 <div className="w-[50px] h-full flex items-center justify-center text-base font-bold text-slate-900 dark:text-slate-200 bg-slate-50 dark:bg-slate-950/50 border-x border-slate-200 dark:border-slate-800">
                   {quantity}
                 </div>
                 <button 
                   onClick={() => setQuantity(q => q + 1)}
                   className="w-[42px] h-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                 >
                   <Plus size={16} strokeWidth={2.5} />
                 </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
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
                const cartItemId = selectedVariant ? `${productIdStr}-var-${selectedVariant.id}` : productIdStr;
                const itemDisplayName = (selectedVariant && Object.values(selectedVariant.attributes || {}).length > 0)
                  ? `${productName} (${Object.values(selectedVariant.attributes || {}).join(" / ")})`
                  : productName;

                addToCart({
                  id: cartItemId,
                  product_id: productData.id,
                  product_variant_id: selectedVariant ? selectedVariant.id : productData.variants?.[0]?.id,
                  name: itemDisplayName,
                  price: numericPrice,
                  image: images[0],
                  brand: brandName,
                  sku: barcodeStr,
                  slug_url: productSlugUrl,
                  quantity: quantity,
                } as any);
              }}
              className="flex-1 bg-[#f14e60] hover:bg-rose-600 text-white font-bold h-12 rounded-sm transition-all text-base shadow-sm cursor-pointer"
            >
              Add to Cart
            </button>
            <button 
              onClick={() => {
                const cartItemId = selectedVariant ? `${productIdStr}-var-${selectedVariant.id}` : productIdStr;
                const itemDisplayName = (selectedVariant && Object.values(selectedVariant.attributes || {}).length > 0)
                  ? `${productName} (${Object.values(selectedVariant.attributes || {}).join(" / ")})`
                  : productName;

                toggleWishlist({
                  id: cartItemId,
                  productId: productData.id,
                  name: itemDisplayName,
                  price: numericPrice,
                  image: images[0],
                  brand: brandName,
                  sku: barcodeStr,
                  slug_url: productSlugUrl,
                } as any);
              }}
              className={`flex-1 font-bold h-12 rounded-sm border transition-colors text-base shadow-sm cursor-pointer ${
                isInWishlist 
                  ? 'bg-rose-500/10 text-rose-500 border-rose-500 hover:bg-rose-500/20' 
                  : 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
              }`}
            >
              {isInWishlist ? 'Saved to Wishlist' : 'Wishlist'}
            </button>
          </div>

          {/* Barcode Row */}
          <div className="flex items-center gap-12 py-4 border-b border-slate-200 dark:border-slate-800 mb-6">
            <span className="text-slate-500 font-bold uppercase tracking-wider text-sm w-24">SKU</span>
            <span className="text-slate-700 dark:text-slate-300 text-sm font-mono font-medium">{barcodeStr}</span>
          </div>

          {/* More from this brand (Slider) */}
          {otherBrandProducts.length > 0 && (
            <div className="mt-8 w-full border-t border-slate-200 dark:border-slate-800 pt-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">More from {brandName}</h3>
                <div className="flex items-center gap-2">
                  <button onClick={() => scrollSlider(brandScrollRef, "left")} className="p-2 sm:p-2.5 rounded-full border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                    <ChevronLeft size={18} />
                  </button>
                  <button onClick={() => scrollSlider(brandScrollRef, "right")} className="p-2 sm:p-2.5 rounded-full border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
              
              <div 
                ref={brandScrollRef}
                className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory pb-4 [&::-webkit-scrollbar]:hidden" 
                style={{ scrollbarWidth: 'none' }}
              >
                {otherBrandProducts.map((bProd) => (
                  <Link 
                    key={bProd.id} 
                    href={`/product/${bProd.slug_url || bProd.slug}`}
                    className="w-32 sm:w-40 flex flex-col gap-3 shrink-0 group snap-start"
                  >
                    <div className="w-full aspect-square bg-white rounded-xl p-3 border border-slate-200 dark:border-slate-800 transition-colors group-hover:border-slate-900 dark:group-hover:border-slate-500 overflow-hidden shadow-sm">
                      <img 
                        src={bProd.thumbnail || images[0]} 
                        alt={bProd.name}
                        className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal transition-transform duration-500 group-hover:scale-110" 
                      />
                    </div>
                    <div className="text-xs sm:text-sm text-slate-900 dark:text-slate-300 font-bold truncate w-full text-left group-hover:text-rose-500 transition-colors" title={bProd.name}>
                      {bProd.name}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Similar Category Products (Slider) */}
          {otherCategoryProducts.length > 0 && (
            <div className="mt-8 w-full border-t border-slate-200 dark:border-slate-800 pt-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Similar in {categoryName}</h3>
                <div className="flex items-center gap-2">
                  <button onClick={() => scrollSlider(categoryScrollRef, "left")} className="p-2 sm:p-2.5 rounded-full border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                    <ChevronLeft size={18} />
                  </button>
                  <button onClick={() => scrollSlider(categoryScrollRef, "right")} className="p-2 sm:p-2.5 rounded-full border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
              
              <div 
                ref={categoryScrollRef}
                className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory pb-4 [&::-webkit-scrollbar]:hidden" 
                style={{ scrollbarWidth: 'none' }}
              >
                {otherCategoryProducts.map((cProd) => (
                  <Link 
                    key={cProd.id} 
                    href={`/product/${cProd.slug_url || cProd.slug}`}
                    className="w-32 sm:w-40 flex flex-col gap-3 shrink-0 group snap-start"
                  >
                    <div className="w-full aspect-square bg-white rounded-xl p-3 border border-slate-200 dark:border-slate-800 transition-colors group-hover:border-slate-900 dark:group-hover:border-slate-500 overflow-hidden shadow-sm">
                      <img 
                        src={cProd.thumbnail || images[0]} 
                        alt={cProd.name}
                        className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal transition-transform duration-500 group-hover:scale-110" 
                      />
                    </div>
                    <div className="text-xs sm:text-sm text-slate-900 dark:text-slate-300 font-bold truncate w-full text-left group-hover:text-rose-500 transition-colors" title={cProd.name}>
                      {cProd.name}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>


      {/* Tabs Section */}
      <div className="mt-16 lg:mt-24 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 rounded-3xl overflow-hidden shadow-sm dark:shadow-none">
        <div className="flex flex-wrap border-b border-slate-200 dark:border-slate-800">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-8 py-5 text-sm font-bold uppercase tracking-wider transition-colors relative ${activeTab === tab.key ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-rose-500 rounded-t-full shadow-[0_-5px_15px_rgba(244,63,94,0.5)]" />
              )}
            </button>
          ))}
        </div>
        
        <div className="p-6 md:p-10 min-h-[250px]">
          {activeTab === "description" && (
            <div className="prose dark:prose-invert max-w-4xl prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-p:leading-relaxed prose-ul:list-disc prose-ul:ml-5 prose-li:my-1 prose-strong:text-slate-900 dark:prose-strong:text-slate-100">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">About the Product</h3>
              <div 
                className="text-slate-700 dark:text-slate-300 leading-relaxed space-y-4"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            </div>
          )}
          
          {activeTab === "ingredients" && (
            <div className="prose dark:prose-invert max-w-4xl">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">Key Ingredients</h3>
              {ingredients ? (
                <div 
                  className="text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-950/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none"
                  dangerouslySetInnerHTML={{ __html: ingredients }}
                />
              ) : (
                <p className="text-slate-500 dark:text-slate-400 italic">No key ingredients information available.</p>
              )}
            </div>
          )}
          
          {activeTab === "shipping" && (
            <div className="prose dark:prose-invert max-w-4xl text-slate-700 dark:text-slate-300 space-y-6">
               <div>
                 <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-2"><Truck size={18} className="text-rose-500" /> B2B Shipping Rates</h4>
                 <p>Shipping rates are calculated dynamically based on total order weight and destination. We partner with major logistics providers in Bangladesh to ensure the lowest wholesale rates.</p>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Zoom Modal */}
      {isZoomModalOpen && (
        <div 
          className="fixed inset-0 z-[200] bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm flex items-center justify-center p-4 sm:p-10"
          onClick={() => setIsZoomModalOpen(false)}
        >
          <button 
            className="absolute top-6 right-6 p-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-full transition-colors z-10"
            onClick={(e) => { e.stopPropagation(); setIsZoomModalOpen(false); }}
          >
            <X size={24} />
          </button>
          <div 
            className="w-full max-w-5xl h-full relative flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={selectedImage} 
              alt={productName} 
              className="max-w-full max-h-full object-contain drop-shadow-2xl" 
            />
          </div>
        </div>
      )}
    </div>
  );
}

