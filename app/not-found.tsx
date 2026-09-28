import Link from "next/link";
import { Suspense } from "react";
import { PackageSearch, Home, ShoppingCart } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";

export default function NotFound() {
  return (
    <CartProvider>
      <div className="flex flex-col min-h-screen bg-[#FAF9F6] text-[#121212] font-sans">
        <Suspense fallback={<div className="h-20 bg-white"></div>}>
          <Header />
        </Suspense>

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-16 flex flex-col items-center justify-center text-center">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-12 border border-black/5 shadow-xs">
            <div className="w-20 h-20 bg-[#FAF9F6] border border-black/5 rounded-full flex items-center justify-center mx-auto mb-6 text-[#BA478F]">
              <PackageSearch className="w-10 h-10" />
            </div>

            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#BA478F] mb-2 block">
              ERROR 404
            </span>

            <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#121212] mb-3">
              Page Not Found
            </h1>

            <p className="text-xs sm:text-sm text-black/60 leading-relaxed mb-8">
              আপনি যে পৃষ্ঠাটি খুঁজছেন তা মুছে ফেলা হয়েছে, নাম পরিবর্তন করা হয়েছে অথবা সাময়িকভাবে অনুপলব্ধ।
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#121212] hover:bg-[#BA478F] text-[#FAF9F6] font-bold text-xs uppercase tracking-widest transition-colors duration-300 shadow-sm cursor-pointer"
              >
                <Home className="w-4 h-4" />
                হোমপেজে ফিরে যান
              </Link>
              <Link
                href="/catalog"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white hover:bg-black/5 text-[#121212] border border-black/10 font-bold text-xs uppercase tracking-widest transition-colors duration-300 shadow-sm cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4 text-[#BA478F]" />
                শপিং করা শুরু করুন
              </Link>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </CartProvider>
  );
}
