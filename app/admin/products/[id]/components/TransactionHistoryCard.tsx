"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Transaction, tabs } from "@/app/admin/products/[id]/mockData";
import type { StockMovement } from "@/lib/api/stock";
import Link from "next/link";

interface TransactionHistoryCardProps {
  transactions: Transaction[];
  stockMovements?: StockMovement[];
  productId: number;
  activeTab: string;
}

const movementTypeLabels: Record<string, { label: string; color: string }> = {
  adjustment: { label: "Adjustment", color: "text-indigo-600 bg-indigo-50" },
  purchase: { label: "Purchase", color: "text-emerald-600 bg-emerald-50" },
  sale: { label: "Sale", color: "text-rose-600 bg-rose-50" },
  sale_return: { label: "Sale Return", color: "text-emerald-600 bg-emerald-50" },
  purchase_return: { label: "Purchase Return", color: "text-rose-600 bg-rose-50" },
};

export default function TransactionHistoryCard({ 
  transactions = [], 
  stockMovements = [],
  productId,
  activeTab: initialTab = "all"
}: TransactionHistoryCardProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [bottomSearch, setBottomSearch] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  // Sync state if initialTab changes (e.g. initial server render or direct route loads)
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Sync tab with router pathname
  useEffect(() => {
    if (pathname) {
      const segments = pathname.split("/").filter(Boolean);
      const tabFromUrl = segments[2] || "all";
      setActiveTab(tabFromUrl);
    }
  }, [pathname]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const newPath = tabId === "all" 
      ? `/admin/products/${productId}` 
      : `/admin/products/${productId}/${tabId}`;
    router.push(newPath, { scroll: false });
  };

  const filteredMovements = stockMovements.filter(m => {
    if (activeTab !== "all" && m.type !== activeTab) return false;

    if (bottomSearch) {
      const query = bottomSearch.toLowerCase();
      return (
        (m.reason || "").toLowerCase().includes(query) ||
        m.type.toLowerCase().includes(query) ||
        new Date(m.created_at).toLocaleDateString().includes(query)
      );
    }
    return true;
  });

  const formatPrice = (price: number) => {
    return `৳ ${price.toFixed(2)}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-BD", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Order Placed":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "Confirmed":
        return "bg-sky-50 text-sky-700 border-sky-100";
      case "Packaging":
        return "bg-amber-50 text-amber-700 border-amber-100";
      case "Ready To Deliver":
        return "bg-purple-50 text-purple-700 border-purple-100";
      case "Shipped":
        return "bg-indigo-50 text-indigo-700 border-indigo-100";
      case "Delivered":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "Cancelled":
        return "bg-rose-50 text-rose-700 border-rose-100";
      case "Unreachable":
        return "bg-orange-50 text-orange-700 border-orange-100";
      case "Returned":
        return "bg-slate-100 text-slate-700 border-slate-200";
      default:
        return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  return (
    <Card className="shadow-sm bg-white border border-slate-100 rounded-xl overflow-hidden">
      {/* Tabs Header + Search bar */}
      <div className="border-b border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between bg-white px-2 md:px-4">
        <div className="flex items-center overflow-x-auto scrollbar-none pt-2 md:pt-0">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-3.5 py-4.5 text-xs md:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${isActive ? 'text-indigo-600 border-indigo-600' : 'text-slate-505 border-transparent hover:text-slate-800'}`}
              >
                {tab.name}
              </button>
            );
          })}
        </div>

        <div className="relative py-3 md:py-0 w-full md:w-48 xl:w-56 px-2 md:px-0 shrink-0">
          <Search className="absolute left-4.5 md:left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input 
            type="text" 
            placeholder="Search.." 
            value={bottomSearch}
            onChange={(e) => setBottomSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 text-slate-800"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead className="bg-[#fafafa] text-slate-505 border-b border-slate-100 font-semibold">
            {activeTab === "sale" ? (
              <tr>
                <th className="px-6 py-4.5 font-semibold text-[13px]">Date</th>
                <th className="px-6 py-4.5 font-semibold text-[13px]">Invoice</th>
                <th className="px-6 py-4.5 font-semibold text-[13px]">QTY</th>
                <th className="px-6 py-4.5 font-semibold text-[13px]">Customer</th>
                <th className="px-6 py-4.5 font-semibold text-[13px]">Unit Price</th>
                <th className="px-6 py-4.5 font-semibold text-[13px]">Total</th>
                <th className="px-6 py-4.5 font-semibold text-[13px]">Status</th>
              </tr>
            ) : (
              <tr>
                <th className="px-6 py-4.5 font-semibold text-[13px]">Date</th>
                <th className="px-6 py-4.5 font-semibold text-[13px]">Type</th>
                <th className="px-6 py-4.5 font-semibold text-[13px]">Title / Reason</th>
                {activeTab === "adjustment" && <th className="px-6 py-4.5 font-semibold text-[13px]">Variant</th>}
                <th className="px-6 py-4.5 font-semibold text-[13px]">QTY</th>
                {activeTab === "adjustment" && <th className="px-6 py-4.5 font-semibold text-[13px]">Before</th>}
                {activeTab === "adjustment" && <th className="px-6 py-4.5 font-semibold text-[13px]">After</th>}
                {activeTab !== "adjustment" && <th className="px-6 py-4.5 font-semibold text-[13px]">Unit Price</th>}
                {activeTab !== "adjustment" && <th className="px-6 py-4.5 font-semibold text-[13px]">Total</th>}
              </tr>
            )}
          </thead>
          <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
            {filteredMovements.length === 0 ? (
              <tr>
                <td colSpan={activeTab === "sale" ? 7 : (activeTab === "adjustment" ? 7 : 6)} className="px-6 py-12 text-center text-slate-400 font-normal">
                  No records found for this selection.
                </td>
              </tr>
            ) : (
              filteredMovements.map((m) => {
                const typeInfo = movementTypeLabels[m.type] || { label: m.type, color: "text-slate-600 bg-slate-50" };
                const unitPrice = m.reference?.unit_price 
                  ? Number(m.reference.unit_price) 
                  : m.variant?.price 
                    ? Number(m.variant.price) 
                    : null;

                if (activeTab === "sale") {
                  const invoice = m.reference?.order?.invoice_no || m.reference?.invoice_no || "—";
                  const customerName = m.reference?.order?.client_snapshot?.name || m.reference?.client_snapshot?.name || "Walk-in Customer";
                  const customerPhone = m.reference?.order?.client_snapshot?.phone || m.reference?.client_snapshot?.phone || null;
                  const status = m.reference?.order?.status || m.reference?.status || "—";

                  const isOrderItem = m.reference_type?.includes("OrderItem");
                  const orderId = isOrderItem ? m.reference?.order_id : m.reference_id;
                  const clientId = isOrderItem ? m.reference?.order?.client_id : m.reference?.client_id;

                  return (
                    <tr key={`movement-${m.id}`} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-6 py-4 text-[13px] text-slate-500" suppressHydrationWarning>{formatDate(m.created_at)}</td>
                      <td className="px-6 py-4 text-[13px] font-bold text-indigo-600">
                        {orderId ? (
                          <Link 
                            href={`/admin/sales/${orderId}`} 
                            target="_blank" 
                            className="hover:underline hover:text-indigo-800 transition-colors"
                          >
                            {invoice}
                          </Link>
                        ) : (
                          invoice
                        )}
                      </td>
                      <td className={`px-6 py-4 text-[13px] font-bold ${m.quantity > 0 ? "text-emerald-600" : "text-rose-500"}`}>
                        {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                      </td>
                      <td className="px-6 py-4 text-[13px] text-slate-700">
                        <div>
                          {clientId ? (
                            <Link 
                              href={`/admin/clients/${clientId}`} 
                              target="_blank" 
                              className="font-semibold text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
                            >
                              {customerName}
                            </Link>
                          ) : (
                            customerName
                          )}
                        </div>
                        {customerPhone && (
                          <div className="text-[11px] text-slate-400 mt-0.5 font-mono">{customerPhone}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-[13px] text-slate-600">
                        {unitPrice !== null ? formatPrice(unitPrice) : "—"}
                      </td>
                      <td className="px-6 py-4 text-[13px] text-slate-900 font-bold">
                        {unitPrice !== null ? formatPrice(Math.abs(m.quantity) * unitPrice) : "—"}
                      </td>
                      <td className="px-6 py-4 text-[13px]">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${getStatusStyles(status)}`}>
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={`movement-${m.id}`} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-6 py-4 text-[13px] text-slate-500" suppressHydrationWarning>{formatDate(m.created_at)}</td>
                    <td className="px-6 py-4 text-[13px]">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${typeInfo.color}`}>
                        {typeInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[13px] text-slate-600">{m.reason || "—"}</td>
                    {activeTab === "adjustment" && (
                      <td className="px-6 py-4 text-[13px] text-slate-600">{m.variant?.sku || "—"}</td>
                    )}
                    <td className={`px-6 py-4 text-[13px] font-bold ${m.quantity > 0 ? "text-emerald-600" : "text-rose-500"}`}>
                      {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                    </td>
                    {activeTab === "adjustment" && (
                      <td className="px-6 py-4 text-[13px] text-slate-600">{m.stock_before}</td>
                    )}
                    {activeTab === "adjustment" && (
                      <td className="px-6 py-4 text-[13px] text-slate-900 font-bold">{m.stock_after}</td>
                    )}
                    {activeTab !== "adjustment" && (
                      <td className="px-6 py-4 text-[13px] text-slate-600">
                        {unitPrice !== null ? formatPrice(unitPrice) : "—"}
                      </td>
                    )}
                    {activeTab !== "adjustment" && (
                      <td className="px-6 py-4 text-[13px] text-slate-900 font-bold">
                        {unitPrice !== null ? formatPrice(Math.abs(m.quantity) * unitPrice) : "—"}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Bottom Footer Info & Pagination */}
      <div className="p-4 border-t border-slate-100 bg-[#fafafa]/50 flex items-center justify-between text-xs font-semibold text-slate-500 select-none">
        <div>
          Showing {filteredMovements.length > 0 ? `1-${filteredMovements.length} from ${filteredMovements.length}` : "0 from 0"}
        </div>
        <div className="flex gap-1">
          <span className="text-slate-400 cursor-pointer hover:text-slate-600 px-1.5 py-0.5">«</span>
          <span className="w-5 h-5 rounded flex items-center justify-center bg-indigo-600 text-white cursor-default">1</span>
          <span className="text-slate-400 cursor-pointer hover:text-slate-600 px-1.5 py-0.5">»</span>
        </div>
      </div>
    </Card>
  );
}
