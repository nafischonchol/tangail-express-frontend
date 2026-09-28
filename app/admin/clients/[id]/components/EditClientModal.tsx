"use client";

import { useEffect, useState } from "react";
import { updateClient, Client, ClientLookup } from "@/lib/api/clients";
import { X, Check, Edit3 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface EditClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | ClientLookup | null;
}

export default function EditClientModal({ isOpen, onClose, client }: EditClientModalProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [type, setType] = useState<"customer" | "supplier" | "both">("customer");
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (client) {
      setName(client.name || "");
      setPhone(client.phone || "");
      setEmail((client as any).email || "");
      setAddress((client as any).address || "");
      setType((client.type as any) || "customer");
      setIsActive((client as any).is_active !== false);
      setErrors({});
    }
  }, [client, isOpen]);

  if (!isOpen || !client) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = "Name is required";
    
    if (phone.trim()) {
      // Basic Bangladeshi phone validation if phone is not empty
      if (!/^\+?(?:88)?01[3-9]\d{8}$/.test(phone.trim().replace(/\s+/g, ""))) {
        newErrors.phone = "Invalid Bangladeshi phone number format";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      const res = await updateClient(client.id, {
        name: name.trim(),
        phone: phone.trim() || null,
        email: email.trim() || null,
        type,
        address: address.trim() || null,
        is_active: isActive,
      });

      if (res.success) {
        toast.success("Client updated successfully");
        router.refresh();
        onClose();
      } else {
        setErrors({ form: res.message || "Failed to update client" });
        toast.error(res.message || "Failed to update client");
      }
    } catch (err: any) {
      setErrors({ form: err?.message || "Failed to update client" });
      toast.error(err?.message || "Failed to update client");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-slate-100 z-10 scale-100 transition-all duration-300 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-indigo-600" />
              Edit Client Details
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Modify information for {client.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {errors.form && (
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 rounded-lg text-xs font-semibold">
              {errors.form}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="edit-name">Client Name <span className="text-rose-500">*</span></Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors(prev => ({ ...prev, name: "" }));
              }}
              className={errors.name ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100" : ""}
            />
            {errors.name && <p className="text-xs text-rose-500 font-semibold">{errors.name}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-phone">Phone Number</Label>
            <Input
              id="edit-phone"
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (errors.phone) setErrors(prev => ({ ...prev, phone: "" }));
              }}
              className={errors.phone ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100" : ""}
            />
            {errors.phone && <p className="text-xs text-rose-500 font-semibold">{errors.phone}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-email">Email Address</Label>
            <Input
              id="edit-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-type">Client Type</Label>
            <Select
              id="edit-type"
              value={type}
              onChange={(e: any) => setType(e.target.value as any)}
            >
              <option value="customer">Customer</option>
              <option value="supplier">Supplier</option>
              <option value="both">Both (Customer & Supplier)</option>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-address">Billing/Shipping Address</Label>
            <Input
              id="edit-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 py-1">
            <input
              id="edit-active"
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
            />
            <Label htmlFor="edit-active" className="cursor-pointer select-none">Active Account</Label>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-slate-700 hover:text-slate-900"
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20"
            >
              <Check className="w-4 h-4 mr-1.5" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
