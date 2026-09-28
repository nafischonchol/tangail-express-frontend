"use client";

import React from "react";
import { Truck, ShieldCheck, PhoneCall, Sparkles } from "lucide-react";

export default function TangailAnnouncementBar() {
  return (
    <div className="bg-[#143d2b] text-emerald-100 text-xs py-2 px-4 border-b border-emerald-900/50">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2 text-[11px] sm:text-xs">
        <div className="flex items-center gap-2 font-medium">
          <Truck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>টাঙ্গাইল পৌরসভা ও সদর এলাকায় দ্রুত হোম বাজার সার্ভিস</span>
          <span className="hidden md:inline text-emerald-500">•</span>
          <span className="hidden md:inline text-emerald-200">
            পণ্য হাতে পেয়ে যাচাই করে মূল্য পরিশোধ করুন
          </span>
        </div>

        <div className="flex items-center gap-3 font-semibold text-emerald-300">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>১০০% কোয়ালিটি নিশ্চয়তা</span>
          </span>
          <span className="text-emerald-600 hidden sm:inline">|</span>
          <a
            href="tel:01700000000"
            className="hidden sm:flex items-center gap-1 text-white hover:text-emerald-300 transition-colors"
          >
            <PhoneCall className="w-3 h-3 text-emerald-400" />
            <span>হেল্পলাইন: 01700-000000</span>
          </a>
        </div>
      </div>
    </div>
  );
}
