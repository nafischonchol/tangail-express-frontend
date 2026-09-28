"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShoppingBag,
  Camera,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Clock,
} from "lucide-react";

interface SlideData {
  id: number;
  badge: string;
  badgeIcon: React.ReactNode;
  title: string;
  highlight: string;
  description: string;
  actionText: string;
  actionHref: string;
  bgGradient: string;
  accentBg: string;
  textColor: string;
}

const slides: SlideData[] = [
  {
    id: 1,
    badge: "টাঙ্গাইল এক্সপ্রেস স্পেশাল",
    badgeIcon: <Sparkles className="w-3.5 h-3.5 text-amber-300" />,
    title: "অফিস থেকে ফেরার পথে বাজারের টেনশন?",
    highlight: "বাজারের লিস্ট দিন, ঘরে পৌঁছে যাবে তাজা বাজার।",
    description:
      "কোনো অ্যাকাউন্ট বা পাসওয়ার্ডের ঝামেলা নেই। লিস্ট লিখে দিন বা ছবি তুলুন।",
    actionText: "লিস্ট জমা দিন",
    actionHref: "#order-section",
    bgGradient: "from-[#0f3d2e] via-[#164e3b] to-[#1e5d47]",
    accentBg: "bg-emerald-500/20 border-emerald-400/30",
    textColor: "text-emerald-100",
  },
  {
    id: 2,
    badge: "১০০% তাজা ও খাঁটি",
    badgeIcon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />,
    title: "তাজা শাকসবজি, দেশি মাছ ও ফ্রেশ মাংস",
    highlight: "সরাসরি টাঙ্গাইলের সেরা বাজার থেকে বাছাইকৃত সেরা পণ্য।",
    description: "অভিজ্ঞ বাজারকারী দিয়ে নিখুঁত বাছাই ও সঠিক ওজনের নিশ্চয়তা।",
    actionText: "আজকের বাজার অর্ডার করুন",
    actionHref: "#order-section",
    bgGradient: "from-[#1b3d1f] via-[#245229] to-[#2d6a35]",
    accentBg: "bg-lime-500/20 border-lime-400/30",
    textColor: "text-lime-100",
  },
  {
    id: 3,
    badge: "জিরো ফ্রিকশন অর্ডার",
    badgeIcon: <Camera className="w-3.5 h-3.5 text-sky-300" />,
    title: "কাগজে লেখা লিস্টের ছবি তুলুন বা মুখে বলুন",
    highlight: "যেভাবে সুবিধা ঠিক সেভাবেই দিন আপনার বাজারের তালিকা।",
    description:
      "খাতায় লিখে ছবি আপলোড করুন অথবা অডিও রেকর্ড করে এক ক্লিকে পাঠান।",
    actionText: "ছবি/ভয়েস দিয়ে অর্ডার করুন",
    actionHref: "#order-section",
    bgGradient: "from-[#13334c] via-[#1b4465] to-[#22557e]",
    accentBg: "bg-sky-500/20 border-sky-400/30",
    textColor: "text-sky-100",
  },
  {
    id: 4,
    badge: "নির্ভরতার প্রতীক",
    badgeIcon: <ShieldCheck className="w-3.5 h-3.5 text-teal-300" />,
    title: "যাচাই করে ক্যাশ অন ডেলিভারিতে মূল্য দিন",
    highlight: "কোনো পণ্যে অসন্তুষ্ট হলে সাথে সাথে রিটার্ন সুবিধা।",
    description: "টাঙ্গাইল শহরের প্রতিটি মহল্লায় দ্রুত ও নির্ভরযোগ্য ডেলিভারি।",
    actionText: "ঝামেলামুক্ত বাজার করুন",
    actionHref: "#order-section",
    bgGradient: "from-[#1a3a3a] via-[#1f4e4e] to-[#266363]",
    accentBg: "bg-teal-500/20 border-teal-400/30",
    textColor: "text-teal-100",
  },
];

export default function TangailHeroSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl shadow-md border border-gray-200/60 bg-gray-900"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* Slides Container - Compact Height */}
      <div
        className="flex transition-transform duration-500 ease-out h-[190px] sm:h-[210px] md:h-[230px]"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {slides.map((slide) => (
          <div
            key={slide.id}
            className={`w-full flex-shrink-0 relative bg-gradient-to-r ${slide.bgGradient} p-4 sm:p-6 md:p-8 flex flex-col justify-between text-white select-none`}
          >
            {/* Background Decorative Circles */}
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-white/10 to-transparent pointer-events-none" />
            <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-white/5 blur-2xl pointer-events-none" />

            {/* Top Badge & Timer Icon */}
            <div className="flex items-center justify-between gap-2 z-10">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-semibold border ${slide.accentBg} backdrop-blur-xs`}
              >
                {slide.badgeIcon}
                <span className="tracking-wide">{slide.badge}</span>
              </span>

              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-white/80 font-medium bg-black/20 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                <Clock className="w-3 h-3 text-emerald-300" />
                <span>টাঙ্গাইল শহর সার্ভিস</span>
              </span>
            </div>

            {/* Main Content - Compact & High-Impact */}
            <div className="my-auto z-10 pr-6 sm:pr-12">
              <h2 className="text-base sm:text-xl md:text-2xl font-black text-white leading-tight sm:leading-snug tracking-tight">
                {slide.title}{" "}
                <span className="text-amber-300 block sm:inline font-bold">
                  {slide.highlight}
                </span>
              </h2>
              <p
                className={`text-xs sm:text-sm mt-1 sm:mt-1.5 max-w-xl line-clamp-1 sm:line-clamp-2 ${slide.textColor}`}
              >
                {slide.description}
              </p>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between gap-3 z-10 pt-1">
              <a
                href={slide.actionHref}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-white text-gray-900 font-bold text-xs sm:text-sm hover:bg-emerald-50 active:scale-95 transition-all shadow-sm group"
              >
                <span>{slide.actionText}</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-700 group-hover:translate-x-0.5 transition-transform" />
              </a>

              <div className="flex items-center gap-1 text-[11px] text-white/80 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden xs:inline">ক্যাশ অন ডেলিভারি</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        aria-label="পূর্ববর্তী স্লাইড"
        className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-xs transition-colors cursor-pointer z-20 border border-white/10"
      >
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
      <button
        onClick={nextSlide}
        aria-label="পরবর্তী স্লাইড"
        className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/30 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-xs transition-colors cursor-pointer z-20 border border-white/10"
      >
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            aria-label={`স্লাইড ${idx + 1}`}
            className={`h-1.5 rounded-full transition-all cursor-pointer ${
              currentIndex === idx
                ? "w-6 bg-amber-400"
                : "w-2 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
