"use client";

import React from "react";
import Link from "next/link";
import { Phone, MessageCircle, ShoppingBag, ArrowRight, Sparkles } from "lucide-react";

interface TangailExpressHeaderProps {
  phone?: string;
  whatsapp?: string;
}

export default function TangailExpressHeader({
  phone = "01700000000",
  whatsapp = "8801700000000",
}: TangailExpressHeaderProps) {
  const scrollToOrder = (e: React.MouseEvent) => {
    e.preventDefault();
    const elem = document.getElementById("order-section");
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shadow-emerald-200 group-hover:scale-105 transition-transform">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base sm:text-lg text-gray-900 leading-tight tracking-tight">
                Tangail Express
              </span>
              <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                টাঙ্গাইল
              </span>
            </div>
            <p className="text-[11px] text-gray-500 font-medium leading-none mt-0.5">
              বাজারের টেনশন মুক্ত ডেলিভারি
            </p>
          </div>
        </Link>

        {/* Navigation Links - Desktop */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-gray-600">
          <a
            href="#bazar-packages"
            className="hover:text-emerald-700 transition-colors"
          >
            জনপ্রিয় প্যাকেজ
          </a>
          <a
            href="#how-it-works"
            className="hover:text-emerald-700 transition-colors"
          >
            ব্যবহারবিধি
          </a>
          <a
            href="#reviews"
            className="hover:text-emerald-700 transition-colors"
          >
            গ্রাহকের মতামত
          </a>
          <a
            href="#faq"
            className="hover:text-emerald-700 transition-colors"
          >
            সাধারণ প্রশ্ন
          </a>
        </nav>

        {/* Quick Contact & Action Buttons */}
        <div className="flex items-center gap-2">
          {/* WhatsApp Button */}
          <a
            href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(
              "হ্যালো টাঙ্গাইল এক্সপ্রেস, আমি বাজার অর্ডার করতে চাই।"
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs transition-colors border border-emerald-200 shadow-2xs"
            title="WhatsApp এ মেসেজ করুন"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-600/20" />
            <span>WhatsApp</span>
          </a>

          {/* Call Button */}
          <a
            href={`tel:${phone}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-xs transition-colors border border-gray-200"
            title="সরাসরি কল করুন"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-700" />
            <span className="hidden xs:inline">কল করুন</span>
          </a>

          {/* Primary Order Button */}
          <button
            type="button"
            onClick={scrollToOrder}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs shadow-xs shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <span>অর্ডার করুন</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
