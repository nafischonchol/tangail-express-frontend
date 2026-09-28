"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { 
  Package, 
  Search, 
  Eye, 
  ShoppingCart, 
  ArrowRight, 
  RefreshCw,
  Copy,
  Check,
  Loader2,
  ChevronDown
} from "lucide-react";
import toast from "react-hot-toast";
import { 
  CustomerOrder, 
  getCustomerOrdersApi 
} from "@/lib/api/customerOrder";
import { getStatusBadgeStyle } from "./OrderDetailModal";

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "Order Placed", label: "Placed" },
  { value: "Confirmed", label: "Confirmed" },
  { value: "Packaging", label: "Packaging" },
  { value: "Ready To Deliver", label: "Ready to Deliver" },
  { value: "Shipped", label: "Shipped" },
  { value: "Delivered", label: "Delivered" },
  { value: "Cancelled", label: "Cancelled" },
];

export function OrdersListView() {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedInvoice, setCopiedInvoice] = useState<string | null>(null);

  const loadOrders = async (statusFilter = selectedStatus) => {
    setLoading(true);
    try {
      const res = await getCustomerOrdersApi({
        status: statusFilter === "all" ? undefined : statusFilter,
      });

      if (res.success && Array.isArray(res.resources)) {
        setOrders(res.resources);
      } else {
        setOrders([]);
      }
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders(selectedStatus);
  }, [selectedStatus]);

  // Client-side search filtering by invoice number or status or date
  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const q = searchQuery.toLowerCase().trim();
    return orders.filter((order) => {
      return order.invoice_no?.toLowerCase().includes(q) ||
             order.status?.toLowerCase().includes(q) ||
             order.date?.toLowerCase().includes(q);
    });
  }, [orders, searchQuery]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(e.target.value);
  };

  const handleCopyInvoice = (e: React.MouseEvent, invoiceNo: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(invoiceNo);
    setCopiedInvoice(invoiceNo);
    toast.success("Invoice number copied", {
      style: { background: "#18181b", color: "#f4f4f5", border: "1px solid #27272a" },
    });
    setTimeout(() => setCopiedInvoice(null), 2000);
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-3.5">
      {/* Top Header with Search and Status Select */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-zinc-100">
        <div>
          <h1 className="text-base font-bold text-zinc-900 flex items-center gap-2">
            <Package size={18} className="text-[#BA478F]" />
            <span>My Orders</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Track and view all your past and current purchases
          </p>
        </div>

        {/* Filters Group: Search + Status Select */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Search Input */}
          <div className="relative w-full sm:w-52">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search invoice..."
              className="w-full pl-8 pr-3 py-1.5 bg-zinc-50 focus:bg-white border border-zinc-200 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 rounded-xl text-xs text-zinc-900 placeholder:text-zinc-400 transition-all outline-hidden"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400 hover:text-zinc-700 bg-zinc-200/60 rounded px-1 py-0.5 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Status Select Dropdown */}
          <div className="relative w-full sm:w-40">
            <select
              value={selectedStatus}
              onChange={handleStatusChange}
              className="w-full appearance-none pl-3 pr-7 py-1.5 bg-zinc-50 hover:bg-zinc-100/60 focus:bg-white border border-zinc-200 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400 rounded-xl text-xs font-medium text-zinc-800 transition-all outline-hidden cursor-pointer"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={13}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
            />
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div>
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-zinc-400 gap-2">
            <Loader2 className="animate-spin text-[#BA478F]" size={20} />
            <span className="text-xs font-medium text-zinc-500">Loading orders...</span>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="space-y-3">
            <div className="overflow-x-auto scrollbar-none -mx-5 px-5">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-zinc-50 border-y border-zinc-100 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                    <th className="py-2.5 px-3.5 font-semibold">Order ID</th>
                    <th className="py-2.5 px-3 font-semibold">Date</th>
                    <th className="py-2.5 px-3 font-semibold">Status</th>
                    <th className="py-2.5 px-3 font-semibold">Items</th>
                    <th className="py-2.5 px-3 font-semibold">Total</th>
                    <th className="py-2.5 px-3.5 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-xs">
                  {filteredOrders.map((order) => {
                    const isCopied = copiedInvoice === order.invoice_no;

                    return (
                      <tr 
                        key={order.id} 
                        className="hover:bg-zinc-50/60 transition-colors group"
                      >
                        {/* Order ID */}
                        <td className="py-2.5 px-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-zinc-900">
                              {order.invoice_no}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleCopyInvoice(e, order.invoice_no)}
                              className="p-1 rounded text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 transition-colors cursor-pointer"
                              title="Copy invoice number"
                            >
                              {isCopied ? (
                                <Check size={12} className="text-emerald-600" />
                              ) : (
                                <Copy size={12} />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="py-2.5 px-3 text-zinc-600 whitespace-nowrap">
                          {order.date}
                        </td>

                        {/* Status */}
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadgeStyle(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                        </td>

                        {/* Items */}
                        <td className="py-2.5 px-3 text-zinc-600 whitespace-nowrap">
                          {order.items_count} {order.items_count === 1 ? "item" : "items"}
                        </td>

                        {/* Total */}
                        <td className="py-2.5 px-3 font-bold text-zinc-900 font-mono whitespace-nowrap">
                          ৳{order.grand_total.toLocaleString()}
                        </td>

                        {/* Action */}
                        <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                          <Link
                            href={`/account/orders/${order.id}`}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-lg bg-[#FDF2F8] hover:bg-[#FCE7F3] text-[#BA478F] border border-[#FBCFE8] text-xs font-semibold transition-colors cursor-pointer"
                          >
                            <Eye size={13} />
                            <span>View Details</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Showing Entries Footer */}
            <div className="pt-1 text-[11px] text-zinc-400 font-medium">
              Showing {filteredOrders.length} {filteredOrders.length === 1 ? "entry" : "entries"}
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="py-14 text-center max-w-sm mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 border border-zinc-200 text-zinc-400 flex items-center justify-center mx-auto mb-3">
              <ShoppingCart size={22} />
            </div>
            <h3 className="text-sm font-bold text-zinc-900 mb-1">
              {searchQuery
                ? "No matching orders found"
                : selectedStatus !== "all"
                ? `No ${selectedStatus.toLowerCase()} orders`
                : "No orders placed yet"}
            </h3>
            <p className="text-xs text-zinc-500 mb-5 leading-relaxed">
              {searchQuery
                ? `We couldn't find any orders matching "${searchQuery}". Try searching with a different keyword.`
                : "When you place an order, it will appear here with live tracking and status updates."}
            </p>

            {searchQuery || selectedStatus !== "all" ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedStatus("all");
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                <RefreshCw size={13} />
                <span>Reset Filters</span>
              </button>
            ) : (
              <Link
                href="/catalog"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-[#BA478F] hover:bg-[#94286B] text-white transition-all cursor-pointer shadow-2xs"
              >
                <span>Browse Catalog</span>
                <ArrowRight size={13} />
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
