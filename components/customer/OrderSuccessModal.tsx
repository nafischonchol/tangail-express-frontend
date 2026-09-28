"use client";

import React from "react";
import { CheckCircle2, Phone, MessageCircle, ShoppingBag, X } from "lucide-react";
import type { TangailOrder } from "@/lib/api/tangailOrders";

interface OrderSuccessModalProps {
  isOpen: boolean;
  order: TangailOrder | null;
  onClose: () => void;
  whatsapp?: string;
  phone?: string;
}

export default function OrderSuccessModal({
  isOpen,
  order,
  onClose,
  whatsapp = "8801700000000",
  phone = "01700000000",
}: OrderSuccessModalProps) {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
        {/* Top Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
          title="বন্ধ করুন"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon & Message */}
        <div className="pt-8 pb-4 px-6 text-center bg-gradient-to-b from-emerald-50 to-white">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 mb-4 ring-8 ring-emerald-50 shadow-inner">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-1.5">
            অর্ডার সফলভাবে গৃহীত হয়েছে! 🎉
          </h3>
          <p className="text-sm text-emerald-800 font-medium px-2 leading-relaxed">
            আপনার লিস্ট আমরা পেয়েছি! কিছুক্ষণের মধ্যেই কল করে কনফার্ম করা হবে।
          </p>
        </div>

        {/* Order Details Card */}
        <div className="px-6 py-4">
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200/80 space-y-2.5 text-xs sm:text-sm">
            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
              <span className="text-gray-500">অর্ডার নম্বর:</span>
              <span className="font-bold text-gray-900 font-mono">
                #TE-{order.id}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">গ্রাহকের নাম:</span>
              <span className="font-semibold text-gray-900">
                {order.customer_name}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">মোবাইল নম্বর:</span>
              <span className="font-semibold text-gray-900 font-mono">
                {order.phone}
              </span>
            </div>
            <div className="flex justify-between items-start gap-4">
              <span className="text-gray-500 shrink-0">ডেলিভারি ঠিকানা:</span>
              <span className="font-medium text-gray-800 text-right">
                {order.address}
              </span>
            </div>
          </div>
        </div>

        {/* Contact & Next Steps */}
        <div className="p-6 pt-2 space-y-3">
          <div className="grid grid-cols-2 gap-2.5">
            <a
              href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(
                `হ্যালো টাঙ্গাইল এক্সপ্রেস, আমার অর্ডার নম্বর #TE-${order.id}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs transition-colors border border-emerald-200"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp চ্যাট</span>
            </a>

            <a
              href={`tel:${phone}`}
              className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-xs transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>সরাসরি কল</span>
            </a>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer"
          >
            নতুন আরেকটি অর্ডার করুন
          </button>
        </div>
      </div>
    </div>
  );
}
