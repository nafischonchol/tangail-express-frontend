"use client";

import React from "react";
import { Star, Quote, MapPin, CheckCircle, UserCheck } from "lucide-react";

interface Review {
  id: number;
  name: string;
  location: string;
  rating: number;
  text: string;
  orderType: string;
  date: string;
}

const customerReviews: Review[] = [
  {
    id: 1,
    name: "মাহমুদুর রহমান",
    location: "কলেজ মোড়, টাঙ্গাইল",
    rating: 5,
    text: "ব্যাংক থেকে ফিরে বাজারে যাওয়া খুব কষ্টের ছিল। টাঙ্গাইল এক্সপ্রেসের মাধ্যমে লিস্ট পাঠিয়ে দিয়েছিলাম, মাত্র ৫০ মিনিটের মাথায় একদম টাটকা দেশি মাছ ও তাজা শাকসবজি পেয়ে গেছি। মাশাল্লাহ অসাধারণ সার্ভিস!",
    orderType: "শাকসবজি ও দেশি মাছ",
    date: "গতকাল",
  },
  {
    id: 2,
    name: "সৈয়দ আহসান হাবীব",
    location: "ভিক্টোরিয়া রোড, টাঙ্গাইল",
    rating: 5,
    text: "সবচেয়ে ভালো লেগেছে কাগজের লিস্টের ছবি তুলে পাঠানোর সিস্টেমটা। কোনো অ্যাকাউন্ট খোলা লাগেনি। ফোন দিয়ে সুন্দর করে দাম জানিয়ে দিয়ে গেছে। পণ্যের ওজন ও কোয়ালিটি ১০০% সঠিক ছিল।",
    orderType: "মুদি সামগ্রী ও ফার্মের ডিম",
    date: "২ দিন আগে",
  },
  {
    id: 3,
    name: "নাজমিন আক্তার",
    location: "আকুর টাকুর পাড়া, টাঙ্গাইল",
    rating: 5,
    text: "বাসায় মেহমান এসেছিল হঠাৎ করে, বাজারে যাওয়ার মানুষ ছিল না। ভয়েসে বলে অর্ডার করেছিলাম—হাঁসের মাংস আর ফ্রেশ সালাদের সব আইটেম একদম ঠিক সময়ে পৌঁছে দিয়েছে। ধন্যবাদ টাঙ্গাইল এক্সপ্রেসকে!",
    orderType: "মাংস ও স্পেশাল বাজার",
    date: "৩ দিন আগে",
  },
  {
    id: 4,
    name: "ইঞ্জিনিয়ার কামরুল হাসান",
    location: "সাবালিয়া, টাঙ্গাইল",
    rating: 5,
    text: "টাঙ্গাইলে এমন একটি স্মার্ট সার্ভিস সত্যি দরকার ছিল। ডেলিভারি ম্যান খুব ভদ্র এবং ক্যাশ অন ডেলিভারিতে চেক করে পেমেন্ট নেওয়ার সুযোগ থাকায় ভরসা অনেক গুণ বেড়ে গেছে। নিয়মিত নেব ইনশাআল্লাহ।",
    orderType: "সাপ্তাহিক বাজার",
    date: "৫ দিন আগে",
  },
];

export default function TangailReviews() {
  return (
    <section className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 border border-gray-200/80 shadow-xs space-y-6" id="reviews">
      {/* Section Header */}
      <div className="text-center max-w-xl mx-auto space-y-1.5">
        <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 inline-block">
          CUSTOMER SATISFACTION
        </span>
        <h2 className="text-xl sm:text-3xl font-black text-gray-900 tracking-tight">
          সম্মানিত গ্রাহকদের সন্তুষ্টি ও মতামত
        </h2>
        <p className="text-xs sm:text-sm text-gray-500">
          টাঙ্গাইল শহরের শত শত পরিবার আস্থা রেখেছেন আমাদের হোম বাজার সার্ভিসে
        </p>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {customerReviews.map((review) => (
          <div
            key={review.id}
            className="p-5 rounded-2xl bg-[#fafbfc] border border-gray-200/80 hover:border-emerald-300 hover:shadow-xs transition-all flex flex-col justify-between"
          >
            <div>
              {/* Stars & Rating */}
              <div className="flex items-center gap-1 mb-3 text-amber-400">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>

              {/* Review Text */}
              <p className="text-xs text-gray-700 leading-relaxed italic">
                "{review.text}"
              </p>
            </div>

            {/* Customer Details */}
            <div className="mt-4 pt-3 border-t border-gray-200/70 space-y-1">
              <div className="flex items-center justify-between">
                <strong className="text-xs font-bold text-gray-900 flex items-center gap-1">
                  <span>{review.name}</span>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 inline" />
                </strong>
                <span className="text-[10px] text-gray-400">{review.date}</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-gray-500 font-medium">
                <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>{review.location}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
