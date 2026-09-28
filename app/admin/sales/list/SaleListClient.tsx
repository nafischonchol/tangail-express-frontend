"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Search, Plus, ShoppingCart, Eye, Inbox, Check, AlertCircle, X, Printer, Loader2 } from "lucide-react";
import { Order, getOrder } from "@/lib/api/orders";
import Link from "next/link";
import StatusUpdateModal from "@/components/orders/StatusUpdateModal";
import { InvoiceReceiptModal, ReceiptData } from "@/components/orders/InvoiceReceiptModal";

type Props = {
  initialOrders: Order[];
};

export default function SaleListClient({ initialOrders }: Props) {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [searchQuery, setSearchQuery] = useState("");

  // Notification state
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Status modal state
  const [selectedOrderForStatus, setSelectedOrderForStatus] = useState<Order | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  // Invoice Receipt Modal state
  const [selectedReceiptData, setSelectedReceiptData] = useState<ReceiptData | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [loadingInvoiceId, setLoadingInvoiceId] = useState<number | null>(null);

  const handleOpenInvoice = async (order: Order) => {
    setLoadingInvoiceId(order.id);
    try {
      const res = await getOrder(order.id);
      if (res.success && res.resources) {
        const detail = res.resources;
        const receipt: ReceiptData = {
          invoiceId: detail.invoice_no,
          date: new Date(detail.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          customerName: detail.customer_name || "Walk-in Customer",
          customerPhone: detail.customer_phone,
          customerAddress: detail.customer_address,
          customerCity: detail.customer_city,
          items: detail.items.map((item) => ({
            id: item.id,
            name: item.product_snapshot?.name || item.name,
            variantTitle: item.product_snapshot?.variant_title,
            sku: item.product_snapshot?.sku,
            sellPrice: Number(item.unit_price),
            quantity: item.quantity,
            total: Number(item.total),
          })),
          subtotal: Number(detail.subtotal),
          discountAmount: Number(detail.discount_amount || 0),
          taxAmount: Number(detail.tax_amount || 0),
          deliveryCharge:
            detail.delivery_charge !== null && detail.delivery_charge !== undefined
              ? Number(detail.delivery_charge)
              : null,
          grandTotal: Number(detail.grand_total),
          paymentMethod: detail.payment_method,
          paidAmount: Number(detail.paid_amount || 0),
          changeAmount: Number(detail.change_amount || 0),
          dueAmount: Number(detail.due || 0),
          createdBy: detail.created_by,
          status: detail.status,
        };
        setSelectedReceiptData(receipt);
        setIsReceiptModalOpen(true);
      } else {
        showNotification("error", res.message || "Failed to load invoice details");
      }
    } catch (err: any) {
      showNotification("error", err.message || "Error loading invoice details");
    } finally {
      setLoadingInvoiceId(null);
    }
  };

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    setOrders(initialOrders);
  }, [initialOrders]);

  const filteredOrders = useMemo(() => {
    return orders.filter(order =>
      order.invoice_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [orders, searchQuery]);

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

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return "৳0.00";
    return `৳${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="pt-2 pl-2 pr-4 pb-4 md:pt-3 md:pl-3 md:pr-6 md:pb-6 lg:pt-4 lg:pl-4 lg:pr-8 lg:pb-8 w-full space-y-6">
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

      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-2">
            <ShoppingCart size={24} className="text-indigo-500" />
            Sales Orders
          </h1>
          <p className="text-sm text-slate-500">View and search all completed sales transactions.</p>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-6 bg-slate-50/30">
          <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <ShoppingCart size={20} className="text-indigo-500" />
            All Sales
          </CardTitle>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <Input
                type="text"
                placeholder="Search by invoice or customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-8 w-full rounded-xl bg-white border-slate-200"
              />
            </div>
            <Link href="/admin/sales/add">
              <Button className="h-8 rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 bg-indigo-600 text-white hover:bg-indigo-700">
                <Plus size={18} className="mr-1.5" />
                Add Sale
              </Button>
            </Link>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Invoice</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Items</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Grand Total</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Paid</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Due</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-right w-24">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                          <Inbox size={24} />
                        </div>
                        <div>
                          <p className="text-base font-bold text-slate-700">No sales found</p>
                          <p className="text-sm text-slate-400 mt-1">
                            {searchQuery ? "Try refining your search." : "Create your first sale to get started."}
                          </p>
                        </div>
                        {!searchQuery && (
                          <Link href="/admin/sales/add">
                            <Button variant="secondary" size="sm" className="mt-2">
                              <Plus className="w-4 h-4 mr-2" />
                              New Sale
                            </Button>
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/40 transition-colors group">
                      <td className="px-6 py-4.5">
                        <span className="font-bold text-indigo-600 text-sm">{order.invoice_no}</span>
                      </td>
                      <td className="px-6 py-4.5 text-slate-500 text-xs" suppressHydrationWarning>
                        {new Date(order.date).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'short', day: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4.5">
                        <div className="flex flex-col items-start gap-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            {order.client_id ? (
                              <Link 
                                href={`/admin/clients/${order.client_id}`} 
                                className="font-semibold text-indigo-600 hover:text-indigo-800 hover:underline transition-colors inline-block"
                              >
                                {order.customer_name}
                              </Link>
                            ) : (
                              <span className="font-medium text-slate-700">{order.customer_name}</span>
                            )}
                          </div>
                          {order.customer_phone && (
                            <div className="text-xs text-slate-400 font-mono mt-0.5">{order.customer_phone}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4.5 text-slate-500">{order.items_count} item{order.items_count !== 1 ? 's' : ''}</td>
                      <td className="px-6 py-4.5 font-bold text-slate-800">{formatCurrency(order.grand_total)}</td>
                      <td className="px-6 py-4.5 text-emerald-600 font-semibold">{formatCurrency(order.paid_amount)}</td>
                      <td className="px-6 py-4.5 text-rose-600 font-semibold">{formatCurrency(order.due)}</td>
                      <td className="px-6 py-4.5">
                        <span 
                          onClick={() => {
                            setSelectedOrderForStatus(order);
                            setIsStatusModalOpen(true);
                          }}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-xs select-none ${getStatusStyles(order.status)}`}
                          title="Click to update status"
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            type="button"
                            variant="secondary"
                            size="icon"
                            onClick={() => handleOpenInvoice(order)}
                            disabled={loadingInvoiceId === order.id}
                            className="h-8 w-8 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/60 transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-xs flex items-center justify-center p-0"
                            title="Print / View Invoice"
                          >
                            {loadingInvoiceId === order.id ? (
                              <Loader2 size={14} className="animate-spin text-slate-500" />
                            ) : (
                              <Printer size={14} />
                            )}
                          </Button>
                          <Link href={`/admin/sales/${order.id}`}>
                            <Button
                              variant="secondary"
                              size="icon"
                              className="h-8 w-8 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/60 transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-xs flex items-center justify-center p-0"
                              title="View Details"
                            >
                              <Eye size={14} />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Status Update Modal */}
      {isStatusModalOpen && selectedOrderForStatus && (
        <StatusUpdateModal
          isOpen={isStatusModalOpen}
          order={selectedOrderForStatus}
          onClose={() => {
            setIsStatusModalOpen(false);
            setSelectedOrderForStatus(null);
          }}
          onSuccess={(message) => {
            setIsStatusModalOpen(false);
            setSelectedOrderForStatus(null);
            showNotification("success", message);
            router.refresh();
          }}
          onError={(message) => {
            showNotification("error", message);
          }}
        />
      )}

      {/* Invoice Receipt Modal */}
      {isReceiptModalOpen && selectedReceiptData && (
        <InvoiceReceiptModal
          isOpen={isReceiptModalOpen}
          onClose={() => {
            setIsReceiptModalOpen(false);
            setSelectedReceiptData(null);
          }}
          data={selectedReceiptData}
          mode="view"
        />
      )}
    </div>
  );
}
