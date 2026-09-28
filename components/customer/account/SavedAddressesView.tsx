"use client";

import { useState, useEffect } from "react";
import { 
  MapPin, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  Phone, 
  Loader2, 
  Home, 
  Briefcase, 
  Bookmark 
} from "lucide-react";
import toast from "react-hot-toast";
import { 
  ClientAddress, 
  fetchCustomerAddressesApi, 
  deleteCustomerAddressApi, 
  setDefaultCustomerAddressApi 
} from "@/lib/api/customerAddresses";
import { AddressModal } from "./AddressModal";

export function SavedAddressesView() {
  const [addresses, setAddresses] = useState<ClientAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<ClientAddress | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const loadAddresses = async () => {
    try {
      const res = await fetchCustomerAddressesApi();
      if (res.success && Array.isArray(res.resources)) {
        setAddresses(res.resources);
      }
    } catch {
      toast.error("Failed to load saved addresses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const handleOpenAdd = () => {
    setEditingAddress(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (address: ClientAddress) => {
    setEditingAddress(address);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    setActionLoadingId(id);
    try {
      const res = await deleteCustomerAddressApi(id);
      if (res.success) {
        toast.success("Address removed", {
          style: { background: "#18181b", color: "#f4f4f5", border: "1px solid #27272a" },
        });
        await loadAddresses();
      } else {
        toast.error(res.message || "Could not delete address");
      }
    } catch {
      toast.error("An error occurred while deleting address");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSetDefault = async (id: number) => {
    setActionLoadingId(id);
    try {
      const res = await setDefaultCustomerAddressApi(id);
      if (res.success) {
        toast.success("Default address updated", {
          style: { background: "#18181b", color: "#f4f4f5", border: "1px solid #27272a" },
        });
        await loadAddresses();
      } else {
        toast.error(res.message || "Failed to set default address");
      }
    } catch {
      toast.error("An error occurred while setting default address");
    } finally {
      setActionLoadingId(null);
    }
  };

  const getLabelIcon = (label?: string | null) => {
    switch (label?.toUpperCase()) {
      case "HOME":
        return <Home size={12} className="text-[#BA478F]" />;
      case "OFFICE":
        return <Briefcase size={12} className="text-blue-600" />;
      default:
        return <Bookmark size={12} className="text-zinc-500" />;
    }
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-100">
        <div>
          <h1 className="text-base font-bold text-zinc-900">Saved Addresses</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Manage your delivery locations for fast and seamless checkout
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-[#BA478F] hover:bg-[#94286B] text-white transition-all shadow-xs cursor-pointer shrink-0"
        >
          <Plus size={14} />
          <span>Add New Address</span>
        </button>
      </div>

      {/* Content */}
      <div className="pt-6">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-zinc-400 gap-2">
            <Loader2 className="animate-spin" size={20} />
            <span className="text-xs font-medium">Loading addresses...</span>
          </div>
        ) : addresses.length === 0 ? (
          /* Empty State */
          <div className="py-16 text-center max-w-sm mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 border border-zinc-200 text-zinc-400 flex items-center justify-center mx-auto mb-3">
              <MapPin size={22} />
            </div>
            <h3 className="text-sm font-bold text-zinc-900 mb-1">No Saved Addresses Yet</h3>
            <p className="text-xs text-zinc-500 mb-5 leading-relaxed">
              Add your home, office, or frequently used shipping addresses to speed up your order checkout.
            </p>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white transition-all cursor-pointer"
            >
              <Plus size={14} />
              <span>Add Your First Address</span>
            </button>
          </div>
        ) : (
          /* Address Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((item) => {
              const isActionLoading = actionLoadingId === item.id;

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between relative ${
                    item.is_default
                      ? "border-[#BA478F] bg-[#FDF2F8]/30"
                      : "border-zinc-200 bg-zinc-50/40 hover:border-zinc-300"
                  }`}
                >
                  <div>
                    {/* Header tags: Label & Default badge */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-white border border-zinc-200 text-zinc-700">
                          {getLabelIcon(item.label)}
                          <span>{item.label || "HOME"}</span>
                        </span>
                        {item.is_default && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#BA478F] text-white">
                            <Check size={10} />
                            <span>Default</span>
                          </span>
                        )}
                      </div>

                      {/* Top Action buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          disabled={isActionLoading}
                          title="Edit Address"
                          className="p-1 rounded-lg text-zinc-400 hover:text-zinc-800 hover:bg-white border border-transparent hover:border-zinc-200 transition-all cursor-pointer disabled:opacity-50"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          disabled={isActionLoading}
                          title="Delete Address"
                          className="p-1 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all cursor-pointer disabled:opacity-50"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Recipient Details */}
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                        {item.name}
                      </h4>
                      <p className="text-xs text-zinc-600 flex items-center gap-1.5 font-mono">
                        <Phone size={11} className="text-zinc-400" />
                        <span>{item.phone}</span>
                      </p>
                      <p className="text-xs text-zinc-700 leading-relaxed pt-1">
                        {item.address}
                      </p>
                      <p className="text-xs font-semibold text-zinc-800">
                        {item.city}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Footer Actions */}
                  {!item.is_default && (
                    <div className="pt-3 mt-3 border-t border-zinc-100/80 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => handleSetDefault(item.id)}
                        disabled={isActionLoading}
                        className="text-[11px] font-semibold text-[#BA478F] hover:text-[#94286B] transition-colors cursor-pointer flex items-center gap-1 disabled:opacity-50"
                      >
                        {isActionLoading ? (
                          <>
                            <Loader2 size={11} className="animate-spin" />
                            <span>Updating...</span>
                          </>
                        ) : (
                          <span>Set as Default Delivery Address</span>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <AddressModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        addressToEdit={editingAddress}
        onSaved={() => loadAddresses()}
      />
    </div>
  );
}
