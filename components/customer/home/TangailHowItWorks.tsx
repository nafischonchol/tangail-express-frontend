"use client";

import React from "react";
import { FileEdit, PhoneCall, PackageCheck, Sparkles } from "lucide-react";

export default function TangailHowItWorks() {
  const steps = [
    {
      step: "০১",
      title: "লিস্ট জমা দিন",
      icon: <FileEdit className="w-5 h-5 text-emerald-700" />,
      description:
        "খাতায় লিখে ছবি তুলুন, টেক্সট বক্সে লিখুন অথবা মুখে বলে অডিও মেসেজ পাঠান। কোনো অ্যাকাউন্ট বা রেজিস্ট্রেশনের প্রয়োজন নেই।",
    },
    {
      step: "০২",
      title: "ফোন দিয়ে কনফার্ম",
      icon: <PhoneCall className="w-5 h-5 text-emerald-700" />,
      description:
        "আমাদের কাস্টমার কেয়ার প্রতিনিধি আপনাকে ফোন করে আইটেম তালিকা, পণ্যের দরদাম এবং মোট আনুমানিক বিল কনফার্ম করবেন।",
    },
    {
      step: "০৩",
      title: "বাসায় বুঝে নিন",
      icon: <PackageCheck className="w-5 h-5 text-emerald-700" />,
      description:
        "আমাদের ডেলিভারি রাইডার টাটকা বাজার আপনার দরজায় পৌঁছে দেবে। পণ্য ও মেমো দেখে ক্যাশ অন ডেলিভারিতে মূল্য দিন।",
    },
  ];

  return (
    <section className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 border border-gray-200/80 shadow-xs space-y-6 sm:space-y-8" id="how-it-works">
      {/* Heading */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 inline-block">
          SIMPLE & FAST PROCESS
        </span>
        <h2 className="text-xl sm:text-3xl font-black text-gray-900 tracking-tight">
          অর্ডার করা খুবই সহজ (মাত্র ৩টি ধাপ)
        </h2>
        <p className="text-xs sm:text-sm text-gray-500">
          টাঙ্গাইল শহরের সবচেয়ে সহজ, আধুনিক ও নির্ভরযোগ্য বাজার সেবা
        </p>
      </div>

      {/* Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 relative">
        {steps.map((item, idx) => (
          <div
            key={idx}
            className="p-6 rounded-2xl sm:rounded-3xl bg-[#f8faf9] border border-gray-200/70 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all flex flex-col justify-between relative group"
          >
            <div>
              {/* Step number badge & icon */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl sm:text-4xl font-black text-emerald-800/80 font-mono">
                  {item.step}
                </span>
                <div className="w-10 h-10 rounded-2xl bg-white border border-gray-200/80 flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xs">
                  {item.icon}
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
                {item.title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="mt-6 pt-3 border-t border-gray-200/60 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
              <Sparkles className="w-3.5 h-3.5" />
              <span>জিরো ফ্রিকশন সার্ভিস</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
