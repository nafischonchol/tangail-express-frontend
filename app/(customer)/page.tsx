import React from "react";
import TangailExpressHeader from "@/components/customer/TangailExpressHeader";
import OrderForm from "@/components/customer/OrderForm";
import {
  CheckCircle2,
  Clock,
  ShieldCheck,
  Truck,
  PhoneCall,
  Sparkles,
  ShoppingBag,
} from "lucide-react";

export const metadata = {
  title: "Tangail Express | টাঙ্গাইল এক্সপ্রেস - জিরো ফ্রিকশন বাজার ডেলিভারি",
  description:
    "অফিস থেকে ফেরার পথে বাজারের টেনশন? বাজারের লিস্ট দিন (লিখে, ছবি দিয়ে বা মুখে বলে), আমরা পৌঁছে দিব বাসায়।",
};

export default function CustomerHomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50/60 font-sans text-gray-900">
      {/* Header */}
      <TangailExpressHeader />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-8">
        {/* Hero Section */}
        <section className="text-center pt-2 pb-4 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>টাঙ্গাইল শহরের ১ নম্বর হোম বাজার সার্ভিস</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight sm:leading-snug max-w-2xl mx-auto">
            অফিস থেকে ফেরার পথে বাজারের টেনশন?{" "}
            <span className="text-emerald-600 block sm:inline">
              বাজারের লিস্ট দিন, আমরা পৌঁছে দিব বাসায়।
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-gray-600 max-w-xl mx-auto leading-relaxed">
            কোনো অ্যাকাউন্ট খোলা বা পাসওয়ার্ডের ঝামেলা নেই। লিস্ট লিখে দিন, ছবি
            আপলোড করুন অথবা মুখে বলুন — বাকি দায়িত্ব আমাদের।
          </p>

          {/* Quick Value Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] sm:text-xs text-gray-700 font-medium">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-gray-200/80 shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>দ্রুততম ডেলিভারি</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-gray-200/80 shadow-2xs">
              <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
              <span>কল দিয়ে কনফার্মেশন</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-gray-200/80 shadow-2xs">
              <Truck className="w-3.5 h-3.5 text-emerald-600" />
              <span>ক্যাশ অন ডেলিভারি</span>
            </div>
          </div>
        </section>

        {/* Core Order Form */}
        <section id="order-section">
          <OrderForm />
        </section>

        {/* How it Works (সহজ ৩টি ধাপ) */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-6">
          <div className="text-center max-w-md mx-auto">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">
              কীভাবে কাজ করে? (মাত্র ৩টি সহজ ধাপ)
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              বাজার করার সবচেয়ে সহজ এবং সময় সাশ্রয়ী উপায়
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm mb-3 shadow-xs">
                ১
              </div>
              <h4 className="font-bold text-gray-900 text-sm mb-1">
                লিস্ট দিন
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                প্যাডে লিখে ছবি তুলুন, টেক্সট বক্সে লিখুন অথবা মুখে বলে লিস্ট
                পাঠান।
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm mb-3 shadow-xs">
                ২
              </div>
              <h4 className="font-bold text-gray-900 text-sm mb-1">
                কল করে কনফার্ম
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                আমাদের প্রতিনিধি ফোন দিয়ে আইটেম ও মোট বিল নিশ্চিত করবেন।
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm mb-3 shadow-xs">
                ৩
              </div>
              <h4 className="font-bold text-gray-900 text-sm mb-1">
                বাসায় ডেলিভারি
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                বাছাইকৃত তাজা বাজার আপনার ঠিকানায় পৌঁছাবে। দেখে টাকা পরিশোধ করুন।
              </p>
            </div>
          </div>
        </section>

        {/* Trust & Guarantee Section */}
        <section className="bg-gradient-to-br from-gray-900 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white space-y-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
            <div>
              <h4 className="font-bold text-base sm:text-lg">
                ১০০% কোয়ালিটি ও সঠিক ওজনের নিশ্চয়তা
              </h4>
              <p className="text-xs text-gray-300 mt-0.5">
                বাজারের কোনো পণ্যে অসন্তুষ্ট হলে সাথে সাথেই পরিবর্তন বা রিটার্ন সুবিধা।
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12 py-8 text-center text-xs text-gray-500 space-y-2">
        <div className="flex items-center justify-center gap-2 font-semibold text-gray-800">
          <ShoppingBag className="w-4 h-4 text-emerald-600" />
          <span>Tangail Express (টাঙ্গাইল এক্সপ্রেস)</span>
        </div>
        <p>সার্ভিস এরিয়া: টাঙ্গাইল সদর ও পৌরসভা এলাকা</p>
        <p className="text-[11px] text-gray-400">
          © {new Date().getFullYear()} Tangail Express. সর্বস্বত্ব সংরক্ষিত।
        </p>
      </footer>
    </div>
  );
}
