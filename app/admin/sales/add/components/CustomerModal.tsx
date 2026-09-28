"use client";

import { useState } from "react";
import { createClient } from "@/lib/api/clients";
import { X, Plus, Check } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";

export type Customer = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
};

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCustomer: (customer: Customer) => void;
}

export function CustomerModal({ isOpen, onClose, onAddCustomer }: CustomerModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = "Name is required";
    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?(?:88)?01[3-9]\d{8}$/.test(phone.trim().replace(/\s+/g, ""))) {
      // Basic Bangladeshi phone validation
      newErrors.phone = "Invalid Bangladeshi phone number format";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Try to persist customer via server action
    try {
      const res = await createClient({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || null,
        type: "customer",
        address: address.trim() || null,
      });

      if (!res || !res.success || !res.resources) {
        setErrors({ form: res?.message || "Failed to create customer" });
        return;
      }

      const created = res.resources;
      const newCustomer: Customer = {
        id: String(created.id),
        name: created.name,
        phone: created.phone || "",
        email: created.email || undefined,
        address: created.address || undefined,
      };

      onAddCustomer(newCustomer);
      resetForm();
      onClose();
    } catch (err: any) {
      setErrors({ form: err?.message || "Failed to create customer" });
    }
  };

  const resetForm = () => {
    setName("");
    setPhone("");
    setEmail("");
    setAddress("");
    setErrors({});
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={() => { resetForm(); onClose(); }}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-slate-100 z-10 scale-100 transition-all duration-300 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-600" />
              Add New Customer
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Register customer to link with this sale</p>
          </div>
          <button
            onClick={() => { resetForm(); onClose(); }}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="cust-name">Customer Name <span className="text-rose-500">*</span></Label>
            <Input
              id="cust-name"
              placeholder="e.g. Rahim Uddin"
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
            <Label htmlFor="cust-phone">Phone Number <span className="text-rose-500">*</span></Label>
            <Input
              id="cust-phone"
              placeholder="e.g. 01712345678"
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
            <Label htmlFor="cust-email">Email Address</Label>
            <Input
              id="cust-email"
              placeholder="e.g. rahim@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cust-address">Billing/Shipping Address</Label>
            <Input
              id="cust-address"
              placeholder="e.g. House 12, Road 4, Dhanmondi, Dhaka"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => { resetForm(); onClose(); }}
              className="text-slate-700 hover:text-slate-900"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20"
            >
              <Check className="w-4 h-4 mr-1.5" />
              Save Customer
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
