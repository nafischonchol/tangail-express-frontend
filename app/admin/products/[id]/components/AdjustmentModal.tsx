"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { X, Plus, Minus, AlertTriangle, Loader2, Check, AlertCircle } from "lucide-react";
import { createAdjustment } from "@/lib/api/stock";

interface VariantOption {
  id: number;
  title: string;
  stock: number;
  price?: number;
  purchasePrice?: number | null;
}

interface AdjustmentModalProps {
  variants: VariantOption[];
  productId: number;
  productName?: string;
  onClose: () => void;
  onSuccess: () => void;
}

type AdjustType = "add" | "reduce" | "damage";

const typeConfig: Record<AdjustType, { label: string; icon: typeof Plus; color: string; bg: string; border: string }> = {
  add: {
    label: "Add Stock",
    icon: Plus,
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  reduce: {
    label: "Reduce Stock",
    icon: Minus,
    color: "text-rose-700",
    bg: "bg-rose-50",
    border: "border-rose-200",
  },
  damage: {
    label: "Damage",
    icon: AlertTriangle,
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
};

export default function AdjustmentModal({
  variants,
  productId,
  productName,
  onClose,
  onSuccess,
}: AdjustmentModalProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<number>(variants[0]?.id || 0);
  const [type, setType] = useState<AdjustType>("add");
  const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Pre-fill prices when selected variant changes
  useEffect(() => {
    const variant = variants.find((v) => v.id === selectedVariantId);
    if (variant) {
      if (variant.price !== undefined && variant.price !== null) {
        setUnitPrice(String(variant.price));
      } else {
        setUnitPrice("");
      }
      if (variant.purchasePrice !== undefined && variant.purchasePrice !== null) {
        setPurchasePrice(String(variant.purchasePrice));
      } else {
        setPurchasePrice("");
      }
    }
  }, [selectedVariantId, variants]);

  const selectedVariant = variants.find((v) => v.id === selectedVariantId) || variants[0];
  const config = typeConfig[type];

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (!selectedVariant) {
      setError("Please select a variant.");
      return;
    }

    const qty = parseInt(quantity, 10);
    if (!qty || qty < 1) {
      setError("Quantity must be at least 1.");
      return;
    }
    if (type !== "add" && qty > selectedVariant.stock) {
      setError(`Not enough stock. Current stock: ${selectedVariant.stock}`);
      return;
    }

    const apiType = type === "add" ? "addition" : type === "damage" ? "damage" : "deduction";

    setIsSubmitting(true);
    const res = await createAdjustment({
      product_variant_id: selectedVariant.id,
      type: apiType,
      quantity: qty,
      unit_price: type === "add" && unitPrice ? parseFloat(unitPrice) : undefined,
      purchase_price: type === "add" && purchasePrice ? parseFloat(purchasePrice) : undefined,
      reason: reason || undefined,
    });

    if (res.success) {
      setSuccess("Stock adjusted successfully!");
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1000);
    } else {
      setError(res.message);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl mx-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center`}>
                  <config.icon size={16} className={config.color} />
                </div>
                <CardTitle>Stock Adjustment</CardTitle>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Product Name */}
            {productName && (
              <div className="bg-slate-50 rounded-xl px-4 py-3">
                <p className="text-xs text-slate-500 font-medium">Product</p>
                <p className="text-sm font-bold text-slate-800">{productName}</p>
              </div>
            )}

            {/* Row: Variant + Quantity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="variant-select">Variant</Label>
                {variants.length > 1 ? (
                  <Select
                    id="variant-select"
                    value={selectedVariantId}
                    onChange={(e) => setSelectedVariantId(Number(e.target.value))}
                    className="w-full mt-1.5 px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 bg-white focus:outline-none focus:border-indigo-500"
                  >
                    {variants.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.title} (Stock: {v.stock})
                      </option>
                    ))}
                  </Select>
                ) : (
                  <div className="mt-1.5 bg-slate-50 rounded-xl px-4 py-3 flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-800">{selectedVariant?.title}</span>
                    <span className="text-xs text-slate-500">
                      Stock: <span className="font-bold text-indigo-600">{selectedVariant?.stock}</span>
                    </span>
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="adjust-qty">Quantity</Label>
                <Input
                  id="adjust-qty"
                  type="number"
                  placeholder="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="1"
                  className="mt-1.5"
                />
              </div>
            </div>

            {/* Adjustment Type - Full width */}
            <div>
              <Label>Adjustment Type</Label>
              <div className="flex gap-2 mt-1.5">
                {(Object.entries(typeConfig) as [AdjustType, typeof typeConfig[AdjustType]][]).map(([key, cfg]) => {
                  const isActive = type === key;
                  const Icon = cfg.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => setType(key)}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer border ${
                        isActive
                          ? `${cfg.bg} ${cfg.color} ${cfg.border}`
                          : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <Icon size={16} />
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Row: Unit Price + Purchase Price (Add only) */}
            {type === "add" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="adjust-unit-price">Unit Price (Sale)</Label>
                  <Input
                    id="adjust-unit-price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="adjust-purchase-price">Purchase Price</Label>
                  <Input
                    id="adjust-purchase-price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
              </div>
            )}

            {/* Reason - Full width */}
            <div>
              <Label htmlFor="adjust-reason">Reason (optional)</Label>
              <textarea
                id="adjust-reason"
                placeholder="e.g. Physical count correction"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full mt-1.5 px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white focus:outline-none focus:border-indigo-500 resize-none"
                rows={3}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-50 text-rose-700 text-sm font-medium">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-medium">
                <Check size={16} />
                {success}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button variant="ghost" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <config.icon className="w-4 h-4 mr-2" />
                )}
                {config.label}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
