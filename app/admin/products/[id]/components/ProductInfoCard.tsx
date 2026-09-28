"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Printer, 
  ExternalLink, 
  Settings, 
  Sliders, 
  Check, 
  AlertCircle, 
  X
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { ProductDetail } from "@/lib/api/products";
import AdjustmentModal from "@/app/admin/products/[id]/components/AdjustmentModal";

interface VariantInfo {
  id: number;
  title: string;
  stock: number;
  price?: number;
  purchasePrice?: number | null;
}

interface ProductInfoCardProps {
  product: ProductDetail;
  variants: VariantInfo[];
}

export default function ProductInfoCard({ product, variants }: ProductInfoCardProps) {
  const router = useRouter();
  const [selectedThumbnail, setSelectedThumbnail] = useState(0);
  const [notification, setNotification] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);
  const [showAdjustment, setShowAdjustment] = useState(false);

  const triggerNotification = (type: "success" | "error" | "info", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return `৳ ${(numPrice || 0).toFixed(2)}`;
  };

  const handleAdjustmentClick = () => {
    setShowAdjustment(true);
  };

  const handleAdjustmentSuccess = () => {
    router.refresh();
  };

  return (
    <>
      <Card className="relative overflow-visible shadow-sm bg-white border border-slate-100 rounded-xl">
        {/* Toast Notification inside this card boundary (placed fixed to fit viewport correctly) */}
        {notification && (
          <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-2xl border shadow-xl backdrop-blur-md animate-in slide-in-from-top-4 duration-300 
            ${notification.type === 'success' 
              ? 'bg-emerald-50/90 border-emerald-100 text-emerald-800' 
              : notification.type === 'error'
              ? 'bg-rose-50/90 border-rose-100 text-rose-800'
              : 'bg-indigo-50/90 border-indigo-100 text-indigo-800'}`}>
            {notification.type === 'success' ? (
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <Check size={18} />
              </div>
            ) : notification.type === 'error' ? (
              <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-600">
                <AlertCircle size={18} />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                <Settings size={18} className="text-indigo-600" />
              </div>
            )}
            <div>
              <p className="text-sm font-semibold capitalize">{notification.type} Alert</p>
              <p className="text-xs text-slate-500 mt-0.5">{notification.message}</p>
            </div>
            <button 
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-slate-600 transition-colors ml-4"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800">Product Details</h2>
          <button 
            onClick={handleAdjustmentClick}
            className="h-8 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Sliders size={13} />
            Adjustment Item
          </button>
        </div>

        {/* Content Body */}
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            
            {/* Image and Thumbnails Section */}
            <div className="w-full md:w-auto flex flex-col items-center gap-3 shrink-0">
              <div className="w-56 h-40 md:w-56 md:h-40 overflow-hidden border border-slate-200 rounded-xl bg-slate-50 flex items-center justify-center relative">
                <img 
                  src={product.thumbnail || "https://placehold.co/100x100?text=Product"} 
                  alt={product.name} 
                  className="object-cover w-full h-full"
                />
              </div>
              {/* Thumbnails row */}
              <div className="flex gap-2 justify-start w-full">
                <button 
                  onClick={() => setSelectedThumbnail(0)}
                  className={`w-12 h-10 rounded border overflow-hidden p-0.5 bg-white transition-all ${selectedThumbnail === 0 ? 'border-indigo-600 ring-2 ring-indigo-50' : 'border-slate-200 hover:border-slate-350'}`}
                >
                  <img src={product.thumbnail || "https://placehold.co/100x100?text=Product"} className="w-full h-full object-cover" alt="Thumb 1" />
                </button>
              </div>
            </div>

            {/* Details columns */}
            <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5 text-xs text-slate-800 font-semibold">
              
              {/* Left Data Column */}
              <div className="space-y-3.5">
                <div className="flex items-center min-h-[24px]">
                  <span className="w-28 text-slate-500">Product Name</span>
                  <span className="mr-3 text-slate-400">:</span>
                  <span className="flex-1 text-slate-900 font-bold">{product.name}</span>
                </div>
                
                <div className="flex items-center min-h-[24px]">
                  <span className="w-28 text-slate-500">Sell Price</span>
                  <span className="mr-3 text-slate-400">:</span>
                  <span className="flex-1 text-slate-900 font-bold">
                    {product.has_variants 
                      ? `${formatPrice(product.min_price)} - ${formatPrice(product.max_price)}` 
                      : formatPrice(product.price || 0)}
                  </span>
                </div>

                <div className="flex items-center min-h-[24px]">
                  <span className="w-28 text-slate-500">Purchase Price</span>
                  <span className="mr-3 text-slate-400">:</span>
                  <span className="flex-1 text-slate-900 font-bold">
                    {product.has_variants
                      ? (product.min_purchase_price === product.max_purchase_price
                          ? formatPrice(product.min_purchase_price || 0)
                          : `${formatPrice(product.min_purchase_price || 0)} - ${formatPrice(product.max_purchase_price || 0)}`)
                      : formatPrice(product.purchase_price || 0)}
                  </span>
                </div>

                <div className="flex items-center min-h-[24px]">
                  <span className="w-28 text-slate-500">Barcode</span>
                  <span className="mr-3 text-slate-400">:</span>
                  <div className="flex-1 flex items-center gap-1.5 text-slate-900 font-bold">
                    <span>{product.barcode || (product.variants?.[0]?.barcode || "—")}</span>
                    <button 
                      onClick={() => {
                        const bc = product.barcode || (product.variants?.[0]?.barcode || "");
                        if (bc) triggerNotification("success", `Printing barcode ${bc}...`);
                      }}
                      className="w-5.5 h-5.5 rounded bg-[#722ed1] hover:bg-[#591ba8] text-white flex items-center justify-center transition-colors cursor-pointer shadow-sm"
                      title="Print Barcode"
                    >
                      <Printer size={10.5} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center min-h-[24px]">
                  <span className="w-28 text-slate-500">SKU</span>
                  <span className="mr-3 text-slate-400">:</span>
                  <span className="flex-1 text-slate-900 font-bold">
                    {product.sku || (product.variants?.[0]?.sku || "—")}
                  </span>
                </div>
              </div>

              {/* Right Data Column */}
              <div className="space-y-3.5">
                <div className="flex items-center min-h-[24px]">
                  <span className="w-28 text-slate-500">Stock Qty</span>
                  <span className="mr-3 text-slate-400">:</span>
                  <span className="flex-1 text-slate-900 font-bold">{(product.total_stock || 0).toFixed(2)}</span>
                </div>

                <div className="flex items-center min-h-[24px]">
                  <span className="w-28 text-slate-500">Minimum Stock</span>
                  <span className="mr-3 text-slate-400">:</span>
                  <span className="flex-1 text-slate-900 font-bold">{(5).toFixed(2)}</span>
                </div>

                <div className="flex items-center min-h-[24px]">
                  <span className="w-28 text-slate-500">Brand</span>
                  <span className="mr-3 text-slate-400">:</span>
                  <span className="flex-1 text-slate-900 font-bold">{product.brand?.name || "N/A"}</span>
                </div>

                <div className="flex items-center min-h-[24px]">
                  <span className="w-28 text-slate-500">Category</span>
                  <span className="mr-3 text-slate-400">:</span>
                  <span className="flex-1 text-slate-900 font-bold">{product.category?.name || "N/A"}</span>
                </div>

                <div className="flex items-center min-h-[24px]">
                  <span className="w-28 text-slate-500">Status</span>
                  <span className="mr-3 text-slate-400">:</span>
                  <span className="flex-1 text-slate-900 font-bold">
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 font-bold text-xs uppercase tracking-wide border border-emerald-100">
                      {product.status}
                    </span>
                  </span>
                </div>
              </div>

            </div>
          </div>
        </CardContent>
      </Card>

      {/* Adjustment Modal */}
      {showAdjustment && (
        <AdjustmentModal
          variants={variants}
          productId={product.id}
          productName={product.name}
          onClose={() => setShowAdjustment(false)}
          onSuccess={handleAdjustmentSuccess}
        />
      )}
    </>
  );
}
