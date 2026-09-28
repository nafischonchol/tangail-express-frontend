"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AccountSidebar } from "@/components/customer/account/AccountSidebar";
import { SavedAddressesView } from "@/components/customer/account/SavedAddressesView";
import { fetchCustomerProfile, CustomerProfile } from "@/lib/api/customerProfile";
import { Loader2 } from "lucide-react";

export default function AccountAddressesPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("customer_token") : null;
    if (!token) {
      router.push("/login?redirect=/account/addresses");
      return;
    }

    try {
      const res = await fetchCustomerProfile();
      if (res.success && res.resources) {
        setProfile(res.resources);
      } else {
        router.push("/login?redirect=/account/addresses");
      }
    } catch {
      router.push("/login?redirect=/account/addresses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF9F6] text-[#121212] font-sans">
      <Suspense fallback={<div className="h-20 bg-white border-b border-black/[0.06]" />}>
        <Header />
      </Suspense>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {loading ? (
          <div className="min-h-[400px] flex items-center justify-center text-zinc-400 gap-2">
            <Loader2 className="animate-spin" size={24} />
            <span className="text-sm font-medium">Loading addresses...</span>
          </div>
        ) : profile ? (
          <div className="flex flex-col lg:flex-row gap-5 items-start">
            {/* Left Nav Sidebar */}
            <AccountSidebar user={profile} />

            {/* Main Content Area */}
            <div className="flex-1 w-full">
              <SavedAddressesView />
            </div>
          </div>
        ) : null}
      </main>

      <Footer />
    </div>
  );
}
