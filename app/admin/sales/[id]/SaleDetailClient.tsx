"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Label } from "@/components/ui/Label";
import { Order, OrderDetail, OrderLookup, updateOrder } from "@/lib/api/orders";
import { getPublicDistricts, District } from "@/lib/api/locations";
import {
  ArrowLeft,
  ShoppingCart,
  User,
  CreditCard,
  Package,
  Clock,
  Check,
  AlertCircle,
  X,
  Pencil,
  Loader2,
  Printer,
} from "lucide-react";
import Link from "next/link";
import SaleListPanel from "@/app/admin/sales/[id]/components/SaleListPanel";
import StatusUpdateModal from "@/components/orders/StatusUpdateModal";
import { InvoiceReceiptModal, ReceiptData } from "@/components/orders/InvoiceReceiptModal";

type Props = {
  order: OrderDetail | null;
  orders: (Order | OrderLookup)[];
};

export default function SaleDetailClient({ order, orders }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"items" | "history">("items");

  // Notification state
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Status modal state
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  // Invoice Receipt Modal state
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Edit Delivery Charge Modal state
  const [isEditDeliveryOpen, setIsEditDeliveryOpen] = useState(false);
  const [deliveryChargeInput, setDeliveryChargeInput] = useState("");
  const [isSavingDelivery, setIsSavingDelivery] = useState(false);

  // Edit Customer Info Modal state
  const [isEditCustomerOpen, setIsEditCustomerOpen] = useState(false);
  const [custName, setCustName] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [custAddress, setCustAddress] = useState("");
  const [custCity, setCustCity] = useState("");
  const [districts, setDistricts] = useState<District[]>([]);
  const [isSavingCustomer, setIsSavingCustomer] = useState(false);

  useEffect(() => {
    async function loadDistricts() {
      try {
        const res = await getPublicDistricts();
        if (res.success && res.resources) {
          setDistricts(res.resources);
        }
      } catch (err) {
        console.error("Failed to load districts:", err);
      }
    }
    loadDistricts();
  }, []);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'Order Placed':
        return 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100/50';
      case 'Confirmed':
        return 'bg-sky-50 text-sky-700 border-sky-100 hover:bg-sky-100/50';
      case 'Packaging':
        return 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100/50';
      case 'Ready To Deliver':
        return 'bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-100/50';
      case 'Shipped':
        return 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100/50';
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100/50';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100/50';
      case 'Unreachable':
        return 'bg-orange-50 text-orange-700 border-orange-100 hover:bg-orange-100/50';
      case 'Returned':
        return 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200/50';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100/50';
    }
  };

  if (!order) {
    return (
      <div className="pt-2 pl-2 pr-4 pb-4 w-full space-y-6">
        <div className="text-center py-16 text-slate-400">
          <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="text-sm font-medium">Order not found</p>
          <Link href="/admin/sales/list">
            <Button variant="secondary" size="sm" className="mt-4">
              Back to Sales
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "৳0.00";
    return `৳${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleOpenEditDelivery = () => {
    setDeliveryChargeInput(
      order.delivery_charge !== undefined && order.delivery_charge !== null
        ? String(order.delivery_charge)
        : "120"
    );
    setIsEditDeliveryOpen(true);
  };

  const handleSaveDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSavingDelivery) return;

    setIsSavingDelivery(true);
    try {
      const chargeVal = deliveryChargeInput.trim() !== "" ? parseFloat(deliveryChargeInput) : null;
      const res = await updateOrder(order.id, { delivery_charge: chargeVal });
      if (res.success) {
        showNotification("success", "Delivery charge updated successfully.");
        setIsEditDeliveryOpen(false);
        router.refresh();
      } else {
        showNotification("error", res.message || "Failed to update delivery charge.");
      }
    } catch (err: any) {
      showNotification("error", err.message || "Error updating delivery charge.");
    } finally {
      setIsSavingDelivery(false);
    }
  };

  const handleOpenEditCustomer = () => {
    setCustName(order.customer_name || "");
    setCustPhone(order.customer_phone || "");
    setCustAddress(order.customer_address || "");
    setCustCity(order.customer_city || "");
    setIsEditCustomerOpen(true);
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSavingCustomer) return;

    setIsSavingCustomer(true);
    try {
      const res = await updateOrder(order.id, {
        customer_name: custName,
        customer_phone: custPhone,
        customer_address: custAddress,
        customer_city: custCity,
      });
      if (res.success) {
        showNotification("success", "Customer info updated successfully.");
        setIsEditCustomerOpen(false);
        router.refresh();
      } else {
        showNotification("error", res.message || "Failed to update customer info.");
      }
    } catch (err: any) {
      showNotification("error", err.message || "Error updating customer info.");
    } finally {
      setIsSavingCustomer(false);
    }
  };

  const receiptData: ReceiptData | null = order
    ? {
        invoiceId: order.invoice_no,
        date: new Date(order.date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        customerName: order.customer_name || "Walk-in Customer",
        customerPhone: order.customer_phone,
        customerAddress: order.customer_address,
        customerCity: order.customer_city,
        items: order.items.map((item) => ({
          id: item.id,
          name: item.product_snapshot?.name || item.name,
          variantTitle: item.product_snapshot?.variant_title,
          sku: item.product_snapshot?.sku,
          sellPrice: Number(item.unit_price),
          quantity: item.quantity,
          total: Number(item.total),
        })),
        subtotal: Number(order.subtotal),
        discountAmount: Number(order.discount_amount || 0),
        taxAmount: Number(order.tax_amount || 0),
        deliveryCharge:
          order.delivery_charge !== null && order.delivery_charge !== undefined
            ? Number(order.delivery_charge)
            : null,
        grandTotal: Number(order.grand_total),
        paymentMethod: order.payment_method,
        paidAmount: Number(order.paid_amount || 0),
        changeAmount: Number(order.change_amount || 0),
        dueAmount: Number(order.due || 0),
        createdBy: order.created_by,
        status: order.status,
      }
    : null;

  return (
    <div className="pt-2 pl-2 pr-4 pb-4 md:pt-3 md:pl-3 md:pr-6 md:pb-6 lg:pt-4 lg:pl-4 lg:pr-8 lg:pb-8 w-full space-y-6 relative text-slate-800 bg-slate-50/30">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-2xl border shadow-xl backdrop-blur-md animate-in slide-in-from-top-4 duration-300
          ${
            notification.type === "success"
              ? "bg-emerald-50/90 border-emerald-100 text-emerald-800"
              : "bg-rose-50/90 border-rose-100 text-rose-800"
          }`}
        >
          {notification.type === "success" ? (
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <Check size={18} />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-600">
              <AlertCircle size={18} />
            </div>
          )}
          <div>
            <p className="text-sm font-semibold">
              {notification.type === "success" ? "Success" : "Error"}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {notification.message}
            </p>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-600 transition-colors ml-4"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side order list panel */}
        <div className="col-span-1 lg:col-span-3">
          <SaleListPanel orders={orders} activeOrderId={String(order.id)} />
        </div>

        {/* Right Side order details */}
        <div className="col-span-1 lg:col-span-9 space-y-6">
          {/* Order Summary Card */}
          <Card className="w-full">
            <CardHeader className="py-4 px-6 bg-slate-50/20 border-b border-slate-100 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-slate-600 flex items-center gap-2">
                <ShoppingCart size={16} className="text-indigo-500" />
                Order Summary
              </CardTitle>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsReceiptModalOpen(true)}
                className="h-8 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer flex items-center gap-1.5 shadow-xs border border-slate-200/60"
              >
                <Printer size={14} className="text-slate-600" />
                Print Invoice
              </Button>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
              {/* Order Info */}
              <div className="space-y-2.5">
                <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-2">
                  Order Info
                </h4>
                <div className="flex items-baseline gap-2">
                  <span className="text-slate-500 w-28 shrink-0">Invoice</span>
                  <span className="text-slate-400">:</span>
                  <span className="font-bold text-indigo-600">
                    {order.invoice_no}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-slate-500 w-28 shrink-0">Total Amount</span>
                  <span className="text-slate-400">:</span>
                  <span className="font-extrabold text-indigo-600">
                    {formatCurrency(order.grand_total)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 w-28 shrink-0">Delivery Charge</span>
                  <span className="text-slate-400">:</span>
                  <span className="font-bold text-slate-700">
                    {order.delivery_charge !== undefined && order.delivery_charge !== null
                      ? formatCurrency(order.delivery_charge)
                      : "Pending"}
                  </span>
                  <button
                    type="button"
                    onClick={handleOpenEditDelivery}
                    className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors ml-1"
                    title="Edit Delivery Charge"
                  >
                    <Pencil size={13} />
                  </button>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-slate-500 w-28 shrink-0">Date</span>
                  <span className="text-slate-400">:</span>
                  <span className="text-slate-800" suppressHydrationWarning>
                    {new Date(order.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-slate-500 w-28 shrink-0">Status</span>
                  <span className="text-slate-400">:</span>
                  <div>
                    <span
                      onClick={() => setIsStatusModalOpen(true)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize cursor-pointer transition-colors shadow-sm select-none ${getStatusStyles(order.status)}`}
                      title="Click to update status"
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">
                    Customer Info
                  </h4>
                  <button
                    type="button"
                    onClick={handleOpenEditCustomer}
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
                  >
                    <Pencil size={12} /> Edit
                  </button>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-slate-500 w-28 shrink-0">Name</span>
                  <span className="text-slate-400">:</span>
                  <span className="font-medium text-slate-800">
                    {order.client_id ? (
                      <Link
                        href={`/admin/clients/${order.client_id}`}
                        className="font-semibold text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
                      >
                        {order.customer_name}
                      </Link>
                    ) : (
                      order.customer_name
                    )}
                  </span>
                </div>
                {order.customer_phone && (
                  <div className="flex items-baseline gap-2">
                    <span className="text-slate-500 w-28 shrink-0">Phone</span>
                    <span className="text-slate-400">:</span>
                    <span className="text-slate-800">{order.customer_phone}</span>
                  </div>
                )}
                {order.customer_address && (
                  <div className="flex items-baseline gap-2">
                    <span className="text-slate-500 w-28 shrink-0">Address</span>
                    <span className="text-slate-400">:</span>
                    <span className="text-slate-800">{order.customer_address}</span>
                  </div>
                )}
                <div className="flex items-baseline gap-2">
                  <span className="text-slate-500 w-28 shrink-0">City / District</span>
                  <span className="text-slate-400">:</span>
                  <span className="text-slate-800 font-medium">
                    {order.customer_city || "—"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items & Status History Tabbed Card */}
          <Card className="overflow-hidden">
            {/* Tab Header */}
            <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/50 px-6 py-3.5">
              <button
                type="button"
                onClick={() => setActiveTab("items")}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer select-none ${
                  activeTab === "items"
                    ? "bg-white text-indigo-600 shadow-sm border border-slate-200/60"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/50"
                }`}
              >
                <Package size={15} />
                Items ({order.items.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("history")}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer select-none ${
                  activeTab === "history"
                    ? "bg-white text-indigo-600 shadow-sm border border-slate-200/60"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/50"
                }`}
              >
                <Clock size={15} />
                Status History ({order.status_histories?.length || 0})
              </button>
            </div>

            <CardContent className="p-0">
              {activeTab === "items" && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-3 font-bold text-xs uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-3 font-bold text-xs uppercase tracking-wider">
                          SKU
                        </th>
                        <th className="px-6 py-3 font-bold text-xs uppercase tracking-wider">
                          Variant
                        </th>
                        <th className="px-6 py-3 font-bold text-xs uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 font-bold text-xs uppercase tracking-wider">
                          Qty
                        </th>
                        <th className="px-6 py-3 font-bold text-xs uppercase tracking-wider text-right">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {order.items.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-50/40 transition-colors"
                        >
                          <td className="px-6 py-3 font-medium text-slate-800">
                            {item.product_snapshot?.name || item.name}
                          </td>
                          <td className="px-6 py-3 text-slate-500 font-mono text-xs">
                            {item.product_snapshot?.sku || "-"}
                          </td>
                          <td className="px-6 py-3 text-slate-500">
                            {item.product_snapshot?.variant_title || "Default"}
                          </td>
                          <td className="px-6 py-3">
                            {formatCurrency(item.unit_price)}
                          </td>
                          <td className="px-6 py-3">{item.quantity}</td>
                          <td className="px-6 py-3 text-right font-semibold">
                            {formatCurrency(item.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="bg-slate-50/60 border-t border-slate-100 p-4 sm:p-6 flex flex-col items-end gap-2 text-sm">
                    <div className="w-full sm:w-72 space-y-2">
                      <div className="flex justify-between text-slate-600">
                        <span>Subtotal:</span>
                        <span className="font-medium">{formatCurrency(order.subtotal)}</span>
                      </div>
                      {order.discount_amount > 0 && (
                        <div className="flex justify-between text-emerald-600">
                          <span>Discount:</span>
                          <span className="font-medium">-{formatCurrency(order.discount_amount)}</span>
                        </div>
                      )}
                      {order.tax_amount > 0 && (
                        <div className="flex justify-between text-slate-600">
                          <span>Tax:</span>
                          <span className="font-medium">{formatCurrency(order.tax_amount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-slate-600 items-center">
                        <span className="flex items-center gap-1">
                          Delivery Charge:
                          <button
                            type="button"
                            onClick={handleOpenEditDelivery}
                            className="p-0.5 text-slate-400 hover:text-indigo-600 rounded transition-colors"
                            title="Edit Delivery Charge"
                          >
                            <Pencil size={11} />
                          </button>
                        </span>
                        <span className="font-medium">
                          {order.delivery_charge !== undefined && order.delivery_charge !== null
                            ? formatCurrency(order.delivery_charge)
                            : "Pending"}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-900 font-extrabold text-base pt-2 border-t border-slate-200">
                        <span>Total Amount:</span>
                        <span className="text-indigo-600">{formatCurrency(order.grand_total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "history" && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-3 font-bold text-xs uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 font-bold text-xs uppercase tracking-wider">
                          Note / Remarks
                        </th>
                        <th className="px-6 py-3 font-bold text-xs uppercase tracking-wider">
                          Changed By
                        </th>
                        <th className="px-6 py-3 font-bold text-xs uppercase tracking-wider">
                          Date & Time
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(!order.status_histories || order.status_histories.length === 0) ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                            No status history records found.
                          </td>
                        </tr>
                      ) : (
                        order.status_histories.map((history) => (
                          <tr key={history.id} className="hover:bg-slate-50/40 transition-colors">
                            <td className="px-6 py-3.5">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${getStatusStyles(history.status)}`}>
                                {history.status}
                              </span>
                            </td>
                            <td className="px-6 py-3.5 text-slate-600">
                              {history.note || "—"}
                            </td>
                            <td className="px-6 py-3.5 text-slate-700 font-medium">
                              {history.changed_by}
                            </td>
                            <td className="px-6 py-3.5 text-slate-500 text-xs" suppressHydrationWarning>
                              {new Date(history.created_at).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Status Update Modal */}
      {isStatusModalOpen && (
        <StatusUpdateModal
          isOpen={isStatusModalOpen}
          order={order}
          onClose={() => {
            setIsStatusModalOpen(false);
          }}
          onSuccess={(message) => {
            setIsStatusModalOpen(false);
            showNotification("success", message);
            router.refresh();
          }}
          onError={(message) => {
            showNotification("error", message);
          }}
        />
      )}

      {/* Edit Delivery Charge Modal */}
      {isEditDeliveryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsEditDeliveryOpen(false)}
          />
          <div className="relative w-full max-w-sm bg-white rounded-2xl border border-slate-100 shadow-2xl overflow-hidden z-10 p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800">Edit Delivery Charge</h3>
              <button
                type="button"
                onClick={() => setIsEditDeliveryOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveDelivery} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-delivery-charge" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Delivery Charge (৳)
                </Label>
                <input
                  id="edit-delivery-charge"
                  type="number"
                  min="0"
                  step="0.01"
                  value={deliveryChargeInput}
                  onChange={(e) => setDeliveryChargeInput(e.target.value)}
                  placeholder="e.g. 120"
                  className="w-full h-10 px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsEditDeliveryOpen(false)}
                  className="rounded-xl"
                  disabled={isSavingDelivery}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white"
                  disabled={isSavingDelivery}
                >
                  {isSavingDelivery ? <Loader2 size={16} className="animate-spin" /> : "Save"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Customer Info Modal */}
      {isEditCustomerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsEditCustomerOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-2xl border border-slate-100 shadow-2xl overflow-hidden z-10 p-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800">Edit Customer Information</h3>
              <button
                type="button"
                onClick={() => setIsEditCustomerOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveCustomer} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="cust-name" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Customer Name
                </Label>
                <input
                  id="cust-name"
                  type="text"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full h-10 px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cust-phone" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Phone Number
                </Label>
                <input
                  id="cust-phone"
                  type="tel"
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  placeholder="e.g. 01712345678"
                  className="w-full h-10 px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cust-address" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Address
                </Label>
                <input
                  id="cust-address"
                  type="text"
                  value={custAddress}
                  onChange={(e) => setCustAddress(e.target.value)}
                  placeholder="House, Street address"
                  className="w-full h-10 px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cust-city" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  City / District
                </Label>
                {districts.length > 0 ? (
                  <Select
                    id="cust-city"
                    value={custCity}
                    onChange={(e) => setCustCity(e.target.value)}
                    className="h-10 text-sm rounded-xl border-slate-200"
                  >
                    <option value="">Select District...</option>
                    {districts.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name} {d.bn_name ? `(${d.bn_name})` : ""}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <input
                    id="cust-city"
                    type="text"
                    value={custCity}
                    onChange={(e) => setCustCity(e.target.value)}
                    placeholder="e.g. Dhaka"
                    className="w-full h-10 px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsEditCustomerOpen(false)}
                  className="rounded-xl"
                  disabled={isSavingCustomer}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white"
                  disabled={isSavingCustomer}
                >
                  {isSavingCustomer ? <Loader2 size={16} className="animate-spin" /> : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Receipt Modal */}
      {isReceiptModalOpen && receiptData && (
        <InvoiceReceiptModal
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
          data={receiptData}
          mode="view"
        />
      )}
    </div>
  );
}
