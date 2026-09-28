"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { 
  Plus, 
  Edit, 
  X, 
  Search, 
  Check, 
  AlertCircle
} from "lucide-react";
import { 
  updateAttribute, 
  Attribute 
} from "@/lib/api/attributes";

interface AttributesClientProps {
  initialAttributes: Attribute[];
}

export default function AttributesClient({ initialAttributes }: AttributesClientProps) {
  const router = useRouter();

  // Data State
  const [attributes, setAttributes] = useState<Attribute[]>(initialAttributes);
  const [searchQuery, setSearchQuery] = useState("");
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Sync props to state when server updates
  useEffect(() => {
    setAttributes(initialAttributes);
  }, [initialAttributes]);

  // Utility to show notification auto-fading after 4s
  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Status Toggle Action
  const handleToggleStatus = async (attribute: Attribute) => {
    const originalStatus = attribute.is_active;
    
    // Optimistic Update UI
    setAttributes(prev => 
      prev.map(attr => 
        attr.id === attribute.id ? { ...attr, is_active: !originalStatus } : attr
      )
    );

    const formData = new FormData();
    formData.append("name", attribute.name);
    formData.append("type", attribute.type);
    formData.append("is_active", !originalStatus ? "1" : "0");
    formData.append("is_default_specification", attribute.is_default_specification ? "1" : "0");

    if (attribute.type !== "text" && attribute.type !== "rich_text" && attribute.values) {
      formData.append("values", JSON.stringify(attribute.values));
    }

    const response = await updateAttribute(attribute.id, formData);

    if (response.success) {
      showNotification("success", `Attribute "${attribute.name}" status updated successfully.`);
      router.refresh();
    } else {
      showNotification("error", response.message);
      // Revert status on failure
      setAttributes(prev => 
        prev.map(attr => 
          attr.id === attribute.id ? { ...attr, is_active: originalStatus } : attr
        )
      );
    }
  };

  // Filter attributes by search query
  const filteredAttributes = attributes.filter(attr => 
    attr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    attr.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pt-2 pl-2 pr-4 pb-4 md:pt-3 md:pl-3 md:pr-6 md:pb-6 lg:pt-4 lg:pl-4 lg:pr-8 lg:pb-8 w-full space-y-6 relative">
      
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-2xl border shadow-xl backdrop-blur-md animate-in slide-in-from-top-4 duration-300 
          ${notification.type === 'success' 
            ? 'bg-emerald-50/90 border-emerald-100 text-emerald-800' 
            : 'bg-rose-50/90 border-rose-100 text-rose-800'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${notification.type === 'success' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
            {notification.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          </div>
          <div>
            <p className="text-sm font-semibold">{notification.type === 'success' ? 'Success' : 'Error'}</p>
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

      {/* Attributes List Table Card */}
      <Card className="overflow-hidden border border-slate-200/80 shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-5 px-6 bg-slate-50/30 border-b border-slate-100">
          <CardTitle className="text-lg font-bold text-slate-800">Attributes List</CardTitle>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <Input 
                type="text" 
                placeholder="Search attributes..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 w-full rounded-xl bg-white border-slate-200 text-xs"
              />
            </div>
            <Link href="/admin/cat/attributes/add">
              <Button className="h-9 rounded-xl shadow-sm bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-semibold cursor-pointer">
                <Plus size={16} className="mr-1" />
                Add Attribute
              </Button>
            </Link>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider w-16">ID</th>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider">Attribute Name</th>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider">Type</th>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider">Values & Swatches</th>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3.5 font-bold uppercase tracking-wider text-right w-24">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAttributes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-slate-400">No attributes found</td>
                  </tr>
                ) : (
                  filteredAttributes.map((row) => (
                    <tr 
                      key={row.id} 
                      className="transition-colors hover:bg-slate-50/50"
                    >
                      <td className="px-5 py-3.5 text-slate-500 font-medium">#{row.id}</td>
                      <td className="px-5 py-3.5 font-bold text-slate-800">
                        <div className="flex items-center gap-2">
                          <span>{row.name}</span>
                          {row.is_default_specification && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                              Default Spec
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold border
                          ${row.type === 'multi_select'
                            ? 'bg-pink-50 border-pink-100 text-pink-700'
                            : row.type === 'select' 
                            ? 'bg-purple-50 border-purple-100 text-purple-700' 
                            : row.type === 'rich_text'
                            ? 'bg-amber-50 border-amber-100 text-amber-700'
                            : 'bg-blue-50 border-blue-100 text-blue-700'}`}>
                          {row.type === 'multi_select' ? 'Multi-select' : row.type === 'select' ? 'Predefined' : row.type === 'rich_text' ? 'Rich Text' : 'Custom Text'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 max-w-md truncate">
                        {row.type !== 'text' && row.type !== 'rich_text' && row.values && row.values.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 items-center">
                            {row.values.map((valItem, vIdx) => {
                              const valText = typeof valItem === 'string' ? valItem : valItem.value;
                              const valImage = typeof valItem === 'object' ? valItem.image : null;
                              return (
                                <span key={vIdx} className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-100/90 border border-slate-200/80 text-slate-700 text-[10px] font-semibold">
                                  {valImage && (
                                    <img 
                                      src={valImage} 
                                      alt={valText} 
                                      className="w-4 h-4 rounded-md object-cover border border-slate-300/80 flex-shrink-0" 
                                    />
                                  )}
                                  <span>{valText}</span>
                                </span>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Custom Input</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(row)}
                          title="Click to toggle status"
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all hover:scale-105 active:scale-95 cursor-pointer
                            ${row.is_active 
                              ? 'bg-emerald-50 border-emerald-100 text-emerald-700 hover:bg-emerald-100/60' 
                              : 'bg-rose-50 border-rose-100 text-rose-700 hover:bg-rose-100/60'}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${row.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          {row.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link href={`/admin/cat/attributes/edit/${row.id}`}>
                          <Button 
                            variant="secondary" 
                            size="sm"
                            className="h-8 w-8 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-none transition-all p-0 flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 shadow-xs"
                            title="Edit Attribute"
                          >
                            <Edit size={14} />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
