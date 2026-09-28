"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import {
  Store,
  Mail,
  Phone,
  MapPin,
  Globe,
  Facebook,
  Instagram,
  Youtube,
  Upload,
  Trash2,
  Check,
  AlertCircle,
  X,
  Loader2,
  FileText,
  Save,
  ExternalLink,
  Copy,
  ArrowRight,
} from "lucide-react";
import { getStoreSetup, updateStoreSetup, deleteStoreLogo, StoreSetup } from "@/lib/api/storeSetup";
import { getDivisions, getDistricts, getUpazilas, Division, District, Upazila } from "@/lib/api/locations";

const TiktokIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

interface BusinessProfileClientProps {
  initialStoreSetup: StoreSetup | null;
}

export default function BusinessProfileClient({ initialStoreSetup }: BusinessProfileClientProps) {
  const router = useRouter();

  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [storeName, setStoreName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [binNumber, setBinNumber] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [divisionId, setDivisionId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [upazilaId, setUpazilaId] = useState("");

  const [divisions, setDivisions] = useState<Division[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [upazilas, setUpazilas] = useState<Upazila[]>([]);
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [youtube, setYoutube] = useState("");
  const [tiktok, setTiktok] = useState("");

  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isRemovingLogo, setIsRemovingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialStoreSetup) {
      setStoreName(initialStoreSetup.store_name || "");
      setEmail(initialStoreSetup.email || "");
      setPhone(initialStoreSetup.phone || "");
      setBinNumber(initialStoreSetup.bin_number || "");
      setContactPerson(initialStoreSetup.contact_person || "");
      setStreetAddress(initialStoreSetup.street_address || "");
      setDivisionId(initialStoreSetup.division_id ? String(initialStoreSetup.division_id) : "");
      setDistrictId(initialStoreSetup.district_id ? String(initialStoreSetup.district_id) : "");
      setUpazilaId(initialStoreSetup.upazila_id ? String(initialStoreSetup.upazila_id) : "");
      setFacebook(initialStoreSetup.facebook || "");
      setInstagram(initialStoreSetup.instagram || "");
      setYoutube(initialStoreSetup.youtube || "");
      setTiktok(initialStoreSetup.tiktok || "");
      setLogoUrl(initialStoreSetup.logo || null);
    }
  }, [initialStoreSetup]);

  useEffect(() => {
    getDivisions().then((res) => {
      if (res.success) setDivisions(res.resources);
    });
  }, []);

  useEffect(() => {
    if (!divisionId) {
      setDistricts([]);
      setDistrictId("");
      return;
    }
    getDistricts(Number(divisionId)).then((res) => {
      if (res.success) setDistricts(res.resources);
    });
  }, [divisionId]);

  useEffect(() => {
    if (!districtId) {
      setUpazilas([]);
      setUpazilaId("");
      return;
    }
    getUpazilas(Number(districtId)).then((res) => {
      if (res.success) setUpazilas(res.resources);
    });
  }, [districtId]);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showNotification("error", "Logo size must be less than 2MB.");
      return;
    }

    setLogoFile(file);
    setLogoUrl(URL.createObjectURL(file));
  };

  const handleRemoveLogo = async () => {
    setIsRemovingLogo(true);
    const response = await deleteStoreLogo();
    setIsRemovingLogo(false);

    if (response.success) {
      setLogoUrl(null);
      setLogoFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      showNotification("success", "Logo removed successfully.");
    } else {
      showNotification("error", response.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("store_name", storeName || "");
    formData.append("email", email || "");
    formData.append("phone", phone || "");
    formData.append("bin_number", binNumber || "");
    formData.append("contact_person", contactPerson || "");
    formData.append("street_address", streetAddress || "");
    if (divisionId) formData.append("division_id", divisionId);
    if (districtId) formData.append("district_id", districtId);
    if (upazilaId) formData.append("upazila_id", upazilaId);
    formData.append("facebook", facebook || "");
    formData.append("instagram", instagram || "");
    formData.append("youtube", youtube || "");
    formData.append("tiktok", tiktok || "");
    if (logoFile) formData.append("logo", logoFile);

    const response = await updateStoreSetup(formData);

    setIsSubmitting(false);

    if (response.success) {
      showNotification("success", response.message || "Store setup updated successfully");
      setLogoFile(null);
      if (response.resources) {
        if (response.resources.logo) {
          setLogoUrl(response.resources.logo);
        }
      }
      router.refresh();
    } else {
      showNotification("error", response.message || "Failed to update store setup");
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
            type="button"
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-600 transition-colors ml-4"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <PageHeader title="Business Profile" />

    
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Side: Logo Uploader Card */}
        <div className="space-y-6 lg:col-span-1">
          <Card className="overflow-hidden border border-slate-100/80 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
            <CardHeader className="py-5 bg-slate-50/20 border-b border-slate-100/50">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Store size={16} className="text-indigo-600" />
                Store Branding
              </h3>
            </CardHeader>
            <CardContent className="p-6 flex flex-col items-center">
              <div className="relative group w-32 h-32 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-all duration-300 hover:border-indigo-400">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Store Logo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center text-center p-4">
                    <Store className="h-10 w-10 text-slate-300 mb-1" />
                    <span className="text-[11px] text-slate-400 font-medium">No Logo</span>
                  </div>
                )}

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              <div className="mt-4 flex gap-2 w-full justify-center">
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-8 px-3 rounded-lg text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-none transition-all flex items-center gap-1.5"
                >
                  <Upload size={12} />
                  Upload
                </Button>
                {logoUrl && (
                  <Button
                    type="button"
                    onClick={handleRemoveLogo}
                    disabled={isRemovingLogo}
                    className="h-8 px-3 rounded-lg text-xs bg-rose-50 hover:bg-rose-100 text-rose-700 border-none transition-all flex items-center gap-1.5"
                  >
                    {isRemovingLogo ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                    Remove
                  </Button>
                )}
              </div>
              <p className="text-[10px] text-slate-400 text-center mt-3 leading-relaxed">
                Recommended: Square (512x512px).<br />Max 2MB (PNG, JPG, WEBP).
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Details forms */}
        <div className="lg:col-span-2 space-y-6">

          {/* Company Info Card */}
          <Card className="overflow-hidden border border-slate-100/80 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
            <CardHeader className="py-5 bg-slate-50/20 border-b border-slate-100/50">
              <h3 className="text-sm font-bold text-slate-800">Store Information</h3>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="storeName" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Store Name</Label>
                  <Input
                    id="storeName"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="rounded-xl h-9.5 border-slate-200 focus-visible:ring-indigo-100 focus-visible:border-indigo-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPerson" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contact Person</Label>
                  <Input
                    id="contactPerson"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="rounded-xl h-9.5 border-slate-200 focus-visible:ring-indigo-100 focus-visible:border-indigo-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Mail size={12} className="text-slate-400" /> Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-xl h-9.5 border-slate-200 focus-visible:ring-indigo-100 focus-visible:border-indigo-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Phone size={12} className="text-slate-400" /> Phone
                  </Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="rounded-xl h-9.5 border-slate-200 focus-visible:ring-indigo-100 focus-visible:border-indigo-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="binNumber" className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText size={12} className="text-slate-400" /> BIN/Trade License
                  </Label>
                  <Input
                    id="binNumber"
                    value={binNumber}
                    onChange={(e) => setBinNumber(e.target.value)}
                    className="rounded-xl h-9.5 border-slate-200 focus-visible:ring-indigo-100 focus-visible:border-indigo-400"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Card */}
          <Card className="overflow-hidden border border-slate-100/80 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
            <CardHeader className="py-5 bg-slate-50/20 border-b border-slate-100/50">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <MapPin size={15} className="text-indigo-600" />
                Address Details
              </h3>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="streetAddress" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Street Address</Label>
                <Textarea
                  id="streetAddress"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  className="rounded-xl min-h-[70px] border-slate-200 focus-visible:ring-indigo-100 focus-visible:border-indigo-400"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="divisionId" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Division</Label>
                  <Select value={divisionId} onChange={(e) => { setDivisionId(e.target.value); setDistrictId(""); setUpazilaId(""); }}>
                    <option value="">Select Division</option>
                    {divisions.map((d) => (
                      <option key={d.id} value={d.id}>{d.name} ({d.bn_name})</option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="districtId" className="text-xs font-bold text-slate-500 uppercase tracking-wider">District</Label>
                  <Select value={districtId} onChange={(e) => { setDistrictId(e.target.value); setUpazilaId(""); }}>
                    <option value="">Select District</option>
                    {districts.map((d) => (
                      <option key={d.id} value={d.id}>{d.name} ({d.bn_name})</option>
                    ))}
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="upazilaId" className="text-xs font-bold text-slate-500 uppercase tracking-wider">Upazila</Label>
                <Select value={upazilaId} onChange={(e) => setUpazilaId(e.target.value)}>
                  <option value="">Select Upazila</option>
                  {upazilas.map((u) => (
                    <option key={u.id} value={u.id}>{u.name} ({u.bn_name})</option>
                  ))}
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Social Links Card */}
          <Card className="overflow-hidden border border-slate-100/80 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
            <CardHeader className="py-5 bg-slate-50/20 border-b border-slate-100/50">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Globe size={15} className="text-indigo-600" />
                Online Presence & Social Links
              </h3>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="facebook" className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Facebook size={12} className="text-blue-600" /> Facebook
                  </Label>
                  <Input
                    id="facebook"
                    placeholder="https://facebook.com/..."
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                    className="rounded-xl h-9.5 border-slate-200 focus-visible:ring-indigo-100 focus-visible:border-indigo-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagram" className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Instagram size={12} className="text-pink-600" /> Instagram
                  </Label>
                  <Input
                    id="instagram"
                    placeholder="https://instagram.com/..."
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    className="rounded-xl h-9.5 border-slate-200 focus-visible:ring-indigo-100 focus-visible:border-indigo-400"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="youtube" className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Youtube size={12} className="text-rose-600" /> YouTube
                  </Label>
                  <Input
                    id="youtube"
                    placeholder="https://youtube.com/c/..."
                    value={youtube}
                    onChange={(e) => setYoutube(e.target.value)}
                    className="rounded-xl h-9.5 border-slate-200 focus-visible:ring-indigo-100 focus-visible:border-indigo-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tiktok" className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <TiktokIcon className="w-3.5 h-3.5 text-slate-900" /> TikTok
                  </Label>
                  <Input
                    id="tiktok"
                    placeholder="https://tiktok.com/@..."
                    value={tiktok}
                    onChange={(e) => setTiktok(e.target.value)}
                    className="rounded-xl h-9.5 border-slate-200 focus-visible:ring-indigo-100 focus-visible:border-indigo-400"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-10 rounded-xl px-6 bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Settings
                </>
              )}
            </Button>
          </div>

        </div>

      </form>
    </div>
  );
}
