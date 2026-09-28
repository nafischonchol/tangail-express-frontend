"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import {
  ArrowLeft,
  Sparkles,
  Search,
  Check,
  X,
  AlertCircle,
  Loader2,
  Ticket,
  Calendar,
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
  initialCoupon?: Coupon | null;
  mode?: "create" | "edit";
}

export default function CouponFormClient({ initialCoupon, mode = "create" }: Props) {
  const router = useRouter();
  const isEdit = mode === "edit" && !!initialCoupon;

  // Form States
  const [code, setCode] = useState(initialCoupon?.code || "");
  const [name, setName] = useState(initialCoupon?.name || "");
  const [type, setType] = useState<"fixed" | "percentage">(initialCoupon?.type || "fixed");
  const [value, setValue] = useState<string>(initialCoupon?.value ? String(initialCoupon.value) : "");
  const [minOrderAmount, setMinOrderAmount] = useState<string>(
    initialCoupon?.min_order_amount ? String(initialCoupon.min_order_amount) : ""
  );
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<string>(
    initialCoupon?.max_discount_amount ? String(initialCoupon.max_discount_amount) : ""
  );
  const [targetType, setTargetType] = useState<"all" | "specific_clients">(
    initialCoupon?.target_type || "all"
  );
  const [selectedClients, setSelectedClients] = useState<ClientLookup[]>(
    (initialCoupon?.clients || []).map((c) => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      email: c.email || null,
      address: null,
      type: "customer" as const,
      balance: 0,
    }))
  );
  const [usageLimitTotal, setUsageLimitTotal] = useState<string>(
    initialCoupon?.usage_limit_total ? String(initialCoupon.usage_limit_total) : ""
  );
  const [usageLimitPerClient, setUsageLimitPerClient] = useState<string>(
    String(initialCoupon?.usage_limit_per_client ?? 1)
  );
  const [startsAt, setStartsAt] = useState<string>(
    initialCoupon?.starts_at ? new Date(initialCoupon.starts_at).toISOString().slice(0, 16) : ""
  );
  const [expiresAt, setExpiresAt] = useState<string>(
    initialCoupon?.expires_at ? new Date(initialCoupon.expires_at).toISOString().slice(0, 16) : ""
  );
  const [isActive, setIsActive] = useState<boolean>(initialCoupon ? initialCoupon.is_active : true);

  // Client search
  const [clientSearch, setClientSearch] = useState("");
  const [searchResults, setSearchResults] = useState<ClientLookup[]>([]);
  const [isSearchingClients, setIsSearchingClients] = useState(false);

  // Status & Notifications
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

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
      const random =
        "MOI-" +
        Math.random().toString(36).substring(2, 6).toUpperCase() +
        "-" +
        Math.random().toString(36).substring(2, 6).toUpperCase();
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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      showNotification("error", "Please enter or generate a coupon code.");
      return;
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) {
      showNotification("error", "Please enter a valid discount amount greater than 0.");
      return;
    }

    if (type === "percentage" && numValue > 100) {
      showNotification("error", "Percentage discount cannot exceed 100%.");
      return;
    }

    if (targetType === "specific_clients" && selectedClients.length === 0) {
      showNotification("error", "Please select at least one client for client-specific coupons.");
      return;
    }

    const payload: CouponPayload = {
      code: cleanCode,
      name: name.trim() || null,
      type,
      value: numValue,
      min_order_amount: minOrderAmount ? parseFloat(minOrderAmount) : null,
      max_discount_amount:
        type === "percentage" && maxDiscountAmount ? parseFloat(maxDiscountAmount) : null,
      target_type: targetType,
      client_ids: targetType === "specific_clients" ? selectedClients.map((c) => c.id) : undefined,
      usage_limit_total: usageLimitTotal ? parseInt(usageLimitTotal, 10) : null,
      usage_limit_per_client: parseInt(usageLimitPerClient, 10) || 1,
      starts_at: startsAt ? new Date(startsAt).toISOString() : null,
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      is_active: isActive,
    };

    setIsSubmitting(true);
    try {
      const res =
        isEdit && initialCoupon
          ? await updateCoupon(initialCoupon.id, payload)
          : await createCoupon(payload);

      setIsSubmitting(false);

      if (res.success) {
        showNotification("success", isEdit ? "Coupon updated successfully!" : "Coupon created successfully!");
        setTimeout(() => {
          router.push("/admin/coupons");
          router.refresh();
        }, 600);
      } else {
        showNotification("error", res.message || "Failed to save coupon.");
      }
    } catch (err: any) {
      setIsSubmitting(false);
      showNotification("error", err?.message || "An unexpected error occurred.");
    }
  };

  return (
    <div className="pt-2 pl-2 pr-4 pb-4 md:pt-3 md:pl-3 md:pr-6 md:pb-6 lg:pt-4 lg:pl-4 lg:pr-8 lg:pb-8 w-full space-y-6 relative">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-2xl border shadow-xl backdrop-blur-md animate-in slide-in-from-top-4 duration-300 ${
            notification.type === "success"
              ? "bg-emerald-50/90 border-emerald-100 text-emerald-800"
              : "bg-rose-50/90 border-rose-100 text-rose-800"
          }`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              notification.type === "success" ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
            }`}
          >
            {notification.type === "success" ? <Check size={18} /> : <AlertCircle size={18} />}
          </div>
          <div>
            <p className="text-sm font-semibold">{notification.type === "success" ? "Success" : "Error"}</p>
            <p className="text-xs text-slate-500 mt-0.5">{notification.message}</p>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-600 transition-colors ml-4 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header with Back Link & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/coupons">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center gap-1.5 h-9 cursor-pointer"
            >
              <ArrowLeft size={16} />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              {isEdit ? `Edit Coupon: ${initialCoupon?.code}` : "Add New Coupon"}
            </h1>
            <p className="text-xs text-slate-500">
              Configure discount rules, customer eligibility, and validity period
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <Link href="/admin/coupons">
            <Button
              type="button"
              variant="ghost"
              disabled={isSubmitting}
              className="h-10 px-5 rounded-xl border border-slate-200 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </Button>
          </Link>
          <Button
            onClick={() => handleSubmit()}
            disabled={isSubmitting}
            className="h-10 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/10 cursor-pointer flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Saving...
              </>
            ) : isEdit ? (
              "Update Coupon"
            ) : (
              "Save Coupon"
            )}
          </Button>
        </div>
      </div>

      {/* Form Content - Two Column Layout */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Basic Discount Settings */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="overflow-hidden border border-slate-200/80 shadow-sm">
            <CardHeader className="py-4 px-6 bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Ticket className="w-4 h-4 text-indigo-600" />
                <span>Coupon & Discount Rules</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6 space-y-4">
              {/* Code with Unique Generator Button */}
              <div>
                <Label htmlFor="coupon-code" className="text-xs font-semibold text-slate-700 mb-1.5 block">
                  Coupon Code <span className="text-rose-500">*</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="coupon-code"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. MOHIMA100"
                    className="h-10 rounded-xl bg-white border-slate-200 font-mono font-bold text-slate-900 uppercase text-xs tracking-wider"
                    required
                  />
                  <Button
                    type="button"
                    onClick={handleGenerateCode}
                    disabled={isGeneratingCode}
                    variant="secondary"
                    className="h-10 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    {isGeneratingCode ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    )}
                    <span>Unique Code</span>
                  </Button>
                </div>
              </div>

              {/* Campaign / Coupon Title */}
              <div>
                <Label htmlFor="coupon-name" className="text-xs font-semibold text-slate-700 mb-1.5 block">
                  Campaign / Promotion Name
                </Label>
                <Input
                  id="coupon-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Eid Mega Discount / VIP Exclusive"
                  className="h-10 rounded-xl bg-white border-slate-200 text-xs text-slate-900"
                />
              </div>

              {/* Discount Type & Value in Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <Label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Discount Type <span className="text-rose-500">*</span>
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setType("fixed")}
                      className={`h-10 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        type === "fixed"
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <CircleDollarSign className="w-3.5 h-3.5" />
                      <span>Fixed (৳)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setType("percentage")}
                      className={`h-10 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        type === "percentage"
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <Percent className="w-3.5 h-3.5" />
                      <span>Percent (%)</span>
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="discount-value" className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Discount Value <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="discount-value"
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={type === "percentage" ? 100 : undefined}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={type === "percentage" ? "10 (for 10%)" : "100 (for ৳100)"}
                    className="h-10 rounded-xl bg-white border-slate-200 text-xs text-slate-900"
                    required
                  />
                </div>
              </div>

              {/* Min Spend and Max Cap in Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="min-spend" className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Minimum Order Amount (৳)
                  </Label>
                  <Input
                    id="min-spend"
                    type="number"
                    step="0.01"
                    min="0"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(e.target.value)}
                    placeholder="e.g. 500 (optional)"
                    className="h-10 rounded-xl bg-white border-slate-200 text-xs text-slate-900"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Minimum cart subtotal required to apply
                  </span>
                </div>

                {type === "percentage" && (
                  <div>
                    <Label htmlFor="max-cap" className="text-xs font-semibold text-slate-700 mb-1.5 block">
                      Maximum Discount Cap (৳)
                    </Label>
                    <Input
                      id="max-cap"
                      type="number"
                      step="0.01"
                      min="0"
                      value={maxDiscountAmount}
                      onChange={(e) => setMaxDiscountAmount(e.target.value)}
                      placeholder="e.g. 200 (optional cap)"
                      className="h-10 rounded-xl bg-white border-slate-200 text-xs text-slate-900"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Upper limit for percentage discounts
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Customer Targeting Card */}
          <Card className="overflow-hidden border border-slate-200/80 shadow-sm">
            <CardHeader className="py-4 px-6 bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>Customer Target Eligibility</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-6">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="target_type"
                    checked={targetType === "all"}
                    onChange={() => setTargetType("all")}
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                  <span className="text-xs font-semibold text-slate-700">All Customers</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="target_type"
                    checked={targetType === "specific_clients"}
                    onChange={() => setTargetType("specific_clients")}
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                  />
                  <span className="text-xs font-semibold text-slate-700">Specific Customer(s) Only</span>
                </label>
              </div>

              {targetType === "specific_clients" && (
                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="text"
                      value={clientSearch}
                      onChange={(e) => setClientSearch(e.target.value)}
                      placeholder="Search customers by name, phone or email..."
                      className="pl-9 h-10 rounded-xl bg-white border-slate-200 text-xs text-slate-900"
                    />
                    {isSearchingClients && (
                      <Loader2 className="w-4 h-4 animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    )}
                  </div>

                  {/* Search Results Dropdown */}
                  {searchResults.length > 0 && (
                    <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-xl bg-white divide-y divide-slate-100 shadow-sm">
                      {searchResults.map((client) => {
                        const isSelected = selectedClients.some((c) => c.id === client.id);
                        return (
                          <div
                            key={client.id}
                            onClick={() => toggleClientSelection(client)}
                            className={`flex items-center justify-between p-2.5 cursor-pointer text-xs transition-colors ${
                              isSelected ? "bg-indigo-50/60 font-semibold text-indigo-900" : "hover:bg-slate-50"
                            }`}
                          >
                            <div>
                              <span className="text-slate-900 font-medium">{client.name}</span>
                              <span className="text-slate-500 ml-2">({client.phone || "No phone"})</span>
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-indigo-600" />}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Selected Client Chips */}
                  {selectedClients.length > 0 ? (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {selectedClients.map((client) => (
                        <span
                          key={client.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-800"
                        >
                          <span>{client.name} ({client.phone || "N/A"})</span>
                          <button
                            type="button"
                            onClick={() => removeClient(client.id)}
                            className="hover:text-rose-600 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                      Please search and select the customer accounts eligible to redeem this coupon.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Limits, Validity & Status */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="overflow-hidden border border-slate-200/80 shadow-sm">
            <CardHeader className="py-4 px-6 bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span>Usage Limits & Validity</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6 space-y-4">
              {/* Total Usage Limit */}
              <div>
                <Label htmlFor="usage-total" className="text-xs font-semibold text-slate-700 mb-1.5 block">
                  Total Redemptions Limit
                </Label>
                <Input
                  id="usage-total"
                  type="number"
                  min="1"
                  value={usageLimitTotal}
                  onChange={(e) => setUsageLimitTotal(e.target.value)}
                  placeholder="Leave blank for unlimited"
                  className="h-10 rounded-xl bg-white border-slate-200 text-xs text-slate-900"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Maximum global redemptions across all customers
                </span>
              </div>

              {/* Limit Per Customer */}
              <div>
                <Label htmlFor="usage-per-client" className="text-xs font-semibold text-slate-700 mb-1.5 block">
                  Limit Per Customer <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="usage-per-client"
                  type="number"
                  min="1"
                  value={usageLimitPerClient}
                  onChange={(e) => setUsageLimitPerClient(e.target.value)}
                  placeholder="1"
                  className="h-10 rounded-xl bg-white border-slate-200 text-xs text-slate-900"
                  required
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  How many times each individual customer can use this code
                </span>
              </div>

              {/* Start Date */}
              <div>
                <Label htmlFor="start-date" className="text-xs font-semibold text-slate-700 mb-1.5 block">
                  Start Date & Time
                </Label>
                <Input
                  id="start-date"
                  type="datetime-local"
                  value={startsAt}
                  onChange={(e) => setStartsAt(e.target.value)}
                  className="h-10 rounded-xl bg-white border-slate-200 text-xs text-slate-900"
                />
              </div>

              {/* Expiry Date */}
              <div>
                <Label htmlFor="expire-date" className="text-xs font-semibold text-slate-700 mb-1.5 block">
                  Expiration Date & Time
                </Label>
                <Input
                  id="expire-date"
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="h-10 rounded-xl bg-white border-slate-200 text-xs text-slate-900"
                />
              </div>

              {/* Active Status Switch */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
                <div>
                  <span className="text-xs font-semibold text-slate-800">Coupon Status</span>
                  <p className="text-[11px] text-slate-500">
                    {isActive ? "Active and usable by customers" : "Inactive / suspended"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isActive ? "bg-emerald-600" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                      isActive ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
