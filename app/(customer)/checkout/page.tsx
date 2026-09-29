"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  MapPin,
  Search,
  Check,
  ChevronDown,
  X,
  ShoppingCart,
  Tag,
  Edit3,
  CheckCircle2,
  PackageCheck,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { getPublicDistricts } from "@/lib/api/locations";
import { useCustomerAuth } from "@/lib/hooks/useCustomerAuth";
import { fetchCustomerProfile } from "@/lib/api/customerProfile";
import { fetchCustomerAddressesApi, ClientAddress } from "@/lib/api/customerAddresses";
import { createCustomerOrderApi, CustomerOrderPayload } from "@/lib/api/customerOrder";
import { CustomerAuthData } from "@/lib/api/customerAuth";
import { BANGLADESH_DISTRICTS } from "@/lib/data/bangladeshDistricts";
import { AddressSelectionModal } from "@/components/customer/checkout/AddressSelectionModal";
import { CheckoutOtpModal } from "@/components/customer/checkout/CheckoutOtpModal";
import { validateCustomerCoupon } from "@/lib/api/coupons";
import { trackInitiateCheckout, getFbpCookie, getFbcCookie } from "@/lib/utils/analytics";

const SHIPPING_THRESHOLD = 1500;
const SHIPPING_INSIDE_DHAKA = 60;
const SHIPPING_OUTSIDE_DHAKA = 120;

export interface DistrictOption {
  id: number | string;
  name: string;
  bn_name?: string;
}

export const DEFAULT_BANGLADESH_DISTRICTS: DistrictOption[] = [
  { id: 1, name: "Dhaka", bn_name: "ঢাকা" },
  { id: 2, name: "Faridpur", bn_name: "ফরিদপুর" },
  { id: 3, name: "Gazipur", bn_name: "গাজীপুর" },
  { id: 4, name: "Gopalganj", bn_name: "গোপালগঞ্জ" },
  { id: 5, name: "Kishoreganj", bn_name: "কিশোরগঞ্জ" },
  { id: 6, name: "Madaripur", bn_name: "মাদারীপুর" },
  { id: 7, name: "Manikganj", bn_name: "মানিকগঞ্জ" },
  { id: 8, name: "Munshiganj", bn_name: "মুন্সীগঞ্জ" },
  { id: 9, name: "Narayanganj", bn_name: "নারায়ণগঞ্জ" },
  { id: 10, name: "Narsingdi", bn_name: "নরসিংদী" },
  { id: 11, name: "Rajbari", bn_name: "রাজবাড়ী" },
  { id: 12, name: "Shariatpur", bn_name: "শরীয়তপুর" },
  { id: 13, name: "Tangail", bn_name: "টাঙ্গাইল" },
  { id: 14, name: "Brahmanbaria", bn_name: "ব্রাহ্মণবাড়িয়া" },
  { id: 15, name: "Comilla", bn_name: "কুমিল্লা" },
  { id: 16, name: "Chandpur", bn_name: "চাঁদপুর" },
  { id: 17, name: "Lakshmipur", bn_name: "লক্ষ্মীপুর" },
  { id: 18, name: "Noakhali", bn_name: "নোয়াখালী" },
  { id: 19, name: "Feni", bn_name: "ফেনী" },
  { id: 20, name: "Chittagong", bn_name: "চট্টগ্রাম" },
  { id: 21, name: "Cox's Bazar", bn_name: "কক্সবাজার" },
  { id: 22, name: "Khagrachhari", bn_name: "খাগড়াছড়ি" },
  { id: 23, name: "Rangamati", bn_name: "রাঙ্গামাটি" },
  { id: 24, name: "Bandarban", bn_name: "বান্দরবান" },
  { id: 25, name: "Sylhet", bn_name: "সিলেট" },
  { id: 26, name: "Moulvibazar", bn_name: "মৌলভীবাজার" },
  { id: 27, name: "Habiganj", bn_name: "হবিগঞ্জ" },
  { id: 28, name: "Sunamganj", bn_name: "সুনামগঞ্জ" },
  { id: 29, name: "Bogura", bn_name: "বগুড়া" },
  { id: 30, name: "Joypurhat", bn_name: "জয়পুরহাট" },
  { id: 31, name: "Naogaon", bn_name: "নওগাঁ" },
  { id: 32, name: "Natore", bn_name: "নাটোর" },
  { id: 33, name: "Nawabganj", bn_name: "নবাবগঞ্জ" },
  { id: 34, name: "Pabna", bn_name: "পাবনা" },
  { id: 35, name: "Rajshahi", bn_name: "রাজশাহী" },
  { id: 36, name: "Sirajganj", bn_name: "সিরাজগঞ্জ" },
  { id: 37, name: "Dinajpur", bn_name: "দিনাজপুর" },
  { id: 38, name: "Gaibandha", bn_name: "গাইবান্ধা" },
  { id: 39, name: "Kurigram", bn_name: "কুড়িগ্রাম" },
  { id: 40, name: "Lalmonirhat", bn_name: "লালমনিরহাট" },
  { id: 41, name: "Nilphamari", bn_name: "নীলফামারী" },
  { id: 42, name: "Panchagarh", bn_name: "পঞ্চগড়" },
  { id: 43, name: "Rangpur", bn_name: "রংপুর" },
  { id: 44, name: "Thakurgaon", bn_name: "ঠাকুরগাঁও" },
  { id: 45, name: "Bagerhat", bn_name: "বাগেরহাট" },
  { id: 46, name: "Chuadanga", bn_name: "চুয়াডাঙ্গা" },
  { id: 47, name: "Jessore", bn_name: "যশোর" },
  { id: 48, name: "Jhenaidah", bn_name: "ঝিনাইদহ" },
  { id: 49, name: "Khulna", bn_name: "খুলনা" },
  { id: 50, name: "Kushtia", bn_name: "কুষ্টিয়া" },
  { id: 51, name: "Magura", bn_name: "মাগুরা" },
  { id: 52, name: "Meherpur", bn_name: "মেহেরপুর" },
  { id: 53, name: "Narail", bn_name: "নড়াইল" },
  { id: 54, name: "Satkhira", bn_name: "সাতক্ষীরা" },
  { id: 55, name: "Barguna", bn_name: "বরগুনা" },
  { id: 56, name: "Barishal", bn_name: "বরিশাল" },
  { id: 57, name: "Bhola", bn_name: "ভোলা" },
  { id: 58, name: "Jhalokati", bn_name: "ঝালকাঠি" },
  { id: 59, name: "Patuakhali", bn_name: "পটুয়াখালী" },
  { id: 60, name: "Pirojpur", bn_name: "পিরোজপুর" },
  { id: 61, name: "Jamalpur", bn_name: "জামালপুর" },
  { id: 62, name: "Mymensingh", bn_name: "ময়মনসিংহ" },
  { id: 63, name: "Netrokona", bn_name: "নেত্রকোণা" },
  { id: 64, name: "Sherpur", bn_name: "শেরপুর" },
];

const LOCAL_STORAGE_DELIVERY_KEY = "customer_saved_delivery_info";
const LEGACY_STORAGE_KEY = "tangail_express_customer_info";

const getSavedDeliveryData = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw =
      localStorage.getItem(LOCAL_STORAGE_DELIVERY_KEY) ||
      localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      fullName: parsed.fullName || parsed.name || parsed.customerName || "",
      phone: parsed.phone || "",
      district: parsed.district || parsed.city || "",
      fullAddress: parsed.fullAddress || parsed.address || "",
    };
  } catch (e) {
    console.warn("Could not read saved delivery info:", e);
    return null;
  }
};

const saveDeliveryDataToStorage = (info: {
  fullName: string;
  phone: string;
  district?: string;
  fullAddress: string;
}) => {
  if (typeof window === "undefined") return;
  try {
    const dataToSave = {
      fullName: info.fullName.trim(),
      name: info.fullName.trim(),
      customerName: info.fullName.trim(),
      phone: info.phone.trim(),
      district: (info.district || "").trim(),
      city: (info.district || "").trim(),
      fullAddress: info.fullAddress.trim(),
      address: info.fullAddress.trim(),
    };
    localStorage.setItem(LOCAL_STORAGE_DELIVERY_KEY, JSON.stringify(dataToSave));
    localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(dataToSave));
  } catch (e) {
    console.warn("Could not save delivery data to localStorage:", e);
  }
};

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, isLoaded, clearCart } = useCart();
  const { isLoggedIn, customerUser } = useCustomerAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);


  // Form State - English fields
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    district: "",
    fullAddress: "",
    note: "",
  });

  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("cod");
  const [districts, setDistricts] = useState<DistrictOption[]>(
    DEFAULT_BANGLADESH_DISTRICTS
  );

  // Coupon State
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    minOrderAmount?: number | null;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // District Dropdown State
  const [districtSearch, setDistrictSearch] = useState("");
  const [isDistrictDropdownOpen, setIsDistrictDropdownOpen] = useState(false);
  const districtDropdownRef = useRef<HTMLDivElement>(null);

  // Saved Addresses State
  const [savedAddresses, setSavedAddresses] = useState<ClientAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [isAddressSelectModalOpen, setIsAddressSelectModalOpen] = useState(false);
  const [isManualMode, setIsManualMode] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const isOrderPlacedRef = useRef(false);
  const hasTrackedCheckoutRef = useRef(false);

  useEffect(() => {
    document.title = "Checkout | Mohima Premium Beauty";

    async function fetchDistricts() {
      try {
        const res = await getPublicDistricts();
        if (res.success && Array.isArray(res.resources) && res.resources.length > 0) {
          setDistricts(res.resources);
        }
      } catch (err) {
        console.warn("Could not fetch districts from API, using default list.", err);
      }
    }
    fetchDistricts();
  }, []);

  const refreshAddresses = async () => {
    try {
      const addrRes = await fetchCustomerAddressesApi();
      if (addrRes.success && Array.isArray(addrRes.resources)) {
        setSavedAddresses(addrRes.resources);
      }
    } catch (err) {
      console.warn("Error refreshing addresses:", err);
    }
  };

  // Auto-fill customer profile details & saved addresses when logged in or from localStorage
  useEffect(() => {
    const autoFillData = async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("customer_token") : null;
      
      // 1. If saved addresses exist in address book, load and prioritize default address
      if (token) {
        try {
          const addrRes = await fetchCustomerAddressesApi();
          if (addrRes.success && Array.isArray(addrRes.resources) && addrRes.resources.length > 0) {
            setSavedAddresses(addrRes.resources);
            const defaultAddr = addrRes.resources.find((a) => a.is_default) || addrRes.resources[0];
            if (defaultAddr) {
              setSelectedAddressId(defaultAddr.id);
              setFormData((prev) => ({
                ...prev,
                fullName: defaultAddr.name || prev.fullName,
                phone: defaultAddr.phone || prev.phone,
                fullAddress: defaultAddr.address || prev.fullAddress,
                district: defaultAddr.city || prev.district,
              }));
              return; // Successfully filled from Address Book
            }
          }
        } catch (err) {
          console.warn("Error fetching customer addresses:", err);
        }
      }

      // 2. Fallback: Immediate fill from local customerUser if available
      if (customerUser) {
        setFormData((prev) => ({
          ...prev,
          fullName: prev.fullName || customerUser.name || "",
          phone: prev.phone || customerUser.phone || "",
          fullAddress: prev.fullAddress || customerUser.address || "",
        }));
      }

      // 3. Fallback: Fetch latest customer profile from API
      if (token) {
        try {
          const res = await fetchCustomerProfile();
          if (res.success && res.resources) {
            const p = res.resources;
            setFormData((prev) => {
              let matchedDistrict = prev.district;
              if (!matchedDistrict && p.address) {
                const found = districts.find(
                  (d) =>
                    p.address?.toLowerCase().includes(d.name.toLowerCase()) ||
                    (d.bn_name && p.address?.includes(d.bn_name))
                );
                if (found) matchedDistrict = found.name;
              }

              return {
                ...prev,
                fullName: prev.fullName || p.name || "",
                phone: prev.phone || p.phone || "",
                fullAddress: prev.fullAddress || p.address || "",
                district: matchedDistrict || prev.district,
              };
            });
          }
        } catch (err) {
          console.warn("Error auto-filling profile data:", err);
        }
      }
    };

    autoFillData();
  }, [customerUser, districts]);

  // Auto-fill when customer clicks or focuses on any delivery input field
  const handleInputFocus = () => {
    const saved = getSavedDeliveryData();
    if (saved) {
      setFormData((prev) => {
        const shouldFillName = !prev.fullName.trim() && !!saved.fullName;
        const shouldFillPhone = !prev.phone.trim() && !!saved.phone;
        const shouldFillDistrict = !prev.district.trim() && !!saved.district;
        const shouldFillAddress = !prev.fullAddress.trim() && !!saved.fullAddress;

        if (shouldFillName || shouldFillPhone || shouldFillDistrict || shouldFillAddress) {
          return {
            ...prev,
            fullName: prev.fullName.trim() ? prev.fullName : saved.fullName,
            phone: prev.phone.trim() ? prev.phone : saved.phone,
            district: prev.district.trim() ? prev.district : saved.district,
            fullAddress: prev.fullAddress.trim() ? prev.fullAddress : saved.fullAddress,
          };
        }
        return prev;
      });
    }
  };

  const handleSelectSavedAddress = (addr: ClientAddress) => {
    setSelectedAddressId(addr.id);
    setIsManualMode(false);
    setFormData((prev) => ({
      ...prev,
      fullName: addr.name,
      phone: addr.phone,
      fullAddress: addr.address,
      district: addr.city,
    }));
  };

  useEffect(() => {
    if (isLoaded && cart.length === 0 && !isProcessing && !isOrderPlacedRef.current) {
      router.push("/view-cart");
    }
  }, [cart, isLoaded, router, isProcessing]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        districtDropdownRef.current &&
        !districtDropdownRef.current.contains(e.target as Node)
      ) {
        setIsDistrictDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const cleanPhone = value.replace(/\D/g, "").slice(0, 11);
      setFormData((prev) => ({ ...prev, phone: cleanPhone }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectDistrict = (districtName: string) => {
    setFormData((prev) => ({ ...prev, district: districtName }));
    setIsDistrictDropdownOpen(false);
    setDistrictSearch("");
  };

  const executeOrderPlacement = async (explicitToken?: string) => {
    setIsProcessing(true);
    setSubmitError(null);

    try {
      const cartIds = cart
        .map((item) => Number(item.id))
        .filter((id) => !isNaN(id) && id > 0);

      const payload: CustomerOrderPayload = {
        address_id:
          savedAddresses.length > 0 && !isManualMode && selectedAddressId
            ? selectedAddressId
            : undefined,
        name: formData.fullName.trim(),
        phone: formData.phone.trim(),
        address: formData.fullAddress.trim(),
        city: formData.district.trim(),
        district: formData.district.trim(),
        note: formData.note.trim() || undefined,
        payment_method: paymentMethod,
        delivery_charge: shippingCharge,
        discount_amount: discountAmount,
        coupon_code: appliedCoupon?.code,
        cart_ids: cartIds,
        fbp: getFbpCookie() || undefined,
        fbc: getFbcCookie() || undefined,
        source_url: typeof window !== "undefined" ? window.location.href : undefined,
      };

      const res = await createCustomerOrderApi(payload, explicitToken);

      if (res.success && res.resources) {
        isOrderPlacedRef.current = true;
        clearCart();
        toast.success("Order placed successfully!", {
          style: {
            background: "#18181b",
            color: "#f4f4f5",
            border: "1px solid #27272a",
          },
        });

        // Save latest customer delivery information into localStorage to replace previous data
        saveDeliveryDataToStorage({
          fullName: formData.fullName,
          phone: formData.phone,
          district: formData.district,
          fullAddress: formData.fullAddress,
        });

        const invoiceNo = res.resources.invoice_no || `Confirmed #${res.resources.order_id || ""}`;
        const grandTotal = res.resources.grand_total || total;
        const customerName = formData.fullName.trim();
        const district = formData.district.trim();
        const phone = formData.phone.trim();
        const address = formData.fullAddress.trim();

        // Clear form fields while preserving saved localStorage data for future orders
        setFormData({
          fullName: "",
          phone: "",
          district: "",
          fullAddress: "",
          note: "",
        });

        const orderInfo = {
          invoiceNo,
          grandTotal,
          customerName,
          district,
          phone,
          address,
          paymentMethod,
        };

        if (typeof window !== "undefined") {
          try {
            sessionStorage.setItem("last_order_data", JSON.stringify(orderInfo));
          } catch (e) {
            console.warn("Could not save order data to sessionStorage:", e);
          }
        }

        const queryParams = new URLSearchParams({
          invoice: invoiceNo,
          total: grandTotal.toString(),
          name: customerName,
          phone: phone,
          address: address,
          district: district,
          method: paymentMethod,
        });

        router.push(`/order-success?${queryParams.toString()}`);
        return;
      } else {
        const errorMsg =
          res.message || "Failed to place your order. Please check the information and try again.";
        setSubmitError(errorMsg);
        toast.error(errorMsg, {
          style: {
            background: "#18181b",
            color: "#f4f4f5",
            border: "1px solid #27272a",
          },
        });
      }
    } catch (err: any) {
      const errorMsg =
        err?.message || "An unexpected error occurred while placing order. Please try again.";
      setSubmitError(errorMsg);
      toast.error(errorMsg, {
        style: {
          background: "#18181b",
          color: "#f4f4f5",
          border: "1px solid #27272a",
        },
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!formData.fullName.trim()) {
      toast.error("Please enter your full name");
      return;
    }
    const cleanPhone = formData.phone.trim();
    if (!cleanPhone) {
      toast.error("Please enter your phone number");
      return;
    }
    if (!/^01[3-9]\d{8}$/.test(cleanPhone) || cleanPhone.length !== 11) {
      toast.error("Phone number must be a valid 11-digit mobile number (e.g. 017XXXXXXXX)");
      return;
    }
    if (!formData.district.trim()) {
      toast.error("Please select your district");
      return;
    }
    if (!formData.fullAddress.trim()) {
      toast.error("Please enter your full address");
      return;
    }
    if (cart.length === 0) {
      toast.error("Your shopping cart is empty");
      return;
    }

    // If customer is already logged in, place order directly without OTP verification
    if (isLoggedIn) {
      await executeOrderPlacement();
      return;
    }

    // If customer is not logged in, trigger mobile OTP verification modal
    setIsOtpModalOpen(true);
  };

  const handleOtpVerificationSuccess = async (authData: CustomerAuthData) => {
    setIsOtpModalOpen(false);
    await executeOrderPlacement(authData.token);
  };

  // Calculations
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleApplyCoupon = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = couponInput.trim().toUpperCase();
    if (!code) return;

    setIsApplyingCoupon(true);
    setCouponError(null);

    try {
      const res = await validateCustomerCoupon(code, subtotal, formData.phone);
      if (res.success && res.resources) {
        setAppliedCoupon({
          code: res.resources.code,
          discountAmount: res.resources.discount_amount,
          minOrderAmount: res.resources.min_order_amount,
        });
        setCouponError(null);
        toast.success(`Coupon "${res.resources.code}" applied!`);
      } else {
        setCouponError(res.message || "Invalid or expired coupon code");
        setAppliedCoupon(null);
      }
    } catch (err: any) {
      setCouponError(err?.message || "Failed to validate coupon");
      setAppliedCoupon(null);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError(null);
  };

  // Auto-remove applied coupon if cart subtotal drops below minimum required order amount
  useEffect(() => {
    if (appliedCoupon?.minOrderAmount && subtotal < appliedCoupon.minOrderAmount) {
      setCouponError(
        `Coupon removed: order subtotal is below minimum spend of ৳${appliedCoupon.minOrderAmount}`
      );
      setAppliedCoupon(null);
    }
  }, [subtotal, appliedCoupon]);

  const isFreeShipping = subtotal >= SHIPPING_THRESHOLD;
  const isInsideDhaka =
    formData.district.toLowerCase().includes("dhaka") ||
    formData.district.includes("ঢাকা");

  const shippingCharge = isFreeShipping
    ? 0
    : isInsideDhaka
    ? SHIPPING_INSIDE_DHAKA
    : SHIPPING_OUTSIDE_DHAKA;

  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const total = Math.max(0, subtotal - discountAmount + shippingCharge);

  // Track Meta Pixel InitiateCheckout event
  useEffect(() => {
    if (isLoaded && cart.length > 0 && !hasTrackedCheckoutRef.current) {
      hasTrackedCheckoutRef.current = true;
      trackInitiateCheckout({
        items: cart.map((item) => ({
          id: item.id || (item as any).product_id || 0,
          name: item.name,
          price: Number(item.price || 0),
          quantity: item.quantity || 1,
        })),
        value: total,
      });
    }
  }, [isLoaded, cart, total]);

  const filteredDistricts = districts.filter((d) => {
    const query = districtSearch.trim().toLowerCase();
    if (!query) return true;
    return (
      d.name.toLowerCase().includes(query) ||
      (d.bn_name && d.bn_name.toLowerCase().includes(query))
    );
  });

  const selectedAddress =
    savedAddresses.find((a) => a.id === selectedAddressId) ||
    savedAddresses.find((a) => a.is_default) ||
    savedAddresses[0];

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#F7F7F8] flex flex-col justify-between">
        <Suspense fallback={<div className="h-16 bg-white border-b border-neutral-200"></div>}>
          <Header />
        </Suspense>
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-20 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  if (cart.length === 0 && !isProcessing && !isOrderPlacedRef.current) {
    return null;
  }

  const totalItemsCount = cart.reduce((a, b) => a + b.quantity, 0);

  return (
    <div className="min-h-screen bg-[#F7F7F8] text-neutral-900 font-sans selection:bg-neutral-900 selection:text-white flex flex-col justify-between">
      <Suspense fallback={<div className="h-16 bg-white border-b border-neutral-200"></div>}>
        <Header />
      </Suspense>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-3 pb-6 lg:pt-3 lg:pb-10">
        {submitError && (
          <div className="mb-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <span>{submitError}</span>
            </div>
            <button
              type="button"
              onClick={() => setSubmitError(null)}
              className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
          {/* Left Column (Shipping Info + Order Items) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Card 1: Delivery Information */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-5 sm:p-7 shadow-xs">
              <div className="mb-5">
                <h2 className="text-base sm:text-lg font-bold text-neutral-900 tracking-tight">
                  Delivery Information
                </h2>
              </div>

              <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="space-y-5">
                {/* If user has saved addresses and is NOT in manual mode: Show exact Address Card from screenshot */}
                {savedAddresses.length > 0 && !isManualMode ? (
                  <div className="p-4 sm:p-5 rounded-xl border border-neutral-200 bg-white shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Left Side: Pin Icon + Details */}
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#FDF2F8] border border-[#FCE7F3] flex items-center justify-center text-[#BA478F] shrink-0 mt-0.5">
                        <MapPin size={18} />
                      </div>
                      <div className="space-y-1 flex-1 min-w-0">
                        {/* Name + Label Badge */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-neutral-900">
                            {formData.fullName}
                          </h4>
                          {selectedAddress?.is_default && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#BA478F] text-white">
                              Default
                            </span>
                          )}
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-neutral-100 text-neutral-700 border border-neutral-200 uppercase">
                            {selectedAddress?.label ? selectedAddress.label.toUpperCase() : "HOME"}
                          </span>
                        </div>

                        {/* Phone */}
                        <p className="text-xs text-neutral-700 font-medium">
                          {formData.phone}
                        </p>

                        {/* Full Address */}
                        <p className="text-xs text-neutral-600 leading-relaxed">
                          {formData.fullAddress}{formData.district && !formData.fullAddress.toLowerCase().includes(formData.district.toLowerCase()) ? `, ${formData.district}` : ""}
                        </p>
                      </div>
                    </div>

                    {/* Right Side: Change Button */}
                    <div className="sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => setIsAddressSelectModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-xs font-semibold text-neutral-800 transition-all cursor-pointer shadow-2xs hover:border-neutral-300"
                      >
                        <Edit3 size={13} className="text-neutral-500" />
                        <span>Change</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Manual Input Form (when user has no saved addresses or clicked 'Enter new address') */
                  <div className="space-y-4">
                    {savedAddresses.length > 0 && (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-xs">
                        <span className="text-neutral-700 font-medium">Entering custom delivery address</span>
                        <button
                          type="button"
                          onClick={() => {
                            setIsManualMode(false);
                            const defaultAddr = savedAddresses.find((a) => a.is_default) || savedAddresses[0];
                            if (defaultAddr) handleSelectSavedAddress(defaultAddr);
                          }}
                          className="font-bold text-[#BA478F] hover:underline cursor-pointer"
                        >
                          ← Use Saved Address
                        </button>
                      </div>
                    )}

                    {/* Name and Phone Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Full Name */}
                      <div>
                        <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                          Full Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          required
                          value={formData.fullName}
                          onChange={handleInputChange}
                          onFocus={handleInputFocus}
                          onClick={handleInputFocus}
                          placeholder="Enter your full name"
                          className="w-full bg-white border border-neutral-300 rounded-lg px-3.5 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-colors"
                        />
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                          Phone Number <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          required
                          maxLength={11}
                          value={formData.phone}
                          onChange={handleInputChange}
                          onFocus={handleInputFocus}
                          onClick={handleInputFocus}
                          placeholder="017XXXXXXXX"
                          className="w-full bg-white border border-neutral-300 rounded-lg px-3.5 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-colors font-mono"
                        />
                      </div>
                    </div>

                    {/* District (Searchable Dropdown) */}
                    <div className="relative" ref={districtDropdownRef}>
                      <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                        District <span className="text-rose-500">*</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => {
                          handleInputFocus();
                          setIsDistrictDropdownOpen(!isDistrictDropdownOpen);
                        }}
                        className="w-full bg-white border border-neutral-300 rounded-lg px-3.5 py-3 text-left flex items-center justify-between text-sm font-medium text-neutral-900 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-colors"
                      >
                        <span className={formData.district ? "text-neutral-900 font-semibold" : "text-neutral-400 font-normal"}>
                          {formData.district || "Search or select district..."}
                        </span>
                        <ChevronDown
                          size={16}
                          className={`text-neutral-400 transition-transform ${isDistrictDropdownOpen ? "rotate-180" : ""}`}
                        />
                      </button>

                      {isDistrictDropdownOpen && (
                        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-xl shadow-xl overflow-hidden max-h-64 flex flex-col animate-in fade-in duration-100">
                          <div className="p-2 border-b border-neutral-100 bg-neutral-50 flex items-center gap-2">
                            <Search size={15} className="text-neutral-400 shrink-0 ml-1" />
                            <input
                              type="text"
                              placeholder="Search district..."
                              value={districtSearch}
                              onChange={(e) => setDistrictSearch(e.target.value)}
                              className="w-full bg-transparent text-xs py-1.5 focus:outline-none text-neutral-900 placeholder:text-neutral-400"
                              autoFocus
                            />
                            {districtSearch && (
                              <button
                                type="button"
                                onClick={() => setDistrictSearch("")}
                                className="p-1 text-neutral-400 hover:text-neutral-600 rounded-full"
                              >
                                <X size={14} />
                              </button>
                            )}
                          </div>

                          <div className="overflow-y-auto max-h-52 custom-scrollbar divide-y divide-neutral-50 py-1 pr-1">
                            {filteredDistricts.length === 0 ? (
                              <div className="p-4 text-xs text-neutral-400 text-center">No district found</div>
                            ) : (
                              filteredDistricts.map((d) => {
                                const label = d.name;
                                const isSelected = formData.district === label;
                                return (
                                  <button
                                    key={d.id}
                                    type="button"
                                    onClick={() => handleSelectDistrict(label)}
                                    className={`w-full px-4 py-2.5 text-xs text-left flex items-center justify-between hover:bg-neutral-50 transition-colors ${
                                      isSelected ? "bg-neutral-100 text-neutral-900 font-bold" : "text-neutral-700"
                                    }`}
                                  >
                                    <span>{d.name} {d.bn_name && <span className="text-neutral-400 font-normal ml-1">({d.bn_name})</span>}</span>
                                    {isSelected && <Check size={14} className="text-neutral-900" />}
                                  </button>
                                );
                              })
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Street Address */}
                    <div>
                      <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
                        Street Address <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        name="fullAddress"
                        required
                        rows={2}
                        value={formData.fullAddress}
                        onChange={handleInputChange}
                        onFocus={handleInputFocus}
                        onClick={handleInputFocus}
                        placeholder="House #12, Road #4, Sector #10, Mirpur, Dhaka"
                        className="w-full bg-white border border-neutral-300 rounded-lg px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-colors resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* Order Note (Optional) */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                    Order Note / Special Instructions <span className="text-neutral-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    name="note"
                    value={formData.note}
                    onChange={handleInputChange}
                    placeholder="Any special instructions for delivery..."
                    className="w-full bg-white border border-neutral-300 rounded-lg px-3.5 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition-colors"
                  />
                </div>
              </form>
            </div>

            {/* Card 2: Order Items Card (Under Shipping Address) */}
            <div className="bg-white rounded-2xl border border-neutral-200 p-5 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-3">
                <h3 className="font-bold text-neutral-900 text-sm sm:text-base flex items-center gap-2">
                  <ShoppingCart size={16} className="text-[#BA478F]" />
                  <span>Order Items</span>
                </h3>
                <span className="text-xs font-normal text-neutral-500">
                  {cart.length} {cart.length === 1 ? "item" : "items"}
                </span>
              </div>

              <div className="divide-y divide-neutral-100">
                {cart.map((item) => (
                  <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex gap-3.5 items-center">
                    <div className="w-14 h-14 bg-neutral-100 rounded-xl border border-neutral-200 overflow-hidden relative shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover" sizes="56px" />
                      <span className="absolute top-0.5 right-0.5 bg-neutral-900 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-xs text-neutral-900 truncate">{item.name}</h4>
                      <p className="text-neutral-500 text-[11px] mt-0.5">
                        Qty: {item.quantity} × ৳{item.price.toLocaleString()}
                      </p>
                    </div>
                    <div className="font-bold text-xs text-neutral-900 whitespace-nowrap">
                      ৳{(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary Sidebar (Pricing Breakdown & CTA) */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-neutral-200 p-5 sm:p-6 shadow-xs lg:sticky lg:top-24">
              <h3 className="font-bold text-neutral-900 text-base border-b border-neutral-100 pb-3 mb-4">
                Order Summary
              </h3>

              {/* Subtotal & Delivery Fee Breakdown */}
              <div className="space-y-2.5 text-xs text-neutral-600 pb-4 border-b border-neutral-100">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-neutral-900 font-semibold">৳{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Delivery Fee</span>
                  <span className="text-neutral-900 font-semibold">
                    {shippingCharge === 0 ? (
                      <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[10px]">Free</span>
                    ) : (
                      `৳${shippingCharge}`
                    )}
                  </span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-600 font-medium pt-1">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span className="font-semibold">-৳{appliedCoupon.discountAmount.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Coupon Code Section (Below Subtotal and Delivery Fee) */}
              <div className="py-4 border-b border-neutral-100">
                {!appliedCoupon ? (
                  <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                    <label className="block text-[11px] font-semibold text-neutral-700">
                      Have a promo / coupon code?
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => {
                            setCouponInput(e.target.value);
                            if (couponError) setCouponError(null);
                          }}
                          placeholder="Enter code (e.g. SAVE10)"
                          className="w-full bg-neutral-50 border border-neutral-300 rounded-lg pl-8 pr-3 py-2 text-xs uppercase font-mono tracking-wider text-neutral-900 placeholder:normal-case placeholder:font-sans placeholder:tracking-normal placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 focus:bg-white transition-colors"
                        />
                        <Tag size={13} className="absolute left-2.5 top-2.5 text-neutral-400 pointer-events-none" />
                      </div>
                      <button
                        type="submit"
                        disabled={!couponInput.trim() || isApplyingCoupon}
                        className="bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
                      >
                        {isApplyingCoupon ? "..." : "Apply"}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-[11px] font-medium text-rose-500 mt-1">{couponError}</p>
                    )}
                  </form>
                ) : (
                  <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-lg p-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Tag size={14} className="text-emerald-700 shrink-0" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold font-mono tracking-wide text-emerald-900">{appliedCoupon.code}</span>
                          <span className="text-[9px] bg-emerald-200/80 text-emerald-800 font-bold px-1.5 py-0.2 rounded uppercase">Applied</span>
                        </div>
                        <p className="text-[11px] text-emerald-700">Saved ৳{appliedCoupon.discountAmount.toLocaleString()}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-neutral-400 hover:text-rose-600 p-1 rounded-md transition-colors cursor-pointer"
                      title="Remove Coupon"
                    >
                      <X size={15} />
                    </button>
                  </div>
                )}
              </div>

              {/* Total Section */}
              <div className="flex justify-between text-neutral-900 font-bold text-sm my-4">
                <span>Total</span>
                <span className="text-xl text-neutral-900">৳{total.toLocaleString()}</span>
              </div>

              {/* Place Order Button */}
              <button
                type="submit"
                form="checkout-form"
                disabled={isProcessing}
                className="w-full bg-[#BA478F] hover:bg-[#9F3375] text-white text-xs font-bold uppercase tracking-widest py-4 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D062A5] focus-visible:ring-offset-2"
              >
                {isProcessing ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ShieldCheck size={16} />
                    <span>Place Order (৳{total.toLocaleString()})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Address Selection Modal */}
      <AddressSelectionModal
        isOpen={isAddressSelectModalOpen}
        onClose={() => setIsAddressSelectModalOpen(false)}
        addresses={savedAddresses}
        selectedAddressId={selectedAddressId}
        onSelectAddress={(addr) => {
          handleSelectSavedAddress(addr);
        }}
        onSelectManualAddress={() => {
          setIsManualMode(true);
          setSelectedAddressId(null);
        }}
        onAddressCreatedOrUpdated={refreshAddresses}
      />

      {/* Checkout OTP Verification Modal for Guest Checkout */}
      <CheckoutOtpModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        phone={formData.phone.trim()}
        customerName={formData.fullName.trim()}
        onVerificationSuccess={handleOtpVerificationSuccess}
      />

      <Footer />
    </div>
  );
}
