"use client";

import React from "react";
import Link from "next/link";
import { Phone, MessageCircle, ShoppingBag, ShieldCheck } from "lucide-react";

interface TangailExpressHeaderProps {
  phone?: string;
  whatsapp?: string;
}

export default function TangailExpressHeader({
  phone = "01700000000",
  whatsapp = "8801700000000",
}: TangailExpressHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-xs">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-200 group-hover:scale-105 transition-transform">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg text-gray-900 leading-tight tracking-tight">
                Tangail Express
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                টাঙ্গাইল
              </span>
            </div>
            <p className="text-[11px] text-gray-500 font-medium leading-none mt-0.5">
              বাজারের টেনশন মুক্ত ডেলিভারি
            </p>
          </div>
        </Link>

        {/* Quick Contact Actions */}
        <div className="flex items-center gap-2">
          {/* WhatsApp Button */}
          <a
            href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(
              "হ্যালো টাঙ্গাইল এক্সপ্রেস, আমি বাজার অর্ডার করতে চাই।"
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs transition-colors border border-emerald-200 shadow-2xs"
            title="WhatsApp এ মেসেজ করুন"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-600/20" />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>

          {/* Call Button */}
          <a
            href={`tel:${phone}`}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gray-900 hover:bg-black text-white font-semibold text-xs transition-colors shadow-2xs"
            title="সরাসরি কল করুন"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>কল করুন</span>
          </a>
        </div>
      </div>
    </header>
  );
}
