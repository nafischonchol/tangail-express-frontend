"use client";

import React from "react";
import {
  ShoppingBag,
  Sparkles,
  ArrowRight,
  Check,
  Flame,
  Clock,
  Leaf,
  Fish,
  Wheat,
} from "lucide-react";

export interface BazarPack {
  id: string;
  badge?: string;
  badgeColor?: string;
  icon: React.ReactNode;
  name: string;
  subtitle: string;
  items: string[];
  approxTime: string;
  presetText: string;
}

const bazarPacks: BazarPack[] = [
  {
    id: "daily-veg",
    badge: "সবচেয়ে জনপ্রিয়",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: <Leaf className="w-5 h-5 text-emerald-600" />,
    name: "তাজা শাকসবজি ও সালাদ প্যাক",
    subtitle: "সরাসরি পাইকারি আড়তের বাছাইকৃত ফ্রেশ সবজি",
    items: [
      "দেশি গোল আলু - ২ কেজি",
      "নতুন দেশি পেঁয়াজ - ১ কেজি",
      "কাঁচামরিচ ও ধনেপাতা - ২৫০ গ্রাম",
      "তাজা শসা ও টমেটো - ১ কেজি",
      "পছন্দের ফ্রেশ শাক - ২ আঁটি",
    ],
    approxTime: "৪৫ মিনিটে ডেলিভারি",
    presetText:
      "- দেশি গোল আলু: ২ কেজি\n- নতুন দেশি পেঁয়াজ: ১ কেজি\n- কাঁচামরিচ ও ধনেপাতা: ২৫০ গ্রাম\n- তাজা শসা ও টমেটো: ১ কেজি\n- তাজা শাক: ২ আঁটি",
  },
  {
    id: "fresh-protein",
    badge: "টাটকা দেশি আইটেম",
    badgeColor: "bg-amber-100 text-amber-900 border-amber-200",
    icon: <Fish className="w-5 h-5 text-amber-600" />,
    name: "মাছ, মাংস ও দেশি ডিম প্যাক",
    subtitle: "যমুনা নদীর তাজা মাছ ও অর্গানিক দেশি মুরগি",
    items: [
      "তাজা রুই/কাতলা মাছ (কাটা ও পরিষ্কার)",
      "দেশি মুরগি / সোনালী মুরগি - ১ পিস",
      "ফার্মের ফ্রেশ লাল ডিম - ১ ডজন",
      "আদা ও রসুন বাটা আইটেম",
    ],
    approxTime: "৬০ মিনিটে ডেলিভারি",
    presetText:
      "- রুই/কাতলা মাছ (কাটা ও পরিষ্কার): ১ কেজি বা ১ পিস\n- সোনালী/দেশি মুরগি: ১টি\n- লাল ডিম: ১ ডজন\n- আদা ও রসুন: ২৫০ গ্রাম করে",
  },
  {
    id: "monthly-grocery",
    badge: "মাসিক বাজার",
    badgeColor: "bg-blue-100 text-blue-900 border-blue-200",
    icon: <Wheat className="w-5 h-5 text-blue-600" />,
    name: "নিত্যপ্রয়োজনীয় মুদি সামগ্রী",
    subtitle: "ব্র্যান্ডেড তেল, চাল, ডাল ও আসল মসলা",
    items: [
      "মিনিকেট চাল / নাজিরশাইল - ৫ কেজি",
      "সয়াবিন তেল (তীর/রূপচাঁদা) - ২ লিটার",
      "মসুর ডাল - ১ কেজি",
      "লবণ, চিনি ও প্যাকেট হলুদ/মরিচ গুঁড়া",
    ],
    approxTime: "৬০ মিনিটে ডেলিভারি",
    presetText:
      "- মিনিকেট চাল: ৫ কেজি\n- সয়াবিন তেল: ২ লিটার\n- মসুর ডাল: ১ কেজি\n- চিনি: ১ কেজি\n- লবণ: ১ কেজি\n- গুঁড়া মসলা সেট",
  },
];

interface TangailBazarPresetsProps {
  onSelectPreset?: (presetText: string) => void;
}

export default function TangailBazarPresets({
  onSelectPreset,
}: TangailBazarPresetsProps) {
  const handleSelect = (presetText: string) => {
    if (onSelectPreset) {
      onSelectPreset(presetText);
    }
    const orderElem = document.getElementById("order-section");
    if (orderElem) {
      orderElem.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="space-y-4 sm:space-y-6" id="bazar-packages">
      {/* Section Heading */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-1 border-b border-gray-200/80">
        <div>
          <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 inline-block mb-1.5">
            OUR POPULAR COLLECTIONS
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            আপনার সুবিধা অনুযায়ী পছন্দের বাজার প্যাকেজ
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            চাইলে যেকোনো একটি প্যাকেজ বেছে নিন, অথবা নিজের ইচ্ছামতো লিস্ট লিখে অর্ডার করুন।
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium bg-gray-100 px-3 py-1 rounded-full self-start sm:self-auto">
          <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
          <span>কাস্টমাইজড লিস্ট গ্রহণযোগ্য</span>
        </div>
      </div>

      {/* Preset Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {bazarPacks.map((pack) => (
          <div
            key={pack.id}
            className="bg-white rounded-3xl p-5 border border-gray-200/90 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between group"
          >
            <div>
              {/* Badge & Icon Header */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="w-10 h-10 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs">
                  {pack.icon}
                </div>
                {pack.badge && (
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${pack.badgeColor}`}
                  >
                    {pack.badge}
                  </span>
                )}
              </div>

              {/* Title & Subtitle */}
              <h3 className="text-base font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                {pack.name}
              </h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                {pack.subtitle}
              </p>

              {/* Items List */}
              <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                  প্যাকেজে অন্তর্ভুক্ত আইটেম:
                </span>
                <ul className="space-y-1.5">
                  {pack.items.map((item, i) => (
                    <li
                      key={i}
                      className="text-xs text-gray-700 flex items-start gap-2"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Card Action */}
            <div className="mt-5 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium mb-2.5">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-emerald-600" />
                  <span>{pack.approxTime}</span>
                </span>
                <span className="text-emerald-700 font-semibold">
                  ক্যাশ অন ডেলিভারি
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleSelect(pack.presetText)}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white border border-emerald-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs group-hover:bg-emerald-600 group-hover:text-white"
              >
                <span>এই লিস্টটি নির্বাচন করুন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
