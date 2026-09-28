"use client";

import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import {
  FileText,
  Camera,
  Mic,
  Send,
  Loader2,
  CheckCircle,
  MapPin,
  Phone,
  User,
  Image as ImageIcon,
  Trash2,
  Sparkles,
  AlertCircle,
  Truck,
  ShieldCheck,
  Clock,
  Wallet,
  Check,
  ShoppingBag,
} from "lucide-react";
import VoiceRecorder from "./VoiceRecorder";
import OrderSuccessModal from "./OrderSuccessModal";
import { submitTangailOrder, TangailOrder } from "@/lib/api/tangailOrders";

const STORAGE_KEY = "tangail_express_customer_info";

export type TabType = "text" | "image" | "voice";

export interface OrderFormHandle {
  setListText: (text: string) => void;
}

interface OrderFormProps {
  initialText?: string;
}

const OrderForm = forwardRef<OrderFormHandle, OrderFormProps>(function OrderForm(
  { initialText = "" },
  ref
) {
  // Customer Details
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [deliverySlot, setDeliverySlot] = useState("urgent");
  const [isSavedUser, setIsSavedUser] = useState(false);

  // Order List Inputs
  const [activeTab, setActiveTab] = useState<TabType>("text");
  const [rawTextList, setRawTextList] = useState(initialText);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [recordedVoiceFile, setRecordedVoiceFile] = useState<File | null>(null);

  // UI States
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successOrder, setSuccessOrder] = useState<TangailOrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Expose imperative handle so preset packages can inject text
  useImperativeHandle(ref, () => ({
    setListText: (text: string) => {
      setRawTextList(text);
      setActiveTab("text");
    },
  }));

  // Update text if initialText changes
  useEffect(() => {
    if (initialText) {
      setRawTextList(initialText);
    }
  }, [initialText]);

  // Load cached customer info from localStorage on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.customerName) setCustomerName(parsed.customerName);
        if (parsed.phone) setPhone(parsed.phone);
        if (parsed.address) setAddress(parsed.address);
        setIsSavedUser(true);
      }
    } catch (e) {
      console.warn("Could not read from localStorage", e);
    }
  }, []);

  // Handle Image Selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setImagePreviewUrl(url);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Basic Validation
    if (!customerName.trim()) {
      setErrorMessage("দয়া করে আপনার নাম লিখুন।");
      return;
    }
    if (!phone.trim() || phone.trim().length < 11) {
      setErrorMessage("দয়া করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন।");
      return;
    }
    if (!address.trim()) {
      setErrorMessage("দয়া করে আপনার সম্পূর্ণ ডেলিভারি ঠিকানা লিখুন।");
      return;
    }

    const hasText = rawTextList.trim().length > 0;
    const hasImage = selectedImage !== null;
    const hasVoice = recordedVoiceFile !== null;

    if (!hasText && !hasImage && !hasVoice) {
      setErrorMessage(
        "দয়া করে যেকোনো ১টি উপায়ে (লিখে, ছবি দিয়ে অথবা মুখে বলে) বাজারের লিস্ট দিন।"
      );
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("customer_name", customerName.trim());
      formData.append("phone", phone.trim());
      formData.append(
        "address",
        `${address.trim()} (ডেলিভারি প্রেফারেন্স: ${
          deliverySlot === "urgent"
            ? "জরুরি ডেলিভারি (যত দ্রুত সম্ভব)"
            : deliverySlot === "evening"
            ? "আজ সন্ধ্যার মধ্যে"
            : "আগামীকাল সকালে"
        })`
      );

      if (hasText) {
        formData.append("raw_text_list", rawTextList.trim());
      }
      if (selectedImage) {
        formData.append("image_list", selectedImage);
      }
      if (recordedVoiceFile) {
        formData.append("voice_list", recordedVoiceFile);
      }

      const response = await submitTangailOrder(formData);

      if (response.success && response.resources) {
        // Save customer details to localStorage for zero-friction future orders
        try {
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
              customerName: customerName.trim(),
              phone: phone.trim(),
              address: address.trim(),
            })
          );
          setIsSavedUser(true);
        } catch (storageErr) {
          console.warn("Storage save failed", storageErr);
        }

        // Show Success Dialog
        setSuccessOrder(response.resources);
        setIsModalOpen(true);

        // Reset list inputs
        setRawTextList("");
        removeImage();
        setRecordedVoiceFile(null);
      } else {
        setErrorMessage(
          response.message || "অর্ডার সম্পন্ন করা সম্ভব হয়নি। আবার চেষ্টা করুন।"
        );
      }
    } catch (err: unknown) {
      setErrorMessage("নেটওয়ার্কের সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  const hasAnyList =
    rawTextList.trim().length > 0 || selectedImage !== null || recordedVoiceFile !== null;

  return (
    <div className="w-full">
      {/* Smart autofill notification */}
      {isSavedUser && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              আপনার পূর্বের নাম ও ঠিকানা <strong>অটো-ফিল</strong> করা হয়েছে।
            </span>
          </div>
          <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
            সেভড ইউজার
          </span>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm flex items-start gap-2.5 animate-shake">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
          <div className="flex-1 font-medium">{errorMessage}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 pb-20 sm:pb-4">
        {/* 2-Column Grid matching reference site structure */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Left Form Panels */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Customer Details */}
            <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-xs border border-gray-200/90">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center gap-2.5">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-700 text-white text-xs font-bold shadow-2xs">
                  ১
                </span>
                <span>আপনার তথ্য (ডেলিভারির জন্য)</span>
              </h3>

              <div className="space-y-4">
                {/* 2-column input row for Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      আপনার নাম <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="যেমন: মোঃ রফিকুল ইসলাম"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all text-gray-900"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      মোবাইল নম্বর <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="017XXXXXXXX"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all text-gray-900 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    সম্পূর্ণ ঠিকানা (টাঙ্গাইল শহর) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute top-2.5 left-3.5 text-gray-400 pointer-events-none">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <textarea
                      required
                      rows={2}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="বাসা নং, রোড/মহল্লা, ল্যান্ডমার্ক (যেমন: কলেজ মোড়, ভিক্টোরিয়া রোড)"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all text-gray-900"
                    />
                  </div>
                </div>

                {/* Delivery Preference */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    পছন্দের ডেলিভারির সময়
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "urgent", label: "যত দ্রুত সম্ভব (জরুরি)" },
                      { id: "evening", label: "আজ সন্ধ্যার মধ্যে" },
                      { id: "morning", label: "আগামীকাল সকালে" },
                    ].map((slot) => (
                      <button
                        type="button"
                        key={slot.id}
                        onClick={() => setDeliverySlot(slot.id)}
                        className={`p-2 rounded-xl text-[11px] font-semibold border text-center transition-all cursor-pointer ${
                          deliverySlot === slot.id
                            ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-2xs"
                            : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {slot.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Bazar List Input */}
            <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-xs border border-gray-200/90">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2.5">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-700 text-white text-xs font-bold shadow-2xs">
                    ২
                  </span>
                  <span>বাজারের লিস্ট দিন (যেকোনো ১টি)</span>
                </h3>
              </div>

              {/* Option Selector Tabs */}
              <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-gray-100/90 rounded-2xl mb-4">
                <button
                  type="button"
                  onClick={() => setActiveTab("text")}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2.5 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    activeTab === "text"
                      ? "bg-white text-emerald-800 shadow-xs"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>১. লিখে দিন</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("image")}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2.5 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    activeTab === "image"
                      ? "bg-white text-emerald-800 shadow-xs"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Camera className="w-4 h-4 text-emerald-600" />
                  <span>২. ছবি তুলুন</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("voice")}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2.5 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    activeTab === "voice"
                      ? "bg-white text-emerald-800 shadow-xs"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Mic className="w-4 h-4 text-emerald-600" />
                  <span>৩. মুখে বলুন</span>
                </button>
              </div>

              {/* Tab 1: Text List */}
              {activeTab === "text" && (
                <div className="space-y-2 animate-in fade-in duration-150">
                  <div className="relative">
                    <textarea
                      rows={5}
                      value={rawTextList}
                      onChange={(e) => setRawTextList(e.target.value)}
                      placeholder={`আপনার বাজারের লিস্ট এখানে লিখুন...\nযেমন:\n- ২ কেজি দেশি আলু\n- ১ ডজন হাঁসের ডিম\n- ৫০০ গ্রাম কাঁচামরিচ\n- ১ কেজি রুই মাছ (কাটা ও পরিষ্কার)`}
                      className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all text-gray-900 leading-relaxed font-sans"
                    />
                  </div>
                  <p className="text-[11px] text-gray-500">
                    💡 প্রতিটি আইটেম ও পরিমাণ আলাদা লাইনে লিখলে বুঝতে সুবিধা হয়।
                  </p>
                </div>
              )}

              {/* Tab 2: Image Upload */}
              {activeTab === "image" && (
                <div className="animate-in fade-in duration-150">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageChange}
                    className="hidden"
                  />

                  {!imagePreviewUrl ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="text-center py-7 px-4 bg-emerald-50/40 rounded-2xl border-2 border-dashed border-emerald-200 hover:border-emerald-400 transition-colors cursor-pointer"
                    >
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mb-2.5 shadow-2xs">
                        <Camera className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-gray-900 text-xs sm:text-sm mb-1">
                        কাগজে লেখা বাজারের লিস্টের ছবি তুলুন বা আপলোড করুন 📸
                      </h4>
                      <p className="text-xs text-gray-500 mb-3 max-w-xs mx-auto">
                        খাতায় বা প্যাডে লেখা যে কোনো বাজারের তালিকার ছবি নির্বাচন করুন
                      </p>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-2xs transition-all pointer-events-none"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>ছবি নির্বাচন করুন</span>
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          লিস্টের ছবি যুক্ত হয়েছে
                        </span>
                        <button
                          type="button"
                          onClick={removeImage}
                          className="p-1 text-red-600 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                          title="ছবি বাদ দিন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="relative rounded-xl overflow-hidden border border-gray-200 max-h-56 bg-black flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imagePreviewUrl}
                          alt="Bazar List Preview"
                          className="max-h-56 w-auto object-contain"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Voice Record */}
              {activeTab === "voice" && (
                <div className="animate-in fade-in duration-150">
                  <VoiceRecorder
                    onAudioRecorded={(file) => setRecordedVoiceFile(file)}
                  />
                </div>
              )}

              {/* Status summary tag chips */}
              {hasAnyList && (
                <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap gap-2 text-xs text-gray-600">
                  <span className="text-gray-400 font-medium text-[11px]">সংযুক্ত:</span>
                  {rawTextList.trim() && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 text-[11px]">
                      <FileText className="w-3 h-3 text-emerald-600" /> টেক্সট লিস্ট
                    </span>
                  )}
                  {selectedImage && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 text-[11px]">
                      <ImageIcon className="w-3 h-3 text-emerald-600" /> লিস্টের ছবি
                    </span>
                  )}
                  {recordedVoiceFile && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 text-[11px]">
                      <Mic className="w-3 h-3 text-emerald-600" /> ভয়েস মেসেজ
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Aside Order Summary Card (Reference style) */}
          <div className="lg:col-span-5 sticky top-20">
            <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-xs border border-gray-200/90 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-emerald-700" />
                  <span>অর্ডার সারসংক্ষেপ</span>
                </h3>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  জিরো ফ্রিকশন
                </span>
              </div>

              {/* Items Summary State */}
              <div className="space-y-2.5 text-xs text-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">অর্ডার পদ্ধতি:</span>
                  <strong className="text-gray-900">
                    {activeTab === "text"
                      ? "লিখে অর্ডার"
                      : activeTab === "image"
                      ? "ছবি আপলোড"
                      : "ভয়েস রেকর্ড"}
                  </strong>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500">সার্ভিস এরিয়া:</span>
                  <strong className="text-gray-900">টাঙ্গাইল শহর</strong>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500">হোম ডেলিভারি চার্জ:</span>
                  <strong className="text-emerald-800 font-bold bg-gray-100 px-2.5 py-0.5 rounded border border-gray-200 text-[11px]">
                    স্বল্প সার্ভিস চার্জ (কলের মাধ্যমে কনফার্ম)
                  </strong>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500">পণ্যের মূল্য পরিশোধ:</span>
                  <strong className="text-gray-900">ক্যাশ অন ডেলিভারি (COD)</strong>
                </div>
              </div>

              {/* Payment Method Badge box */}
              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
                  <Wallet className="w-4 h-4 text-emerald-700" />
                  <span>পেমেন্ট মেথড: ক্যাশ অন ডেলিভারি</span>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  বাজার বাসায় পৌঁছালে মেমো ও পণ্য দেখে রাইডারের কাছে মূল্য পরিশোধ করুন।
                </p>
              </div>

              {/* Submit CTA Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] disabled:opacity-70 text-white font-bold text-sm sm:text-base rounded-2xl shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>অর্ডার সাবমিট হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>অর্ডার কনফার্ম করুন 🚀</span>
                  </>
                )}
              </button>

              {/* Trust Notes */}
              <div className="space-y-2 pt-1 text-[11px] text-gray-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>কোনো অ্যাকাউন্ট বা পাসওয়ার্ডের প্রয়োজন নেই।</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>অর্ডারের পর প্রতিনিধি ফোন দিয়ে কনফার্ম করবেন।</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Sticky Bottom Floating Bar */}
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 p-3 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-2xl">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-emerald-700 hover:bg-emerald-800 active:scale-98 disabled:opacity-70 text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>অর্ডার সাবমিট হচ্ছে...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>অর্ডার কনফার্ম করুন 🚀</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Success Modal */}
      <OrderSuccessModal
        isOpen={isModalOpen}
        order={successOrder}
        onClose={() => {
          setIsModalOpen(false);
          setSuccessOrder(null);
        }}
      />
    </div>
  );
});

export default OrderForm;
