"use client";

import { useState } from "react";
import { 
  MapPin, 
  Check, 
  Plus, 
  X, 
  Edit3
} from "lucide-react";
import { ClientAddress } from "@/lib/api/customerAddresses";
import { AddressModal } from "@/components/customer/account/AddressModal";

interface AddressSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  addresses: ClientAddress[];
  selectedAddressId: number | null | undefined;
  onSelectAddress: (address: ClientAddress) => void;
  onSelectManualAddress?: () => void;
  onAddressCreatedOrUpdated: () => void;
}

export function AddressSelectionModal({
  isOpen,
  onClose,
  addresses,
  selectedAddressId,
  onSelectAddress,
  onSelectManualAddress,
  onAddressCreatedOrUpdated,
}: AddressSelectionModalProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<ClientAddress | null>(null);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <div
          className="bg-white rounded-2xl w-full max-w-2xl border border-zinc-200 shadow-xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200"
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#FDF2F8] text-[#BA478F] flex items-center justify-center">
                <MapPin size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900">Select Delivery Address</h3>
                <p className="text-xs text-zinc-500">Choose where you want your order delivered</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body: Addresses List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-3">
            {addresses.map((addr) => {
              const isSelected = selectedAddressId === addr.id;

              return (
                <div
                  key={addr.id}
                  onClick={() => {
                    onSelectAddress(addr);
                    onClose();
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    isSelected
                      ? "border-[#BA478F] bg-[#FDF2F8]/60 ring-1 ring-[#BA478F]"
                      : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50/50"
                  }`}
                >
                  {/* Left: Radio Circle + Info */}
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    {/* Radio Button */}
                    <div
                      className={`w-4.5 h-4.5 rounded-full flex items-center justify-center border transition-all shrink-0 ${
                        isSelected
                          ? "border-[#BA478F] bg-white ring-2 ring-[#BA478F]/20"
                          : "border-zinc-300 bg-white"
                      }`}
                    >
                      {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#BA478F]" />}
                    </div>

                    {/* Text Info */}
                    <div className="space-y-1 flex-1 min-w-0">
                      {/* Top Row: Name (Phone) DEFAULT LABEL */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-zinc-900 text-sm">{addr.name}</span>
                        <span className="text-zinc-500 text-xs font-medium">({addr.phone})</span>
                        {addr.is_default && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#BA478F] text-white">
                            DEFAULT
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200/80 uppercase">
                          {addr.label || "HOME"}
                        </span>
                      </div>

                      {/* Bottom Row: Address, City */}
                      <p className="text-xs text-zinc-600 truncate">
                        <span>{addr.address}</span>
                        {addr.city && !addr.address.toLowerCase().includes(addr.city.toLowerCase()) && (
                          <span>, <strong className="text-zinc-800 font-semibold">{addr.city}</strong></span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Right: Actions (Edit + Check Badge) */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingAddress(addr);
                        setIsAddModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
                      title="Edit this address"
                    >
                      <Edit3 size={15} />
                    </button>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-[#BA478F] text-white flex items-center justify-center shadow-xs">
                        <Check size={13} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Option to use a new manual address */}
            {onSelectManualAddress && (
              <button
                type="button"
                onClick={() => {
                  onSelectManualAddress();
                  onClose();
                }}
                className="w-full p-3.5 rounded-xl border border-dashed border-zinc-300 hover:border-zinc-400 bg-zinc-50/50 hover:bg-zinc-50 transition-all text-left flex items-center justify-between text-xs font-medium text-zinc-700 cursor-pointer"
              >
                <span>Enter a different address for this order</span>
                <span className="text-zinc-400 text-xs">→</span>
              </button>
            )}
          </div>

          {/* Footer with Add New Address */}
          <div className="p-4 border-t border-zinc-100 bg-zinc-50/60 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                setEditingAddress(null);
                setIsAddModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-white border border-zinc-200 hover:border-zinc-300 text-zinc-800 transition-all shadow-2xs cursor-pointer"
            >
              <Plus size={14} className="text-[#BA478F]" />
              <span>Add New Address</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Address Modal */}
      {isAddModalOpen && (
        <AddressModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          addressToEdit={editingAddress}
          onSaved={(saved) => {
            onAddressCreatedOrUpdated();
            onSelectAddress(saved);
          }}
        />
      )}
    </>
  );
}
