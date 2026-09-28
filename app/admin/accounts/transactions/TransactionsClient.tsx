"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Wallet,
  Building2,
  Smartphone,
  CreditCard,
  Plus,
  Inbox,
  TrendingUp,
  TrendingDown,
  RefreshCw,
} from "lucide-react";
import type { Account } from "@/lib/api/accounts";

interface TransactionsClientProps {
  initialAccounts: Account[];
}

interface TransactionItem {
  id: string;
  account_id: number;
  account_name: string;
  account_type: string;
  type: "deposit" | "withdrawal" | "transfer";
  amount: number;
  balance_after: number;
  reference_no: string;
  description: string;
  created_at: string;
}

export default function TransactionsClient({ initialAccounts }: TransactionsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");

  // Sample initial transactions data (rendered dynamically)
  const mockTransactions: TransactionItem[] = useMemo(() => {
    return initialAccounts.flatMap((acc, index) => {
      const baseDate = new Date();
      return [
        {
          id: `TXN-${acc.id}-01`,
          account_id: acc.id,
          account_name: acc.name,
          account_type: acc.type,
          type: "deposit",
          amount: acc.balance * 0.7,
          balance_after: acc.balance,
          reference_no: `INV-2026-00${index + 1}`,
          description: `Sales order payment received via ${acc.name}`,
          created_at: new Date(baseDate.getTime() - index * 86400000).toISOString(),
        },
        {
          id: `TXN-${acc.id}-02`,
          account_id: acc.id,
          account_name: acc.name,
          account_type: acc.type,
          type: "withdrawal",
          amount: Math.min(acc.balance * 0.2, 5000),
          balance_after: acc.balance * 0.3,
          reference_no: `EXP-2026-00${index + 1}`,
          description: `Courier shipping fee / Expense payout`,
          created_at: new Date(baseDate.getTime() - (index + 1) * 86400000).toISOString(),
        },
      ];
    });
  }, [initialAccounts]);

  const filteredTransactions = useMemo(() => {
    return mockTransactions.filter((txn) => {
      const matchesSearch =
        txn.reference_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
        txn.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        txn.account_name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesAccount =
        selectedAccountId === "all" || String(txn.account_id) === selectedAccountId;

      const matchesType = selectedType === "all" || txn.type === selectedType;

      return matchesSearch && matchesAccount && matchesType;
    });
  }, [mockTransactions, searchQuery, selectedAccountId, selectedType]);

  const stats = useMemo(() => {
    const totalDeposits = filteredTransactions
      .filter((t) => t.type === "deposit")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalWithdrawals = filteredTransactions
      .filter((t) => t.type === "withdrawal")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalDeposits,
      totalWithdrawals,
      netFlow: totalDeposits - totalWithdrawals,
    };
  }, [filteredTransactions]);

  const getAccountIcon = (type: string) => {
    switch (type) {
      case "cash":
        return <Wallet size={16} className="text-emerald-600" />;
      case "bank":
        return <Building2 size={16} className="text-blue-600" />;
      case "mobile_banking":
        return <Smartphone size={16} className="text-pink-600" />;
      case "credit_card":
        return <CreditCard size={16} className="text-purple-600" />;
      default:
        return <Wallet size={16} className="text-indigo-600" />;
    }
  };

  const formatCurrency = (val: number) => `৳ ${val.toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="pt-2 pl-2 pr-4 pb-4 md:pt-3 md:pl-3 md:pr-6 md:pb-6 lg:pt-4 lg:pl-4 lg:pr-8 lg:pb-8 w-full space-y-6">
      
      {/* Page Header */}
      <PageHeader
        title="Account Transactions"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Accounts", href: "/admin/accounts" },
          { label: "Transactions" },
        ]}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border border-slate-100 shadow-xs bg-white">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Income / Deposit</p>
              <h3 className="text-xl font-bold text-emerald-600 mt-1">{formatCurrency(stats.totalDeposits)}</h3>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <TrendingUp size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-100 shadow-xs bg-white">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Expense / Payout</p>
              <h3 className="text-xl font-bold text-rose-600 mt-1">{formatCurrency(stats.totalWithdrawals)}</h3>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <TrendingDown size={20} />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-100 shadow-xs bg-white">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Net Cash Flow</p>
              <h3 className={`text-xl font-bold mt-1 ${stats.netFlow >= 0 ? "text-indigo-600" : "text-rose-600"}`}>
                {formatCurrency(stats.netFlow)}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Wallet size={20} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="overflow-hidden border border-slate-100 shadow-sm">
        
        {/* Controls Header */}
        <CardHeader className="py-5 bg-slate-50/40 border-b border-slate-100">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            
            {/* Search */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <Input
                type="text"
                placeholder="Search reference, note or account..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9 rounded-xl bg-white border-slate-200 text-sm focus-visible:ring-indigo-100 focus-visible:border-indigo-400"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="w-40 sm:w-48">
                <Select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="h-9 rounded-xl border-slate-200 text-xs font-medium bg-white text-slate-700"
                >
                  <option value="all">All Accounts ({initialAccounts.length})</option>
                  {initialAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.type})
                    </option>
                  ))}
                </Select>
              </div>

              <div className="w-36">
                <Select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="h-9 rounded-xl border-slate-200 text-xs font-medium bg-white text-slate-700"
                >
                  <option value="all">All Types</option>
                  <option value="deposit">Deposits / Income</option>
                  <option value="withdrawal">Withdrawals / Expense</option>
                </Select>
              </div>
            </div>

          </div>
        </CardHeader>

        {/* Transactions Table */}
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-100 font-semibold">
                <tr>
                  <th className="px-6 py-4 text-xs uppercase tracking-wider">Date & Ref</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-wider">Account</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-wider">Description</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-wider text-right">Amount</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-wider text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                          <Inbox size={22} />
                        </div>
                        <div>
                          <p className="text-base font-bold text-slate-700">No transactions found</p>
                          <p className="text-xs text-slate-400 mt-1">Try clearing filters or search query.</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((txn) => (
                    <tr key={txn.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-mono text-xs text-indigo-600 font-bold">{txn.reference_no}</span>
                          <span className="text-[11px] text-slate-400 font-normal mt-0.5" suppressHydrationWarning>
                            {new Date(txn.created_at).toLocaleDateString("en-BD", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                            {getAccountIcon(txn.account_type)}
                          </div>
                          <span className="text-xs font-bold text-slate-800">{txn.account_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-slate-600 font-normal truncate max-w-xs" title={txn.description}>
                          {txn.description}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold capitalize border ${
                            txn.type === "deposit"
                              ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                              : "bg-rose-50 border-rose-100 text-rose-700"
                          }`}
                        >
                          {txn.type === "deposit" ? (
                            <ArrowDownLeft size={13} className="text-emerald-600" />
                          ) : (
                            <ArrowUpRight size={13} className="text-rose-600" />
                          )}
                          {txn.type}
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-right font-bold text-sm ${
                        txn.type === "deposit" ? "text-emerald-600" : "text-rose-600"
                      }`}>
                        {txn.type === "deposit" ? `+${formatCurrency(txn.amount)}` : `-${formatCurrency(txn.amount)}`}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-xs text-slate-800">
                        {formatCurrency(txn.balance_after)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>

      </Card>
    </div>
  );
}
