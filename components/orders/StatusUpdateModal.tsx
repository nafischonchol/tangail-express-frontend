"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import { X, AlertCircle } from "lucide-react";
import { updateOrderStatus } from "@/lib/api/orders";
import type { Order } from "@/lib/api/orders";
import { getCourierSettings } from "@/lib/api/couriers";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  order: Order | null;
};

const STATUS_OPTIONS = [
  { value: "Confirmed", label: "Confirmed" },
  { value: "Packaging", label: "Packaging" },
  { value: "Ready To Deliver", label: "Ready To Deliver" },
  { value: "Cancelled", label: "Cancelled" },
];

const getStatusRank = (status: string | undefined): number => {
  if (!status) return 0;
  switch (status) {
    case 'Order Placed': return 1;
    case 'Confirmed': return 2;
    case 'Packaging': return 3;
    case 'Ready To Deliver': return 4;
    case 'Shipped': return 5;
    case 'Delivered': return 6;
    case 'Cancelled': return 6;
    case 'Unreachable': return 6;
    case 'Returned': return 6;
    default: return 0;
  }
};

export default function StatusUpdateModal({ isOpen, onClose, onSuccess, onError, order }: Props) {
  const [status, setStatus] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [couriers, setCouriers] = useState<any[]>([]);
  const [selectedCourier, setSelectedCourier] = useState("");
  const [isLoadingCouriers, setIsLoadingCouriers] = useState(false);

  const [deliveryCharge, setDeliveryCharge] = useState<string>("120");

  useEffect(() => {
    if (order) {
      const currentRank = getStatusRank(order.status);
      const availableOption = STATUS_OPTIONS.find(opt => {
        if (opt.value === "Cancelled") {
          return currentRank < 5;
        }
        return getStatusRank(opt.value) > currentRank;
      });
      setStatus(availableOption ? availableOption.value : "");
      setNote("");
      setDeliveryCharge(order.delivery_charge !== undefined && order.delivery_charge !== null ? String(order.delivery_charge) : "120");
    }
  }, [order]);

  useEffect(() => {
    if (isOpen) {
      const loadCouriers = async () => {
        setIsLoadingCouriers(true);
        try {
          const res = await getCourierSettings();
          if (res.success && res.resources) {
            const enabled = res.resources.filter((c: any) => c.is_enabled);
            setCouriers(enabled);
            const defaultCourier = enabled.find((c: any) => c.is_default);
            if (defaultCourier) {
              setSelectedCourier(defaultCourier.courier_name);
            } else if (enabled.length > 0) {
              setSelectedCourier(enabled[0].courier_name);
            } else {
              setSelectedCourier("");
            }
          }
        } catch (err) {
          console.error("Failed to load couriers:", err);
        } finally {
          setIsLoadingCouriers(false);
        }
      };
      loadCouriers();
    }
  }, [isOpen]);

  if (!isOpen || !order) return null;

  const currentRank = getStatusRank(order.status);
  const isTerminal = currentRank >= 5;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!status) return;

    setIsSubmitting(true);
    try {
      const payload: { status: string; note?: string; courier_name?: string; delivery_charge?: number } = {
        status,
        note: note.trim() || undefined,
      };

      if (status === "Ready To Deliver") {
        if (selectedCourier) {
          payload.courier_name = selectedCourier;
        }
        if (deliveryCharge !== "") {
          payload.delivery_charge = parseFloat(deliveryCharge) || 0;
        }
      }

      const res = await updateOrderStatus(order.id, payload);

      if (res.success) {
        onSuccess(res.message || "Order status updated successfully.");
      } else {
        onError(res.message || "Failed to update order status.");
      }
    } catch (err: any) {
      onError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-white rounded-2xl border border-slate-100 shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Update Order Status</h3>
            <p className="text-xs text-slate-500 mt-0.5">{order.invoice_no}</p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        {isTerminal ? (
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50/50 border border-amber-100 text-amber-800 text-sm">
              <AlertCircle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Manual Update Unavailable</p>
                <p className="text-xs text-slate-500 mt-1">
                  This order is currently in the <strong>{order.status}</strong> state. Manually advancing or cancelling order status at/past &apos;Shipped&apos; is disabled. Further updates are handled automatically.
                </p>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button type="button" onClick={onClose} variant="secondary" className="rounded-xl">
                Close
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Current Status Info */}
            <div className="flex justify-between items-center px-4 py-3 rounded-xl bg-slate-50 text-sm border border-slate-100">
              <span className="text-slate-500">Current Status</span>
              <span className="font-bold text-slate-700">{order.status}</span>
            </div>

            {/* New Status Select */}
            <div className="space-y-1.5">
              <Label htmlFor="status-select" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Select New Status
              </Label>
              <Select
                id="status-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                variant="light"
                required
              >
                <option value="" disabled>Choose status...</option>
                {STATUS_OPTIONS.map((opt) => {
                  let isBlocked = false;
                  if (opt.value === "Cancelled") {
                    isBlocked = currentRank >= 5;
                  } else {
                    isBlocked = getStatusRank(opt.value) <= currentRank;
                  }
                  return (
                    <option key={opt.value} value={opt.value} disabled={isBlocked}>
                      {opt.label} {isBlocked ? "(Locked)" : ""}
                    </option>
                  );
                })}
              </Select>
            </div>

            {/* Courier Selection & Delivery Charge Fields (Show only when Ready To Deliver) */}
            {status === "Ready To Deliver" && (
              <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                <div className="space-y-1.5">
                  <Label htmlFor="courier-select" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Select Courier Partner
                  </Label>
                  {isLoadingCouriers ? (
                    <div className="text-xs text-slate-400 py-1">Loading couriers...</div>
                  ) : couriers.length > 0 ? (
                    <Select
                      id="courier-select"
                      value={selectedCourier}
                      onChange={(e) => setSelectedCourier(e.target.value)}
                      variant="light"
                      required
                    >
                      {couriers.map((c) => (
                        <option key={c.id} value={c.courier_name}>
                          {c.courier_name.charAt(0).toUpperCase() + c.courier_name.slice(1)} {c.is_default ? "(Default)" : ""}
                        </option>
                      ))}
                    </Select>
                  ) : (
                    <div className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-xl p-3">
                      No active courier partners found. Go to Settings &gt; Courier to enable one.
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="delivery-charge" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Delivery Charge (৳)
                  </Label>
                  <input
                    id="delivery-charge"
                    type="number"
                    min="0"
                    step="0.01"
                    value={deliveryCharge}
                    onChange={(e) => setDeliveryCharge(e.target.value)}
                    placeholder="120"
                    required
                    className="w-full h-10 px-3 py-2 text-sm bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Note Field */}
            <div className="space-y-1.5">
              <Label htmlFor="status-note" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Reason / Note
              </Label>
              <Textarea
                id="status-note"
                placeholder="Enter a reason or update details..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="min-h-[90px] rounded-xl border-slate-200 bg-white text-slate-900"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100/80">
              <Button 
                type="button" 
                onClick={onClose} 
                variant="secondary"
                className="rounded-xl"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20"
                disabled={isSubmitting || !status}
              >
                {isSubmitting ? "Saving..." : "Update Status"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
