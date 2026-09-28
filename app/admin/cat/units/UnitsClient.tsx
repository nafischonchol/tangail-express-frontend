"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Plus, Edit, X, Search, Check, AlertCircle } from "lucide-react";
import { createUnit, updateUnit, Unit } from "@/lib/api/units";

interface UnitsClientProps {
  initialUnits: Unit[];
}

export default function UnitsClient({ initialUnits }: UnitsClientProps) {
  const router = useRouter();
  const [units, setUnits] = useState<Unit[]>(initialUnits);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [status, setStatus] = useState("active");

  useEffect(() => {
    setUnits(initialUnits);
  }, [initialUnits]);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const openCreateModal = () => {
    setEditingUnit(null);
    setName("");
    setShortName("");
    setStatus("active");
    setIsModalOpen(true);
  };

  const openEditModal = (unit: Unit) => {
    setEditingUnit(unit);
    setName(unit.name);
    setShortName(unit.short_name);
    setStatus(unit.is_active ? "active" : "inactive");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showNotification("error", "Unit name is required.");
      return;
    }

    if (!shortName.trim()) {
      showNotification("error", "Short name is required.");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      name: name.trim(),
      short_name: shortName.trim(),
      is_active: status === "active",
    };

    const response = editingUnit ? await updateUnit(editingUnit.id, payload) : await createUnit(payload);

    setIsSubmitting(false);

    if (response.success) {
      showNotification("success", response.message);
      setIsModalOpen(false);
      router.refresh();
    } else {
      showNotification("error", response.message);
    }
  };

  const handleToggleStatus = async (unit: Unit) => {
    const originalStatus = unit.is_active;

    // Optimistic UI Update
    setUnits(prev => prev.map(item => item.id === unit.id ? { ...item, is_active: !originalStatus } : item));

    const response = await updateUnit(unit.id, {
      name: unit.name,
      short_name: unit.short_name,
      is_active: !originalStatus,
    });

    if (response.success) {
      showNotification("success", `Unit "${unit.name}" status updated successfully.`);
      router.refresh();
    } else {
      showNotification("error", response.message);
      // Revert state
      setUnits(prev => prev.map(item => item.id === unit.id ? { ...item, is_active: originalStatus } : item));
    }
  };

  const filteredUnits = units.filter(unit =>
    unit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    unit.short_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pt-2 pl-2 pr-4 pb-4 md:pt-3 md:pl-3 md:pr-6 md:pb-6 lg:pt-4 lg:pl-4 lg:pr-8 lg:pb-8 w-full space-y-6 relative">
      {notification && (
        <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-2xl border shadow-xl backdrop-blur-md animate-in slide-in-from-top-4 duration-300 ${notification.type === 'success' ? 'bg-emerald-50/90 border-emerald-100 text-emerald-800' : 'bg-rose-50/90 border-rose-100 text-rose-800'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${notification.type === 'success' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
            {notification.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          </div>
          <div>
            <p className="text-sm font-semibold">{notification.type === 'success' ? 'Success' : 'Error'}</p>
            <p className="text-xs text-slate-500 mt-0.5">{notification.message}</p>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={16} />
          </button>
        </div>
      )}

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-6 bg-slate-50/30">
          <CardTitle className="text-xl font-bold text-slate-800">Units</CardTitle>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <Input
                type="text"
                placeholder="Search units..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-8 w-full rounded-xl bg-white border-slate-200"
              />
            </div>
            <Button onClick={openCreateModal} className="h-8 rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 bg-indigo-600 text-white hover:bg-indigo-700">
              <Plus size={18} className="mr-1.5" />
              Add Unit
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider w-16">ID</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Unit Name</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Short Name</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-right w-28">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUnits.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-slate-400">No units found</td>
                  </tr>
                ) : (
                  filteredUnits.map((unit) => (
                    <tr key={unit.id}>
                      <td className="px-6 py-4 text-slate-600">#{unit.id}</td>
                      <td className="px-6 py-4 text-slate-800 font-medium">{unit.name}</td>
                      <td className="px-6 py-4 text-slate-700 font-mono">{unit.short_name}</td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(unit)}
                          title="Click to toggle status"
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer hover:scale-105 active:scale-95 shadow-xs ${unit.is_active ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-rose-100 text-rose-700 border border-rose-200'}`}
                        >
                          {unit.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button 
                          onClick={() => openEditModal(unit)} 
                          className="h-8.5 w-8.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-none transition-all p-0 flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 shadow-xs"
                          title="Edit Unit"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">{editingUnit ? 'Edit Unit' : 'Create Unit'}</h2>
                <p className="text-sm text-slate-500">Set unit details and active status.</p>
              </div>
              <button type="button" onClick={closeModal} className="text-slate-500 hover:text-slate-900 rounded-full p-2">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 px-6 py-5">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="unit-name" className="text-xs font-bold text-slate-500 uppercase">Unit Name</Label>
                  <Input
                    id="unit-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Pieces"
                    required
                    className="rounded-xl h-9 border-slate-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit-short-name" className="text-xs font-bold text-slate-500 uppercase">Short Name</Label>
                  <Input
                    id="unit-short-name"
                    type="text"
                    value={shortName}
                    onChange={(e) => setShortName(e.target.value)}
                    placeholder="e.g. pcs"
                    required
                    className="rounded-xl h-9 border-slate-200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit-status" className="text-xs font-bold text-slate-500 uppercase">Status</Label>
                <div className="relative">
                  <Select
                    id="unit-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="rounded-xl h-9 border-slate-200"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button type="button" onClick={closeModal} variant="ghost" className="h-9 rounded-xl border border-slate-200">
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="h-9 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700">
                  {isSubmitting ? 'Saving...' : editingUnit ? 'Update Unit' : 'Create Unit'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
