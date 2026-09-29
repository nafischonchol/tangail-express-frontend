import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Phone,
  MessageCircle,
  Clock,
  ShieldCheck,
  ChevronUp,
} from "lucide-react";
import { useStoreSetup } from "@/context/StoreSetupContext";

export default function TangailFooter() {
  const { storeSetup } = useStoreSetup();
  const logoUrl = storeSetup?.logo || "/logo.png";
  const storeName = storeSetup?.store_name || "Tangail Express";

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-[#0f2e21] text-emerald-100/90 pt-12 pb-24 sm:pb-12 border-t border-emerald-950 mt-12">
      <div className="max-w-6xl mx-auto px-4 space-y-10">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-5 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="bg-white px-3 py-1.5 rounded-xl shadow-xs inline-flex items-center">
                <Image
                  src={logoUrl}
                  alt={storeName}
                  width={180}
                  height={50}
                  className="h-9 sm:h-10 w-auto object-contain"
                  unoptimized
                />
              </div>
            </Link>

            <p className="text-xs text-emerald-200/80 leading-relaxed max-w-sm">
              অফিস থেকে ফিরে বাজারের ঝামেলা নয়। আপনার প্রয়োজনীয় বাজারের লিস্ট
              দিন—তাজা শাকসবজি, দেশি মাছ ও ফ্রেশ মাংস দরজায় পৌঁছে দেওয়ার দায়িত্ব
              আমাদের।
            </p>

            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-800 text-xs text-emerald-300 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                ১০০% কোয়ালিটি ও সঠিক ওজন
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              দরকারি লিংক
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="#order-section"
                  className="hover:text-white hover:underline transition-colors flex items-center gap-1.5"
                >
                  <span>•</span> এখনই বাজার অর্ডার করুন
                </a>
              </li>
              <li>
                <a
                  href="#bazar-packages"
                  className="hover:text-white hover:underline transition-colors flex items-center gap-1.5"
                >
                  <span>•</span> জনপ্রিয় বাজার প্যাকেজ
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  className="hover:text-white hover:underline transition-colors flex items-center gap-1.5"
                >
                  <span>•</span> যেভাবে কাজ করে
                </a>
              </li>
              <li>
                <a
                  href="#reviews"
                  className="hover:text-white hover:underline transition-colors flex items-center gap-1.5"
                >
                  <span>•</span> সম্মানিত গ্রাহকদের রিভিউ
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  className="hover:text-white hover:underline transition-colors flex items-center gap-1.5"
                >
                  <span>•</span> সাধারণ প্রশ্নোত্তর
                </a>
              </li>
            </ul>
          </div>

          {/* Coverage & Contact */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              সার্ভিস এরিয়া ও যোগাযোগ
            </h4>
            <div className="space-y-2 text-xs text-emerald-200/90">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>টাঙ্গাইল সদর ও পৌরসভা এলাকা:</strong> কলেজ মোড়,
                  ভিক্টোরিয়া রোড, আকুর টাকুর পাড়া, সাবালিয়া, আদালত পাড়া,
                  বিশ্বাস বেতকা, নতুন বাসস্ট্যান্ড ইত্যাদি।
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>ডেলিভারি সময়: সকাল ৭:০০ - রাত ১০:০০</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>হেল্পলাইন: 01700-000000</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-emerald-900/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-emerald-400/80">
          <p>
            © {new Date().getFullYear()} Tangail Express (টাঙ্গাইল এক্সপ্রেস).
            সর্বস্বত্ব সংরক্ষিত।
          </p>
          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 text-xs text-emerald-300 hover:text-white transition-colors cursor-pointer bg-emerald-900/40 px-3 py-1.5 rounded-full border border-emerald-800/60"
          >
            <span>উপরে যান</span>
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
