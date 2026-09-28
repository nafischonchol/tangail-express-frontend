"use client";

import React, { useState } from "react";
import {
  HelpCircle,
  ChevronDown,
  PhoneCall,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
  defaultOpen?: boolean;
}

const faqs: FaqItem[] = [
  {
    question: "কীভাবে বাজার অর্ডার করব?",
    answer:
      "অর্ডার করা একদম সহজ ও দ্রুত! উপরের ফর্মে আপনার নাম, মোবাইল নম্বর ও টাঙ্গাইল শহরের ঠিকানা দিন। এরপর আপনার বাজারের লিস্ট লিখে দিন, প্যাডে লেখা লিস্টের ছবি তুলুন অথবা মুখে বলে ভয়েস রেকর্ড করুন। কোনো অ্যাকাউন্ট বা পাসওয়ার্ডের ঝামেলা নেই।",
    defaultOpen: true,
  },
  {
    question: "পণ্যের দরদাম কীভাবে নির্ধারিত হয়?",
    answer:
      "আমরা টাঙ্গাইল শহরের মূল কাঁচাবাজার ও পাইকারি আড়তের ওই দিনের সঠিক খুচরা ও পাইকারি মূল্যে বাজার করে দিই। বাজার কেনার পর মেমো ও ডিজিটাল রসিদ আপনাকে বুঝিয়ে দেওয়া হবে।",
  },
  {
    question: "কোনো পণ্যের মান পছন্দ না হলে কী করব?",
    answer:
      "আমাদের ১০০% কোয়ালিটি নিশ্চয়তা রয়েছে। ডেলিভারির সময় পণ্য দেখে পছন্দ না হলে সাথে সাথেই রাইডারের কাছে রিটার্ন করতে পারবেন অথবা পরিবর্তন করে নেওয়া হবে।",
  },
  {
    question: "অর্ডার করার পর ডেলিভারি পেতে কতক্ষণ সময় লাগে?",
    answer:
      "সাধারণত অর্ডার নিশ্চিত হওয়ার ৪৫ থেকে ৬০ মিনিটের মধ্যে বাজার আপনার বাসায় পৌঁছে দেওয়া হয়। এছাড়াও আপনি চাইলে পছন্দের নির্দিষ্ট টাইম-স্লট উল্লেখ করে দিতে পারেন।",
  },
  {
    question: "পেমেন্ট কীভাবে পরিশোধ করব?",
    answer:
      "সম্পূর্ণ ক্যাশ অন ডেলিভারি (Cash on Delivery)। পণ্য হাতে পেয়ে ওজন ও কোয়ালিটি যাচাই করে রাইডারের কাছে নগদ টাকায় অথবা বিকাশ/নগদে মূল্য পরিশোধ করুন।",
  },
  {
    question: "টাঙ্গাইল এক্সপ্রেস সার্ভিস এরিয়া কতটুকু?",
    answer:
      "সমগ্র টাঙ্গাইল পৌরসভা ও সদর এলাকা (যেমন: কলেজ মোড়, ভিক্টোরিয়া রোড, আকুর টাকুর পাড়া, বিশ্বাস বেতকা, সাবালিয়া, আদালত পাড়া, নতুন বাসস্ট্যান্ড ইত্যাদি)।",
  },
];

export default function TangailFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 border border-gray-200/80 shadow-xs" id="faq">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Summary & Quick Support */}
        <div className="lg:col-span-5 space-y-5">
          <div>
            <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 inline-block mb-2">
              HERE TO HELP
            </span>
            <h2 className="text-xl sm:text-3xl font-black text-gray-900 tracking-tight leading-tight">
              আপনার প্রশ্ন, <br />
              <span className="text-emerald-700">আমাদের স্পষ্ট উত্তর।</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-2 leading-relaxed">
              টাঙ্গাইল এক্সপ্রেস সম্পর্কিত যেকোনো জিজ্ঞাসা থাকলে নিচের উত্তরগুলো দেখে নিতে পারেন অথবা সরাসরি কল করুন।
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-3">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
              <PhoneCall className="w-4 h-4 text-emerald-700" />
              <span>সরাসরি কথা বলতে চান?</span>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed">
              আমাদের সাপোর্ট টিম সকাল ৭টা থেকে রাত ১০টা পর্যন্ত আপনার সেবায় নিয়োজিত।
            </p>
            <div className="pt-1 flex flex-col sm:flex-row gap-2">
              <a
                href="https://wa.me/8801700000000?text=%E0%A6%B9%E0%A7%8D%E0%A6%AF%E0%A6%BE%E0%A6%B2%E0%A7%8B%20%E0%A6%9F%E0%A6%BE%E0%A6%99%E0%A7%8D%E0%A6%97%E0%A6%BE%E0%A6%87%E0%A6%B2%20%E0%A6%8F%E0%A6%95%E0%A7%8D%E0%A6%B8%E0%A6%AA%E0%A7%8D%E0%A6%B0%E0%A7%87%E0%A6%B8%2C%20%E0%A6%86%E0%A6%AE%E0%A6%BE%E0%A6%B0%20%E0%A6%8F%E0%A6%95%E0%A6%9F%E0%A6%BF%20%E0%A6%AA%E0%A7%8D%E0%A6%B0%E0%A6%B6%E0%A7%8D%E0%A6%A8%20%E0%A6%9B%E0%A6%BF%E0%A6%B2%E0%A7%8B"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp এ মেসেজ</span>
              </a>
              <a
                href="tel:01700000000"
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 font-bold text-xs transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                <span>01700-000000</span>
              </a>
            </div>
          </div>
        </div>

        {/* Right Side: Accordion Items */}
        <div className="lg:col-span-7 space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl border border-gray-200/80 bg-gray-50/50 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-gray-900 hover:text-emerald-700 transition-colors cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span>{faq.question}</span>
                  <span
                    className={`w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0 text-gray-500 transition-transform duration-200 ${
                      isOpen ? "rotate-180 bg-emerald-50 text-emerald-700 border-emerald-300" : ""
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-gray-600 leading-relaxed pt-0 border-t border-gray-100 animate-in fade-in duration-200">
                    <p className="pt-3">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
