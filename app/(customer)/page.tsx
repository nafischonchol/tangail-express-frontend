"use client";

import React, { useRef } from "react";
import TangailAnnouncementBar from "@/components/customer/home/TangailAnnouncementBar";
import TangailExpressHeader from "@/components/customer/TangailExpressHeader";
import TangailHeroSlider from "@/components/customer/home/TangailHeroSlider";
import TangailTrustStrip from "@/components/customer/home/TangailTrustStrip";
import TangailBazarPresets from "@/components/customer/home/TangailBazarPresets";
import TangailCareSection from "@/components/customer/home/TangailCareSection";
import TangailHowItWorks from "@/components/customer/home/TangailHowItWorks";
import TangailReviews from "@/components/customer/home/TangailReviews";
import TangailFaq from "@/components/customer/home/TangailFaq";
import TangailFooter from "@/components/customer/home/TangailFooter";
import OrderForm, { OrderFormHandle } from "@/components/customer/OrderForm";

export default function CustomerHomePage() {
  const orderFormRef = useRef<OrderFormHandle | null>(null);

  const handleSelectPreset = (presetText: string) => {
    if (orderFormRef.current) {
      orderFormRef.current.setListText(presetText);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f7f6] font-sans text-gray-900 selection:bg-emerald-200 selection:text-emerald-900">
      {/* Top Announcement Bar */}
      <TangailAnnouncementBar />

      {/* Main Header */}
      <TangailExpressHeader />

      {/* Main Content Container */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-8 sm:space-y-10">
        {/* 1. Compact Hero Slider (Low Height as requested) */}
        <section>
          <TangailHeroSlider />
        </section>

        {/* 2. Trust Strip (4 Value Badges) */}
        <section>
          <TangailTrustStrip />
        </section>

        {/* 3. Core Frictionless Order Form */}
        <section id="order-section" className="scroll-mt-20">
          <div className="text-center max-w-xl mx-auto mb-6 space-y-1.5">
            <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-block">
              ZERO FRICTION ORDER
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              আজকের বাজার অর্ডার করুন
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              ফর্মটি পূরণ করুন অথবা লিস্টের ছবি/ভয়েস দিন — বাকি দায়িত্ব আমাদের।
            </p>
          </div>

          <OrderForm ref={orderFormRef} />
        </section>

        {/* 4. Popular Bazar Packages / Categories */}
        <section className="pt-2">
          <TangailBazarPresets onSelectPreset={handleSelectPreset} />
        </section>

        {/* 5. Care & Comfort Section */}
        <section className="pt-2">
          <TangailCareSection />
        </section>

        {/* 6. How It Works (3 Steps) */}
        <section className="pt-2">
          <TangailHowItWorks />
        </section>

        {/* 7. Customer Reviews & Social Proof */}
        <section className="pt-2">
          <TangailReviews />
        </section>

        {/* 8. FAQ Section */}
        <section className="pt-2">
          <TangailFaq />
        </section>
      </main>

      {/* Footer */}
      <TangailFooter />
    </div>
  );
}
