"use client";

import React, { useState } from "react";
import { ShieldCheck, HeartHandshake, Truck, RefreshCw, Send, Phone, Mail, MapPin } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useStoreSetup } from "@/context/StoreSetupContext";

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
  </svg>
);

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.52 3.5 12 3.5 12 3.5s-7.52 0-9.388.555a3.002 3.002 0 0 0-2.11 2.108C0 8.028 0 12 0 12s0 3.972.502 5.837a3.003 3.003 0 0 0 2.11 2.108C4.48 20.5 12 20.5 12 20.5s7.52 0 9.388-.555a3.003 3.003 0 0 0 2.11-2.108C24 15.972 24 12 24 12s0-3.972-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const TiktokIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.01 1.62 4.2 1.25 1.48 3.04 2.4 4.95 2.6v3.85c-1.8-.1-3.52-.82-4.9-1.92-.09-.07-.17-.16-.29-.27v7.03c.03 5.48-4.56 9.87-10.02 9.77-5.07-.1-9.25-4.22-9.43-9.29C-.07 10.63 4.14 6 9.61 6.01c1.23.01 2.45.29 3.56.84V10.7c-.89-.54-1.92-.83-2.98-.82-2.73.01-4.95 2.22-4.97 4.95-.02 2.92 2.43 5.25 5.35 5.17 2.45-.06 4.54-1.89 4.79-4.32.06-.59.03-1.18.03-1.77V.02h.13z" />
  </svg>
);

export default function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const { storeSetup } = useStoreSetup();

  const storeName = storeSetup?.store_name || "Tangail Express";
  const logoUrl = storeSetup?.logo || "/logo.jpeg";
  const phone = storeSetup?.phone;
  const emailAddress = storeSetup?.email;
  const address = [storeSetup?.street_address, storeSetup?.upazila_name, storeSetup?.district_name]
    .filter(Boolean)
    .join(", ") || storeSetup?.street_address;

  const facebookUrl = storeSetup?.facebook;
  const instagramUrl = storeSetup?.instagram;
  const youtubeUrl = storeSetup?.youtube;
  const tiktokUrl = storeSetup?.tiktok;

  const hasAnySocial = Boolean(facebookUrl || instagramUrl || youtubeUrl || tiktokUrl);
  const fb = facebookUrl || (!hasAnySocial ? "https://facebook.com" : null);
  const ig = instagramUrl || (!hasAnySocial ? "https://instagram.com" : null);
  const yt = youtubeUrl || (!hasAnySocial ? "https://youtube.com" : null);
  const tt = tiktokUrl || (!hasAnySocial ? "https://tiktok.com" : null);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      alert(`Welcome to the Glow Circle! A 15% discount code has been sent to ${newsletterEmail}`);
      setNewsletterEmail("");
    }
  };

  return (
    <footer className="w-full bg-zinc-900 text-zinc-300 border-t border-zinc-800 select-none mt-6 md:mt-8">
      {/* Trust Badges Bar */}
      <div className="w-full border-b border-zinc-800/80 py-10 bg-zinc-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="flex flex-col items-center text-center gap-3">
            <ShieldCheck size={28} className="text-[#D062A5]" />
            <h3 className="text-xs font-bold tracking-widest uppercase text-zinc-100">100% Authentic</h3>
            <p className="text-[10px] text-zinc-400 leading-relaxed font-light max-w-[200px]">
              Directly sourced from trusted brands in South Korea & Japan.
            </p>
          </div>

          <div className="flex flex-col items-center text-center gap-3">
            <HeartHandshake size={28} className="text-[#D062A5]" />
            <h3 className="text-xs font-bold tracking-widest uppercase text-zinc-100">Cruelty Free</h3>
            <p className="text-[10px] text-zinc-400 leading-relaxed font-light max-w-[200px]">
              We prioritize clean formulas that are never tested on animals.
            </p>
          </div>

          <div className="flex flex-col items-center text-center gap-3">
            <Truck size={28} className="text-[#D062A5]" />
            <h3 className="text-xs font-bold tracking-widest uppercase text-zinc-100">Express Delivery</h3>
            <p className="text-[10px] text-zinc-400 leading-relaxed font-light max-w-[200px]">
              Carefully packed shipments sent straight to your doorstep.
            </p>
          </div>

          <div className="flex flex-col items-center text-center gap-3">
            <RefreshCw size={28} className="text-[#D062A5]" />
            <h3 className="text-xs font-bold tracking-widest uppercase text-zinc-100">Easy Returns</h3>
            <p className="text-[10px] text-zinc-400 leading-relaxed font-light max-w-[200px]">
              Hassle-free 7-day exchange window for undamaged packages.
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 border-b border-zinc-800">
        {/* Brand Column */}
        <div className="lg:col-span-4 flex flex-col gap-5 text-left">
          <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
            <Image
              src={logoUrl}
              alt={storeName}
              width={220}
              height={65}
              className="h-12 sm:h-14 w-auto object-contain"
              unoptimized
            />
          </Link>
          <p className="text-xs text-zinc-400 leading-relaxed tracking-wider font-light max-w-sm">
            Experience the art of mindful self-care. {storeName} brings you premium, authentic skincare products carefully curated to deliver the coveted glow.
          </p>

          {/* Socials */}
          <div className="flex items-center gap-2.5">
            {fb && (
              <a
                href={fb}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-zinc-800/90 border border-zinc-700/60 flex items-center justify-center text-zinc-400 hover:text-white hover:border-[#D062A5] hover:bg-zinc-800 transition-all"
                aria-label="Facebook"
              >
                <FacebookIcon className="w-3.5 h-3.5 fill-current" />
              </a>
            )}
            {ig && (
              <a
                href={ig}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-zinc-800/90 border border-zinc-700/60 flex items-center justify-center text-zinc-400 hover:text-white hover:border-[#D062A5] hover:bg-zinc-800 transition-all"
                aria-label="Instagram"
              >
                <InstagramIcon className="w-3.5 h-3.5" />
              </a>
            )}
            {yt && (
              <a
                href={yt}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-zinc-800/90 border border-zinc-700/60 flex items-center justify-center text-zinc-400 hover:text-white hover:border-[#D062A5] hover:bg-zinc-800 transition-all"
                aria-label="YouTube"
              >
                <YoutubeIcon className="w-3.5 h-3.5 fill-current" />
              </a>
            )}
            {tt && (
              <a
                href={tt}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-zinc-800/90 border border-zinc-700/60 flex items-center justify-center text-zinc-400 hover:text-white hover:border-[#D062A5] hover:bg-zinc-800 transition-all"
                aria-label="TikTok"
              >
                <TiktokIcon className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          {/* Contact Details */}
          {(phone || emailAddress || address) && (
            <div className="flex flex-col gap-2.5 pt-3 text-xs text-zinc-400 border-t border-zinc-800/80">
              {phone && (
                <a href={`tel:${phone}`} className="flex items-center gap-2 hover:text-[#D062A5] transition-colors">
                  <Phone size={13} className="text-[#D062A5] shrink-0" />
                  <span>{phone}</span>
                </a>
              )}
              {emailAddress && (
                <a href={`mailto:${emailAddress}`} className="flex items-center gap-2 hover:text-[#D062A5] transition-colors">
                  <Mail size={13} className="text-[#D062A5] shrink-0" />
                  <span className="truncate">{emailAddress}</span>
                </a>
              )}
              {address && (
                <div className="flex items-start gap-2">
                  <MapPin size={13} className="text-[#D062A5] shrink-0 mt-0.5" />
                  <span className="leading-snug">{address}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Curation Links Column */}
        <div className="lg:col-span-2.5 flex flex-col gap-5 text-left">
          <h4 className="text-xs font-bold tracking-widest uppercase text-zinc-100">Curations</h4>
          <ul className="space-y-3 text-xs text-zinc-400 font-light tracking-wide">
            <li><Link href="/catalog" prefetch={false} className="hover:text-[#D062A5] transition-colors">Glass Skin Routine</Link></li>
            <li><Link href="/catalog" prefetch={false} className="hover:text-[#D062A5] transition-colors">Centella Calming Care</Link></li>
            <li><Link href="/catalog" prefetch={false} className="hover:text-[#D062A5] transition-colors">Vitamin C Brightening</Link></li>
            <li><Link href="/catalog" prefetch={false} className="hover:text-[#D062A5] transition-colors">Snail Mucin Essentials</Link></li>
          </ul>
        </div>

        {/* Help Links Column */}
        <div className="lg:col-span-2.5 flex flex-col gap-5 text-left">
          <h4 className="text-xs font-bold tracking-widest uppercase text-zinc-100">Customer Care</h4>
          <ul className="space-y-3 text-xs text-zinc-400 font-light tracking-wide">
            <li><Link href="/faq" prefetch={false} className="hover:text-[#D062A5] transition-colors">FAQ</Link></li>
            <li><Link href="/account/orders" prefetch={false} className="hover:text-[#D062A5] transition-colors">Track Orders</Link></li>
            <li><Link href="/catalog" prefetch={false} className="hover:text-[#D062A5] transition-colors">Browse Products</Link></li>
            <li><Link href="/account" prefetch={false} className="hover:text-[#D062A5] transition-colors">My Account</Link></li>
          </ul>
        </div>

        {/* Newsletter Column */}
        <div className="lg:col-span-3 flex flex-col gap-5 text-left">
          <h4 className="text-xs font-bold tracking-widest uppercase text-zinc-100">Join the Glow Circle</h4>
          <p className="text-xs text-zinc-400 leading-relaxed font-light">
            Subscribe to receive editorial curation logs, skincare advice, and special offers.
          </p>
          <form onSubmit={handleSubscribe} className="relative flex items-center border-b border-zinc-700 focus-within:border-[#D062A5] py-1.5 transition-colors">
            <input
              type="email"
              placeholder="Your email address"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              required
              className="bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none w-full pr-10 tracking-wider"
            />
            <button type="submit" className="absolute right-0 text-[#D062A5] hover:text-white transition-colors cursor-pointer" aria-label="Subscribe">
              <Send size={14} />
            </button>
          </form>
        </div>
      </div>

      {/* Copyright & Payments */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row justify-between items-center gap-6">
        <span className="text-[10px] text-zinc-500 tracking-wider" suppressHydrationWarning>
          © {new Date().getFullYear()} {storeName}. Sourced with care. All rights reserved.
        </span>

        {/* Payment Partners */}
        <div className="flex items-center gap-3 text-[10px] tracking-widest uppercase text-zinc-500 font-semibold select-none">
          <span>bKash</span>
          <span className="opacity-30">|</span>
          <span>Nagad</span>
          <span className="opacity-30">|</span>
          <span>Visa</span>
          <span className="opacity-30">|</span>
          <span>Mastercard</span>
          <span className="opacity-30">|</span>
          <span>COD</span>
        </div>
      </div>
    </footer>
  );
}
