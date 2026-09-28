"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Package, 
  Clock, 
  MapPin, 
  CreditCard, 
  Eye, 
  Copy, 
  Check, 
  ShoppingCart, 
  ArrowRight,
  Loader2
} from "lucide-react";
import toast from "react-hot-toast";
import { 
  CustomerOrder, 
  getCustomerOrdersApi 
} from "@/lib/api/customerOrder";
import { fetchCustomerAddressesApi, ClientAddress } from "@/lib/api/customerAddresses";
import { getStatusBadgeStyle } from "./OrderDetailModal";

export function DashboardView() {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [addresses, setAddresses] = useState<ClientAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedInvoice, setCopiedInvoice] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [ordersRes, addressesRes] = await Promise.all([
          getCustomerOrdersApi(),
          fetchCustomerAddressesApi(),
        ]);

        if (ordersRes.success && Array.isArray(ordersRes.resources)) {
          setOrders(ordersRes.resources);
        }

        if (addressesRes.success && Array.isArray(addressesRes.resources)) {
          setAddresses(addressesRes.resources);
        }
      } catch {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const totalOrdersCount = orders.length;

  // Pending orders are orders not yet Delivered or Cancelled
  const pendingOrdersCount = orders.filter((order) => {
    const s = (order.status || "").toLowerCase();
    return !s.includes("delivered") && !s.includes("cancel") && !s.includes("return");
  }).length;

  const totalAddressesCount = addresses.length;

  // Total spent calculation
  const totalSpent = orders
    .filter((order) => !order.status?.toLowerCase().includes("cancel"))
    .reduce((sum, order) => sum + (Number(order.grand_total) || 0), 0);

  const recentOrders = orders.slice(0, 5);

  const handleCopyInvoice = (e: React.MouseEvent, invoiceNo: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(invoiceNo);
    setCopiedInvoice(invoiceNo);
    toast.success("Invoice number copied", {
      style: { background: "#18181b", color: "#f4f4f5", border: "1px solid #27272a" },
    });
    setTimeout(() => setCopiedInvoice(null), 2000);
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-zinc-400 gap-2 bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs">
        <Loader2 className="animate-spin text-[#BA478F]" size={24} />
        <span className="text-xs font-medium text-zinc-500">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Orders */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-50/80 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <Package size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] sm:text-xs text-zinc-500 font-medium truncate">Total Orders</p>
            <h3 className="text-lg sm:text-xl font-bold text-zinc-900 mt-0.5">{totalOrdersCount}</h3>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-50/80 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <Clock size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] sm:text-xs text-zinc-500 font-medium truncate">Pending Orders</p>
            <h3 className="text-lg sm:text-xl font-bold text-zinc-900 mt-0.5">{pendingOrdersCount}</h3>
          </div>
        </div>

        {/* Addresses */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-50/80 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <MapPin size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] sm:text-xs text-zinc-500 font-medium truncate">Addresses</p>
            <h3 className="text-lg sm:text-xl font-bold text-zinc-900 mt-0.5">{totalAddressesCount}</h3>
          </div>
        </div>

        {/* Total Spent */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-purple-50/80 border border-purple-100 flex items-center justify-center text-[#BA478F] shrink-0">
            <CreditCard size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] sm:text-xs text-zinc-500 font-medium truncate">Total Spent</p>
            <h3 className="text-lg sm:text-xl font-bold text-zinc-900 font-mono mt-0.5">৳{totalSpent.toLocaleString()}</h3>
          </div>
        </div>
      </div>

      {/* Recent Orders Card */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-3.5">
        {/* Card Header */}
        <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-zinc-100">
          <h2 className="text-sm sm:text-base font-bold text-zinc-900">
            Recent Orders
          </h2>
          <Link
            href="/account/orders"
            className="text-xs font-semibold text-[#BA478F] hover:text-[#94286B] transition-colors"
          >
            View All
          </Link>
        </div>

        {/* Orders Table */}
        {recentOrders.length > 0 ? (
          <div className="overflow-x-auto scrollbar-none -mx-5 px-5">
            <table className="w-full text-left border-collapse min-w-[580px]">
              <thead>
                <tr className="bg-zinc-50 border-y border-zinc-100 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                  <th className="py-2.5 px-3.5 font-semibold">Order ID</th>
                  <th className="py-2.5 px-3 font-semibold">Date</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                  <th className="py-2.5 px-3 font-semibold">Total</th>
                  <th className="py-2.5 px-3.5 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-xs">
                {recentOrders.map((order) => {
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

                      {/* Total */}
                      <td className="py-2.5 px-3 font-bold text-zinc-900 font-mono whitespace-nowrap">
                        ৳{order.grand_total.toLocaleString()}
                      </td>

                      {/* Action */}
                      <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                        <Link
                          href={`/account/orders/${order.id}`}
                          className="inline-flex items-center justify-center gap-1 px-3 py-1 rounded-lg bg-[#FDF2F8] hover:bg-[#FCE7F3] text-[#BA478F] border border-[#FBCFE8] text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <Eye size={12} />
                          <span>View</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center max-w-sm mx-auto">
            <div className="w-10 h-10 rounded-2xl bg-zinc-100 border border-zinc-200 text-zinc-400 flex items-center justify-center mx-auto mb-2.5">
              <ShoppingCart size={20} />
            </div>
            <h3 className="text-xs font-bold text-zinc-900 mb-0.5">No orders yet</h3>
            <p className="text-[11px] text-zinc-500 mb-4">
              Your recent orders will appear here once placed.
            </p>
            <Link
              href="/catalog"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-[#BA478F] hover:bg-[#94286B] text-white transition-all cursor-pointer shadow-2xs"
            >
              <span>Browse Catalog</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
