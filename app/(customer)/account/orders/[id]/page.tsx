"use client";

import { useEffect, useState, Suspense, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AccountSidebar } from "@/components/customer/account/AccountSidebar";
import { fetchCustomerProfile, CustomerProfile } from "@/lib/api/customerProfile";
import { 
  CustomerOrderDetail, 
  getCustomerOrderDetailApi 
} from "@/lib/api/customerOrder";
import { getStatusBadgeStyle } from "@/components/customer/account/OrderDetailModal";
import { 
  Loader2, 
  ArrowLeft, 
  Package, 
  Calendar, 
  Copy, 
  Check, 
  Truck, 
  ShoppingCart, 
  ExternalLink, 
  MapPin, 
  User, 
  Phone, 
  FileText, 
  Clock, 
  AlertCircle,
  Star
} from "lucide-react";
import toast from "react-hot-toast";
import { WriteReviewModal } from "@/components/customer/account/WriteReviewModal";

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

export default function AccountOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [order, setOrder] = useState<CustomerOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<{
    orderItemId: number;
    productSlug: string;
    productName: string;
  } | null>(null);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("customer_token") : null;
    if (!token) {
      router.push(`/login?redirect=/account/orders/${resolvedParams.id}`);
      return;
    }

    const loadData = async () => {
      try {
        const [profileRes, orderRes] = await Promise.all([
          fetchCustomerProfile(),
          getCustomerOrderDetailApi(resolvedParams.id),
        ]);

        if (profileRes.success && profileRes.resources) {
          setProfile(profileRes.resources);
        } else {
          router.push("/login?redirect=/account/orders");
          return;
        }

        if (orderRes.success && orderRes.resources) {
          setOrder(orderRes.resources);
        } else {
          toast.error(orderRes.message || "Failed to load order details");
        }
      } catch {
        toast.error("Failed to load order information");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [resolvedParams.id, router]);

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
    <div className="flex flex-col min-h-screen bg-[#FAF9F6] text-[#121212] font-sans">
      <Suspense fallback={<div className="h-20 bg-white border-b border-black/[0.06]" />}>
        <Header />
      </Suspense>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {loading ? (
          <div className="min-h-[400px] flex items-center justify-center text-zinc-400 gap-2">
            <Loader2 className="animate-spin text-[#BA478F]" size={24} />
            <span className="text-sm font-medium">Loading order details...</span>
          </div>
        ) : profile ? (
          <div className="flex flex-col lg:flex-row gap-5 items-start">
            {/* Left Nav Sidebar */}
            <AccountSidebar user={profile} />

            {/* Main Content Area */}
            <div className="flex-1 w-full space-y-6">
              {/* Back to Orders Link */}
              <div>
                <Link
                  href="/account/orders"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  <ArrowLeft size={14} />
                  <span>Back to My Orders</span>
                </Link>
              </div>

              {order ? (
                <div className="bg-white border border-neutral-200 rounded-2xl p-5 sm:p-7 shadow-xs space-y-6">
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-neutral-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#FDF2F8] border border-[#FBCFE8] flex items-center justify-center text-[#BA478F] shrink-0">
                        <Package size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h1 className="text-base sm:text-lg font-bold text-neutral-900 font-mono">
                            {order.invoice_no}
                          </h1>
                          <button
                            type="button"
                            onClick={handleCopyInvoice}
                            className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                            title="Copy invoice"
                          >
                            {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                          </button>
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadgeStyle(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 mt-0.5 flex items-center gap-1">
                          <Calendar size={12} />
                          <span>Placed on {order.date}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Tracker Stepper */}
                  {!isCancelled && !isReturned ? (
                    <div className="bg-neutral-50 border border-neutral-200/80 rounded-xl p-5">
                      <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider mb-5 flex items-center gap-1.5">
                        <Truck size={14} className="text-neutral-500" />
                        <span>Delivery Progress</span>
                      </h3>
                      
                      <div className="relative flex items-center justify-between">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 w-full bg-neutral-200 z-0" />
                        <div 
                          className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-[#BA478F] z-0 transition-all duration-300"
                          style={{ width: `${(currentStep / (ORDER_STEPS.length - 1)) * 100}%` }}
                        />

                        {ORDER_STEPS.map((step, idx) => {
                          const isCompleted = idx <= currentStep;
                          const isCurrent = idx === currentStep;

                          return (
                            <div key={step.key} className="relative z-10 flex flex-col items-center">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                                  isCompleted
                                    ? "bg-[#BA478F] text-white ring-4 ring-[#FDF2F8]"
                                    : "bg-white text-neutral-400 border border-neutral-300"
                                }`}
                              >
                                {isCompleted ? <Check size={14} strokeWidth={3} /> : idx + 1}
                              </div>
                              <span
                                className={`text-[11px] mt-1.5 font-medium text-center ${
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
                          This order has been {order.status.toLowerCase()}. Please contact customer support if you need assistance.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Items List */}
                  <div className="border border-neutral-200 rounded-xl overflow-hidden bg-white">
                    <div className="px-4 py-3 bg-neutral-50/80 border-b border-neutral-200">
                      <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
                        <ShoppingCart size={14} className="text-neutral-500" />
                        <span>Order Items ({order.items?.length || 0})</span>
                      </h3>
                    </div>

                    <div className="divide-y divide-neutral-100">
                      {order.items?.map((item) => {
                        const isDelivered = order.status?.toLowerCase().includes("delivered");

                        return (
                          <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-50/40 transition-colors">
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                              <div className="w-16 h-16 rounded-lg bg-neutral-100 border border-neutral-200 shrink-0 overflow-hidden relative flex items-center justify-center">
                                {item.image ? (
                                  <Image
                                    src={item.image}
                                    alt={item.name}
                                    fill
                                    className="object-cover"
                                    sizes="64px"
                                  />
                                ) : (
                                  <ShoppingCart size={22} className="text-neutral-400" />
                                )}
                              </div>

                              <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className="text-sm font-semibold text-neutral-900 leading-snug">
                                    {item.product_slug ? (
                                      <Link 
                                        href={`/products/${item.product_slug}`} 
                                        className="hover:text-[#BA478F] transition-colors inline-flex items-center gap-1"
                                      >
                                        <span>{item.name}</span>
                                        <ExternalLink size={12} className="text-neutral-400" />
                                      </Link>
                                    ) : (
                                      item.name
                                    )}
                                  </h4>
                                </div>

                                <div className="flex items-center gap-2 flex-wrap text-xs text-neutral-500">
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
                                  <span>•</span>
                                  <span>
                                    ৳{item.unit_price.toLocaleString()} × {item.quantity}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                              <span className="text-sm font-bold text-neutral-900 font-mono">
                                ৳{item.total.toLocaleString()}
                              </span>

                              {isDelivered && (
                                <div>
                                  {item.has_review ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                                      <Star size={12} className="fill-emerald-600 text-emerald-600" />
                                      <span>Reviewed {item.review?.rating ? `(${item.review.rating}★)` : ""}</span>
                                    </span>
                                  ) : item.product_slug ? (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setReviewTarget({
                                          orderItemId: item.id,
                                          productSlug: item.product_slug!,
                                          productName: item.name,
                                        })
                                      }
                                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#BA478F] hover:bg-[#94286B] text-white text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                                    >
                                      <Star size={13} className="fill-white" />
                                      <span>Write Review</span>
                                    </button>
                                  ) : null}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2-Column Grid: Delivery & Financial info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Delivery details */}
                    <div className="p-5 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-3.5">
                      <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin size={14} className="text-neutral-500" />
                        <span>Delivery Address</span>
                      </h3>

                      <div className="space-y-2.5 text-xs">
                        {order.client_snapshot?.name && (
                          <div className="flex items-center gap-2 text-neutral-800 font-medium">
                            <User size={14} className="text-neutral-400 shrink-0" />
                            <span>{order.client_snapshot.name}</span>
                          </div>
                        )}
                        {order.client_snapshot?.phone && (
                          <div className="flex items-center gap-2 text-neutral-800 font-mono">
                            <Phone size={14} className="text-neutral-400 shrink-0" />
                            <span>{order.client_snapshot.phone}</span>
                          </div>
                        )}
                        {order.client_snapshot?.address && (
                          <div className="flex items-start gap-2 text-neutral-600 leading-snug">
                            <MapPin size={14} className="text-neutral-400 shrink-0 mt-0.5" />
                            <span>
                              {order.client_snapshot.address}
                              {order.client_snapshot.city ? `, ${order.client_snapshot.city}` : ""}
                            </span>
                          </div>
                        )}
                        {order.client_snapshot?.note && (
                          <div className="pt-2 mt-2 border-t border-neutral-200/60 text-xs text-neutral-500 italic">
                            Note: &ldquo;{order.client_snapshot.note}&rdquo;
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Financial details */}
                    <div className="p-5 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-3.5">
                      <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
                        <FileText size={14} className="text-neutral-500" />
                        <span>Payment Summary</span>
                      </h3>

                      <div className="space-y-2.5 text-xs">
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

                        <div className="pt-2.5 border-t border-neutral-200/80 flex justify-between items-center text-sm font-bold text-neutral-900">
                          <span>Grand Total</span>
                          <span className="text-[#BA478F] font-mono text-base">
                            ৳{order.grand_total.toLocaleString()}
                          </span>
                        </div>

                        <div className="pt-1.5 flex justify-between items-center text-xs text-neutral-500">
                          <span>Payment Method</span>
                          <span className="font-semibold text-neutral-800 uppercase">
                            Cash on Delivery (COD)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status History */}
                  {order.status_histories && order.status_histories.length > 0 && (
                    <div className="border border-neutral-200 rounded-xl overflow-hidden bg-white">
                      <div className="px-4 py-3 bg-neutral-50/80 border-b border-neutral-200">
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
                </div>
              ) : (
                <div className="bg-white border border-neutral-200 rounded-2xl p-10 text-center space-y-4 shadow-xs">
                  <AlertCircle size={36} className="text-neutral-300 mx-auto" />
                  <h3 className="text-sm font-bold text-neutral-900">Order Not Found</h3>
                  <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                    We could not locate this order. Please verify the invoice number or return to your orders list.
                  </p>
                  <Link
                    href="/account/orders"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold transition-colors"
                  >
                    <span>View All Orders</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </main>

      {/* Review Modal */}
      {reviewTarget && order && (
        <WriteReviewModal
          isOpen={!!reviewTarget}
          onClose={() => setReviewTarget(null)}
          onSuccess={async () => {
            const res = await getCustomerOrderDetailApi(resolvedParams.id);
            if (res.success && res.resources) {
              setOrder(res.resources);
            }
          }}
          orderId={order.id}
          orderItemId={reviewTarget.orderItemId}
          productSlug={reviewTarget.productSlug}
          productName={reviewTarget.productName}
        />
      )}

      <Footer />
    </div>
  );
}
