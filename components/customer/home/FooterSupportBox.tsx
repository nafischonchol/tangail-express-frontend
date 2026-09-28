"use client";

import Link from "next/link";

export function FooterSupportBox() {
  return (
    <div className="mt-20 bg-white dark:bg-slate-900/80 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center flex flex-col items-center gap-4 shadow-sm w-full mx-auto relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-orange-500/5 dark:from-rose-500/10 dark:to-orange-500/10 pointer-events-none"></div>
      
      <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2 relative z-10">
        Need Help?
      </h3>
      <p className="text-slate-600 dark:text-slate-400 max-w-2xl text-lg relative z-10 leading-relaxed mb-2">
        For wholesale inquiries, product sourcing, orders, shipping, or B2B partnership, please contact our team.
      </p>
      <p className="text-rose-500 font-bold uppercase tracking-widest text-sm sm:text-base relative z-10 mb-6">
        MOHIMAA — Your Trusted Partner in Korean Beauty.
      </p>
      
      <Link 
        href="/contact" 
        className="relative z-10 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-bold py-4 px-10 rounded-full transition-all shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:scale-105 active:scale-95 text-lg"
      >
        Contact Support
      </Link>
    </div>
  );
}
