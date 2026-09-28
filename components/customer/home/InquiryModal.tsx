"use client";

import { useState } from "react";
import Image from "next/image";
import { Send, X, CheckCircle2 } from "lucide-react";
import { useCustomerAuth } from "@/lib/hooks/useCustomerAuth";

export interface InquiryProduct {
  id: number;
  name: string;
  brand: string;
  image: string;
  wholesalePrice: number;
  moq: number;
}

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: InquiryProduct | null;
}

export function InquiryModal({ isOpen, onClose, product }: InquiryModalProps) {
  const { isLoggedIn } = useCustomerAuth();
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [businessType, setBusinessType] = useState("FB Page Reseller");
  const [notes, setNotes] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => {
      onClose();
      setBusinessName("");
      setPhone("");
      setNotes("");
      setFormSubmitted(false);
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden relative animate-in zoom-in-95 duration-300">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Send size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Wholesale Rate Inquiry
              </h3>
              <p className="text-xs text-slate-400">
                B2B Wholesale Account Application
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4">
          {formSubmitted ? (
            <div className="text-center py-8 space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} />
              </div>
              <h4 className="text-lg font-bold text-white">
                Inquiry Received!
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                Our wholesale B2B manager will contact your business phone
                number shortly with full price lists.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {product && (
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={40}
                    height={40}
                    unoptimized
                    className="w-10 h-10 rounded-lg object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate">
                      {product.name}
                    </p>
                    {isLoggedIn ? (
                      <p className="text-[11px] text-rose-400 font-mono">
                        Wholesale: ৳{product.wholesalePrice}{" "}
                        (MOQ: {product.moq} pcs)
                      </p>
                    ) : (
                      <p className="text-[11px] text-rose-400 font-bold">
                        Log in required for wholesale price
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Business / Page Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Glowing Skin BD / Glamour Shop"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Phone / WhatsApp Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +8801700000000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Business Type
                </label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="FB Page Reseller">
                    Facebook Page Reseller
                  </option>
                  <option value="Physical Shop">
                    Physical Retail Shop Owner
                  </option>
                  <option value="E-Commerce Site">
                    E-Commerce Website
                  </option>
                  <option value="Wholesale Distributor">
                    Wholesale Sub-Distributor
                  </option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Requirements / Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Mention expected order quantity or brands you need..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold text-sm transition-all cursor-pointer shadow-lg shadow-rose-600/20"
              >
                Submit Wholesale Inquiry
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
