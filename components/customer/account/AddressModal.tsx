"use client";

import { useState, useEffect, useRef } from "react";
import { X, Loader2, MapPin, Phone, User, Check, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import { BANGLADESH_DISTRICTS } from "@/lib/data/bangladeshDistricts";
import { 
  ClientAddress, 
  ClientAddressPayload,
  createCustomerAddressApi, 
  updateCustomerAddressApi 
} from "@/lib/api/customerAddresses";

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  addressToEdit?: ClientAddress | null;
  onSaved: (savedAddress: ClientAddress) => void;
}

const ADDRESS_LABELS = [
  { key: "HOME", label: "Home" },
  { key: "OFFICE", label: "Office" },
  { key: "OTHER", label: "Other" },
];

export function AddressModal({
  isOpen,
  onClose,
  addressToEdit,
  onSaved,
}: AddressModalProps) {
  const isEdit = !!addressToEdit;

  const [formData, setFormData] = useState<ClientAddressPayload>({
    name: "",
    phone: "",
    address: "",
    city: "Dhaka",
    label: "HOME",
    is_default: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [districtSearch, setDistrictSearch] = useState("");
  const [isDistrictDropdownOpen, setIsDistrictDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize or reset form when modal opens / addressToEdit changes
  useEffect(() => {
    if (addressToEdit) {
      setFormData({
        name: addressToEdit.name || "",
        phone: addressToEdit.phone || "",
        address: addressToEdit.address || "",
        city: addressToEdit.city || "Dhaka",
        label: addressToEdit.label || "HOME",
        is_default: !!addressToEdit.is_default,
      });
    } else {
      setFormData({
        name: "",
        phone: "",
        address: "",
        city: "Dhaka",
        label: "HOME",
        is_default: false,
      });
    }
    setDistrictSearch("");
    setIsDistrictDropdownOpen(false);
  }, [addressToEdit, isOpen]);

  // Click outside to close district dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDistrictDropdownOpen(false);
      }
    }
    if (isDistrictDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDistrictDropdownOpen]);

  if (!isOpen) return null;

  const filteredDistricts = BANGLADESH_DISTRICTS.filter(
    (d) =>
      d.name.toLowerCase().includes(districtSearch.toLowerCase()) ||
      (d.bn_name && d.bn_name.includes(districtSearch))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please enter recipient name");
      return;
    }
    const phoneClean = formData.phone.trim();
    if (!phoneClean) {
      toast.error("Please enter recipient phone number");
      return;
    }
    if (!/^01[3-9]\d{8}$/.test(phoneClean) || phoneClean.length !== 11) {
      toast.error("Phone number must be a valid 11-digit mobile number (e.g. 017XXXXXXXX)");
      return;
    }
    if (!formData.city.trim()) {
      toast.error("Please select a city/district");
      return;
    }
    if (!formData.address.trim()) {
      toast.error("Please enter full street address");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: ClientAddressPayload = {
        ...formData,
        name: formData.name.trim(),
        phone: phoneClean,
        address: formData.address.trim(),
        city: formData.city.trim(),
      };

      if (isEdit && addressToEdit) {
        const res = await updateCustomerAddressApi(addressToEdit.id, payload);
        if (res.success && res.resources) {
          toast.success("Address updated successfully", {
            style: { background: "#18181b", color: "#f4f4f5", border: "1px solid #27272a" },
          });
          onSaved(res.resources);
          onClose();
        } else {
          toast.error(res.message || "Failed to update address");
        }
      } else {
        const res = await createCustomerAddressApi(payload);
        if (res.success && res.resources) {
          toast.success("New address added successfully", {
            style: { background: "#18181b", color: "#f4f4f5", border: "1px solid #27272a" },
          });
          onSaved(res.resources);
          onClose();
        } else {
          toast.error(res.message || "Failed to add address");
        }
      }
    } catch (err: any) {
      toast.error(err?.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl w-full max-w-lg border border-zinc-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FDF2F8] text-[#BA478F] flex items-center justify-center">
              <MapPin size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-900">
                {isEdit ? "Edit Address" : "Add New Address"}
              </h2>
              <p className="text-xs text-zinc-500">
                {isEdit ? "Update your saved delivery address" : "Save a delivery address for quicker checkout"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
          {/* Label selector: HOME, OFFICE, OTHER */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
              Address Label
            </label>
            <div className="flex gap-2">
              {ADDRESS_LABELS.map((item) => {
                const isSelected = formData.label === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setFormData({ ...formData, label: item.key })}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                      isSelected
                        ? "bg-[#FDF2F8] border-[#BA478F] text-[#BA478F]"
                        : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Recipient Name */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-200 bg-zinc-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#BA478F]/20 focus:border-[#BA478F] text-zinc-900 placeholder:text-zinc-400 transition-all"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="tel"
                  required
                  maxLength={11}
                  placeholder="017XXXXXXXX"
                  value={formData.phone}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/\D/g, "").slice(0, 11);
                    setFormData({ ...formData, phone: clean });
                  }}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-200 bg-zinc-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#BA478F]/20 focus:border-[#BA478F] text-zinc-900 placeholder:text-zinc-400 transition-all font-mono"
                />
              </div>
            </div>
          </div>

          {/* District / City Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
              District / City <span className="text-rose-500">*</span>
            </label>
            <div
              onClick={() => setIsDistrictDropdownOpen(!isDistrictDropdownOpen)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-200 bg-zinc-50/50 hover:bg-white cursor-pointer flex items-center justify-between text-zinc-900 transition-all focus:border-[#BA478F]"
            >
              <div className="flex items-center gap-2 truncate">
                <MapPin size={14} className="text-zinc-400 shrink-0" />
                <span className="truncate font-medium">{formData.city || "Select District"}</span>
              </div>
              <ChevronDown size={14} className={`text-zinc-400 transition-transform ${isDistrictDropdownOpen ? "rotate-180" : ""}`} />
            </div>

            {isDistrictDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-zinc-200 rounded-xl shadow-lg z-30 p-2 flex flex-col">
                <input
                  type="text"
                  placeholder="Search district..."
                  value={districtSearch}
                  onChange={(e) => setDistrictSearch(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full px-3 py-1.5 mb-2 text-xs rounded-lg border border-zinc-200 focus:outline-none focus:border-[#BA478F] text-zinc-900"
                  autoFocus
                />
                <div className="divide-y divide-zinc-50 overflow-y-auto max-h-48 custom-scrollbar pr-1">
                  {filteredDistricts.length > 0 ? (
                    filteredDistricts.map((d) => {
                      const isSelected = formData.city === d.name;
                      return (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, city: d.name });
                            setIsDistrictDropdownOpen(false);
                            setDistrictSearch("");
                          }}
                          className={`w-full px-2.5 py-1.5 text-xs text-left rounded-md flex items-center justify-between transition-colors ${
                            isSelected
                              ? "bg-[#FDF2F8] text-[#BA478F] font-semibold"
                              : "hover:bg-zinc-50 text-zinc-700"
                          }`}
                        >
                          <span>{d.name} {d.bn_name && <span className="text-zinc-400 font-normal">({d.bn_name})</span>}</span>
                          {isSelected && <Check size={14} />}
                        </button>
                      );
                    })
                  ) : (
                    <div className="p-2 text-center text-xs text-zinc-400">No district found</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Detailed Street Address */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
              Detailed Address (House, Road, Area, Thana) <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="e.g. House #12, Road #4, Block C, Banani, Dhaka"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full p-3 text-xs rounded-xl border border-zinc-200 bg-zinc-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#BA478F]/20 focus:border-[#BA478F] text-zinc-900 placeholder:text-zinc-400 transition-all resize-none"
            />
          </div>

          {/* Default Address Checkbox */}
          <div className="pt-2">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.is_default || false}
                onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                className="w-4 h-4 rounded border-zinc-300 text-[#BA478F] focus:ring-[#BA478F] cursor-pointer"
              />
              <span className="text-xs font-medium text-zinc-700">
                Set as default delivery address
              </span>
            </label>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 mt-2 border-t border-zinc-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-zinc-600 hover:bg-zinc-100 border border-zinc-200 transition-all cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-[#BA478F] hover:bg-[#94286B] text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEdit ? "Update Address" : "Save Address"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
