"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import {
  Plus,
  Edit,
  Eye,
  X,
  Search,
  Check,
  AlertCircle,
  Loader2,
  Users,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Filter,
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
  ChevronLeft,
  ChevronRight,
  Lock,
  EyeOff
} from "lucide-react";
import Link from "next/link";
import {
  createClient,
  updateClient,
  updateClientStatus,
  Client,
  PaginationInfo
} from "@/lib/api/clients";

type Props = {
  initialClients: Client[];
  initialPagination?: PaginationInfo;
};

export default function ClientsClient({ initialClients, initialPagination }: Props) {
  const router = useRouter();
  
  // Data State
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [pagination, setPagination] = useState<PaginationInfo | undefined>(initialPagination);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "customer" | "supplier" | "both">("all");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Form Fields State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [type, setType] = useState<"customer" | "supplier" | "both">("customer");
  const [balance, setBalance] = useState("0.00");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState("active");

  // Keep state in sync with server components re-fetching
  useEffect(() => {
    setClients(initialClients);
    setPagination(initialPagination);
  }, [initialClients, initialPagination]);

  const searchParams = useSearchParams();

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/admin/clients?${params.toString()}`);
  };

  const handlePerPageChange = (newPerPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("per_page", newPerPage.toString());
    params.set("page", "1");
    router.push(`/admin/clients?${params.toString()}`);
  };

  // Utility to show notification auto-fading after 4s
  const showNotification = useCallback((type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  }, []);

  // Open Modal for Create
  const handleOpenCreate = useCallback(() => {
    setEditingClient(null);
    setName("");
    setPhone("");
    setEmail("");
    setPassword("");
    setShowPassword(false);
    setType("customer");
    setBalance("0.00");
    setAddress("");
    setStatus("active");
    setIsModalOpen(true);
  }, []);

  // Open Modal for Edit
  const handleOpenEdit = useCallback((client: Client) => {
    setEditingClient(client);
    setName(client.name);
    setPhone(client.phone || "");
    setEmail(client.email || "");
    setPassword("");
    setShowPassword(false);
    setType(client.type);
    setBalance(client.balance.toFixed(2));
    setAddress(client.address || "");
    setStatus(client.is_active ? "active" : "inactive");
    setIsModalOpen(true);
  }, []);

  // Form Submit Action
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showNotification("error", "Client name is required.");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      name: name.trim(),
      phone: phone.trim() || null,
      email: email.trim() || null,
      password: password.trim() || null,
      type: type,
      balance: parseFloat(balance) || 0.00,
      address: address.trim() || null,
      is_active: status === "active",
    };

    let response;
    if (editingClient) {
      response = await updateClient(editingClient.id, payload);
    } else {
      response = await createClient(payload);
    }

    setIsSubmitting(false);

    if (response.success) {
      showNotification("success", response.message);
      setIsModalOpen(false);
      router.refresh();
    } else {
      showNotification("error", response.message);
    }
  };

  // Toggle client status (inline)
  const handleToggleStatus = useCallback(async (client: Client) => {
    const originalStatus = client.is_active;

    // Optimistic Update
    setClients(prev =>
      prev.map(item =>
        item.id === client.id ? { ...item, is_active: !originalStatus } : item
      )
    );

    const response = await updateClient(client.id, {
      name: client.name,
      type: client.type,
      is_active: !originalStatus,
    });

    if (response.success) {
      showNotification("success", `Client "${client.name}" status updated successfully.`);
      router.refresh();
    } else {
      showNotification("error", response.message);
      // Revert optimistic update on failure
      setClients(prev =>
        prev.map(item =>
          item.id === client.id ? { ...item, is_active: originalStatus } : item
        )
      );
    }
  }, [router, showNotification]);

  // Update client status (Approve / Reject)
  const handleUpdateStatus = useCallback(async (client: Client, newStatus: "approved" | "rejected" | "pending") => {
    const originalStatus = client.status;
    const originalIsActive = client.is_active;

    // Optimistic Update
    setClients(prev =>
      prev.map(item =>
        item.id === client.id ? { ...item, status: newStatus, is_active: newStatus === "approved" } : item
      )
    );

    const response = await updateClientStatus(client.id, newStatus);

    if (response.success) {
      showNotification("success", `Client "${client.name}" ${newStatus === "approved" ? "approved" : newStatus === "rejected" ? "rejected" : "updated"} successfully.`);
      router.refresh();
    } else {
      showNotification("error", response.message);
      // Revert optimistic update on failure
      setClients(prev =>
        prev.map(item =>
          item.id === client.id ? { ...item, status: originalStatus, is_active: originalIsActive } : item
        )
      );
    }
  }, [router, showNotification]);

  // Filter clients by search query and tab selection
  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      // Search filter
      const matchesSearch =
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (client.phone || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (client.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (client.address || "").toLowerCase().includes(searchQuery.toLowerCase());

      // Tab filter
      let matchesTab = true;
      if (activeTab === "pending") {
        matchesTab = client.status === "pending";
      } else if (activeTab === "customer") {
        matchesTab = client.type === "customer" || client.type === "both";
      } else if (activeTab === "supplier") {
        matchesTab = client.type === "supplier" || client.type === "both";
      } else if (activeTab === "both") {
        matchesTab = client.type === "both";
      }

      return matchesSearch && matchesTab;
    });
  }, [clients, searchQuery, activeTab]);

  return (
    <div className="pt-2 pl-2 pr-4 pb-4 md:pt-3 md:pl-3 md:pr-6 md:pb-6 lg:pt-4 lg:pl-4 lg:pr-8 lg:pb-8 w-full space-y-6 relative">
      
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-2xl border shadow-xl backdrop-blur-md animate-in slide-in-from-top-4 duration-300 
          ${notification.type === 'success' 
            ? 'bg-emerald-50/90 border-emerald-100 text-emerald-800' 
            : 'bg-rose-50/90 border-rose-100 text-rose-800'}`}>
          {notification.type === 'success' ? (
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <Check size={18} />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-600">
              <AlertCircle size={18} />
            </div>
          )}
          <div>
            <p className="text-sm font-semibold">{notification.type === 'success' ? 'Success' : 'Error'}</p>
            <p className="text-xs text-slate-500 mt-0.5">{notification.message}</p>
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
      <PageHeader 
        title="Client Management" 
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Clients" }
        ]}
      />

      {/* Main Content Card */}
      <Card className="overflow-hidden border border-slate-100/80 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
        
        {/* Card Header with Filtering Controls */}
        <CardHeader className="flex flex-col gap-4 py-6 bg-slate-50/20 border-b border-slate-100/50">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Custom Interactive Tab Controls */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl w-fit">
              {(["all", "pending", "customer", "supplier", "both"] as const).map((tab) => {
                const pendingCount = clients.filter(c => c.status === "pending").length;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all capitalize select-none cursor-pointer flex items-center gap-1.5
                      ${activeTab === tab 
                        ? "bg-white text-indigo-600 shadow-sm" 
                        : "text-slate-500 hover:text-slate-800 hover:bg-slate-50/50"}`}
                  >
                    {tab === "all" ? "All Clients" : tab === "pending" ? "Pending Approval" : tab === "both" ? "Both Types" : `${tab}s`}
                    {tab === "pending" && pendingCount > 0 && (
                      <span className="px-1.5 py-0.5 text-[10px] bg-amber-500 text-white rounded-full font-extrabold">
                        {pendingCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Search and Action Button */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <Input 
                  id="client-search"
                  type="text" 
                  placeholder="Search by name, contact or address..." 
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
                Add Client
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {/* Clients Table */}
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50/50 text-slate-500 border-b border-slate-100/80">
                <tr>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider w-16">ID</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Client Name</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Contact details</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Address</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Current Balance</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-right w-24">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                          <Users size={24} />
                        </div>
                        <div>
                          <p className="text-base font-bold text-slate-700">No clients found</p>
                          <p className="text-sm text-slate-400 mt-1">Try searching another term or add a new client to get started.</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredClients.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-6 py-4.5 text-slate-400 font-medium">#{row.id}</td>
                      <td className="px-6 py-4.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100/50 flex-shrink-0 flex items-center justify-center text-indigo-600 font-bold text-xs uppercase shadow-sm">
                            {row.name.substring(0, 2)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">{row.name}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5" suppressHydrationWarning>Joined {new Date(row.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4.5">
                        <div className="space-y-1">
                          {row.phone ? (
                            <p className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
                              <Phone size={11} className="text-slate-400" />
                              {row.phone}
                            </p>
                          ) : (
                            <p className="text-xs text-slate-400 italic">No phone</p>
                          )}
                          {row.email && (
                            <p className="text-xs text-slate-400 flex items-center gap-1.5">
                              <Mail size={11} className="text-slate-300" />
                              {row.email}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4.5">
                        {row.address ? (
                          <p className="text-xs text-slate-500 max-w-[200px] truncate flex items-center gap-1.5" title={row.address}>
                            <MapPin size={12} className="text-slate-300 flex-shrink-0" />
                            {row.address}
                          </p>
                        ) : (
                          <span className="text-xs text-slate-300 italic">No address</span>
                        )}
                      </td>
                      <td className="px-6 py-4.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize
                          ${row.type === 'customer' 
                            ? 'bg-blue-50 border-blue-100 text-blue-700' 
                            : row.type === 'supplier'
                            ? 'bg-purple-50 border-purple-100 text-purple-700'
                            : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5
                            ${row.type === 'customer' 
                              ? 'bg-blue-500' 
                              : row.type === 'supplier'
                              ? 'bg-purple-500'
                              : 'bg-emerald-500'}`} 
                          />
                          {row.type}
                        </span>
                      </td>
                      <td className="px-6 py-4.5">
                        <p className={`text-sm font-bold flex items-center gap-0.5
                          ${row.balance > 0 
                            ? 'text-emerald-600' 
                            : row.balance < 0 
                            ? 'text-rose-600' 
                            : 'text-slate-500'}`}>
                          {row.balance >= 0 ? `$${row.balance.toFixed(2)}` : `-$${Math.abs(row.balance).toFixed(2)}`}
                        </p>
                      </td>
                      <td className="px-6 py-4.5">
                        {row.status === "pending" ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 border border-amber-200 text-amber-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse" />
                            Pending Approval
                          </span>
                        ) : row.status === "rejected" ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 border border-rose-200 text-rose-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5" />
                            Rejected
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(row)}
                            title="Click to toggle status"
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border transition duration-150 cursor-pointer hover:scale-105 active:scale-95 shadow-xs
                              ${row.is_active 
                                ? 'bg-emerald-50 border-emerald-100 text-emerald-700 hover:bg-emerald-100' 
                                : 'bg-rose-50 border-rose-100 text-rose-700 hover:bg-rose-100'}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${row.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            {row.is_active ? 'Active' : 'Inactive'}
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4.5 text-right flex items-center justify-end gap-2">
                        {row.status === "pending" ? (
                          <>
                            <Button
                              onClick={() => handleUpdateStatus(row, "approved")}
                              title="Approve Client"
                              className="h-7 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                            >
                              <Check size={13} /> Approve
                            </Button>
                            <Button
                              onClick={() => handleUpdateStatus(row, "rejected")}
                              title="Reject Client"
                              className="h-7 px-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                            >
                              <X size={13} /> Reject
                            </Button>
                          </>
                        ) : row.status === "rejected" ? (
                          <Button
                            onClick={() => handleUpdateStatus(row, "approved")}
                            title="Approve Client"
                            className="h-7 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                          >
                            <Check size={13} /> Approve
                          </Button>
                        ) : null}
                        <Link href={`/admin/clients/${row.id}`} title="View Client Details">
                          <Button
                            variant="secondary"
                            size="icon"
                            className="h-8 w-8 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/60 transition-all p-0 cursor-pointer hover:scale-105 active:scale-95 shadow-xs hover:border-slate-300"
                          >
                            <Eye size={13} />
                          </Button>
                        </Link>
                        <Button 
                          onClick={() => handleOpenEdit(row)}
                          title="Edit Client Information"
                          className="h-8 w-8 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-none transition-all p-0 cursor-pointer hover:scale-105 active:scale-95 shadow-xs"
                        >
                          <Edit size={14} />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>

        {/* Pagination Footer */}
        {pagination && pagination.total > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-100 bg-slate-50/30">
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
              <span>
                Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to{" "}
                {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of{" "}
                <span className="font-bold text-slate-700">{pagination.total}</span> entries
              </span>
              <div className="flex items-center gap-2">
                <label htmlFor="per-page-select" className="text-xs text-slate-500">Per page:</label>
                <select
                  id="per-page-select"
                  value={pagination.per_page}
                  onChange={(e) => handlePerPageChange(Number(e.target.value))}
                  className="h-8 px-2 rounded-lg border border-slate-200 bg-white text-xs text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                disabled={pagination.current_page <= 1}
                onClick={() => handlePageChange(pagination.current_page - 1)}
                className="h-8 text-xs rounded-lg px-2.5 text-slate-600 disabled:opacity-40"
              >
                <ChevronLeft size={14} className="mr-1" /> Previous
              </Button>

              {Array.from({ length: pagination.last_page }, (_, i) => i + 1)
                .filter(p => p === 1 || p === pagination.last_page || Math.abs(p - pagination.current_page) <= 1)
                .reduce<(number | string)[]>((acc, p, idx, arr) => {
                  if (idx > 0 && typeof arr[idx - 1] === 'number' && (p as number) - (arr[idx - 1] as number) > 1) {
                    acc.push('...');
                  }
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, idx) =>
                  typeof p === 'number' ? (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={`h-8 w-8 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        p === pagination.current_page
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {p}
                    </button>
                  ) : (
                    <span key={`ellipsis-${idx}`} className="px-1 text-slate-400 text-xs">...</span>
                  )
                )}

              <Button
                variant="ghost"
                size="sm"
                disabled={pagination.current_page >= pagination.last_page}
                onClick={() => handlePageChange(pagination.current_page + 1)}
                className="h-8 text-xs rounded-lg px-2.5 text-slate-600 disabled:opacity-40"
              >
                Next <ChevronRight size={14} className="ml-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Create / Edit Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <form 
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm">
                  <Users size={18} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">
                  {editingClient ? 'Edit Client' : 'Create Client'}
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
              
              {/* Client Name */}
              <div className="space-y-2">
                <Label htmlFor="client-name" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Client Name <span className="text-rose-500">*</span></Label>
                <Input 
                  id="client-name"
                  type="text" 
                  placeholder="e.g. Acme Corp or Rahim Uddin" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="rounded-xl h-9.5 border-slate-200 focus-visible:ring-indigo-100 focus-visible:border-indigo-400"
                />
              </div>

              {/* Phone & Email Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="client-phone" className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Phone size={12} className="text-slate-400" /> Phone Number
                  </Label>
                  <Input 
                    id="client-phone"
                    type="text" 
                    placeholder="e.g. +8801700000000" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="rounded-xl h-9.5 border-slate-200 focus-visible:ring-indigo-100 focus-visible:border-indigo-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client-email" className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Mail size={12} className="text-slate-400" /> Email Address
                  </Label>
                  <Input 
                    id="client-email"
                    type="email" 
                    placeholder="e.g. contact@client.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-xl h-9.5 border-slate-200 focus-visible:ring-indigo-100 focus-visible:border-indigo-400"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="client-password" className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock size={12} className="text-slate-400" /> Password {editingClient && <span className="text-[10px] text-slate-400 font-normal lowercase">(leave blank to keep current)</span>}
                </Label>
                <div className="relative">
                  <Input 
                    id="client-password"
                    type={showPassword ? "text" : "password"} 
                    placeholder={editingClient ? "Enter new password (optional)" : "Set client password (optional)"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="rounded-xl h-9.5 border-slate-200 focus-visible:ring-indigo-100 focus-visible:border-indigo-400 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Client Type & Initial Balance Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="client-type" className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Filter size={12} className="text-slate-400" /> Client Type <span className="text-rose-500">*</span>
                  </Label>
                  <div className="relative">
                    <Select 
                      id="client-type"
                      value={type}
                      onChange={(e) => setType(e.target.value as Client["type"])}
                      className="rounded-xl h-9.5 border-slate-200 text-slate-700 bg-white focus-visible:ring-indigo-100 focus-visible:border-indigo-400 cursor-pointer"
                    >
                      <option value="customer">Customer</option>
                      <option value="supplier">Supplier</option>
                      <option value="both">Both (Customer & Supplier)</option>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client-balance" className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <DollarSign size={12} className="text-slate-400" /> Client Balance ($)
                  </Label>
                  <Input 
                    id="client-balance"
                    type="number" 
                    step="0.01"
                    placeholder="0.00" 
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                    className="rounded-xl h-9.5 border-slate-200 focus-visible:ring-indigo-100 focus-visible:border-indigo-400"
                  />
                  <p className="text-[10px] text-slate-400">Positive balance represents credits/receivables; negative represents outstanding debt/payables.</p>
                </div>
              </div>

              {/* Status & Address Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="client-status" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</Label>
                  <div className="relative">
                    <Select 
                      id="client-status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="rounded-xl h-9.5 border-slate-200 text-slate-700 bg-white focus-visible:ring-indigo-100 focus-visible:border-indigo-400 cursor-pointer"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client-address" className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin size={12} className="text-slate-400" /> Address Details
                  </Label>
                  <Textarea 
                    id="client-address"
                    placeholder="Street, City, Zipcode..." 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="rounded-xl min-h-[90px] border-slate-200 focus-visible:ring-indigo-100 focus-visible:border-indigo-400"
                  />
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end px-6 py-5 border-t border-slate-100 bg-slate-50/50">
              <Button 
                type="button" 
                onClick={() => setIsModalOpen(false)} 
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
                ) : editingClient ? 'Update Client' : 'Create Client'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
