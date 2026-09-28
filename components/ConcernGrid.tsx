"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { getAttributeValues } from "@/lib/api/attributes";

interface Concern {
  id: string;
  name: string;
  subText: string;
  image: string;
}

const fallbackConcerns: Concern[] = [
  {
    id: "Dry Skin",
    name: "Dryness & Dehydration",
    subText: "Intense Moisture Infusion",
    image: "/images/concern_dry.png",
  },
  {
    id: "Acne Prone",
    name: "Acne & Sensitive Skin",
    subText: "Soothe & Calming Botanicals",
    image: "/images/concern_acne.png",
  },
  {
    id: "Anti-Aging",
    name: "Aging & Firming",
    subText: "Restore Elasticity & Lift",
    image: "/images/concern_aging.png",
  },
  {
    id: "Dullness",
    name: "Dullness & Dark Spots",
    subText: "Brighten & Glow Ampoules",
    image: "/images/concern_glow.png",
  },
];

interface ConcernGridProps {
  initialConcerns?: Concern[];
}

export default function ConcernGrid({ initialConcerns }: ConcernGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const selectedConcern = searchParams?.get("concern");

  const [concerns, setConcerns] = useState<Concern[]>(
    initialConcerns && initialConcerns.length > 0
      ? initialConcerns
      : fallbackConcerns,
  );

  useEffect(() => {
    if (initialConcerns && initialConcerns.length > 0) return;
    let isMounted = true;
    async function fetchConcerns() {
      try {
        const res = await getAttributeValues("skin-concern");
        if (res && res.success && res.resources) {
          const apiBase =
            process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
          const attributeData = res.resources;
          if (
            attributeData.values &&
            Array.isArray(attributeData.values) &&
            attributeData.values.length > 0
          ) {
            const mapped: Concern[] = attributeData.values
              .filter((v: any) => v.is_active !== false)
              .map((v: any, index: number) => {
                const fallbackImg =
                  fallbackConcerns[index % fallbackConcerns.length].image;
                const img = v.image
                  ? v.image.startsWith("http")
                    ? v.image
                    : `${apiBase}${v.image}`
                  : fallbackImg;
                return {
                  id: v.value,
                  name: v.meta_title || v.value,
                  subText: v.meta_description || "Targeted Skin Solution",
                  image: img,
                };
              });
            if (mapped.length > 0 && isMounted) {
              setConcerns(mapped);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load concern attributes from API", err);
      }
    }
    fetchConcerns();
    return () => {
      isMounted = false;
    };
  }, [initialConcerns]);

  const onConcernClick = (concern: string | null) => {
    const params = new URLSearchParams(searchParams?.toString());
    if (concern) {
      params.set("concern", concern);
      params.delete("category");
    } else {
      params.delete("concern");
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsToShow, setItemsToShow] = useState(3);
  const [isHovered, setIsHovered] = useState(false);

  // Responsive items to show
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsToShow(1);
      } else if (window.innerWidth < 1024) {
        setItemsToShow(2);
      } else {
        setItemsToShow(3);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto-play timer (pauses when user hovers)
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % concerns.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isHovered]);

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + concerns.length) % concerns.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % concerns.length);
  };

  // Duplicate items array to make the looping feel smooth and seamless
  const extendedConcerns = [...concerns, ...concerns];

  return (
    <section className="w-full max-w-7xl mx-auto px-6 pt-6 pb-3 md:pt-8 md:pb-4 select-none">
      {/* Title Header */}
      <div className="flex flex-col text-left border-b border-[#E5E5E5] pb-4 mb-6">
        <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-normal text-[#121212] tracking-wide">
          Shop by Skin Concern
        </h2>
      </div>

      {/* Slider Container */}
      <div
        className="relative w-full overflow-hidden group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Navigation Arrows */}
        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-neutral-900/80 hover:bg-neutral-900 text-neutral-50 border border-neutral-700/50 p-2.5 rounded-md transition-colors cursor-pointer opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-neutral-900"
          aria-label="Previous slide"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-neutral-900/80 hover:bg-neutral-900 text-neutral-50 border border-neutral-700/50 p-2.5 rounded-md transition-colors cursor-pointer opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-neutral-900"
          aria-label="Next slide"
        >
          <ChevronRight size={18} />
        </button>

        {/* Sliding Track (Flex wrapper) */}
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{
            transform: `translateX(-${currentIndex * (100 / itemsToShow)}%)`,
          }}
        >
          {extendedConcerns.map((concern, idx) => {
            const isSelected = selectedConcern === concern.id;
            return (
              <div
                key={`${concern.id}-${idx}`}
                className="flex-shrink-0 px-1.5 transition-all duration-350"
                style={{ width: `${100 / itemsToShow}%` }}
              >
                <button
                  onClick={() => onConcernClick(isSelected ? null : concern.id)}
                  className={`w-full group/card relative h-80 sm:h-96 rounded-lg overflow-hidden border cursor-pointer transition-colors ${
                    isSelected
                      ? "border-neutral-900 dark:border-neutral-100 ring-1 ring-neutral-900 dark:ring-neutral-100"
                      : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600"
                  }`}
                >
                  {/* Background Image */}
                  <Image
                    src={concern.image}
                    alt={concern.name}
                    fill
                    className="object-cover"
                    sizes="(max-w-7xl) 33vw, 100vw"
                  />

                  {/* Tint overlay */}
                  <div
                    className={`absolute inset-0 transition-colors ${
                      isSelected
                        ? "bg-black/50"
                        : "bg-black/35 group-hover/card:bg-black/25"
                    }`}
                  />

                  {/* Text details */}
                  <div className="absolute inset-0 p-5 flex flex-col justify-end text-left text-white z-10">
                    <span className="text-[10px] font-medium tracking-[0.2em] text-neutral-300 uppercase mb-1">
                      {concern.subText}
                    </span>
                    <h3 className="font-serif text-lg md:text-xl font-normal tracking-wide leading-tight mb-2 text-white">
                      {concern.name}
                    </h3>
                    <span className="text-[10px] font-semibold tracking-wider uppercase border-b border-white/60 pb-0.5 self-start group-hover/card:border-white transition-colors">
                      {isSelected ? "Filter active" : "Explore"}
                    </span>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Slide Indicators/Dots */}
      <div className="flex justify-center gap-2 mt-4">
        {concerns.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`h-1 rounded-xs transition-all duration-300 cursor-pointer ${
              idx === currentIndex ? "bg-[#121212] w-6" : "bg-[#121212]/20 w-2"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
