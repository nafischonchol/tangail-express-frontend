"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { getHeroBanners } from "@/lib/api/banners";

interface Slide {
  image: string;
  title: string;
  subtitle: string;
  tagline: string;
  ctaText: string;
}

export default function HeroSection() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [dynamicSlides, setDynamicSlides] = useState<Slide[]>([]);

  const handleNext = () => {
    setCurrentIdx((prev) => (prev + 1) % dynamicSlides.length);
  };

  const handlePrev = () => {
    setCurrentIdx(
      (prev) => (prev - 1 + dynamicSlides.length) % dynamicSlides.length,
    );
  };

  useEffect(() => {
    const fetchHeroBanners = async () => {
      try {
        const data = await getHeroBanners();

        if (data.success && data.resources && data.resources.length > 0) {
          const mapped: Slide[] = data.resources.map((item: any) => ({
            image: item.banner_image,
            tagline: item.type_label
              ? item.type_label.toUpperCase()
              : "EID OFFER",
            title: item.name || "Special Promotion",
            subtitle:
              item.short_description ||
              "Experience the glow with Mohima's premium collection of authentic beauty and luxury skincare.",
            ctaText: "Shop Now",
            redirectUrl: item.redirect_url,
          }));
          setDynamicSlides(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch hero banners from API:", err);
      }
    };

    fetchHeroBanners();
  }, []);

  useEffect(() => {
    const timer = setInterval(handleNext, 6000);
    return () => clearInterval(timer);
  }, [dynamicSlides.length]);

  if (dynamicSlides.length === 0) {
    return null;
  }

  return (
    <section className="relative w-full h-[350px] sm:h-[450px] md:h-[550px] bg-neutral-900 overflow-hidden select-none">
      {/* Slides Container */}
      <div className="relative w-full h-full">
        {dynamicSlides.map((slide, index) => {
          const isActive = index === currentIdx;
          const redirectUrl = (slide as any).redirectUrl;

          return (
            <div
              key={index}
              onClick={() => {
                if (redirectUrl) {
                  window.location.href = redirectUrl;
                }
              }}
              className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
                redirectUrl ? "cursor-pointer" : ""
              } ${
                isActive ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              <Image
                src={slide.image}
                alt={slide.title || "Hero Banner"}
                fill
                priority={index === 0}
                className="object-cover object-center"
                sizes="100vw"
              />
            </div>
          );
        })}
      </div>

      {/* Navigation Chevrons */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-neutral-900/60 hover:bg-neutral-900 text-neutral-50 border border-neutral-700/50 p-2 rounded-md transition-colors z-30 cursor-pointer focus-visible:ring-2 focus-visible:ring-white"
        aria-label="Previous slide"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-neutral-900/60 hover:bg-neutral-900 text-neutral-50 border border-neutral-700/50 p-2 rounded-md transition-colors z-30 cursor-pointer focus-visible:ring-2 focus-visible:ring-white"
        aria-label="Next slide"
      >
        <ChevronRight size={18} />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-y-1/2 -translate-x-1/2 flex items-center gap-2 z-30">
        {dynamicSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIdx(index)}
            className={`h-1 rounded-xs transition-all duration-300 cursor-pointer ${
              index === currentIdx ? "bg-white w-6" : "bg-white/40 w-2"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
