"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  X, 
  Package, 
  MapPin, 
  Phone, 
  User, 
  Calendar, 
  FileText, 
  Copy, 
  Check, 
  Truck, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ExternalLink,
  ShoppingCart,
  Loader2
} from "lucide-react";
import toast from "react-hot-toast";
import { 
  CustomerOrderDetail, 
  getCustomerOrderDetailApi 
} from "@/lib/api/customerOrder";

interface OrderDetailModalProps {
  orderIdOrInvoice: string | number | null;
  isOpen: boolean;
  onClose: () => void;
  initialOrder?: CustomerOrderDetail | null;
}

export function getStatusBadgeStyle(status: string) {
  const s = (status || "").toLowerCase().trim();
  switch (s) {
    case "order placed":
    case "placed":
      return "bg-sky-50 text-sky-700 border-sky-200";
    case "confirmed":
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    case "packaging":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "ready to deliver":
    case "ready_to_deliver":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "shipped":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "delivered":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "cancelled":
      return "bg-rose-50 text-rose-700 border-rose-200";
    case "returned":
      return "bg-zinc-100 text-zinc-700 border-zinc-300";
    case "unreachable":
      return "bg-orange-50 text-orange-700 border-orange-200";
    default:
      return "bg-zinc-100 text-zinc-700 border-zinc-200";
  }
}

const ORDER_STEPS = [
  { key: "Order Placed", label: "Placed" },
  { key: "Confirmed", label: "Confirmed" },
  { key: "Packaging", label: "Packaging" },
  { key: "Shipped", label: "Shipped" },
  { key: "Delivered", label: "Delivered" },
];

function getStepIndex(status: string): number {
  const s = (status || "").toLowerCase();
  if (s.includes("delivered")) return 4;
  if (s.includes("shipped") || s.includes("ready to deliver")) return 3;
  if (s.includes("packaging")) return 2;
  if (s.includes("confirmed")) return 1;
  if (s.includes("placed")) return 0;
  return 0;
}

export function OrderDetailModal({
  orderIdOrInvoice,
  isOpen,
  onClose,
  initialOrder = null,
}: OrderDetailModalProps) {
  const [order, setOrder] = useState<CustomerOrderDetail | null>(initialOrder);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen || !orderIdOrInvoice) return;

    if (initialOrder && (initialOrder.id === orderIdOrInvoice || initialOrder.invoice_no === orderIdOrInvoice)) {
      setOrder(initialOrder);
    } else {
      setLoading(true);
      getCustomerOrderDetailApi(orderIdOrInvoice)
        .then((res) => {
          if (res.success && res.resources) {
            setOrder(res.resources);
          } else {
            toast.error(res.message || "Failed to load order details");
          }
        })
        .catch(() => {
          toast.error("Failed to load order details");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, orderIdOrInvoice, initialOrder]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopyInvoice = () => {
    if (!order?.invoice_no) return;
    navigator.clipboard.writeText(order.invoice_no);
    setCopied(true);
    toast.success("Invoice number copied to clipboard", {
      style: { background: "#18181b", color: "#f4f4f5", border: "1px solid #27272a" },
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const isCancelled = order?.status?.toLowerCase().includes("cancel");
  const isReturned = order?.status?.toLowerCase().includes("return");
  const currentStep = order ? getStepIndex(order.status) : 0;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="relative w-full max-w-3xl bg-white rounded-2xl border border-neutral-200 shadow-xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-neutral-100 flex items-center justify-between gap-3 bg-neutral-50/50 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-[#FDF2F8] border border-[#FBCFE8] flex items-center justify-center text-[#BA478F] shrink-0">
              <Package size={18} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-bold text-neutral-900 font-mono tracking-tight truncate">
                  {order ? order.invoice_no : "Order Details"}
                </h2>
                {order && (
                  <button
                    type="button"
                    onClick={handleCopyInvoice}
                    className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                    title="Copy invoice number"
                  >
                    {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                  </button>
                )}
                {order && (
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadgeStyle(order.status)}`}>
                    {order.status}
                  </span>
                )}
              </div>
              {order && (
                <p className="text-[11px] text-neutral-500 mt-0.5 flex items-center gap-1">
                  <Calendar size={12} />
                  <span>Placed on {order.date}</span>
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-neutral-900">
          {loading ? (
            <div className="min-h-[300px] flex flex-col items-center justify-center text-neutral-400 gap-2">
              <Loader2 className="animate-spin text-[#BA478F]" size={28} />
              <span className="text-xs font-medium text-neutral-500">Loading order information...</span>
            </div>
          ) : order ? (
            <>
              {/* Order Status Stepper */}
              {!isCancelled && !isReturned ? (
                <div className="bg-neutral-50 border border-neutral-200/80 rounded-xl p-4 sm:p-5">
                  <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                    <Truck size={14} className="text-neutral-500" />
                    <span>Delivery Progress</span>
                  </h3>
                  
                  <div className="relative flex items-center justify-between">
                    {/* Background connecting bar */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 w-full bg-neutral-200 z-0" />
                    {/* Active connecting bar */}
                    <div 
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-[#BA478F] z-0 transition-all duration-300"
                      style={{ width: `${(currentStep / (ORDER_STEPS.length - 1)) * 100}%` }}
                    />

                    {ORDER_STEPS.map((step, idx) => {
                      const isCompleted = idx <= currentStep;
                      const isCurrent = idx === currentStep;

                      return (
                        <div key={step.key} className="relative z-10 flex flex-col items-center group">
                          <div
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                              isCompleted
                                ? "bg-[#BA478F] text-white ring-4 ring-[#FDF2F8]"
                                : "bg-white text-neutral-400 border border-neutral-300"
                            }`}
                          >
                            {isCompleted ? <Check size={14} strokeWidth={3} /> : idx + 1}
                          </div>
                          <span
                            className={`text-[10px] sm:text-[11px] mt-1.5 font-medium text-center ${
                              isCurrent
                                ? "text-neutral-900 font-bold"
                                : isCompleted
                                ? "text-neutral-700"
                                : "text-neutral-400"
                            }`}
                          >
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/70 flex items-start gap-3">
                  <AlertCircle size={20} className="text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider">
                      Order {order.status}
                    </h4>
                    <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">
                      This order has been {order.status.toLowerCase()}. Please contact customer support if you have any questions.
                    </p>
                  </div>
                </div>
              )}

              {/* Items Table */}
              <div className="border border-neutral-200 rounded-xl overflow-hidden bg-white">
                <div className="px-4 py-3 bg-neutral-50/80 border-b border-neutral-200 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
                    <ShoppingCart size={14} className="text-neutral-500" />
                    <span>Order Items ({order.items?.length || 0})</span>
                  </h3>
                </div>

                <div className="divide-y divide-neutral-100">
                  {order.items?.map((item) => (
                    <div key={item.id} className="p-3.5 sm:p-4 flex items-center gap-3 sm:gap-4 hover:bg-neutral-50/40 transition-colors">
                      {/* Thumbnail */}
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-neutral-100 border border-neutral-200 shrink-0 overflow-hidden relative flex items-center justify-center">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        ) : (
                          <ShoppingCart size={20} className="text-neutral-400" />
                        )}
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs sm:text-sm font-semibold text-neutral-900 leading-snug line-clamp-2">
                            {item.product_slug ? (
                              <Link 
                                href={`/products/${item.product_slug}`} 
                                className="hover:text-[#BA478F] transition-colors inline-flex items-center gap-1"
                              >
                                <span>{item.name}</span>
                                <ExternalLink size={11} className="text-neutral-400" />
                              </Link>
                            ) : (
                              item.name
                            )}
                          </h4>
                          <span className="text-xs sm:text-sm font-bold text-neutral-900 shrink-0 font-mono">
                            ৳{item.total.toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap text-[11px] text-neutral-500">
                          {item.variant_title && item.variant_title !== "Default" && (
                            <span className="px-2 py-0.5 bg-neutral-100 rounded text-neutral-700 font-medium">
                              {item.variant_title}
                            </span>
                          )}
                          {item.sku && (
                            <span className="font-mono text-neutral-400">
                              SKU: {item.sku}
                            </span>
                          )}
                          <span className="text-neutral-400">•</span>
                          <span>
                            ৳{item.unit_price.toLocaleString()} × {item.quantity}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2-Column Grid: Delivery info & Price Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Shipping & Receiver info */}
                <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-3">
                  <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin size={14} className="text-neutral-500" />
                    <span>Delivery Address</span>
                  </h3>
                  
                  <div className="space-y-2 text-xs">
                    {order.client_snapshot?.name && (
                      <div className="flex items-center gap-2 text-neutral-800 font-medium">
                        <User size={13} className="text-neutral-400 shrink-0" />
                        <span>{order.client_snapshot.name}</span>
                      </div>
                    )}
                    {order.client_snapshot?.phone && (
                      <div className="flex items-center gap-2 text-neutral-800 font-mono">
                        <Phone size={13} className="text-neutral-400 shrink-0" />
                        <span>{order.client_snapshot.phone}</span>
                      </div>
                    )}
                    {order.client_snapshot?.address && (
                      <div className="flex items-start gap-2 text-neutral-600 leading-snug">
                        <MapPin size={13} className="text-neutral-400 shrink-0 mt-0.5" />
                        <span>
                          {order.client_snapshot.address}
                          {order.client_snapshot.city ? `, ${order.client_snapshot.city}` : ""}
                        </span>
                      </div>
                    )}
                    {order.client_snapshot?.note && (
                      <div className="pt-2 mt-2 border-t border-neutral-200/60 text-[11px] text-neutral-500 italic">
                        Note: &ldquo;{order.client_snapshot.note}&rdquo;
                      </div>
                    )}
                  </div>
                </div>

                {/* Financial / Total Breakdown */}
                <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-3">
                  <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText size={14} className="text-neutral-500" />
                    <span>Payment Summary</span>
                  </h3>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center text-neutral-600">
                      <span>Subtotal</span>
                      <span className="font-semibold text-neutral-900 font-mono">
                        ৳{order.total_amount.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-neutral-600">
                      <span>Delivery Charge</span>
                      <span className="font-semibold text-neutral-900 font-mono">
                        ৳{(order.delivery_charge ?? 0).toLocaleString()}
                      </span>
                    </div>

                    {order.discount_amount > 0 && (
                      <div className="flex justify-between items-center text-emerald-700">
                        <span>Discount</span>
                        <span className="font-semibold font-mono">
                          -৳{order.discount_amount.toLocaleString()}
                        </span>
                      </div>
                    )}

                    <div className="pt-2 border-t border-neutral-200/80 flex justify-between items-center text-sm font-bold text-neutral-900">
                      <span>Grand Total</span>
                      <span className="text-[#BA478F] font-mono text-base">
                        ৳{order.grand_total.toLocaleString()}
                      </span>
                    </div>

                    <div className="pt-1.5 flex justify-between items-center text-[11px] text-neutral-500">
                      <span>Payment Method</span>
                      <span className="font-semibold text-neutral-800 uppercase">
                        Cash on Delivery (COD)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status History / Timeline Audit */}
              {order.status_histories && order.status_histories.length > 0 && (
                <div className="border border-neutral-200 rounded-xl overflow-hidden bg-white">
                  <div className="px-4 py-3 bg-neutral-50/80 border-b border-neutral-200 flex items-center justify-between">
                    <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock size={14} className="text-neutral-500" />
                      <span>Status History</span>
                    </h3>
                  </div>

                  <div className="p-4 space-y-3">
                    {order.status_histories.map((history, idx) => (
                      <div key={history.id || idx} className="flex items-start gap-3 text-xs">
                        <div className="w-2 h-2 rounded-full bg-[#BA478F] mt-1.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="font-semibold text-neutral-900">
                              {history.status}
                            </span>
                            <span className="text-[11px] text-neutral-400">
                              {history.created_at}
                            </span>
                          </div>
                          {history.note && (
                            <p className="text-[11px] text-neutral-600 mt-0.5 leading-relaxed">
                              {history.note}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="min-h-[250px] flex flex-col items-center justify-center text-center p-6 space-y-2">
              <AlertCircle size={32} className="text-neutral-300" />
              <h4 className="text-sm font-bold text-neutral-800">Order Not Found</h4>
              <p className="text-xs text-neutral-500 max-w-xs">
                We could not find the details for this order. It may have been removed or does not belong to your account.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 sm:px-6 sm:py-4 border-t border-neutral-100 bg-neutral-50 flex items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl border border-neutral-300 hover:bg-neutral-100 text-neutral-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
