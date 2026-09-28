"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
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
  UploadCloud,
  Image as ImageIcon,
  ExternalLink,
} from "lucide-react";
import { createBanner, updateBanner, updateBannerStatus, getBannerTypes, Banner, BannerType } from "@/lib/api/banners";

interface BannersClientProps {
  initialBanners: Banner[];
}

export default function BannersClient({ initialBanners }: BannersClientProps) {
  const router = useRouter();

  const [banners, setBanners] = useState<Banner[]>(initialBanners);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  const [statusModalBanner, setStatusModalBanner] = useState<Banner | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [bannerTypes, setBannerTypes] = useState<BannerType[]>([]);
  const [shortDescription, setShortDescription] = useState("");
  const [redirectUrl, setRedirectUrl] = useState("");
  const [isActive, setIsActive] = useState("active");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setBanners(initialBanners);
  }, [initialBanners]);

  useEffect(() => {
    getBannerTypes().then(res => {
      if (res.success) setBannerTypes(res.resources);
    });
  }, []);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleOpenCreate = () => {
    setEditingBanner(null);
    setName("");
    setType("");
    setShortDescription("");
    setRedirectUrl("");
    setIsActive("active");
    setImageFile(null);
    setImagePreview(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setName(banner.name || "");
    setType(banner.type);
    setShortDescription(banner.short_description || "");
    setRedirectUrl(banner.redirect_url || "");
    setIsActive(banner.is_active ? "active" : "inactive");
    setImageFile(null);
    setImagePreview(banner.banner_image || null);
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleClearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!type) {
      showNotification("error", "Banner type is required.");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    if (name) {
      formData.append("name", name);
    }
    formData.append("type", type);
    formData.append("short_description", shortDescription);
    formData.append("redirect_url", redirectUrl);
    formData.append("is_active", isActive === "active" ? "1" : "0");

    if (imageFile) {
      formData.append("banner_image", imageFile);
    }

    let response;
    if (editingBanner) {
      response = await updateBanner(editingBanner.id, formData);
    } else {
      response = await createBanner(formData);
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

  const handleConfirmStatusChange = async () => {
    if (!statusModalBanner) return;
    setIsUpdatingStatus(true);

    const newStatus = !statusModalBanner.is_active;
    const response = await updateBannerStatus(statusModalBanner.id, newStatus);

    setIsUpdatingStatus(false);

    if (response.success) {
      showNotification("success", response.message);
      setBanners(prev => prev.map(b => b.id === statusModalBanner.id ? { ...b, is_active: newStatus } : b));
      setStatusModalBanner(null);
      router.refresh();
    } else {
      showNotification("error", response.message);
      setStatusModalBanner(null);
    }
  };

  const filteredBanners = banners.filter(banner =>
    (banner.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (banner.type_label || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRecommendedSize = (bannerType: string) => {
    switch (bannerType) {
      case "hero":
        return { size: "1920 × 800 px", ratio: "21:9 / 16:9", desc: "Top homepage slideshow banner" };
      case "promo":
        return { size: "1200 × 400 px", ratio: "3:1", desc: "Wide campaign banner card" };
      case "sidebar":
        return { size: "600 × 800 px", ratio: "3:4", desc: "Vertical sidebar banner widget" };
      case "popup":
        return { size: "800 × 800 px", ratio: "1:1", desc: "Modal popup announcement" };
      default:
        return { size: "1920 × 800 px", ratio: "16:9", desc: "High resolution image" };
    }
  };

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
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-600 transition-colors ml-4"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-6 bg-slate-50/30">
          <CardTitle className="text-xl font-bold text-slate-800">Banners</CardTitle>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <Input
                type="text"
                placeholder="Search by name or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-8 w-full rounded-xl bg-white border-slate-200"
              />
            </div>
            <Button onClick={handleOpenCreate} className="h-8 rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 bg-indigo-600 text-white hover:bg-indigo-700">
              <Plus size={18} className="mr-1.5" />
              Add Banner
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider w-16">ID</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Banner</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Redirect URL</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-right w-32">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBanners.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                          <ImageIcon size={24} />
                        </div>
                        <div>
                          <p className="text-base font-bold text-slate-700">No banners found</p>
                          <p className="text-sm text-slate-400 mt-1">Try refining your search or add a new banner to get started.</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredBanners.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/40 transition-colors group">
                      <td className="px-6 py-4.5 text-slate-500 font-medium">#{row.id}</td>
                      <td className="px-6 py-4.5">
                        <div className="flex items-center gap-3">
                          {row.banner_image ? (
                            <div className="w-16 h-10 rounded-lg overflow-hidden border border-slate-200 bg-white flex-shrink-0">
                              <img src={row.banner_image} alt={row.name || "Banner"} className="object-cover w-full h-full" />
                            </div>
                          ) : (
                            <div className="w-16 h-10 rounded-lg bg-slate-100 border border-slate-200 flex-shrink-0 flex items-center justify-center text-slate-400">
                              <ImageIcon size={16} />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4.5">
                        <p className="font-bold text-slate-800 text-sm">{row.name || <span className="text-slate-400 font-normal italic">N/A</span>}</p>
                      </td>
                      <td className="px-6 py-4.5">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 border border-indigo-100 text-indigo-700">
                          {row.type_label}
                        </span>
                      </td>
                      <td className="px-6 py-4.5">
                        {row.redirect_url ? (
                          <a
                            href={row.redirect_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-xs font-medium max-w-[200px] truncate"
                          >
                            <ExternalLink size={12} />
                            {row.redirect_url}
                          </a>
                        ) : (
                          <span className="text-slate-400 text-xs">No URL</span>
                        )}
                      </td>
                      <td className="px-6 py-4.5">
                        <button
                          type="button"
                          onClick={() => setStatusModalBanner(row)}
                          title={`Click to change status to ${row.is_active ? 'Inactive' : 'Active'}`}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-xs
                            ${row.is_active
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${row.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          {row.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4.5 text-right">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleOpenEdit(row)}
                          className="h-8.5 w-8.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-none transition-all p-0 flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 shadow-xs"
                          title="Edit Banner"
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

      {/* Banner Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <ImageIcon size={18} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">
                  {editingBanner ? 'Edit Banner' : 'Create Banner'}
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
                  <Label htmlFor="banner-name" className="text-xs font-bold text-slate-500 uppercase">Name</Label>
                  <Input
                    id="banner-name"
                    type="text"
                    placeholder="e.g. Summer Sale Banner (Optional)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-xl h-9 border-slate-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="banner-type" className="text-xs font-bold text-slate-500 uppercase">Type <span className="text-rose-500">*</span></Label>
                  <div className="relative">
                    <Select
                      id="banner-type"
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="rounded-xl h-9 border-slate-200 text-slate-700 bg-white"
                      required
                    >
                      <option value="">Select type...</option>
                      {bannerTypes.map((bt) => (
                        <option key={bt.value} value={bt.value}>{bt.label}</option>
                      ))}
                    </Select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="banner-url" className="text-xs font-bold text-slate-500 uppercase">Redirect URL</Label>
                  <Input
                    id="banner-url"
                    type="url"
                    placeholder="https://example.com/offer"
                    value={redirectUrl}
                    onChange={(e) => setRedirectUrl(e.target.value)}
                    className="rounded-xl h-9 border-slate-200"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="banner-status" className="text-xs font-bold text-slate-500 uppercase">Status</Label>
                  <div className="relative">
                    <Select
                      id="banner-status"
                      value={isActive}
                      onChange={(e) => setIsActive(e.target.value)}
                      className="rounded-xl h-9 border-slate-200 text-slate-700 bg-white"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </Select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="banner-short-desc" className="text-xs font-bold text-slate-500 uppercase">Short Description</Label>
                  <Textarea
                    id="banner-short-desc"
                    placeholder="Brief description (max 250 characters)"
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    maxLength={250}
                    rows={2}
                    className="rounded-xl border-slate-200 resize-none"
                  />
                  <p className="text-[10px] text-slate-400 text-right">{shortDescription.length}/250</p>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <Label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                    <ImageIcon size={12} className="text-slate-400" /> Banner Image
                  </Label>
                  {type && (
                    <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full">
                      Recommended: {getRecommendedSize(type).size} ({getRecommendedSize(type).ratio})
                    </span>
                  )}
                </div>

                {type && (
                  <p className="text-xs text-slate-500 bg-slate-50 border border-slate-100 p-2.5 rounded-xl flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />
                    <span><strong>{getRecommendedSize(type).desc}:</strong> Ideal resolution is <strong>{getRecommendedSize(type).size}</strong> for optimal visual clarity.</span>
                  </p>
                )}

                {imagePreview ? (
                  <div className="relative group/preview rounded-2xl border border-slate-200/60 bg-slate-50/50 p-3.5 flex items-center gap-4 transition-all hover:bg-slate-50">
                    <div className="relative w-24 h-16 rounded-xl overflow-hidden bg-white border border-slate-200 flex-shrink-0">
                      <img
                        src={imagePreview}
                        alt="Banner Preview"
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-700 truncate">
                        {imageFile ? imageFile.name : 'Current Banner Image'}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {imageFile ? `${(imageFile.size / 1024).toFixed(1)} KB` : 'Database Asset'}
                      </p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors mt-2 block"
                      >
                        Replace Image
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearImage}
                      className="w-8 h-8 rounded-full bg-slate-100 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center text-slate-400 transition-all shadow-sm flex-shrink-0 mr-1.5"
                      title="Remove Image"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:bg-slate-50/50 rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2"
                  >
                    <div className="w-11 h-11 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                      <UploadCloud size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700">Upload banner image</p>
                      <p className="text-xs text-slate-400 mt-0.5">Click to browse</p>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">
                      PNG, JPG, JPEG, or WEBP up to 5MB
                      {type && ` • Recommended: ${getRecommendedSize(type).size}`}
                    </p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
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
                    Save Banner
                  </>
                )}
              </Button>
            </div>

          </form>

        </div>
      )}

      {/* Status Update Confirmation Modal */}
      {statusModalBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 p-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0
                ${statusModalBanner.is_active ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                <AlertCircle size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Confirm Status Change
                </h3>
                <p className="text-xs text-slate-500">Banner #{statusModalBanner.id}</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Are you sure you want to change the status of this banner to{" "}
              <span className={`font-bold ${statusModalBanner.is_active ? 'text-rose-600' : 'text-emerald-600'}`}>
                {statusModalBanner.is_active ? "Inactive" : "Active"}
              </span>
              ?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStatusModalBanner(null)}
                disabled={isUpdatingStatus}
                className="h-9 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleConfirmStatusChange}
                disabled={isUpdatingStatus}
                className={`h-9 rounded-xl text-white shadow-lg ${
                  statusModalBanner.is_active
                    ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/10'
                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/10'
                }`}
              >
                {isUpdatingStatus ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Check size={16} className="mr-1.5" />
                    Confirm Update
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
