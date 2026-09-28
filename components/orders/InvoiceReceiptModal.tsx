"use client";

import React, { useRef, useState, useEffect } from "react";
import { X, Printer, ArrowRight, Check, FileText, Receipt } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getStoreSetup, StoreSetup } from "@/lib/api/storeSetup";

export type ReceiptItem = {
  id: string | number;
  name: string;
  banglaName?: string;
  variantTitle?: string;
  sku?: string;
  sellPrice: number;
  quantity: number;
  total: number;
};

export type ReceiptData = {
  invoiceId: string;
  date: string;
  customerName: string;
  customerPhone?: string | null;
  customerAddress?: string | null;
  customerCity?: string | null;
  items: ReceiptItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  deliveryCharge?: number | null;
  grandTotal: number;
  paymentMethod?: string;
  paidAmount: number;
  changeAmount: number;
  dueAmount?: number;
  createdBy?: string;
  status?: string;
};

interface InvoiceReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ReceiptData | null;
  mode?: "pos_success" | "view";
  onNewSale?: () => void;
}

export function InvoiceReceiptModal({
  isOpen,
  onClose,
  data,
  mode = "view",
  onNewSale,
}: InvoiceReceiptModalProps) {
  const [format, setFormat] = useState<"pos" | "a4">("pos");
  const [storeSetup, setStoreSetup] = useState<StoreSetup | null>(null);
  const posReceiptRef = useRef<HTMLDivElement>(null);
  const a4InvoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadStore() {
      try {
        const res = await getStoreSetup();
        if (isMounted && res.success && res.resources) {
          setStoreSetup(res.resources);
        }
      } catch (err) {
        console.error("Failed to load store setup:", err);
      }
    }
    if (isOpen) {
      loadStore();
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen || !data) return null;

  const storeName = storeSetup?.store_name || "Mohimaa";
  const storePhone = storeSetup?.phone || "";
  const storeEmail = storeSetup?.email || "";
  const storeAddress =
    [storeSetup?.street_address, storeSetup?.district_name, "Bangladesh"]
      .filter(Boolean)
      .join(", ") || "Dhaka, Bangladesh";
  const storeBin = storeSetup?.bin_number || "";

  const handlePrint = (targetFormat?: "pos" | "a4") => {
    const selected = targetFormat || format;
    const ref = selected === "pos" ? posReceiptRef : a4InvoiceRef;
    if (!ref.current) return;
    const printContent = ref.current.innerHTML;

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) {
      window.print();
      return;
    }

    doc.open();
    if (selected === "pos") {
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>POS Receipt - ${data.invoiceId}</title>
            <meta charset="utf-8" />
            <style>
              * {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
              }
              body {
                font-family: monospace, ui-monospace, SFMono-Regular, "Courier New", sans-serif;
                font-size: 11px;
                line-height: 1.35;
                color: #000;
                background: #fff;
                width: 76mm;
                margin: 0 auto;
                padding: 4mm 2mm;
              }
              .text-center { text-align: center; }
              .text-right { text-align: right; }
              .font-bold { font-weight: bold; }
              .uppercase { text-transform: uppercase; }
              .border-b-dashed { border-bottom: 1px dashed #666; }
              .border-t-dashed { border-top: 1px dashed #666; }
              .border-b-solid { border-bottom: 1px solid #000; }
              .border-t-solid { border-top: 1px solid #000; }
              .py-1 { padding-top: 3px; padding-bottom: 3px; }
              .py-2 { padding-top: 6px; padding-bottom: 6px; }
              .my-1 { margin-top: 4px; margin-bottom: 4px; }
              .mb-2 { margin-bottom: 8px; }
              .flex { display: flex; }
              .justify-between { justify-content: space-between; }
              .items-center { align-items: center; }
              .space-y-1 > * + * { margin-top: 3px; }
              .space-y-0-5 > * + * { margin-top: 1.5px; }
              .w-half { width: 50%; }
              .w-qty { width: 15%; text-align: center; }
              .w-price { width: 35%; text-align: right; }
              .barcode-container { display: flex; justify-content: center; gap: 1.5px; height: 26px; margin: 6px auto; }
              .bar { background: #000; height: 100%; }
              @media print {
                @page {
                  size: 80mm auto;
                  margin: 0;
                }
                body {
                  width: 76mm;
                  padding: 4mm 2mm;
                }
              }
            </style>
          </head>
          <body>
            ${printContent}
          </body>
        </html>
      `);
    } else {
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Invoice - ${data.invoiceId}</title>
            <meta charset="utf-8" />
            <style>
              * {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
              }
              body {
                font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                font-size: 12px;
                line-height: 1.4;
                color: #1e293b;
                background: #fff;
                width: 100%;
                max-width: 190mm;
                margin: 0 auto;
                padding: 8mm 6mm;
              }
              .text-center { text-align: center; }
              .text-right { text-align: right; }
              .text-left { text-align: left; }
              .font-bold { font-weight: bold; }
              .font-semibold { font-weight: 600; }
              .uppercase { text-transform: uppercase; }
              .text-xs { font-size: 11px; }
              .text-sm { font-size: 13px; }
              .text-base { font-size: 14px; }
              .text-lg { font-size: 16px; }
              .text-xl { font-size: 18px; }
              .text-2xl { font-size: 22px; }
              .text-slate-400 { color: #94a3b8; }
              .text-slate-500 { color: #64748b; }
              .text-slate-600 { color: #475569; }
              .text-slate-700 { color: #334155; }
              .text-slate-800 { color: #1e293b; }
              .text-slate-900 { color: #0f172a; }
              .text-indigo-600 { color: #4f46e5; }
              .text-emerald-600 { color: #059669; }
              .text-rose-600 { color: #e11d48; }
              .bg-slate-50 { background-color: #f8fafc; }
              .bg-slate-100 { background-color: #f1f5f9; }
              .border { border: 1px solid #e2e8f0; }
              .border-b { border-bottom: 1px solid #e2e8f0; }
              .border-t { border-top: 1px solid #e2e8f0; }
              .rounded { border-radius: 6px; }
              .rounded-lg { border-radius: 8px; }
              .rounded-xl { border-radius: 12px; }
              .p-2 { padding: 8px; }
              .p-3 { padding: 12px; }
              .p-4 { padding: 16px; }
              .py-2 { padding-top: 8px; padding-bottom: 8px; }
              .py-3 { padding-top: 12px; padding-bottom: 12px; }
              .px-3 { padding-left: 12px; padding-right: 12px; }
              .mb-1 { margin-bottom: 4px; }
              .mb-2 { margin-bottom: 8px; }
              .mb-4 { margin-bottom: 16px; }
              .mb-5 { margin-bottom: 20px; }
              .mb-6 { margin-bottom: 24px; }
              .mt-4 { margin-top: 16px; }
              .mt-6 { margin-top: 24px; }
              .flex { display: flex; }
              .flex-wrap { flex-wrap: wrap; }
              .justify-between { justify-content: space-between; }
              .items-center { align-items: center; }
              .items-start { align-items: flex-start; }
              .gap-2 { gap: 8px; }
              .gap-4 { gap: 16px; }
              .gap-6 { gap: 24px; }
              table { width: 100%; border-collapse: collapse; margin-top: 12px; margin-bottom: 12px; }
              th { background-color: #f8fafc; border-top: 1px solid #e2e8f0; border-bottom: 2px solid #cbd5e1; padding: 8px 10px; font-size: 11px; text-transform: uppercase; font-weight: 700; color: #475569; text-align: left; }
              td { border-bottom: 1px solid #f1f5f9; padding: 8px 10px; font-size: 12px; }
              .table-summary { width: 300px; margin-left: auto; }
              .table-summary td { padding: 5px 8px; }
              .sign-box { border-top: 1px dashed #94a3b8; width: 160px; text-align: center; padding-top: 6px; font-size: 11px; color: #64748b; margin-top: 30px; }
              .barcode-container { display: flex; justify-content: center; gap: 1.5px; height: 26px; margin: 6px auto; }
              .bar { background: #000; height: 100%; }
              @media print {
                @page {
                  size: A4 portrait;
                  margin: 10mm 12mm;
                }
                body {
                  width: 100%;
                  max-width: 100%;
                  padding: 0;
                }
              }
            </style>
          </head>
          <body>
            ${printContent}
          </body>
        </html>
      `);
    }
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1500);
    }, 250);
  };

  const getPaymentLabel = (method?: string) => {
    if (!method) return "N/A";
    const lower = method.toLowerCase();
    switch (lower) {
      case "cash":
        return "Cash (নগদ)";
      case "card":
        return "Card";
      case "bkash":
        return "bKash";
      case "nagad":
        return "Nagad";
      default:
        return method;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto py-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className={`relative bg-white rounded-2xl w-full mx-4 p-6 shadow-2xl border border-slate-100 z-10 flex flex-col max-h-[92vh] scale-100 transition-all duration-200 animate-in zoom-in-95 ${format === "a4" ? "max-w-3xl" : "max-w-lg"}`}>
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-50 transition-colors z-20 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header */}
        {mode === "pos_success" ? (
          <div className="flex flex-col items-center text-center mb-4">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 mb-2">
              <Check className="w-5 h-5 stroke-[3]" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">
              Sale Completed Successfully!
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Invoice #{data.invoiceId} generated
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 pr-8">
            <div className="flex items-center gap-2">
              <Printer className="w-4 h-4 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-800">
                Invoice #{data.invoiceId}
              </h2>
            </div>
            {data.status && (
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 capitalize">
                {data.status}
              </span>
            )}
          </div>
        )}

        {/* Format Selector Tabs */}
        <div className="flex items-center justify-between gap-2 mb-3 bg-slate-100/70 p-1 rounded-xl">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setFormat("pos")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                format === "pos"
                  ? "bg-white text-indigo-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              POS Slip (80mm)
            </button>
            <button
              type="button"
              onClick={() => setFormat("a4")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                format === "a4"
                  ? "bg-white text-indigo-600 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Standard Invoice (A4)
            </button>
          </div>
          <span className="text-[11px] text-slate-400 pr-2 hidden sm:inline">
            {format === "pos" ? "Thermal 80mm format" : "Standard A4 page format"}
          </span>
        </div>

        {/* Scrollable Receipt / Invoice Preview Area */}
        <div className="flex-1 overflow-y-auto pr-1 py-1 border border-slate-100 bg-slate-50/50 p-4 rounded-xl">
          {/* 1. POS Thermal Receipt View */}
          {format === "pos" && (
            <div
              ref={posReceiptRef}
              className="bg-white p-5 shadow-xs border border-slate-200 rounded-lg mx-auto max-w-[340px] font-mono text-xs text-slate-800"
            >
              {/* Store details */}
              <div className="text-center space-y-1 pb-3 border-b-dashed border-slate-300">
                <h3 className="font-bold text-base uppercase text-slate-900 tracking-wider">
                  {storeName}
                </h3>
                {storeAddress && <p className="text-[10px] text-slate-500">{storeAddress}</p>}
                {storePhone && <p className="text-[10px] text-slate-500">Tel: {storePhone}</p>}
                {storeEmail && <p className="text-[10px] text-slate-500">Email: {storeEmail}</p>}
                {storeBin && <p className="text-[10px] text-slate-500">BIN: {storeBin}</p>}
              </div>

              {/* Invoice meta */}
              <div className="py-2.5 space-y-1 border-b-dashed border-slate-300 text-[11px] text-slate-600">
                <div className="flex justify-between">
                  <span>Invoice:</span>
                  <span className="font-bold text-slate-900">{data.invoiceId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>{data.date}</span>
                </div>
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <span className="font-bold text-slate-900">{data.customerName}</span>
                </div>
                {data.customerPhone && (
                  <div className="flex justify-between">
                    <span>Phone:</span>
                    <span>{data.customerPhone}</span>
                  </div>
                )}
                {data.customerAddress && (
                  <div className="flex justify-between">
                    <span>Address:</span>
                    <span className="text-right max-w-[180px] break-words">
                      {data.customerAddress}
                      {data.customerCity ? `, ${data.customerCity}` : ""}
                    </span>
                  </div>
                )}
                {data.createdBy && (
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Served by:</span>
                    <span>{data.createdBy}</span>
                  </div>
                )}
              </div>

              {/* Items table */}
              <div className="py-3 border-b-dashed border-slate-300">
                <div className="flex justify-between font-bold text-slate-900 mb-2 border-b-solid border-slate-200 pb-1 text-[11px]">
                  <span className="w-half">Item Description</span>
                  <span className="w-qty">Qty</span>
                  <span className="w-price">Price</span>
                </div>
                <div className="space-y-2">
                  {data.items.map((item, idx) => (
                    <div key={item.id ? String(item.id) : idx} className="space-y-0.5">
                      <div className="flex justify-between font-semibold text-slate-900">
                        <span className="w-half break-words leading-tight">
                          {item.name}
                        </span>
                        <span className="w-qty">{item.quantity}</span>
                        <span className="w-price">৳{item.total.toFixed(2)}</span>
                      </div>
                      {(item.variantTitle && item.variantTitle !== "Default") && (
                        <div className="text-[10px] text-slate-500 pl-0.5">
                          Variant: {item.variantTitle}
                        </div>
                      )}
                      {item.banglaName && (
                        <div className="text-[10px] text-slate-500 pl-0.5">
                          {item.banglaName}
                        </div>
                      )}
                      <div className="text-[10px] text-slate-400 pl-0.5">
                        {item.quantity} x ৳{item.sellPrice.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals and calculations */}
              <div className="py-2.5 space-y-1 border-b-dashed border-slate-300 text-slate-600 text-[11px]">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>৳{data.subtotal.toFixed(2)}</span>
                </div>
                {data.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount:</span>
                    <span>-৳{data.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                {data.taxAmount > 0 && (
                  <div className="flex justify-between">
                    <span>VAT/Tax:</span>
                    <span>৳{data.taxAmount.toFixed(2)}</span>
                  </div>
                )}
                {data.deliveryCharge !== undefined &&
                  data.deliveryCharge !== null &&
                  data.deliveryCharge > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Delivery Charge:</span>
                      <span>৳{Number(data.deliveryCharge).toFixed(2)}</span>
                    </div>
                  )}
                <div className="flex justify-between font-bold text-xs text-slate-900 pt-1 border-t-solid border-slate-200">
                  <span>Total Payable:</span>
                  <span>৳{data.grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Payments & Due/Change info */}
              <div className="py-2.5 space-y-1 border-b-dashed border-slate-300 text-slate-600 text-[11px]">
                <div className="flex justify-between">
                  <span>Method:</span>
                  <span className="font-bold text-slate-900">
                    {getPaymentLabel(data.paymentMethod)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Paid Amount:</span>
                  <span className="font-bold text-slate-900">
                    ৳{data.paidAmount.toFixed(2)}
                  </span>
                </div>
                {data.dueAmount !== undefined && data.dueAmount > 0 ? (
                  <div className="flex justify-between font-bold text-rose-600">
                    <span>Due Amount:</span>
                    <span>৳{data.dueAmount.toFixed(2)}</span>
                  </div>
                ) : null}
                {data.changeAmount > 0 && (
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>Change Due:</span>
                    <span>৳{data.changeAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Footer message & Barcode */}
              <div className="text-center pt-3 space-y-2">
                <p className="text-[10px] font-bold text-slate-700 italic">
                  Thank You for Shopping!
                </p>

                <div className="flex flex-col items-center justify-center gap-1">
                  <div className="barcode-container flex items-center justify-center gap-[1px] h-7 w-44 bg-white overflow-hidden py-0.5">
                    {Array.from({ length: 32 }).map((_, i) => (
                      <div
                        key={i}
                        className="bar"
                        style={{
                          width: `${i % 3 === 0 ? 1 : i % 5 === 0 ? 3 : 2}px`,
                          opacity: i % 7 === 0 ? 0 : 1,
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono tracking-widest">
                    *{data.invoiceId}*
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 2. Standard A4 Invoice View */}
          {format === "a4" && (
            <div
              ref={a4InvoiceRef}
              className="bg-white p-8 shadow-xs border border-slate-200 rounded-lg mx-auto w-full text-slate-800 text-xs"
            >
              {/* Top Company Header & Invoice Badge */}
              <div className="flex justify-between items-start pb-5 border-b border-slate-200 mb-5">
                <div>
                  <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 uppercase">
                    {storeName}
                  </h1>
                  {storeAddress && (
                    <p className="text-slate-500 text-xs mt-1">{storeAddress}</p>
                  )}
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-slate-500 text-xs mt-1">
                    {storePhone && <span>Tel: {storePhone}</span>}
                    {storeEmail && <span>Email: {storeEmail}</span>}
                    {storeBin && <span>BIN: {storeBin}</span>}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="inline-block px-3 py-1 bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded mb-1.5">
                    Invoice
                  </span>
                  <div className="text-base font-bold text-slate-900 font-mono">
                    #{data.invoiceId}
                  </div>
                  <div className="text-slate-500 text-xs mt-0.5">
                    Date: {data.date}
                  </div>
                </div>
              </div>

              {/* Billed To (Customer) Card */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70 mb-5">
                <h3 className="font-bold text-slate-400 uppercase text-[10px] tracking-wider mb-1.5">
                  Billed To (Customer)
                </h3>
                <div className="font-bold text-sm text-slate-900 mb-0.5">
                  {data.customerName}
                </div>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-600">
                  {data.customerPhone && (
                    <span className="font-mono">Phone: {data.customerPhone}</span>
                  )}
                  {data.customerAddress && (
                    <span>
                      Address: {data.customerAddress}
                      {data.customerCity ? `, ${data.customerCity}` : ""}
                    </span>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto mb-6">
                <table className="w-full text-left border border-slate-200 rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-slate-100/80 text-slate-600 text-[11px] uppercase tracking-wider font-bold">
                      <th className="p-2.5 text-center w-12 border-b border-slate-200">#</th>
                      <th className="p-2.5 border-b border-slate-200">Item Description</th>
                      <th className="p-2.5 text-right w-24 border-b border-slate-200">Unit Price</th>
                      <th className="p-2.5 text-center w-16 border-b border-slate-200">Qty</th>
                      <th className="p-2.5 text-right w-28 border-b border-slate-200">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.items.map((item, idx) => (
                      <tr key={item.id ? String(item.id) : idx} className="hover:bg-slate-50/40">
                        <td className="p-2.5 text-center text-slate-400 font-mono">{idx + 1}</td>
                        <td className="p-2.5">
                          <div className="font-semibold text-slate-900">{item.name}</div>
                          {(item.variantTitle && item.variantTitle !== "Default") && (
                            <div className="text-[11px] text-slate-500">Variant: {item.variantTitle}</div>
                          )}
                          {item.sku && (
                            <div className="text-[10px] text-slate-400 font-mono">SKU: {item.sku}</div>
                          )}
                        </td>
                        <td className="p-2.5 text-right font-mono text-slate-700">৳{item.sellPrice.toFixed(2)}</td>
                        <td className="p-2.5 text-center font-bold text-slate-800">{item.quantity}</td>
                        <td className="p-2.5 text-right font-mono font-bold text-slate-900">৳{item.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary and Terms */}
              <div className="flex flex-col sm:flex-row justify-between gap-6 pt-2">
                <div className="w-full sm:w-1/2 space-y-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-[11px] text-slate-600">
                    <div className="font-bold text-slate-800 mb-1">Terms & Conditions:</div>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-500 text-[10px]">
                      <li>Goods can be exchanged within 7 days with the original invoice.</li>
                      <li>Products must be unworn, undamaged, and with tags intact.</li>
                      {(storePhone || storeEmail) && (
                        <li>
                          For support, please call {storePhone || "+880 1700-000000"}
                          {storeEmail ? ` or email ${storeEmail}` : ""}.
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className="pt-6">
                    <div className="border-t border-slate-300 w-44 text-center pt-1.5 text-[10px] font-semibold text-slate-500">
                      Authorized Signature
                    </div>
                  </div>
                </div>

                <div className="w-full sm:w-72 space-y-1.5 text-xs bg-slate-50/60 p-4 rounded-xl border border-slate-200/70">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-mono font-semibold">৳{data.subtotal.toFixed(2)}</span>
                  </div>
                  {data.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount:</span>
                      <span className="font-mono font-semibold">-৳{data.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {data.taxAmount > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>VAT / Tax:</span>
                      <span className="font-mono font-semibold">৳{data.taxAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {data.deliveryCharge !== undefined &&
                    data.deliveryCharge !== null &&
                    data.deliveryCharge > 0 && (
                      <div className="flex justify-between text-slate-600">
                        <span>Delivery Charge:</span>
                        <span className="font-mono font-semibold">৳{Number(data.deliveryCharge).toFixed(2)}</span>
                      </div>
                    )}
                  <div className="flex justify-between text-slate-900 font-bold text-sm pt-2 border-t border-slate-200">
                    <span>Total Amount:</span>
                    <span className="font-mono text-indigo-600">৳{data.grandTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-700 pt-1">
                    <span>Paid Amount:</span>
                    <span className="font-mono font-semibold">৳{data.paidAmount.toFixed(2)}</span>
                  </div>
                  {data.dueAmount !== undefined && data.dueAmount > 0 ? (
                    <div className="flex justify-between text-rose-600 font-bold">
                      <span>Due Amount:</span>
                      <span className="font-mono">৳{data.dueAmount.toFixed(2)}</span>
                    </div>
                  ) : null}
                  {data.changeAmount > 0 && (
                    <div className="flex justify-between text-slate-800 font-bold">
                      <span>Change Given:</span>
                      <span className="font-mono">৳{data.changeAmount.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Barcode Footer */}
              <div className="mt-8 pt-4 border-t border-slate-100 flex flex-col items-center justify-center gap-1">
                <div className="flex items-center justify-center gap-[1px] h-6 w-40 bg-white overflow-hidden">
                  {Array.from({ length: 32 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-slate-900 h-full"
                      style={{
                        width: `${i % 3 === 0 ? 1 : i % 5 === 0 ? 3 : 2}px`,
                        opacity: i % 7 === 0 ? 0 : 1,
                      }}
                    />
                  ))}
                </div>
                <span className="text-[9px] text-slate-400 font-mono tracking-widest">
                  *{data.invoiceId}*
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-4 border-t border-slate-100 mt-4">
          <div className="flex gap-2 w-full sm:w-auto flex-1">
            <Button
              type="button"
              variant="secondary"
              onClick={() => handlePrint("pos")}
              className={`flex-1 h-9 rounded-xl cursor-pointer text-xs font-semibold ${
                format === "pos"
                  ? "bg-slate-800 text-white hover:bg-slate-700"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              <Receipt className="w-3.5 h-3.5 mr-1.5" />
              Print POS Slip
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => handlePrint("a4")}
              className={`flex-1 h-9 rounded-xl cursor-pointer text-xs font-semibold ${
                format === "a4"
                  ? "bg-indigo-600 text-white hover:bg-indigo-700"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              <FileText className="w-3.5 h-3.5 mr-1.5" />
              Print A4 Invoice
            </Button>
          </div>

          {mode === "pos_success" && onNewSale ? (
            <Button
              type="button"
              onClick={onNewSale}
              className="w-full sm:w-auto px-5 bg-indigo-600 hover:bg-indigo-700 text-white h-9 rounded-xl cursor-pointer text-xs font-semibold"
            >
              New Sale
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="w-full sm:w-24 border border-slate-200 text-slate-700 hover:bg-slate-50 h-9 rounded-xl cursor-pointer text-xs"
            >
              Close
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
