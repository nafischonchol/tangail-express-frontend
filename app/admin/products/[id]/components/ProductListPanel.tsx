"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Edit3, ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Product } from "@/lib/api/products";

interface ProductListPanelProps {
  products: Product[];
  activeProductId: string;
}

export default function ProductListPanel({ products, activeProductId }: ProductListPanelProps) {
  const router = useRouter();
  const [leftSearch, setLeftSearch] = useState("");

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(leftSearch.toLowerCase())
  );

  return (
    <Card className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
      {/* Header section of sidebar */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-2 bg-white">
        <h3 className="text-sm font-bold text-slate-800 shrink-0">
          Total Item: ({products.length})
        </h3>
        <div className="relative w-32 md:w-40 lg:w-32 xl:w-36">
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input 
            type="text" 
            placeholder="Search" 
            value={leftSearch}
            onChange={(e) => setLeftSearch(e.target.value)}
            className="w-full pr-8 pl-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500 text-slate-800"
          />
        </div>
      </div>

      {/* List Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead className="bg-[#fafafa] text-slate-500 border-b border-slate-100 font-semibold">
            <tr>
              <th className="px-4 py-3 font-semibold">Title</th>
              <th className="px-4 py-3 font-semibold text-center w-16">Quantity</th>
              <th className="px-4 py-3 font-semibold text-right w-12">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredProducts.map((p) => {
              const isActive = String(p.id) === activeProductId;
              return (
                <tr 
                  key={p.id} 
                  onClick={() => router.push(`/admin/products/${p.id}`)}
                  className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${isActive ? 'bg-slate-100/80 font-medium' : ''}`}
                >
                  <td className="px-4 py-3 text-slate-800">
                    <p className="truncate max-w-[130px] xl:max-w-[150px] font-semibold text-[13px] text-slate-800">{p.name}</p>
                  </td>
                  <td className="px-4 py-3 text-center text-slate-700 font-semibold">
                    {(p.total_stock || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <Link href={`/admin/products/edit/${p.id}`}>
                      <button className="p-1.5 text-slate-400 hover:text-indigo-600 border border-slate-200 hover:border-slate-300 rounded bg-white transition-colors shadow-sm cursor-pointer">
                        <Edit3 size={13} className="text-slate-600" />
                      </button>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Paginator / Scrollbar */}
      <div className="p-4 border-t border-slate-100 bg-[#fafafa]/50 flex flex-col items-center gap-3">
        {/* Custom tracker line scrollbar */}
        <div className="flex items-center justify-between w-full text-slate-400 px-2 select-none">
          <ChevronLeft size={16} className="cursor-pointer hover:text-slate-600" />
          <div className="flex-1 mx-4 h-1.5 rounded-full bg-slate-200 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-400 border-2 border-white shadow-sm"></div>
          </div>
          <ChevronRight size={16} className="cursor-pointer hover:text-slate-600" />
        </div>

        {/* Page Number indicator */}
        <div className="flex gap-1 text-[11px] font-bold">
          <span className="text-slate-400 cursor-pointer hover:text-slate-600 px-1 py-0.5">«</span>
          <span className="w-5 h-5 rounded flex items-center justify-center bg-indigo-600 text-white cursor-default">1</span>
          <span className="text-slate-400 cursor-pointer hover:text-slate-600 px-1 py-0.5">»</span>
        </div>
      </div>
    </Card>
  );
}
