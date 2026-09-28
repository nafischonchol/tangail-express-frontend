"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, PhoneCall, Mail, MapPin, Facebook, Instagram, MessageCircle, Youtube } from "lucide-react";
import { useStoreSetup } from "@/context/StoreSetupContext";

const TiktokIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.01 1.62 4.2 1.25 1.48 3.04 2.4 4.95 2.6v3.85c-1.8-.1-3.52-.82-4.9-1.92-.09-.07-.17-.16-.29-.27v7.03c.03 5.48-4.56 9.87-10.02 9.77-5.07-.1-9.25-4.22-9.43-9.29C-.07 10.63 4.14 6 9.61 6.01c1.23.01 2.45.29 3.56.84V10.7c-.89-.54-1.92-.83-2.98-.82-2.73.01-4.95 2.22-4.97 4.95-.02 2.92 2.43 5.25 5.35 5.17 2.45-.06 4.54-1.89 4.79-4.32.06-.59.03-1.18.03-1.77V.02h.13z" />
  </svg>
);

export function CustomerFooter() {
  const { storeSetup } = useStoreSetup();

  const logoUrl = storeSetup?.logo || "/logo.png";
  const storeName = storeSetup?.store_name || "MOHIMAA";
  const helplinePhone = storeSetup?.phone || "+8801700000000";
  const email = storeSetup?.email || "wholesale@mohimaa.com";
  const address = [storeSetup?.street_address, storeSetup?.upazila_name, storeSetup?.district_name]
    .filter(Boolean)
    .join(", ") || storeSetup?.street_address || "Dhaka, Bangladesh";
  const currentYear = new Date().getFullYear();

  const facebook = storeSetup?.facebook;
  const instagram = storeSetup?.instagram;
  const youtube = storeSetup?.youtube;
  const tiktok = storeSetup?.tiktok;

  return (
    <footer className="relative z-10 border-t border-zinc-800 bg-zinc-900 pt-14 pb-8 text-zinc-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-12">
          {/* Column 1: Branding & Contact */}
          <div className="flex flex-col gap-5 lg:pr-4">
            <div className="flex items-center gap-3">
              {logoUrl ? (
                <div className="relative h-16 w-56 flex items-center justify-start shrink-0">
                  <Image
                    src={logoUrl}
                    alt={storeName}
                    width={224}
                    height={64}
                    className="object-contain max-h-16 w-auto"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-[#D062A5] shrink-0">
                  <ShoppingCart size={20} />
                </div>
              )}
              {!logoUrl && (
                <span className="text-xl font-extrabold text-white font-mono uppercase tracking-tight">
                  {storeName}
                </span>
              )}
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed">
              100% Authentic Korean Beauty Products • Direct from Brand Owners & Trusted Suppliers
            </p>
            <div className="flex items-center gap-3 mt-2">
              {facebook && (
                <a href={facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-zinc-800/90 border border-zinc-700/60 flex items-center justify-center text-zinc-400 hover:bg-[#BA478F] hover:text-white transition-all shadow-2xs" aria-label="Facebook">
                  <Facebook size={18} />
                </a>
              )}
              {instagram && (
                <a href={instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-zinc-800/90 border border-zinc-700/60 flex items-center justify-center text-zinc-400 hover:bg-[#BA478F] hover:text-white transition-all shadow-2xs" aria-label="Instagram">
                  <Instagram size={18} />
                </a>
              )}
              {youtube && (
                <a href={youtube} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-zinc-800/90 border border-zinc-700/60 flex items-center justify-center text-zinc-400 hover:bg-[#BA478F] hover:text-white transition-all shadow-2xs" aria-label="YouTube">
                  <Youtube size={18} />
                </a>
              )}
              {tiktok && (
                <a href={tiktok} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-zinc-800/90 border border-zinc-700/60 flex items-center justify-center text-zinc-400 hover:bg-[#BA478F] hover:text-white transition-all shadow-2xs" aria-label="TikTok">
                  <TiktokIcon className="w-4 h-4 fill-current" />
                </a>
              )}
              {helplinePhone && (
                <a href={`https://wa.me/${helplinePhone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-zinc-800/90 border border-zinc-700/60 flex items-center justify-center text-zinc-400 hover:bg-[#BA478F] hover:text-white transition-all shadow-2xs" aria-label="WhatsApp">
                  <MessageCircle size={18} />
                </a>
              )}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider mb-5">Quick Links</h3>
            <ul className="flex flex-col gap-3 text-sm font-medium text-zinc-400">
              <li><Link href="/" className="hover:text-[#D062A5] transition-colors">Home</Link></li>
              <li><Link href="/catalog" className="hover:text-[#D062A5] transition-colors">Cosmetics Catalog</Link></li>
              <li><Link href="/brands" className="hover:text-[#D062A5] transition-colors">All Brands</Link></li>
              <li><Link href="/best-sellings" className="hover:text-[#D062A5] transition-colors">Best Sellers</Link></li>
              <li><Link href="/contact" className="hover:text-[#D062A5] transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Column 3: Customer Service */}
          <div>
            <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider mb-5">Customer Service</h3>
            <ul className="flex flex-col gap-3 text-sm font-medium text-zinc-400">
              <li><Link href="/faq" className="hover:text-[#D062A5] transition-colors">FAQs</Link></li>
              <li><Link href="/shipping" className="hover:text-[#D062A5] transition-colors">Shipping & Delivery</Link></li>
              <li><Link href="/returns" className="hover:text-[#D062A5] transition-colors">Return Policy</Link></li>
              <li><Link href="/payment" className="hover:text-[#D062A5] transition-colors">Payment Information</Link></li>
              <li><Link href="/terms" className="hover:text-[#D062A5] transition-colors">Terms & Conditions</Link></li>
              <li><Link href="/privacy" className="hover:text-[#D062A5] transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Column 4: Connect With Us */}
          <div>
            <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider mb-5">CONTACT US</h3>
            <p className="text-sm text-zinc-400 mb-4 leading-relaxed">
              Have questions about our Korean beauty products, wholesale pricing, bulk orders, product sourcing, or B2B partnership opportunities? Our dedicated team is here to assist you with reliable information and professional support.
            </p>
          </div>
        </div>

        {/* Contact Info Row & Bottom Bar */}
        <div className="pt-8 border-t border-zinc-800 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row flex-wrap items-center justify-center gap-4 md:gap-6 text-sm text-zinc-300">
            <a 
              href={`tel:${helplinePhone}`} 
              className="flex items-center gap-3 px-5 py-3 rounded-full bg-zinc-800/80 border border-zinc-700/60 hover:bg-zinc-800 hover:border-[#D062A5]/50 hover:text-white transition-all shadow-2xs group w-full md:w-auto justify-center"
            >
              <div className="w-8 h-8 rounded-full bg-pink-500/10 flex items-center justify-center text-[#D062A5] group-hover:bg-[#BA478F] group-hover:text-white transition-colors shrink-0">
                <PhoneCall size={14} />
              </div>
              <span className="font-medium tracking-wide">{helplinePhone}</span>
            </a>
            
            <a 
              href={`mailto:${email}`} 
              className="flex items-center gap-3 px-5 py-3 rounded-full bg-zinc-800/80 border border-zinc-700/60 hover:bg-zinc-800 hover:border-[#D062A5]/50 hover:text-white transition-all shadow-2xs group w-full md:w-auto justify-center"
            >
              <div className="w-8 h-8 rounded-full bg-pink-500/10 flex items-center justify-center text-[#D062A5] group-hover:bg-[#BA478F] group-hover:text-white transition-colors shrink-0">
                <Mail size={14} />
              </div>
              <span className="font-medium tracking-wide">{email}</span>
            </a>
            
            <div 
              className="flex items-center gap-3 px-5 py-3 rounded-full bg-zinc-800/80 border border-zinc-700/60 transition-all shadow-2xs w-full md:w-auto justify-center"
            >
              <div className="w-8 h-8 rounded-full bg-pink-500/10 flex items-center justify-center text-[#D062A5] shrink-0">
                <MapPin size={14} />
              </div>
              <span className="font-medium tracking-wide text-zinc-300">{address}</span>
            </div>
          </div>
          
          <div className="pt-4 border-t border-zinc-800/60 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium text-zinc-500">
            <p>© {currentYear} {storeName}. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <span>B2B Wholesale Portal</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

