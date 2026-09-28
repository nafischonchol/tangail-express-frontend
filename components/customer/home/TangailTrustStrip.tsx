"use client";

import React from "react";
import { Truck, Wallet, ShieldCheck, PhoneCall } from "lucide-react";

export default function TangailTrustStrip() {
  const trustItems = [
    {
      icon: <Truck className="w-5 h-5 text-emerald-600" />,
      title: "টাঙ্গাইল শহরে ডেলিভারি",
      subtitle: "সরাসরি আপনার ঠিকানায় বাসায় পৌঁছাবে",
    },
    {
      icon: <Wallet className="w-5 h-5 text-emerald-600" />,
      title: "ক্যাশ অন ডেলিভারি",
      subtitle: "বাজার হাতে বুঝে পেয়ে মূল্য পরিশোধ",
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
      title: "১০০% কোয়ালিটি নিশ্চয়তা",
      subtitle: "পছন্দ না হলে সাথে সাথেই রিটার্ন সুবিধা",
    },
    {
      icon: <PhoneCall className="w-5 h-5 text-emerald-600" />,
      title: "সরাসরি ফোন সাপোর্ট",
      subtitle: "01700-000000 (সকাল ৭টা - রাত ১০টা)",
    },
  ];

  return (
    <section className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/80 p-4 sm:p-5 shadow-xs">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
        {trustItems.map((item, index) => (
          <div
            key={index}
            className={`flex items-center gap-3.5 ${
              index > 0 ? "pt-3 sm:pt-0 sm:pl-4" : ""
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 shadow-2xs">
              {item.icon}
            </div>
            <div>
              <strong className="block text-xs sm:text-sm font-bold text-gray-900 leading-tight">
                {item.title}
              </strong>
              <small className="block text-[11px] sm:text-xs text-gray-500 font-medium leading-tight mt-0.5">
                {item.subtitle}
              </small>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
