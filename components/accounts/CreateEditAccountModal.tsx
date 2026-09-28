"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Wallet, X, Loader2, Check, AlertCircle } from "lucide-react";
import { createAccount, updateAccount } from "@/lib/api/accounts";
import type { Account } from "@/lib/api/accounts";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  editingAccount?: Account | null;
};

export default function CreateEditAccountModal({
  isOpen,
  onClose,
  onSuccess,
  editingAccount,
}: Props) {
  const [name, setName] = useState("");
  const [type, setType] = useState<Account["type"]>("cash");
  const [accountNumber, setAccountNumber] = useState("");
  const [status, setStatus] = useState("active");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Re-initialize form when editingAccount changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setName(editingAccount?.name || "");
      setType(editingAccount?.type || "cash");
      setAccountNumber(editingAccount?.account_number || "");
      setStatus(editingAccount?.is_active === false ? "inactive" : "active");
      setNotification(null);
    }
  }, [isOpen, editingAccount]);

  const showNotification = useCallback(
    (type: "success" | "error", message: string) => {
      setNotification({ type, message });
      setTimeout(() => setNotification(null), 3500);
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!name.trim()) {
        showNotification("error", "Account name is required.");
        return;
      }
      setIsSubmitting(true);

      const payload = {
        name: name.trim(),
        type,
        account_number: type !== "cash" ? accountNumber.trim() : null,
        is_active: status === "active",
      };

      try {
        const res = editingAccount
          ? await updateAccount(editingAccount.id, payload)
          : await createAccount(payload);

        if (res.success) {
          showNotification("success", res.message || "Saved successfully.");
          setTimeout(() => {
            if (onSuccess) {
              onSuccess();
            } else {
              onClose();
            }
          }, 800);
        } else {
          showNotification("error", res.message || "Save failed.");
        }
      } catch (err: any) {
        showNotification("error", err.message || "Save failed.");
      }

      setIsSubmitting(false);
    },
    [name, type, accountNumber, status, editingAccount, showNotification, onSuccess, onClose]
  );

  if (!isOpen) return null;

  return (
    <>
      {notification && (
        <div
          className={`fixed top-6 right-6 z-[101] flex items-center gap-3 px-5 py-4 rounded-2xl border shadow-xl backdrop-blur-md animate-in slide-in-from-top-4 duration-300 ${
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
            className="text-slate-400 hover:text-slate-600 ml-4"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm">
                <Wallet size={18} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">
                {editingAccount ? "Edit Account" : "Create Account"}
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
            {/* Account Name */}
            <div className="space-y-2">
              <Label
                htmlFor="account-name"
                className="text-xs font-bold text-slate-500 uppercase tracking-wider"
              >
                Account Name <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="account-name"
                type="text"
                placeholder="e.g. Cash, Bank Account, bKash"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="rounded-xl h-9.5 border-slate-200 focus-visible:ring-indigo-100 focus-visible:border-indigo-400"
              />
            </div>

            {/* Type & Account Number Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`space-y-2 ${type === "cash" ? "md:col-span-2" : ""}`}>
                <Label
                  htmlFor="account-type"
                  className="text-xs font-bold text-slate-500 uppercase tracking-wider"
                >
                  Account Type <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <Select
                    id="account-type"
                    value={type}
                    onChange={(e) =>
                      setType(e.target.value as Account["type"])
                    }
                    variant="light"
                    className="rounded-xl h-9.5 border-slate-200 text-slate-700 bg-white focus-visible:ring-indigo-100 focus-visible:border-indigo-400 cursor-pointer"
                  >
                    <option value="cash">Cash</option>
                    <option value="bank">Bank</option>
                    <option value="mobile_banking">Mobile Banking</option>
                    <option value="credit_card">Credit Card</option>
                  </Select>
                </div>
              </div>

              {type !== "cash" && (
                <div className="space-y-2 animate-in fade-in duration-200">
                  <Label
                    htmlFor="account-number"
                    className="text-xs font-bold text-slate-500 uppercase tracking-wider"
                  >
                    Account Number <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="account-number"
                    type="text"
                    placeholder="e.g. 1234567890"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    required
                    className="rounded-xl h-9.5 border-slate-200 focus-visible:ring-indigo-100 focus-visible:border-indigo-400"
                  />
                </div>
              )}
            </div>

            {/* Status (Always present here, full-width) */}
            <div className="space-y-2">
              <Label
                htmlFor="account-status"
                className="text-xs font-bold text-slate-500 uppercase tracking-wider"
              >
                Status
              </Label>
              <div className="relative">
                <Select
                  id="account-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  variant="light"
                  className="rounded-xl h-9.5 border-slate-200 text-slate-700 bg-white focus-visible:ring-indigo-100 focus-visible:border-indigo-400 cursor-pointer"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end px-6 py-5 border-t border-slate-100 bg-slate-50/50">
            <Button
              type="button"
              onClick={onClose}
              variant="ghost"
              className="h-9.5 rounded-xl border border-slate-200 active:scale-[0.98] transition-all"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-9.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98] transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Saving...
                </>
              ) : editingAccount ? (
                "Update Account"
              ) : (
                "Create Account"
              )}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
