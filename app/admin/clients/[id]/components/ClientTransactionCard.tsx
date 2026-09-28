"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Eye } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { Order } from "@/lib/api/orders";

interface ClientTransactionCardProps {
  orders: Order[];
}

const tabs = [
  { id: "all", name: "All Transactions" },
  { id: "sale", name: "Sales" },
];

const typeLabels: Record<string, { label: string; color: string }> = {
  sale: { label: "Sale", color: "text-rose-600 bg-rose-50" },
  sale_return: { label: "Sale Return", color: "text-emerald-600 bg-emerald-50" },
  purchase: { label: "Purchase", color: "text-indigo-600 bg-indigo-50" },
};

export default function ClientTransactionCard({ orders }: ClientTransactionCardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");

  const formatPrice = (price: number) => `৳ ${price.toFixed(2)}`;

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-BD", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const filtered = orders.filter((o) => {
    if (activeTab === "sale" && !o.invoice_no) return false;

    if (search) {
      const q = search.toLowerCase();
      return (
        o.invoice_no.toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q) ||
        formatDate(o.date).includes(q)
      );
    }
    return true;
  });

  return (
    <Card className="shadow-sm bg-white border border-slate-100 rounded-xl overflow-hidden">
      <div className="border-b border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between bg-white px-2 md:px-4">
        <div className="flex items-center overflow-x-auto scrollbar-none pt-2 md:pt-0">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-4.5 text-xs md:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "text-indigo-600 border-indigo-600"
                    : "text-slate-505 border-transparent hover:text-slate-800"
                }`}
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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 text-slate-800"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead className="bg-[#fafafa] text-slate-505 border-b border-slate-100 font-semibold">
            <tr>
              <th className="px-6 py-4.5 font-semibold text-[13px]">Date</th>
              <th className="px-6 py-4.5 font-semibold text-[13px]">Invoice</th>
              <th className="px-6 py-4.5 font-semibold text-[13px]">Customer</th>
              <th className="px-6 py-4.5 font-semibold text-[13px]">Items</th>
              <th className="px-6 py-4.5 font-semibold text-[13px]">Grand Total</th>
              <th className="px-6 py-4.5 font-semibold text-[13px]">Paid</th>
              <th className="px-6 py-4.5 font-semibold text-[13px]">Due</th>
              <th className="px-6 py-4.5 font-semibold text-[13px] text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-slate-400 font-normal">
                  No records found for this selection.
                </td>
              </tr>
            ) : (
              filtered.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50/40 transition-colors">
                  <td className="px-6 py-4 text-[13px] text-slate-500" suppressHydrationWarning>{formatDate(o.date)}</td>
                  <td className="px-6 py-4 text-[13px] text-indigo-600 font-bold">{o.invoice_no}</td>
                  <td className="px-6 py-4 text-[13px] text-slate-700">{o.customer_name}</td>
                  <td className="px-6 py-4 text-[13px] text-slate-700">{o.items_count}</td>
                  <td className="px-6 py-4 text-[13px] text-slate-900 font-bold">{formatPrice(o.grand_total)}</td>
                  <td className="px-6 py-4 text-[13px] text-emerald-700">{formatPrice(o.paid_amount)}</td>
                  <td className="px-6 py-4 text-[13px] text-rose-600">{formatPrice(o.due)}</td>
                  <td className="px-6 py-4 text-[13px] text-center">
                    <button
                      onClick={() => router.push(`/admin/sales/${o.id}`)}
                      className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 transition-colors text-[13px] font-bold cursor-pointer"
                    >
                      <Eye size={15} />
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-slate-100 bg-[#fafafa]/50 flex items-center justify-between text-xs font-semibold text-slate-500 select-none">
        <div>Showing 1-{filtered.length} from {filtered.length}</div>
        <div className="flex gap-1">
          <span className="text-slate-400 cursor-pointer hover:text-slate-600 px-1.5 py-0.5">{"«"}</span>
          <span className="w-5 h-5 rounded flex items-center justify-center bg-indigo-600 text-white cursor-default">1</span>
          <span className="text-slate-400 cursor-pointer hover:text-slate-600 px-1.5 py-0.5">{"»"}</span>
        </div>
      </div>
    </Card>
  );
}
