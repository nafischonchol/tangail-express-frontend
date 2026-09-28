"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import {
  Plus,
  Edit,
  X,
  Search,
  Check,
  AlertCircle,
  Loader2,
  UserCircle,
  Mail,
  Phone,
  Lock,
  Shield,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  createAdminUser,
  updateAdminUser,
  AdminUser,
} from "@/lib/api/adminUsers";
import { adminUserSchema, formatZodErrors } from "@/lib/validation";

type Props = {
  initialUsers: AdminUser[];
};

export default function UsersClient({ initialUsers }: Props) {
  const router = useRouter();

  // Data State
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  // Form Fields State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState("active");

  // Keep state in sync with server component updates
  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

  const showNotification = useCallback((type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  const handleOpenCreate = useCallback(() => {
    setEditingUser(null);
    setName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setStatus("active");
    setIsModalOpen(true);
  }, []);

  const handleOpenEdit = useCallback((user: AdminUser) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone || "");
    setPassword("");
    setStatus(user.is_active ? "active" : "inactive");
    setIsModalOpen(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationResult = adminUserSchema.safeParse({
      name,
      email,
      phone,
      password,
      isEdit: !!editingUser,
    });

    if (!validationResult.success) {
      const formattedErrors = formatZodErrors(validationResult.error);
      const firstErrorMessage = Object.values(formattedErrors)[0];
      showNotification("error", firstErrorMessage);
      return;
    }

    setIsSubmitting(true);

    const payload: any = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      is_active: status === "active",
    };
    if (password.trim()) {
      payload.password = password;
    }

    let response;
    if (editingUser) {
      response = await updateAdminUser(editingUser.id, payload);
    } else {
      response = await createAdminUser(payload);
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

  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.phone && user.phone.includes(searchQuery))
    );
  }, [users, searchQuery]);

  return (
    <div className="pt-2 pl-2 pr-4 pb-4 md:pt-3 md:pl-3 md:pr-6 md:pb-6 lg:pt-4 lg:pl-4 lg:pr-8 lg:pb-8 w-full space-y-6 relative">
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
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-600 transition-colors ml-4">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Page Header */}
      <PageHeader 
        title="User Management" 
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Users" }
        ]}
      />

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-6 bg-slate-50/30">
          <CardTitle className="text-xl font-bold text-slate-800">Users</CardTitle>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <Input
                type="text"
                placeholder="Search by name, email or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-8 w-full rounded-xl bg-white border-slate-200"
              />
            </div>
            <Button onClick={handleOpenCreate} className="h-8 rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 bg-indigo-600 text-white hover:bg-indigo-700">
              <Plus size={18} className="mr-1.5" />
              Add User
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-right w-32">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                          <UserCircle size={24} />
                        </div>
                        <div>
                          <p className="text-base font-bold text-slate-700">No users found</p>
                          <p className="text-sm text-slate-400 mt-1">Add a new user to get started.</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/40 transition-colors group">
                      <td className="px-6 py-4.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm uppercase">
                            {row.name.substring(0, 2)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">{row.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4.5 text-slate-600">{row.email}</td>
                      <td className="px-6 py-4.5 text-slate-600">{row.phone || '—'}</td>
                      <td className="px-6 py-4.5">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border
                          ${row.is_active
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                            : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${row.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          {row.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4.5 text-right">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleOpenEdit(row)}
                          className="h-8.5 w-8.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-none transition-all p-0 flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 shadow-xs"
                          title="Edit User"
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
      </Card>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <UserCircle size={18} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">
                  {editingUser ? 'Edit User' : 'Create User'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="user-name" className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                    <UserCircle size={12} /> Name <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="user-name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="rounded-xl h-9 border-slate-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="user-email" className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                    <Mail size={12} /> Email <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="user-email"
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="rounded-xl h-9 border-slate-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="user-phone" className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                    <Phone size={12} /> Phone
                  </Label>
                  <Input
                    id="user-phone"
                    type="text"
                    placeholder="+8801XXXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="rounded-xl h-9 border-slate-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="user-password" className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                    <Lock size={12} /> Password {!editingUser && <span className="text-rose-500">*</span>}
                  </Label>
                  <div className="relative">
                    <Input
                      id="user-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={editingUser ? "Leave blank to keep current" : "Min 6 characters"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="rounded-xl h-9 border-slate-200 pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="user-status" className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                    <Shield size={12} /> Status
                  </Label>
                  <div className="relative">
                    <Select
                      id="user-status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="rounded-xl h-9 border-slate-200 text-slate-700 bg-white"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-5 border-t border-slate-100 bg-slate-50/40">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
                className="h-9 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check size={16} className="mr-1.5" />
                    {editingUser ? 'Update User' : 'Save User'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
