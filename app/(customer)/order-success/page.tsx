"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ArrowRight, ShoppingCart } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCustomerAuth } from "@/lib/hooks/useCustomerAuth";
import { trackPurchase } from "@/lib/utils/analytics";

interface OrderConfirmationInfo {
  invoiceNo: string;
  grandTotal: number;
  customerName: string;
  district: string;
  phone: string;
  address: string;
  paymentMethod?: string;
}

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const { isLoggedIn } = useCustomerAuth();
  const [orderData, setOrderData] = useState<OrderConfirmationInfo | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    document.title = "Order Confirmed | Mohima Premium Beauty";

    // 1. Try reading from URL search params
    const invoice = searchParams.get("invoice");
    const name = searchParams.get("name");
    const phone = searchParams.get("phone");
    const address = searchParams.get("address");
    const district = searchParams.get("district");
    const total = searchParams.get("total");
    const method = searchParams.get("method");

    if (invoice || total) {
      setOrderData({
        invoiceNo: invoice || "Confirmed",
        grandTotal: total ? parseFloat(total) : 0,
        customerName: name || "Valued Customer",
        district: district || "",
        phone: phone || "",
        address: address || "",
        paymentMethod: method || "cod",
      });
      setIsLoaded(true);
      return;
    }

    // 2. Fallback to sessionStorage
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("last_order_data");
        if (stored) {
          const parsed = JSON.parse(stored);
          setOrderData(parsed);
          setIsLoaded(true);
          return;
        }
      } catch (err) {
        console.warn("Failed to parse last_order_data from sessionStorage", err);
      }
    }

    setIsLoaded(true);
  }, [searchParams]);

  // Track Meta Pixel Purchase event
  useEffect(() => {
    if (orderData && orderData.invoiceNo) {
      trackPurchase({
        orderId: orderData.invoiceNo,
        value: orderData.grandTotal || 0,
        currency: "BDT",
      });
    }
  }, [orderData]);

  if (!isLoaded) {
    return (
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-12 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  // If accessed directly without order data
  if (!orderData) {
    return (
      <main className="flex-1 w-full max-w-lg mx-auto px-4 sm:px-6 py-10 text-center space-y-5">
        <div className="w-16 h-16 bg-neutral-100 border border-neutral-200 text-neutral-600 rounded-full flex items-center justify-center mx-auto">
          <ShoppingCart size={30} />
        </div>
        <h1 className="text-2xl font-bold text-neutral-900">No Recent Order Found</h1>
        <p className="text-sm text-neutral-600">
          We couldn&apos;t find any recent order details. If you already placed an order, please check your account dashboard.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider transition-colors"
          >
            <span>Continue Shopping</span>
            <ArrowRight size={14} />
          </Link>
          <Link
            href="/account/orders"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-800 text-xs font-bold uppercase tracking-wider transition-colors"
          >
            <span>My Orders</span>
          </Link>
        </div>
      </main>
    );
  }

  const paymentMethodLabel =
    orderData.paymentMethod?.toLowerCase() === "online" ? "Online" : "COD";

  const fullAddressDisplay = [orderData.address, orderData.district]
    .filter(Boolean)
    .join(", ");

  return (
    <main className="flex-1 w-full max-w-lg mx-auto px-4 sm:px-6 py-4 sm:py-6">
      <div className="bg-white rounded-2xl border border-neutral-200 p-5 sm:p-7 shadow-xs text-center space-y-5">
        {/* Compact Header */}
        <div className="space-y-2">
          <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 size={26} />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
            Thank You for Your Order!
          </h1>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
            We have received your order and are preparing it for shipment. We will contact you shortly to confirm delivery.
          </p>
        </div>

        {/* Details Box */}
        <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-4 sm:p-5 text-left space-y-2.5 text-xs">
          {orderData.invoiceNo && (
            <div className="flex justify-between items-center pb-2 border-b border-neutral-200/70">
              <span className="text-neutral-500 font-medium">Invoice Number</span>
              <span className="font-mono font-bold text-neutral-900 text-sm">
                {orderData.invoiceNo}
              </span>
            </div>
          )}

          {orderData.customerName && (
            <div className="flex justify-between items-center pb-2 border-b border-neutral-200/70">
              <span className="text-neutral-500 font-medium">Customer Name</span>
              <span className="font-semibold text-neutral-900">
                {orderData.customerName}
              </span>
            </div>
          )}

          {orderData.phone && (
            <div className="flex justify-between items-center pb-2 border-b border-neutral-200/70">
              <span className="text-neutral-500 font-medium">Phone</span>
              <span className="font-semibold text-neutral-900 font-mono">
                {orderData.phone}
              </span>
            </div>
          )}

          {fullAddressDisplay && (
            <div className="flex justify-between items-start pb-2 border-b border-neutral-200/70">
              <span className="text-neutral-500 font-medium">Delivery Address</span>
              <span className="font-medium text-neutral-800 text-right max-w-[220px] leading-snug">
                {fullAddressDisplay}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center pt-1">
            <span className="text-neutral-700 font-bold">
              Total Amount ({paymentMethodLabel})
            </span>
            <span className="text-base font-bold text-[#BA478F]">
              ৳{orderData.grandTotal.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
          >
            <span>Continue Shopping</span>
            <ArrowRight size={14} />
          </Link>
          <Link
            href="/account/orders"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-800 text-xs font-bold uppercase tracking-wider transition-colors"
          >
            <span>My Orders</span>
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-[#F7F7F8] text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white flex flex-col justify-between">
      <Suspense fallback={<div className="h-16 bg-white border-b border-neutral-200" />}>
        <Header />
      </Suspense>

      <Suspense
        fallback={
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-20 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
          </main>
        }
      >
        <OrderSuccessContent />
      </Suspense>

      <Footer />
    </div>
  );
}
