import { Percent, ShieldCheck, Truck } from "lucide-react";

export function WholesaleBenefits() {
  return (
    <section className="py-16 bg-white dark:bg-slate-900/30 border-b border-slate-200 dark:border-slate-800/60 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Why Businesses Choose MOHIMAA
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            Built for retailers, distributors, e-commerce businesses, beauty shops, and professional beauty suppliers seeking authentic Korean beauty products and reliable B2B wholesale solutions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-card">
          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 backdrop-blur-md hover:border-rose-500/30 dark:hover:border-rose-500/30 transition-all space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Percent size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Maximize Your Business Margins
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Access competitive B2B wholesale pricing designed to support healthy profit margins and sustainable business growth. Benefit from flexible MOQs and volume-based pricing tailored to your order requirements.
            </p>
            <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wide pt-1">
              Competitive Pricing • Flexible MOQ • Volume-Based Benefits
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 backdrop-blur-md hover:border-emerald-500/30 dark:hover:border-emerald-500/30 transition-all space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Guaranteed Authentic Imports
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              100% authentic Korean beauty products, sourced from trusted brand owners and verified Korean suppliers, with proper import documentation and quality assurance. We are committed to providing genuine, reliable, and quality-assured products for our B2B partners.
            </p>
            <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide pt-1">
              Authenticity • Quality Assurance • Reliable Sourcing
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 backdrop-blur-md hover:border-indigo-500/30 dark:hover:border-indigo-500/30 transition-all space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Truck size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Fast Local Dispatch
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Selected products are stocked locally in our Dhaka warehouse for faster order processing and dispatch. We provide reliable delivery support to customers and B2B partners across Bangladesh, including all 64 districts.
            </p>
            <p className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide pt-1">
              Local Stock • Fast Dispatch • Nationwide Delivery
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
