"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronLeft, ChevronRight, Edit } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Client, ClientLookup } from "@/lib/api/clients";
import EditClientModal from "@/app/admin/clients/[id]/components/EditClientModal";

interface ClientListPanelProps {
  clients: (Client | ClientLookup)[];
  activeClientId?: string;
}

export default function ClientListPanel({ clients, activeClientId }: ClientListPanelProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | ClientLookup | null>(null);

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || "").includes(search) ||
    (c.email || "").toLowerCase().includes(search.toLowerCase())
  );

  const typeLabel = (type: string) => {
    if (type === "customer") return "Customer";
    if (type === "supplier") return "Supplier";
    return "Both";
  };

  return (
    <Card className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-2 bg-white">
        <h3 className="text-sm font-bold text-slate-800 shrink-0">
          Clients ({clients.length})
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

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead className="bg-[#fafafa] text-slate-500 border-b border-slate-100 font-semibold">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold text-center w-16">Type</th>
              <th className="px-4 py-3 font-semibold text-right w-20">Balance</th>
              <th className="px-4 py-3 font-semibold text-center w-12">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                  No clients found
                </td>
              </tr>
            ) : (
              filtered.map((c) => {
                const isActive = String(c.id) === activeClientId;
                return (
                  <tr
                    key={c.id}
                    onClick={() => router.push(`/admin/clients/${c.id}`)}
                    className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${isActive ? 'bg-slate-100/80 font-medium' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <p className="truncate max-w-[130px] xl:max-w-[150px] font-semibold text-[13px] text-slate-800">
                        {c.name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {c.phone ? (
                          <p className="text-[11px] text-slate-400 truncate">{c.phone}</p>
                        ) : (
                          <p className="text-[11px] text-slate-300 italic">No phone</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold
                        ${c.type === 'customer' ? 'bg-blue-50 text-blue-700' : ''}
                        ${c.type === 'supplier' ? 'bg-amber-50 text-amber-700' : ''}
                        ${c.type === 'both' ? 'bg-purple-50 text-purple-700' : ''}
                      `}>
                        {typeLabel(c.type)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-700">
                      ৳{c.balance.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedClient(c);
                          setIsEditModalOpen(true);
                        }}
                        className="p-1 hover:bg-slate-100 rounded-md transition-colors text-slate-500 hover:text-indigo-600 inline-flex items-center justify-center cursor-pointer"
                        title="Edit client"
                      >
                        <Edit size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-slate-100 bg-[#fafafa]/50 flex flex-col items-center gap-3">
        <div className="flex items-center justify-between w-full text-slate-400 px-2 select-none">
          <ChevronLeft size={16} className="cursor-pointer hover:text-slate-600" />
          <div className="flex-1 mx-4 h-1.5 rounded-full bg-slate-200 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-400 border-2 border-white shadow-sm" />
          </div>
          <ChevronRight size={16} className="cursor-pointer hover:text-slate-600" />
        </div>
        <div className="flex gap-1 text-[11px] font-bold">
          <span className="text-slate-400 cursor-pointer hover:text-slate-600 px-1 py-0.5">«</span>
          <span className="w-5 h-5 rounded flex items-center justify-center bg-indigo-600 text-white cursor-default">1</span>
          <span className="text-slate-400 cursor-pointer hover:text-slate-600 px-1 py-0.5">»</span>
        </div>
      </div>
      <EditClientModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedClient(null);
        }}
        client={selectedClient}
      />
    </Card>
  );
}
