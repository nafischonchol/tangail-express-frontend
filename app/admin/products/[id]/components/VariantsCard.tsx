"use client";

import { useState } from "react";
import { Package, Image as ImageIcon, Check, X, ChevronDown, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";

export interface VariantData {
  id: number;
  title: string;
  sku: string;
  price: number;
  purchasePrice?: number | null;
  discountPrice: number | null;
  barcode: string;
  stock: number;
  image?: string | null;
}

interface VariantsCardProps {
  variants: VariantData[];
  colorImages?: Record<string, string>;
}

export default function VariantsCard({ variants, colorImages = {} }: VariantsCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const formatPrice = (price: number) => `৳ ${price.toFixed(2)}`;

  if (!variants.length) return null;

  return (
    <Card className="relative overflow-visible shadow-sm bg-white border border-slate-100 rounded-xl">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 border-b border-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <Package size={16} className="text-slate-500" />
          <h2 className="text-sm font-bold text-slate-800">Variants</h2>
          <span className="text-xs text-slate-400 font-medium bg-slate-100 px-2 py-0.5 rounded-full">
            {variants.length} items
          </span>
        </div>
        {isOpen ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
      </button>

      {isOpen && (
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#fafafa] text-slate-500 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3 font-semibold w-14 text-center">Image</th>
                <th className="px-4 py-3 font-semibold">Variant</th>
                <th className="px-4 py-3 font-semibold">SKU</th>
                <th className="px-4 py-3 font-semibold text-right">Purchase Price</th>
                <th className="px-4 py-3 font-semibold text-right">Price</th>
                <th className="px-4 py-3 font-semibold text-right">Discount Price</th>
                <th className="px-4 py-3 font-semibold">Barcode</th>
                <th className="px-4 py-3 font-semibold text-center">Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {variants.map((variant) => {
                const colorName = variant.title.split(" / ")[0];
                const colorImage = colorImages[colorName];

                return (
                  <tr key={variant.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 text-center">
                      {variant.image || colorImage ? (
                        <img
                          src={variant.image || colorImage || ""}
                          alt={variant.title}
                          className="w-9 h-9 rounded-lg border border-slate-200 object-cover bg-slate-50 mx-auto"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center mx-auto">
                          <ImageIcon size={14} className="text-slate-300" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-800 text-[13px]">
                        {variant.title}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-medium">
                      {variant.sku || "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-800">
                      {variant.purchasePrice ? formatPrice(variant.purchasePrice) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-800">
                      {formatPrice(variant.price)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {variant.discountPrice ? (
                        <span className="font-semibold text-emerald-600">
                          {formatPrice(variant.discountPrice)}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-mono text-[11px]">
                      {variant.barcode || "—"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                        variant.stock > 0
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-rose-50 text-rose-500"
                      }`}>
                        {variant.stock > 0 ? (
                          <Check size={10} />
                        ) : (
                          <X size={10} />
                        )}
                        {variant.stock}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
      )}
    </Card>
  );
}
