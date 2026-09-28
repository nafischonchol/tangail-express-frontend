import { Sparkles, ArrowRight, Building2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Banner } from "@/lib/api/banners";

interface CustomerHeroProps {
  heroBanners?: Banner[];
}

export function CustomerHero({ heroBanners = [] }: CustomerHeroProps) {
  const activeBanners = heroBanners.filter((b) => b.banner_image);

  let bannerList: { src: string; alt: string; url?: string | null }[] = [];

  if (activeBanners.length > 0) {
    const mapped = activeBanners.map((b) => ({
      src: b.banner_image!,
      alt: b.name || "Hero Banner",
      url: b.redirect_url,
    }));
    // Repeat items if count is small so marquee animation loops smoothly
    bannerList = mapped;
    while (bannerList.length < 4) {
      bannerList = [...bannerList, ...mapped];
    }
  }

  return (
    <section className="relative w-full pt-8 pb-12 md:pt-12 md:pb-16 overflow-hidden bg-neutral-50/50 dark:bg-zinc-950 border-b border-zinc-200/80 dark:border-zinc-850 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-5 sm:space-y-6">
        
        {/* Subtle Pill Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-[#FDF2F8] border border-[#FBCFE8] text-[#9F3375] shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-[#BA478F] shrink-0" />
          <span>
            🇰🇷 100% Authentic Korean Skincare & Cosmetics
          </span>
        </div>

        {/* Minimalist Editorial Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-zinc-900 dark:text-white tracking-tight leading-[1.15] max-w-4xl mx-auto">
          Discover the Glow of{" "}
          <span className="text-[#BA478F]">
            Authentic K-Beauty
          </span>
        </h1>

        <div className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          <p>
            Curated selection of genuine skincare, serums, sunscreens, and makeup sourced directly from top verified brands in South Korea.
          </p>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/catalog"
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[#BA478F] hover:bg-[#9F3375] text-white font-semibold text-sm transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D062A5] focus-visible:ring-offset-2"
          >
            Shop Collection
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/best-sellings"
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
          >
            <Sparkles size={16} className="text-[#BA478F]" />
            Best Sellers
          </Link>
        </div>

        {/* Promotional Banners Marquee */}
        {bannerList.length > 0 && (
          <div className="w-full max-w-6xl mx-auto pt-8 mt-6 border-t border-zinc-200 dark:border-zinc-800/80">
            <div className="relative flex overflow-hidden w-full">
              <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex shrink-0">
                    {bannerList.map((item, idx) => {
                      const content = (
                        <Image
                          src={item.src}
                          alt={item.alt}
                          width={500}
                          height={256}
                          unoptimized
                          className="w-full h-40 sm:h-52 md:h-60 rounded-xl object-cover border border-zinc-200 dark:border-zinc-800 transition-transform duration-200 hover:scale-[1.01]"
                        />
                      );

                      return (
                        <div
                          key={`banner-${i}-${idx}`}
                          className="w-[280px] sm:w-[380px] md:w-[460px] shrink-0 px-2 sm:px-3"
                        >
                          {item.url ? (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block"
                            >
                              {content}
                            </a>
                          ) : (
                            content
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Edge fade */}
              <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-24 bg-gradient-to-r from-neutral-50/90 dark:from-zinc-950 to-transparent z-10" />
              <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-24 bg-gradient-to-l from-neutral-50/90 dark:from-zinc-950 to-transparent z-10" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
