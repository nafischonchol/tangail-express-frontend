"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import { 
  Trash2, 
  UserPlus, 
  Coins, 
  CreditCard, 
  Smartphone,
  Trash,
  Loader2,
  CheckCircle2,
  Barcode,
  X
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { POSProduct } from "@/app/admin/sales/add/components/ProductGrid";
import { Account } from "@/lib/api/accounts";
import { Customer } from "@/app/admin/sales/add/components/CustomerModal";

export type CartItem = {
  id: string;
  product: POSProduct;
  quantity: number;
  unitPrice: number;
  total: number;
};

interface CartPanelProps {
  cartItems: CartItem[];
  onUpdateQty: (productId: string, qty: number) => void;
  onUpdatePrice: (productId: string, price: number) => void;
  onRemoveItem: (productId: string) => void;
  customers: Customer[];
  activeCustomer: Customer | null;
  onSelectCustomer: (customer: Customer | null) => void;
  onOpenAddCustomer: () => void;
  discountType: "percentage" | "flat";
  onDiscountTypeChange: (type: "percentage" | "flat") => void;
  discountValue: number;
  onDiscountValueChange: (value: number) => void;
  taxRate: number; // e.g. 5 for 5%
  onTaxRateChange: (rate: number) => void;
  accounts: Account[];
  paymentMethod: string;
  onPaymentMethodChange: (method: string) => void;
  paidAmount: string;
  onPaidAmountChange: (amount: string) => void;
  onCheckout: () => void;
  onClearCart: () => void;
  isCheckoutLoading: boolean;
  onScanBarcode: (barcode: string) => Promise<{ success: boolean; message: string }>;
}

export function CartPanel({
  cartItems,
  onUpdateQty,
  onUpdatePrice,
  onRemoveItem,
  customers,
  activeCustomer,
  onSelectCustomer,
  onOpenAddCustomer,
  discountType,
  onDiscountTypeChange,
  discountValue,
  onDiscountValueChange,
  taxRate,
  onTaxRateChange,
  accounts,
  paymentMethod,
  onPaymentMethodChange,
  paidAmount,
  onPaidAmountChange,
  onCheckout,
  onClearCart,
  isCheckoutLoading,
  onScanBarcode,
}: CartPanelProps) {
  // Calculations
  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.total, 0);
  }, [cartItems]);

  const discountAmount = useMemo(() => {
    if (discountType === "percentage") {
      return (subtotal * (discountValue || 0)) / 100;
    }
    return discountValue || 0;
  }, [subtotal, discountType, discountValue]);

  const taxAmount = useMemo(() => {
    const taxableAmount = Math.max(0, subtotal - discountAmount);
    return (taxableAmount * taxRate) / 100;
  }, [subtotal, discountAmount, taxRate]);

  const grandTotal = useMemo(() => {
    return Math.max(0, subtotal - discountAmount + taxAmount);
  }, [subtotal, discountAmount, taxAmount]);

  const paidValue = useMemo(() => {
    if (paidAmount.trim() === "") return 0;
    const parsed = parseFloat(paidAmount);
    return isNaN(parsed) ? 0 : parsed;
  }, [paidAmount]);

  const isDue = paidValue < grandTotal;
  const dueAmount = isDue ? grandTotal - paidValue : 0;
  const changeAmount = !isDue ? paidValue - grandTotal : 0;
  
  const isPaidAmountEmpty = paidAmount.trim() === "";
  const isCheckoutDisabled = cartItems.length === 0 || isCheckoutLoading || isPaidAmountEmpty || (isDue && !activeCustomer);

  const [barcodeQuery, setBarcodeQuery] = useState("");
  const [scanStatus, setScanStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus barcode input on load, and when cart is cleared or updated
  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, []);

  const triggerScanAction = async () => {
    const trimmed = barcodeQuery.trim();
    if (!trimmed) return;

    try {
      const result = await onScanBarcode(trimmed);
      if (result.success) {
        setScanStatus({ type: "success", text: result.message });
        setBarcodeQuery("");
      } else {
        setScanStatus({ type: "error", text: result.message });
      }
    } catch (err: any) {
      setScanStatus({ type: "error", text: err.message || "Error scanning barcode." });
    }

    // Auto-clear status message after 3 seconds
    const timer = setTimeout(() => {
      setScanStatus(null);
    }, 3000);

    // Re-focus the input
    barcodeInputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      triggerScanAction();
    }
  };

  const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) {
      onSelectCustomer(null);
    } else {
      const cust = customers.find((c) => c.id === val);
      if (cust) onSelectCustomer(cust);
    }
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden border border-slate-200 shadow-sm bg-white">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          Cart Queue 
          <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full">
            {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
          </span>
        </h3>
        {cartItems.length > 0 && (
          <button
            onClick={onClearCart}
            className="text-slate-500 hover:text-rose-600 transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer py-1 px-2 hover:bg-rose-50 rounded-lg"
          >
            <Trash className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* Customer Selection */}
      <div className="px-4 py-2.5 border-b border-slate-200 bg-white space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold text-slate-700">Customer Link</Label>
          <button
            onClick={onOpenAddCustomer}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer transition-colors py-0.5 px-1.5 hover:bg-indigo-50 rounded-md"
          >
            <UserPlus className="w-3 h-3" />
            New Customer
          </button>
        </div>
        <div className="flex gap-2">
          <Select 
            value={activeCustomer?.id || ""} 
            onChange={handleCustomerChange}
            className="text-xs h-8 select-none cursor-pointer text-slate-800 font-medium"
          >
            <option value="">Walk-in Customer (নিয়মিত খদ্দের)</option>
            {customers.map((c) => {
              return (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.phone || "No phone"})
                </option>
              );
            })}
          </Select>
        </div>
      </div>

      {/* Barcode Scanner Input */}
      <div className="px-4 py-2.5 border-b border-slate-200 bg-slate-50/40 space-y-1.5 select-none">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Barcode className="w-4 h-4 text-indigo-600" />
            Barcode / SKU Scanner
          </Label>
          {scanStatus && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md transition-all duration-300 animate-in fade-in zoom-in-95 ${
              scanStatus.type === "success" 
                ? "text-emerald-700 bg-emerald-50 border border-emerald-100" 
                : "text-rose-700 bg-rose-50 border border-rose-100"
            }`}>
              {scanStatus.text}
            </span>
          )}
        </div>
        <div className="relative">
          <input
            ref={barcodeInputRef}
            type="text"
            placeholder="Scan barcode or type SKU..."
            value={barcodeQuery}
            onChange={(e) => setBarcodeQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full pl-3 pr-8 h-9 text-xs font-semibold text-slate-800 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-400 transition-all shadow-sm"
          />
          {barcodeQuery && (
            <button
              type="button"
              onClick={() => {
                setBarcodeQuery("");
                barcodeInputRef.current?.focus();
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-slate-200">
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center text-slate-400">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3 border border-slate-200">
              <Coins className="w-6 h-6" />
            </div>
            <p className="font-bold text-slate-700 text-sm">Cart is empty</p>
            <p className="text-xs text-slate-400 mt-1">Select products from grid to build invoice</p>
          </div>
        ) : (
          <>
            {/* Column headings */}
            <div className="flex items-center px-3 gap-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <div className="flex-1">Item</div>
              <div className="w-16 text-center">Qty</div>
              <div className="w-20 text-center">Price</div>
              <div className="w-20 text-right">Total</div>
            </div>
          {cartItems.map((item) => (
            <div 
              key={item.id}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50/60 border border-slate-200 hover:border-slate-300 transition-colors gap-3 animate-in fade-in slide-in-from-right-2 duration-200"
            >
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-slate-800 truncate leading-snug">
                  {item.product.name}
                </h4>
                {item.product.banglaName && (
                  <p className="text-[11px] text-slate-500 truncate Bengali-font">
                    {item.product.banglaName}
                  </p>
                )}
              </div>

              {/* Quantity input */}
              <div className="w-16 shrink-0">
                <input
                  type="number"
                  min="1"
                  max={item.product.stock}
                  value={item.quantity}
                  onChange={(e) => {
                    const qty = parseInt(e.target.value) || 0;
                    if (qty >= 1 && qty <= item.product.stock) {
                      onUpdateQty(item.product.id, qty);
                    }
                  }}
                  className="w-full h-8.5 text-center text-xs font-bold text-slate-800 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Price input */}
              <div className="w-20 shrink-0">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={item.unitPrice}
                  onChange={(e) => {
                    const price = parseFloat(e.target.value) || 0;
                    onUpdatePrice(item.product.id, price);
                  }}
                  className="w-full h-8.5 text-center text-xs font-bold text-slate-800 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Row Subtotal */}
              <div className="flex flex-col items-end w-20 shrink-0">
                <span className="text-xs font-bold text-slate-900">
                  ৳{item.total.toFixed(2)}
                </span>
                <button
                  onClick={() => onRemoveItem(item.product.id)}
                  className="text-slate-400 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 transition-colors mt-0.5 cursor-pointer"
                  title="Remove item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
          </>
        )}
      </div>

      {/* Calculations & Checkout Forms */}
      <div className="border-t border-slate-200 bg-white p-3.5 space-y-2.5 shrink-0">
        
        {/* Discount & Tax Section */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-slate-700">Discount</Label>
            <div className="flex border border-slate-200 rounded-lg bg-white overflow-hidden focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-500 h-8.5 transition-all">
              <input
                type="number"
                min="0"
                className="w-full pl-3 text-xs bg-transparent border-none outline-none font-bold text-slate-800"
                placeholder="0.00"
                value={discountValue || ""}
                onChange={(e) => onDiscountValueChange(parseFloat(e.target.value) || 0)}
              />
              <select
                value={discountType}
                onChange={(e) => onDiscountTypeChange(e.target.value as "percentage" | "flat")}
                className="bg-slate-50 hover:bg-slate-100 border-l border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer outline-none px-2"
              >
                <option value="percentage">%</option>
                <option value="flat">Flat (৳)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-slate-700">VAT/Tax Rate</Label>
              <span className="text-xs font-medium text-slate-500">৳{taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex border border-slate-200 rounded-lg bg-white overflow-hidden focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-500 h-8.5 transition-all">
              <input
                type="number"
                min="0"
                className="w-full pl-3 text-xs bg-transparent border-none outline-none font-bold text-slate-800"
                placeholder="0"
                value={taxRate === 0 ? "" : taxRate}
                onChange={(e) => onTaxRateChange(parseFloat(e.target.value) || 0)}
              />
              <div className="px-2.5 bg-slate-50 border-l border-slate-200 text-xs font-semibold text-slate-600 flex items-center select-none">
                %
              </div>
            </div>
          </div>
        </div>

        {/* Bill Breakdown Summary */}
        <div className="space-y-1 py-1.5 border-y border-slate-200 text-xs">
          <div className="flex justify-between text-slate-600 font-medium">
            <span>Subtotal</span>
            <span className="text-slate-800 font-semibold">৳{subtotal.toFixed(2)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-emerald-600 font-medium">
              <span>Discount Amount</span>
              <span className="font-semibold">-৳{discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-slate-600 font-medium">
            <span>Tax (VAT)</span>
            <span className="text-slate-800 font-semibold">৳{taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-slate-900 pt-1.5 border-t border-dashed border-slate-200">
            <span>Grand Total</span>
            <span className="text-base font-extrabold text-slate-900">৳{grandTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Account */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-slate-700">Payment Account</Label>
          <div className="relative">
            <Select
              value={paymentMethod}
              onChange={(e) => onPaymentMethodChange(e.target.value)}
              className="text-xs h-9 cursor-pointer font-medium select-none text-slate-800 pr-10"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={String(acc.id)}>
                  {acc.name} {acc.account_number ? `(${acc.account_number})` : ""}
                </option>
              ))}
            </Select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
              <Coins className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Amount Paid & Change Due */}
        <div className="grid grid-cols-2 gap-3 items-end">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-slate-700">
                Amount Paid <span className="text-rose-500">*</span>
              </Label>
              {grandTotal > 0 && (
                <button
                  type="button"
                  onClick={() => onPaidAmountChange(grandTotal.toFixed(2))}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer"
                >
                  Pay in Full
                </button>
              )}
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">৳</span>
              <Input
                type="number"
                min="0"
                step="any"
                placeholder="0.00"
                className="pl-6 h-8.5 text-xs font-bold bg-white text-slate-900 border-slate-200"
                value={paidAmount}
                onChange={(e) => onPaidAmountChange(e.target.value)}
              />
            </div>
          </div>

          {/* Change/Due Display Widget */}
          <div className="h-8.5 flex flex-col justify-center border border-slate-200 rounded-lg bg-slate-50 px-3 py-1 select-none">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider leading-none">
              {isDue ? "Due Amount" : "Change Due"}
            </span>
            <span 
              className={`text-xs font-bold mt-0.5 leading-none
                ${isDue ? "text-rose-600" : "text-emerald-600"}`}
            >
              ৳{(isDue ? dueAmount : changeAmount).toFixed(2)}
            </span>
          </div>
        </div>

        {isPaidAmountEmpty && (
          <div className="text-[11px] text-amber-700 font-medium px-1">
            * Amount paid is required.
          </div>
        )}

        {!isPaidAmountEmpty && isDue && !activeCustomer && (
          <div className="text-[11px] text-rose-600 font-medium px-1">
            * Walk-in customer cannot have a due balance. Please select a customer or pay in full.
          </div>
        )}

        {/* Complete Checkout Action */}
        <Button
          type="button"
          onClick={onCheckout}
          disabled={isCheckoutDisabled}
          className={`w-full h-9 rounded-xl font-bold transition-all cursor-pointer
            ${
              isCheckoutDisabled
                ? "bg-slate-200 text-slate-500 border border-slate-300 disabled:opacity-100 cursor-not-allowed shadow-none"
                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow active:scale-[0.99]"
            }`}
        >
          {isCheckoutLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <CheckCircle2 className="w-4 h-4 mr-2 stroke-[2.5]" />
          )}
          Complete Checkout (৳{grandTotal.toFixed(2)})
        </Button>

      </div>
    </Card>
  );
}
