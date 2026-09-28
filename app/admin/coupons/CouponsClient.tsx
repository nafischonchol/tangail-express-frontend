"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Check,
  AlertCircle,
  X,
  History,
  Users,
  Percent,
  CircleDollarSign,
  Ticket,
} from "lucide-react";
import {
  updateCouponStatus,
  deleteCoupon,
  type Coupon,
  type CouponStats,
} from "@/lib/api/coupons";
import CouponUsagesModal from "./components/CouponUsagesModal";

interface Props {
  initialCoupons: Coupon[];
  initialPagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  initialStats: CouponStats;
}

export default function CouponsClient({
  initialCoupons,
  initialPagination,
  initialStats,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [pagination, setPagination] = useState(initialPagination);
  const [stats, setStats] = useState<CouponStats>(initialStats);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [activeTab, setActiveTab] = useState(searchParams.get("status") || "all");
  const [typeFilter, setTypeFilter] = useState(searchParams.get("type") || "all");

  // Keep state in sync with server components re-fetching on URL/filter changes
  useEffect(() => {
    setCoupons(initialCoupons);
    setPagination(initialPagination);
    setStats(initialStats);
  }, [initialCoupons, initialPagination, initialStats]);

  useEffect(() => {
    setActiveTab(searchParams.get("status") || "all");
    setTypeFilter(searchParams.get("type") || "all");
    setSearchQuery(searchParams.get("search") || "");
  }, [searchParams]);

  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Usages Modal
  const [isUsagesModalOpen, setIsUsagesModalOpen] = useState(false);
  const [usagesCoupon, setUsagesCoupon] = useState<Coupon | null>(null);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchQuery.trim()) {
      params.set("search", searchQuery.trim());
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    router.push(`/admin/coupons?${params.toString()}`);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    if (tab !== "all") {
      params.set("status", tab);
    } else {
      params.delete("status");
    }
    params.set("page", "1");
    router.push(`/admin/coupons?${params.toString()}`);
  };

  const handleTypeChange = (type: string) => {
    setTypeFilter(type);
    const params = new URLSearchParams(searchParams.toString());
    if (type !== "all") {
      params.set("type", type);
    } else {
      params.delete("type");
    }
    params.set("page", "1");
    router.push(`/admin/coupons?${params.toString()}`);
  };

  const handleToggleStatus = async (coupon: Coupon) => {
    const nextStatus = !coupon.is_active;

    // Optimistic update
    setCoupons((prev) =>
      prev.map((c) => (c.id === coupon.id ? { ...c, is_active: nextStatus } : c))
    );

    const res = await updateCouponStatus(coupon.id, nextStatus);
    if (!res.success) {
      setCoupons((prev) =>
        prev.map((c) => (c.id === coupon.id ? { ...c, is_active: coupon.is_active } : c))
      );
      showNotification("error", res.message || "Failed to update coupon status.");
    } else {
      showNotification(
        "success",
        `Coupon "${coupon.code}" is now ${nextStatus ? "active" : "inactive"}.`
      );
      router.refresh();
    }
  };

  const handleDelete = async (coupon: Coupon) => {
    const confirmMessage =
      coupon.used_count > 0
        ? `This coupon has been used ${coupon.used_count} time(s). Deleting it will deactivate it to preserve order history. Proceed?`
        : `Are you sure you want to permanently delete coupon "${coupon.code}"?`;

    if (!window.confirm(confirmMessage)) return;

    const res = await deleteCoupon(coupon.id);
    if (res.success) {
      setCoupons((prev) => prev.filter((c) => c.id !== coupon.id));
      showNotification("success", "Coupon deleted successfully.");
      router.refresh();
    } else {
      showNotification("error", res.message || "Failed to delete coupon.");
    }
  };

  const renderValidity = (coupon: Coupon) => {
    const now = new Date();
    const startsAt = coupon.starts_at ? new Date(coupon.starts_at) : null;
    const expiresAt = coupon.expires_at ? new Date(coupon.expires_at) : null;

    const formatDate = (date: Date) =>
      date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

    if (expiresAt && now > expiresAt) {
      return (
        <div className="flex flex-col items-start gap-0.5">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            Expired
          </span>
          <span className="text-[10px] text-slate-400">
            Ended {formatDate(expiresAt)}
          </span>
        </div>
      );
    }

    if (startsAt && now < startsAt) {
      return (
        <div className="flex flex-col items-start gap-0.5">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Upcoming
          </span>
          <span className="text-[10px] text-slate-400">
            Starts {formatDate(startsAt)}
          </span>
        </div>
      );
    }

    if (expiresAt) {
      return (
        <div className="flex flex-col items-start gap-0.5">
          <span className="text-xs font-medium text-slate-700">
            Until {formatDate(expiresAt)}
          </span>
          {startsAt && (
            <span className="text-[10px] text-slate-400">
              From {formatDate(startsAt)}
            </span>
          )}
        </div>
      );
    }

    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
        No Expiry
      </span>
    );
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
              notification.type === "success"
                ? "bg-emerald-500/10 text-emerald-600"
                : "bg-rose-500/10 text-rose-600"
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

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="border border-slate-200/80 shadow-xs">
          <CardContent className="p-4">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Total Coupons
            </div>
            <div className="text-xl font-bold text-slate-800 mt-1">
              {stats.total_coupons}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 shadow-xs">
          <CardContent className="p-4">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Active Promos
            </div>
            <div className="text-xl font-bold text-emerald-600 mt-1">
              {stats.active_coupons}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 shadow-xs">
          <CardContent className="p-4">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Total Redemptions
            </div>
            <div className="text-xl font-bold text-slate-800 mt-1">
              {stats.total_redemptions.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 shadow-xs">
          <CardContent className="p-4">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Discount Issued
            </div>
            <div className="text-xl font-bold text-indigo-600 mt-1">
              ৳{Number(stats.total_discount_given).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coupons List Table Card */}
      <Card className="overflow-hidden border border-slate-200/80 shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-5 px-6 bg-slate-50/30 border-b border-slate-100">
          <div>
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Ticket className="w-5 h-5 text-indigo-600" />
              <span>Coupons & Promotions</span>
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage promotional codes, discounts, and customer eligibility
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
            {/* Status Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
              {[
                { key: "all", label: "All" },
                { key: "active", label: "Active" },
                { key: "inactive", label: "Inactive" },
                { key: "expired", label: "Expired" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                    activeTab === tab.key
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="h-9 px-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-600 font-medium"
            >
              <option value="all">All Types</option>
              <option value="fixed">Fixed (৳)</option>
              <option value="percentage">Percent (%)</option>
            </select>

            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <Input
                type="text"
                placeholder="Search code or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 w-full rounded-xl bg-white border-slate-200 text-xs"
              />
            </form>

            {/* Add Coupon Button */}
            <Link href="/admin/coupons/add">
              <Button className="h-9 rounded-xl shadow-sm bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-semibold cursor-pointer whitespace-nowrap">
                <Plus size={16} className="mr-1" />
                Add Coupon
              </Button>
            </Link>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider">Coupon Code</th>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider">Discount</th>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider">Min Spend</th>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider">Target</th>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider">Used / Limit</th>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider">Validity</th>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-right w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {coupons.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-slate-400">
                      No coupons found
                    </td>
                  </tr>
                ) : (
                  coupons.map((row) => (
                    <tr key={row.id} className="transition-colors hover:bg-slate-50/50">
                      {/* Code & Name */}
                      <td className="px-5 py-3.5">
                        <div className="font-mono font-bold text-slate-800 tracking-wider text-xs uppercase">
                          {row.code}
                        </div>
                        {row.name && (
                          <div className="text-[11px] text-slate-500 mt-0.5">{row.name}</div>
                        )}
                      </td>

                      {/* Discount */}
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold border ${
                            row.type === "percentage"
                              ? "bg-purple-50 border-purple-100 text-purple-700"
                              : "bg-emerald-50 border-emerald-100 text-emerald-700"
                          }`}
                        >
                          {row.type === "percentage" ? (
                            <>
                              <Percent className="w-3 h-3 mr-1" />
                              <span>{row.value}% OFF</span>
                              {row.max_discount_amount && (
                                <span className="ml-1 text-[10px] text-purple-500 font-normal">
                                  (Max ৳{row.max_discount_amount})
                                </span>
                              )}
                            </>
                          ) : (
                            <>
                              <CircleDollarSign className="w-3 h-3 mr-1" />
                              <span>৳{Number(row.value).toLocaleString()} OFF</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Min Spend */}
                      <td className="px-5 py-3.5 text-slate-700 font-medium">
                        {row.min_order_amount ? `৳${Number(row.min_order_amount).toLocaleString()}` : "—"}
                      </td>

                      {/* Target Audience */}
                      <td className="px-5 py-3.5">
                        {row.target_type === "specific_clients" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-indigo-50 border border-indigo-100 text-indigo-700">
                            <Users className="w-3 h-3" />
                            <span>{row.clients?.length || 0} Clients</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 border border-slate-200 text-slate-700">
                            All Clients
                          </span>
                        )}
                      </td>

                      {/* Used / Limit */}
                      <td className="px-5 py-3.5">
                        <div className="font-mono font-medium text-slate-800">
                          {row.used_count} / {row.usage_limit_total ?? "∞"}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {row.usage_limit_per_client} per customer
                        </div>
                      </td>

                      {/* Validity Period */}
                      <td className="px-5 py-3.5">
                        {renderValidity(row)}
                      </td>

                      {/* Status Toggle Button */}
                      <td className="px-5 py-3.5">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(row)}
                          title="Click to toggle status"
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                            row.is_active
                              ? "bg-emerald-50 border-emerald-100 text-emerald-700 hover:bg-emerald-100/60"
                              : "bg-rose-50 border-rose-100 text-rose-700 hover:bg-rose-100/60"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                              row.is_active ? "bg-emerald-500" : "bg-rose-500"
                            }`}
                          />
                          {row.is_active ? "Active" : "Inactive"}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Usages Log */}
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setUsagesCoupon(row);
                              setIsUsagesModalOpen(true);
                            }}
                            className="h-8 w-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border-none transition-all p-0 flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 shadow-xs"
                            title="View Redemptions"
                          >
                            <History size={14} />
                          </Button>

                          {/* Edit on /admin/coupons/edit/[id] */}
                          <Link href={`/admin/coupons/edit/${row.id}`}>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="h-8 w-8 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-none transition-all p-0 flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 shadow-xs"
                              title="Edit Coupon"
                            >
                              <Edit size={14} />
                            </Button>
                          </Link>

                          {/* Delete */}
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleDelete(row)}
                            className="h-8 w-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border-none transition-all p-0 flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 shadow-xs"
                            title="Delete Coupon"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {pagination.last_page > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/30 text-xs text-slate-600">
              <div>
                Showing page {pagination.current_page} of {pagination.last_page} ({pagination.total} total)
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={pagination.current_page <= 1}
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.set("page", String(pagination.current_page - 1));
                    router.push(`/admin/coupons?${params.toString()}`);
                  }}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-white bg-white font-medium cursor-pointer"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={pagination.current_page >= pagination.last_page}
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.set("page", String(pagination.current_page + 1));
                    router.push(`/admin/coupons?${params.toString()}`);
                  }}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-white bg-white font-medium cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usages Modal */}
      <CouponUsagesModal
        isOpen={isUsagesModalOpen}
        coupon={usagesCoupon}
        onClose={() => {
          setIsUsagesModalOpen(false);
          setUsagesCoupon(null);
        }}
      />
    </div>
  );
}
