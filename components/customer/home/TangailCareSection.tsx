"use client";

import React from "react";
import {
  ShieldCheck,
  Sparkles,
  HeartHandshake,
  Smile,
  CheckCircle,
  ArrowRight,
  Clock,
  Scale,
} from "lucide-react";

export default function TangailCareSection() {
  return (
    <section className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 border border-gray-200/80 shadow-xs">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Visual Card / Guarantee Showcase */}
        <div className="lg:col-span-5">
          <div className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#103b2b] via-[#164e3b] to-[#0a261c] p-6 sm:p-8 text-white overflow-hidden shadow-lg">
            {/* Background glowing shapes */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />

            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>টাঙ্গাইলের সেরা হোম বাজার সার্ভিস</span>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white leading-snug">
                  আপনার ঘরের বাজার, <br />
                  <span className="text-amber-300">আমাদের বিশ্বস্ত যত্ন।</span>
                </h3>
                <p className="text-xs sm:text-sm text-emerald-100/90 mt-2 leading-relaxed">
                  আমরা প্রতিটি আইটেম কেনার সময় এমনভাবে বাছাই করি যেন নিজের পরিবারের জন্য বাজার করছি।
                </p>
              </div>

              {/* Assurance Badge Box */}
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                  <ShieldCheck className="w-5 h-5 text-amber-300 shrink-0" />
                  <span>১০০% স্যাটিসফ্যাকশন গ্যারান্টি</span>
                </div>
                <p className="text-xs text-emerald-100/80 leading-relaxed">
                  কোনো পণ্যের মান বা ওজনে সামান্যতম অসন্তুষ্টি থাকলে আমরা বিনা প্রশ্নে পরিবর্তন বা টাকা ফেরত দেব।
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-emerald-200/80">
                <span>📍 সার্ভিস এরিয়া: সমগ্র টাঙ্গাইল শহর</span>
                <span className="font-semibold text-white">সকাল ৭টা - রাত ১০টা</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Benefits copy */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 inline-block mb-2">
              BRING COMFORT HOME
            </span>
            <h2 className="text-xl sm:text-3xl font-black text-gray-900 tracking-tight leading-snug">
              ঘরের আরামটুকু থাকুক অটুট, <br />
              <span className="text-emerald-700">বাজারের ঝামেলা ছেড়ে দিন আমাদের ওপর।</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
              অফিস শেষে জ্যাম আর ভিড়ের বাজারে দৌড়াদৌড়ি করার দিন শেষ। একটি ক্লিকেই পেয়ে যান তাজা ও টাটকা বাজার।
            </p>
          </div>

          <div className="space-y-4">
            {/* Benefit 1 */}
            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100 hover:bg-emerald-50/40 hover:border-emerald-100 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">
                  মূল্যবান সময় ও শক্তি বাঁচান
                </h4>
                <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                  কাজের ফাঁকে বা পরিবারের সাথে কাটানো সময়কে কাজে লাগান। বাজারের পুরো দায়িত্ব আমাদের অভিজ্ঞ টিমের।
                </p>
              </div>
            </div>

            {/* Benefit 2 */}
            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100 hover:bg-emerald-50/40 hover:border-emerald-100 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">
                  ন্যায্য দাম ও ডিজিটাল সঠিক ওজন
                </h4>
                <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                  টাঙ্গাইলের লোকাল পাইকারি ও খুচরা বাজারের আসল দরদাম অনুযায়ী ডিজিটাল স্কেলে মেপে বাজার পৌঁছে দেওয়া হয়।
                </p>
              </div>
            </div>

            {/* Benefit 3 */}
            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100 hover:bg-emerald-50/40 hover:border-emerald-100 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">
                  নিশ্চিন্ত ক্যাশ অন ডেলিভারি
                </h4>
                <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                  পণ্য বাসার দরজায় আসার পর নিজে দেখে, মেপে ও যাচাই করে সন্তুষ্ট হয়ে টাকা পরিশোধ করুন।
                </p>
              </div>
            </div>
          </div>

          <div className="pt-1">
            <a
              href="#order-section"
              className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 hover:text-emerald-800 group"
            >
              <span>আজকের বাজার এখনই অর্ডার করুন</span>
              <ArrowRight className="w-4 h-4 text-emerald-700 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
