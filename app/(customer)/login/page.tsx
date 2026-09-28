import { Metadata } from "next";
import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CustomerLoginForm } from "@/components/auth/CustomerLoginForm";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Sign In | Mohima Premium Beauty",
  description: "Sign in to your Mohimaa account using your mobile number or password.",
};

export default function CustomerLoginPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FAF9F6] text-[#121212] font-sans">
      <Suspense fallback={<div className="h-20 bg-white border-b border-black/[0.06]" />}>
        <Header />
      </Suspense>

      <main className="flex-1 w-full flex items-center justify-center px-4 sm:px-6 py-10 sm:py-16">
        <Suspense
          fallback={
            <div className="flex items-center justify-center p-12 text-zinc-400 gap-2">
              <Loader2 className="animate-spin" size={24} />
              <span className="text-sm font-medium">Loading sign-in...</span>
            </div>
          }
        >
          <CustomerLoginForm />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
