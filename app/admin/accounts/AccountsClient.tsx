"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  Search,
  Plus,
  Wallet,
  DollarSign,
  Eye,
  Edit,
  Check,
  AlertCircle,
  X,
} from "lucide-react";
import CreateEditAccountModal from "@/components/accounts/CreateEditAccountModal";
import { updateAccount } from "@/lib/api/accounts";
import type { Account } from "@/lib/api/accounts";

type Props = {
  initialAccounts: Account[];
};

export default function AccountsClient({ initialAccounts }: Props) {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  // Notification state
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Toggling state — track which account ID is currently toggling
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const typeKeys = ["all", "cash", "bank", "mobile_banking", "credit_card"] as const;

  // Keep accounts in sync when server re-fetches (e.g. after router.refresh())
  useEffect(() => {
    setAccounts(initialAccounts);
  }, [initialAccounts]);

  const showNotification = useCallback(
    (type: "success" | "error", message: string) => {
      setNotification({ type, message });
      setTimeout(() => setNotification(null), 4000);
    },
    []
  );

  // --- Memoized filtering ---
  const filteredAccounts = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return accounts.filter((account) => {
      const matchesSearch = account.name.toLowerCase().includes(query);
      const matchesType = filterType === "all" || account.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [accounts, searchQuery, filterType]);

  // --- Status Toggle (optimistic + server action) ---
  const handleToggleStatus = useCallback(
    async (account: Account) => {
      const originalStatus = account.is_active;
      setTogglingId(account.id);

      // Optimistic update
      setAccounts((prev) =>
        prev.map((a) =>
          a.id === account.id ? { ...a, is_active: !originalStatus } : a
        )
      );

      try {
        const res = await updateAccount(account.id, {
          name: account.name,
          type: account.type,
          is_active: !originalStatus,
        });

        if (res.success) {
          showNotification(
            "success",
            `"${account.name}" ${!originalStatus ? "activated" : "deactivated"}.`
          );
          router.refresh();
        } else {
          throw new Error(res.message || "Failed to update status");
        }
      } catch (err: any) {
        // Revert optimistic update
        setAccounts((prev) =>
          prev.map((a) =>
            a.id === account.id ? { ...a, is_active: originalStatus } : a
          )
        );
        showNotification("error", err.message || "Failed to update status.");
      }

      setTogglingId(null);
    },
    [showNotification, router]
  );

  // --- Modal handlers ---
  const handleOpenCreate = useCallback(() => {
    setEditingAccount(null);
    setIsModalOpen(true);
  }, []);

  const handleOpenEdit = useCallback((account: Account) => {
    setEditingAccount(account);
    setIsModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setEditingAccount(null);
  }, []);

  const handleModalSuccess = useCallback(() => {
    setIsModalOpen(false);
    setEditingAccount(null);
    router.refresh();
  }, [router]);

  return (
    <>
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

      <Card className="overflow-hidden border border-slate-100/80 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
        <CardHeader className="flex flex-col gap-4 py-6 bg-slate-50/20 border-b border-slate-100/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm">
                <Wallet size={18} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Accounts</h3>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Search & Filter Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4">
            {/* Type Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl w-fit">
              {typeKeys.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFilterType(tab)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all capitalize select-none cursor-pointer ${
                    filterType === tab
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-50/50"
                  }`}
                >
                  {tab === "all" ? "All" : tab.replace("_", " ")}
                </button>
              ))}
            </div>

            {/* Search and Action Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
              <div className="relative w-full sm:w-72">
                <Search
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  size={15}
                />
                <Input
                  id="account-search"
                  type="text"
                  placeholder="Search by account name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-9 w-full rounded-xl bg-white border-slate-200/80 text-sm focus-visible:ring-indigo-100 focus-visible:border-indigo-400"
                />
              </div>
              <Button
                onClick={handleOpenCreate}
                className="h-9 rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98] transition-all"
              >
                <Plus size={18} className="mr-1.5" />
                Add Account
              </Button>
            </div>
          </div>

          {/* Table */}
          {filteredAccounts.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <Wallet size={24} />
                </div>
                <div>
                  <p className="text-base font-bold text-slate-700">
                    No accounts found
                  </p>
                  <p className="text-sm text-slate-400 mt-1">
                    {searchQuery || filterType !== "all"
                      ? "Try adjusting your search or filter."
                      : "Add a new account to get started."}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50/50 text-slate-500 border-b border-slate-100/80">
                  <tr>
                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider w-16">
                      ID
                    </th>
                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">
                      Account Name
                    </th>
                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">
                      Balance
                    </th>
                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-right w-32">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80">
                  {filteredAccounts.map((row) => (
                    <tr
                      key={row.id}
                      className="hover:bg-slate-50/30 transition-colors group"
                    >
                      <td className="px-6 py-4.5 text-slate-400 font-medium">
                        #{row.id}
                      </td>
                      <td className="px-6 py-4.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100/50 flex-shrink-0 flex items-center justify-center text-indigo-600 shadow-sm">
                            <Wallet size={16} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">
                              {row.name}
                            </p>
                            {row.account_number && (
                              <p className="text-xs text-slate-500 font-medium mt-0.5">
                                A/C: {row.account_number}
                              </p>
                            )}
                            <p className="text-[10px] text-slate-400 mt-0.5" suppressHydrationWarning>
                              Created{" "}
                              {new Date(row.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border bg-slate-50 text-slate-700">
                          {row.type.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4.5">
                        <p
                          className={`text-sm font-bold flex items-center gap-0.5 ${
                            row.balance > 0
                              ? "text-emerald-600"
                              : row.balance < 0
                              ? "text-rose-600"
                              : "text-slate-500"
                          }`}
                        >
                          <DollarSign size={14} /> {row.balance.toFixed(2)}
                        </p>
                      </td>
                      <td className="px-6 py-4.5">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(row)}
                          disabled={togglingId === row.id}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border transition duration-150 cursor-pointer hover:scale-105 active:scale-95 shadow-xs ${
                            row.is_active
                              ? "bg-emerald-50 border-emerald-100 text-emerald-700 hover:bg-emerald-100"
                              : "bg-rose-50 border-rose-100 text-rose-700 hover:bg-rose-100"
                          } disabled:opacity-50`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                              row.is_active
                                ? "bg-emerald-500"
                                : "bg-rose-500"
                            }`}
                          />
                          {row.is_active ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="px-6 py-4.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            className="h-8 w-8 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60 transition-all p-0 cursor-pointer hover:scale-105 active:scale-95 shadow-xs"
                            title="View"
                          >
                            <Eye size={14} />
                          </Button>
                          <Button
                            onClick={() => handleOpenEdit(row)}
                            className="h-8 w-8 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-none transition-all p-0 cursor-pointer hover:scale-105 active:scale-95 shadow-xs flex items-center justify-center"
                            title="Edit"
                          >
                            <Edit size={14} />
                          </Button>
                          <Button
                            className="h-8 w-8 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-none transition-all p-0 cursor-pointer hover:scale-105 active:scale-95 shadow-xs"
                            title="Add Fund"
                          >
                            <Plus size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <CreateEditAccountModal
          key={editingAccount ? `edit-${editingAccount.id}` : "create"}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
          editingAccount={editingAccount}
        />
      )}
    </>
  );
}
