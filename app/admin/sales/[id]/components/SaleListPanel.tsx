"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Order, OrderLookup } from "@/lib/api/orders";

interface SaleListPanelProps {
  orders: (Order | OrderLookup)[];
  activeOrderId?: string;
}

export default function SaleListPanel({ orders, activeOrderId }: SaleListPanelProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filtered = orders.filter(o =>
    o.invoice_no.toLowerCase().includes(search.toLowerCase()) ||
    o.customer_name.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'Order Placed': return 'bg-blue-500';
      case 'Confirmed': return 'bg-sky-500';
      case 'Packaging': return 'bg-amber-500';
      case 'Ready To Deliver': return 'bg-purple-500';
      case 'Shipped': return 'bg-indigo-500';
      case 'Delivered': return 'bg-emerald-500';
      case 'Cancelled': return 'bg-rose-500';
      case 'Unreachable': return 'bg-orange-500';
      case 'Returned': return 'bg-slate-400';
      default: return 'bg-slate-300';
    }
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "৳0.00";
    return `৳${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <Card className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-2 bg-white">
        <h3 className="text-sm font-bold text-slate-800 shrink-0">
          Sales ({orders.length})
        </h3>
        <div className="relative w-32 md:w-40 lg:w-32 xl:w-36">
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-8 pl-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 text-slate-800"
          />
        </div>
      </div>

      <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead className="bg-[#fafafa] text-slate-500 border-b border-slate-100 font-semibold sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 font-semibold">Invoice / Customer</th>
              <th className="px-4 py-3 font-semibold text-center w-16">Status</th>
              <th className="px-4 py-3 font-semibold text-right w-20">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-slate-400">
                  No sales found
                </td>
              </tr>
            ) : (
              filtered.map((o) => {
                const isActive = String(o.id) === activeOrderId;
                return (
                  <tr
                    key={o.id}
                    onClick={() => router.push(`/admin/sales/${o.id}`)}
                    className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${isActive ? 'bg-slate-100/80 font-medium' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <p className="font-bold text-[13px] text-indigo-600">
                        {o.invoice_no}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[130px] xl:max-w-[150px]">
                        {o.customer_name}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${getStatusStyles(o.status)}`} />
                        <span className="text-[10px] text-slate-500">{o.status}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-700">
                      {formatCurrency(o.grand_total)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
