"use client";

import { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  Search,
  Check,
  Calendar,
  AlertCircle,
  Loader2,
  Users,
  Percent,
  CircleDollarSign,
} from "lucide-react";
import {
  createCoupon,
  updateCoupon,
  generateUniqueCouponCode,
  type Coupon,
  type CouponPayload,
} from "@/lib/api/coupons";
import { getClientLookup, type ClientLookup } from "@/lib/api/clients";

interface Props {
  isOpen: boolean;
  coupon: Coupon | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CouponModal({ isOpen, coupon, onClose, onSuccess }: Props) {
  const isEdit = !!coupon;

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState<"fixed" | "percentage">("fixed");
  const [value, setValue] = useState<string>("");
  const [minOrderAmount, setMinOrderAmount] = useState<string>("");
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<string>("");
  const [targetType, setTargetType] = useState<"all" | "specific_clients">("all");
  const [selectedClients, setSelectedClients] = useState<ClientLookup[]>([]);
  const [usageLimitTotal, setUsageLimitTotal] = useState<string>("");
  const [usageLimitPerClient, setUsageLimitPerClient] = useState<string>("1");
  const [startsAt, setStartsAt] = useState<string>("");
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(true);

  // Client search state
  const [clientSearch, setClientSearch] = useState("");
  const [searchResults, setSearchResults] = useState<ClientLookup[]>([]);
  const [isSearchingClients, setIsSearchingClients] = useState(false);

  // Form submit state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (coupon) {
      setCode(coupon.code || "");
      setName(coupon.name || "");
      setType(coupon.type || "fixed");
      setValue(coupon.value ? String(coupon.value) : "");
      setMinOrderAmount(coupon.min_order_amount ? String(coupon.min_order_amount) : "");
      setMaxDiscountAmount(coupon.max_discount_amount ? String(coupon.max_discount_amount) : "");
      setTargetType(coupon.target_type || "all");
      setSelectedClients(
        (coupon.clients || []).map((c) => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
          email: c.email || null,
          address: null,
          type: "customer" as const,
          balance: 0,
        }))
      );
      setUsageLimitTotal(coupon.usage_limit_total ? String(coupon.usage_limit_total) : "");
      setUsageLimitPerClient(String(coupon.usage_limit_per_client ?? 1));

      // Format ISO dates to YYYY-MM-DDTHH:mm for datetime-local
      setStartsAt(
        coupon.starts_at ? new Date(coupon.starts_at).toISOString().slice(0, 16) : ""
      );
      setExpiresAt(
        coupon.expires_at ? new Date(coupon.expires_at).toISOString().slice(0, 16) : ""
      );
      setIsActive(coupon.is_active);
    } else {
      setCode("");
      setName("");
      setType("fixed");
      setValue("");
      setMinOrderAmount("");
      setMaxDiscountAmount("");
      setTargetType("all");
      setSelectedClients([]);
      setUsageLimitTotal("");
      setUsageLimitPerClient("1");
      setStartsAt("");
      setExpiresAt("");
      setIsActive(true);
    }
    setError(null);
  }, [isOpen, coupon]);

  // Client search debounce
  useEffect(() => {
    if (targetType !== "specific_clients" || !clientSearch.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingClients(true);
      try {
        const res = await getClientLookup(clientSearch.trim());
        if (res.success && res.resources) {
          setSearchResults(res.resources);
        } else {
          setSearchResults([]);
        }
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearchingClients(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [clientSearch, targetType]);

  const handleGenerateCode = async () => {
    setIsGeneratingCode(true);
    try {
      const res = await generateUniqueCouponCode();
      if (res.success && res.resources?.code) {
        setCode(res.resources.code);
      }
    } catch {
      // Fallback local random generator
      const random = "MOI-" + Math.random().toString(36).substring(2, 6).toUpperCase() + "-" + Math.random().toString(36).substring(2, 6).toUpperCase();
      setCode(random);
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const toggleClientSelection = (client: ClientLookup) => {
    if (selectedClients.some((c) => c.id === client.id)) {
      setSelectedClients((prev) => prev.filter((c) => c.id !== client.id));
    } else {
      setSelectedClients((prev) => [...prev, client]);
    }
  };

  const removeClient = (id: number) => {
    setSelectedClients((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setError("Please enter or generate a coupon code.");
      return;
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) {
      setError("Please enter a valid discount amount greater than 0.");
      return;
    }

    if (type === "percentage" && numValue > 100) {
      setError("Percentage discount cannot exceed 100%.");
      return;
    }

    if (targetType === "specific_clients" && selectedClients.length === 0) {
      setError("Please select at least one client for client-specific coupons.");
      return;
    }

    const payload: CouponPayload = {
      code: cleanCode,
      name: name.trim() || null,
      type,
      value: numValue,
      min_order_amount: minOrderAmount ? parseFloat(minOrderAmount) : null,
      max_discount_amount:
        type === "percentage" && maxDiscountAmount
          ? parseFloat(maxDiscountAmount)
          : null,
      target_type: targetType,
      client_ids:
        targetType === "specific_clients"
          ? selectedClients.map((c) => c.id)
          : undefined,
      usage_limit_total: usageLimitTotal ? parseInt(usageLimitTotal, 10) : null,
      usage_limit_per_client: parseInt(usageLimitPerClient, 10) || 1,
      starts_at: startsAt ? new Date(startsAt).toISOString() : null,
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      is_active: isActive,
    };

    setIsSubmitting(true);
    try {
      const res = isEdit && coupon
        ? await updateCoupon(coupon.id, payload)
        : await createCoupon(payload);

      if (!res.success) {
        setError(res.message || "Failed to save coupon.");
      } else {
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div
        className="w-full max-w-2xl bg-white rounded-lg border border-neutral-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-200 bg-neutral-50/50">
          <div>
            <h2 className="text-sm font-semibold text-neutral-900">
              {isEdit ? "Edit Coupon" : "Create New Coupon"}
            </h2>
            <p className="text-xs text-neutral-500">
              Configure promo code discounts, limits, and customer eligibility
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {error && (
            <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Row 1: Code and Generate Button */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">
                Coupon Code <span className="text-rose-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. MOHIMA100"
                  className="flex-1 h-8 px-2.5 rounded border border-neutral-200 font-mono font-semibold text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 placeholder:text-neutral-400 text-xs uppercase"
                  required
                />
                <button
                  type="button"
                  onClick={handleGenerateCode}
                  disabled={isGeneratingCode}
                  title="Auto-generate random unique coupon code"
                  className="inline-flex items-center gap-1 px-2.5 h-8 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 rounded font-medium text-neutral-700 transition-colors disabled:opacity-50"
                >
                  {isGeneratingCode ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>Unique</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">
                Campaign / Coupon Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Eid Mega Sale / VIP Reward"
                className="w-full h-8 px-2.5 rounded border border-neutral-200 text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 placeholder:text-neutral-400 text-xs"
              />
            </div>
          </div>

          {/* Row 2: Discount Type and Value */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-neutral-50/70 border border-neutral-200 rounded">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">
                Discount Type <span className="text-rose-500">*</span>
              </label>
              <div className="flex rounded border border-neutral-200 bg-white p-0.5">
                <button
                  type="button"
                  onClick={() => setType("fixed")}
                  className={`flex-1 flex items-center justify-center gap-1 py-1 rounded text-[11px] font-medium transition-colors ${
                    type === "fixed"
                      ? "bg-neutral-900 text-white"
                      : "text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  <CircleDollarSign className="w-3 h-3" />
                  <span>Fixed (৳)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setType("percentage")}
                  className={`flex-1 flex items-center justify-center gap-1 py-1 rounded text-[11px] font-medium transition-colors ${
                    type === "percentage"
                      ? "bg-neutral-900 text-white"
                      : "text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  <Percent className="w-3 h-3" />
                  <span>Percent (%)</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">
                Discount Value <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={type === "percentage" ? 100 : undefined}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={type === "percentage" ? "10 (for 10%)" : "100 (for ৳100)"}
                  className="w-full h-8 px-2.5 rounded border border-neutral-200 text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 text-xs"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">
                {type === "percentage" ? "Max Discount Cap (৳)" : "Min Order Spend (৳)"}
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={type === "percentage" ? maxDiscountAmount : minOrderAmount}
                onChange={(e) =>
                  type === "percentage"
                    ? setMaxDiscountAmount(e.target.value)
                    : setMinOrderAmount(e.target.value)
                }
                placeholder={type === "percentage" ? "e.g. 500 max cap" : "e.g. 500 min cart"}
                className="w-full h-8 px-2.5 rounded border border-neutral-200 text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 text-xs"
              />
            </div>
          </div>

          {/* Row 3: Target Audience */}
          <div className="border border-neutral-200 rounded p-3 space-y-2.5">
            <label className="block font-medium text-neutral-800">
              Customer Target Eligibility
            </label>
            <div className="flex items-center gap-4">
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="target_type"
                  checked={targetType === "all"}
                  onChange={() => setTargetType("all")}
                  className="text-neutral-900 focus:ring-neutral-900"
                />
                <span className="text-neutral-700 font-medium">All Customers</span>
              </label>
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="target_type"
                  checked={targetType === "specific_clients"}
                  onChange={() => setTargetType("specific_clients")}
                  className="text-neutral-900 focus:ring-neutral-900"
                />
                <span className="text-neutral-700 font-medium">Specific Customer(s) Only</span>
              </label>
            </div>

            {targetType === "specific_clients" && (
              <div className="pt-2 border-t border-neutral-100 space-y-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-neutral-400" />
                  <input
                    type="text"
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    placeholder="Search customers by name, phone or email..."
                    className="w-full h-8 pl-8 pr-2.5 rounded border border-neutral-200 text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 text-xs"
                  />
                  {isSearchingClients && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin absolute right-2.5 top-2.5 text-neutral-400" />
                  )}
                </div>

                {/* Search Dropdown Results */}
                {searchResults.length > 0 && (
                  <div className="max-h-36 overflow-y-auto border border-neutral-200 rounded bg-white divide-y divide-neutral-100">
                    {searchResults.map((client) => {
                      const isSelected = selectedClients.some((c) => c.id === client.id);
                      return (
                        <div
                          key={client.id}
                          onClick={() => toggleClientSelection(client)}
                          className={`flex items-center justify-between p-2 cursor-pointer text-xs transition-colors ${
                            isSelected ? "bg-neutral-100 font-medium" : "hover:bg-neutral-50"
                          }`}
                        >
                          <div>
                            <span className="text-neutral-900">{client.name}</span>
                            <span className="text-neutral-500 ml-2">({client.phone || "No phone"})</span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-neutral-900" />}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Selected Client Chips */}
                {selectedClients.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedClients.map((client) => (
                      <span
                        key={client.id}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-neutral-100 border border-neutral-200 text-[11px] text-neutral-800"
                      >
                        <span>{client.name} ({client.phone || "N/A"})</span>
                        <button
                          type="button"
                          onClick={() => removeClient(client.id)}
                          className="hover:text-rose-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-amber-700 bg-amber-50 p-1.5 rounded border border-amber-200">
                    Search and select customer accounts authorized to redeem this coupon.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Row 4: Usage Limits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">
                Total Redemptions Limit
              </label>
              <input
                type="number"
                min="1"
                value={usageLimitTotal}
                onChange={(e) => setUsageLimitTotal(e.target.value)}
                placeholder="Leave blank for unlimited"
                className="w-full h-8 px-2.5 rounded border border-neutral-200 text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 text-xs"
              />
              <span className="text-[10px] text-neutral-500">
                Max global redemptions across all users
              </span>
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">
                Limit Per Customer <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={usageLimitPerClient}
                onChange={(e) => setUsageLimitPerClient(e.target.value)}
                placeholder="1"
                className="w-full h-8 px-2.5 rounded border border-neutral-200 text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 text-xs"
                required
              />
              <span className="text-[10px] text-neutral-500">
                How many times a single customer can redeem (usually 1)
              </span>
            </div>
          </div>

          {/* Row 5: Validity Period */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-neutral-700 mb-1">
                Start Date & Time
              </label>
              <input
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="w-full h-8 px-2.5 rounded border border-neutral-200 text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 text-xs"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 mb-1">
                Expiration Date & Time
              </label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full h-8 px-2.5 rounded border border-neutral-200 text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900 text-xs"
              />
            </div>
          </div>

          {/* Row 6: Active Status Toggle */}
          <div className="flex items-center justify-between p-3 bg-neutral-50 border border-neutral-200 rounded">
            <div>
              <span className="font-medium text-neutral-900">Active Status</span>
              <p className="text-[11px] text-neutral-500">
                Inactive coupons cannot be redeemed at checkout by customers
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isActive ? "bg-emerald-600" : "bg-neutral-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${
                  isActive ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded border border-neutral-200 text-neutral-700 hover:bg-neutral-100 font-medium text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-xs transition-colors disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isEdit ? "Update Coupon" : "Create Coupon"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
