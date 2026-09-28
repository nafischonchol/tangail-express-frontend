"use client";

import { useEffect, useState } from "react";
import { X, Loader2, Calendar, FileText, User } from "lucide-react";
import { getCouponUsages, type Coupon, type CouponUsageItem } from "@/lib/api/coupons";
import Link from "next/link";

interface Props {
  isOpen: boolean;
  coupon: Coupon | null;
  onClose: () => void;
}

export default function CouponUsagesModal({ isOpen, coupon, onClose }: Props) {
  const [usages, setUsages] = useState<CouponUsageItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (!isOpen || !coupon) return;

    let isMounted = true;
    setIsLoading(true);

    getCouponUsages(coupon.id, page)
      .then((res) => {
        if (!isMounted) return;
        if (res.success && res.resources) {
          setUsages(res.resources.usages || []);
          setTotalPages(res.resources.pagination?.last_page || 1);
          setTotalCount(res.resources.pagination?.total || 0);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, coupon, page]);

  if (!isOpen || !coupon) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div
        className="w-full max-w-2xl bg-white rounded-lg border border-neutral-200 shadow-xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-200 bg-neutral-50/50">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-neutral-900">
                Redemption History: <span className="font-mono text-neutral-800 uppercase">{coupon.code}</span>
              </h2>
              <span className="px-2 py-0.5 text-[11px] font-medium bg-neutral-200 text-neutral-700 rounded-full">
                {totalCount} Total Uses
              </span>
            </div>
            <p className="text-xs text-neutral-500">
              Orders and customer redemptions for this promotional code
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 text-xs">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-neutral-500">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              <span>Loading redemption logs...</span>
            </div>
          ) : usages.length === 0 ? (
            <div className="text-center py-12 text-neutral-500 border border-dashed border-neutral-200 rounded">
              <p className="font-medium text-neutral-700">No redemptions yet</p>
              <p className="text-[11px] text-neutral-400 mt-1">
                This coupon has not been used in any placed orders.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-neutral-200 rounded">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200 text-[11px] font-semibold text-neutral-600">
                    <th className="py-2.5 px-3">Order Invoice</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Discount Applied</th>
                    <th className="py-2.5 px-3">Order Total</th>
                    <th className="py-2.5 px-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {usages.map((u) => (
                    <tr key={u.id} className="hover:bg-neutral-50/70">
                      <td className="py-2.5 px-3 font-mono">
                        {u.order?.id ? (
                          <Link
                            href={`/admin/sales/${u.order.id}`}
                            className="text-neutral-900 hover:underline font-medium"
                          >
                            {u.order.invoice_no}
                          </Link>
                        ) : (
                          <span className="text-neutral-400">Order #{u.order_id}</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-medium text-neutral-900">
                          {u.client?.name || "Guest Customer"}
                        </div>
                        {u.client?.phone && (
                          <div className="text-[10px] text-neutral-500">{u.client.phone}</div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-emerald-700">
                        ৳{Number(u.discount_amount).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-neutral-800">
                        {u.order?.grand_total ? `৳${Number(u.order.grand_total).toLocaleString()}` : "N/A"}
                      </td>
                      <td className="py-2.5 px-3 text-neutral-500 text-[11px]">
                        {new Date(u.created_at).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-3 text-neutral-600 text-[11px]">
              <span>Page {page} of {totalPages}</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1 border border-neutral-200 rounded disabled:opacity-40 hover:bg-neutral-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-2.5 py-1 border border-neutral-200 rounded disabled:opacity-40 hover:bg-neutral-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-5 py-3 border-t border-neutral-200 bg-neutral-50">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded border border-neutral-200 text-neutral-700 hover:bg-neutral-100 font-medium text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
