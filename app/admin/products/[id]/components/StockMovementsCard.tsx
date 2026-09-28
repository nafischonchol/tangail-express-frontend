"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { History, Plus, Minus, RefreshCw, Sliders } from "lucide-react";
import { getStockMovements } from "@/lib/api/stock";
import type { StockMovement } from "@/lib/api/stock";
import AdjustmentModal from "@/app/admin/products/[id]/components/AdjustmentModal";

interface StockMovementsCardProps {
  productId: number;
  variants: { id: number; title: string; stock: number; price?: number; purchasePrice?: number | null }[];
}

const typeLabels: Record<string, { label: string; color: string }> = {
  adjustment: { label: "Adjustment", color: "text-indigo-600 bg-indigo-50" },
  purchase: { label: "Purchase", color: "text-emerald-600 bg-emerald-50" },
  sale: { label: "Sale", color: "text-rose-600 bg-rose-50" },
  sale_return: { label: "Sale Return", color: "text-emerald-600 bg-emerald-50" },
  purchase_return: { label: "Purchase Return", color: "text-rose-600 bg-rose-50" },
};

export default function StockMovementsCard({ productId, variants }: StockMovementsCardProps) {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(true);
  const [showAdjustment, setShowAdjustment] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<{ id: number; title: string; stock: number } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchMovements = async () => {
    setIsLoading(true);
    const res = await getStockMovements(productId);
    if (res.success) {
      setMovements(res.resources?.data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchMovements();
  }, [productId, refreshKey]);

  const handleAdjust = (variant: { id: number; title: string; stock: number }) => {
    setSelectedVariant(variant);
    setShowAdjustment(true);
  };

  const handleAdjustmentSuccess = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History size={16} className="text-slate-500" />
              <CardTitle>Stock Movements</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setIsOpen(!isOpen);
                  if (!isOpen) fetchMovements();
                }}
              >
                <RefreshCw size={14} className="mr-1" />
                {isOpen ? "Hide" : "Show"}
              </Button>
            </div>
          </div>
        </CardHeader>

        {isOpen && (
          <CardContent className="p-0">
            {/* Variant quick-adjust buttons */}
            {variants.length > 1 && (
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase">Quick Adjust</p>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => handleAdjust(v)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:border-indigo-300 hover:text-indigo-600 transition-colors cursor-pointer"
                    >
                      <Sliders size={12} />
                      {v.title}
                      <span className="text-slate-400">({v.stock})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {variants.length === 1 && (
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500">Stock: <span className="text-slate-800 text-sm">{variants[0].stock}</span></p>
                <Button size="sm" onClick={() => handleAdjust(variants[0])}>
                  <Sliders size={14} className="mr-1" />
                  Adjust
                </Button>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#fafafa] text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Date</th>
                    {variants.length > 1 && <th className="px-4 py-3 font-semibold">Variant</th>}
                    <th className="px-4 py-3 font-semibold">Type</th>
                    <th className="px-4 py-3 font-semibold text-right">Qty</th>
                    <th className="px-4 py-3 font-semibold text-right">Before</th>
                    <th className="px-4 py-3 font-semibold text-right">After</th>
                    <th className="px-4 py-3 font-semibold">Reason</th>
                    <th className="px-4 py-3 font-semibold">By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                        Loading...
                      </td>
                    </tr>
                  ) : movements.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                        <History size={20} className="mx-auto mb-2 text-slate-300" />
                        <p className="text-sm">No stock movements yet</p>
                      </td>
                    </tr>
                  ) : (
                    movements.map((m) => {
                      const typeInfo = typeLabels[m.type] || { label: m.type, color: "text-slate-600 bg-slate-50" };
                      return (
                        <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3 text-slate-500 whitespace-nowrap" suppressHydrationWarning>
                            {new Date(m.created_at).toLocaleDateString("en-BD", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                          {variants.length > 1 && (
                            <td className="px-4 py-3 text-slate-700 font-medium">
                              {m.variant?.sku || "—"}
                            </td>
                          )}
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${typeInfo.color}`}>
                              {typeInfo.label}
                            </span>
                          </td>
                          <td className={`px-4 py-3 text-right font-bold ${m.quantity > 0 ? "text-emerald-600" : "text-rose-500"}`}>
                            {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                          </td>
                          <td className="px-4 py-3 text-right text-slate-600">{m.stock_before}</td>
                          <td className="px-4 py-3 text-right font-semibold text-slate-800">{m.stock_after}</td>
                          <td className="px-4 py-3 text-slate-500 max-w-[150px] truncate">
                            {m.reason || "—"}
                          </td>
                          <td className="px-4 py-3 text-slate-500">{m.creator?.name || "—"}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        )}
      </Card>

      {showAdjustment && selectedVariant && (
        <AdjustmentModal
          variants={variants}
          productId={productId}
          onClose={() => {
            setShowAdjustment(false);
            setSelectedVariant(null);
          }}
          onSuccess={handleAdjustmentSuccess}
        />
      )}
    </>
  );
}
