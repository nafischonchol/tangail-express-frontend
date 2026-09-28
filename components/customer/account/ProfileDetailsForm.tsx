"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { User, Mail, Phone, MapPin, Camera, Loader2, Check, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { CustomerProfile, updateCustomerProfileApi } from "@/lib/api/customerProfile";

interface ProfileDetailsFormProps {
  initialProfile: CustomerProfile;
  onProfileUpdated?: (updated: CustomerProfile) => void;
}

export function ProfileDetailsForm({ initialProfile, onProfileUpdated }: ProfileDetailsFormProps) {
  const [profile, setProfile] = useState<CustomerProfile>(initialProfile);
  const [name, setName] = useState(initialProfile.name || "");
  const [email, setEmail] = useState(initialProfile.email || "");
  const [phone, setPhone] = useState(initialProfile.phone || "");
  const [gender, setGender] = useState<string>(initialProfile.gender || "");
  const [address, setAddress] = useState(initialProfile.address || "");

  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialProfile.avatar || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      toast.error("Image file size must be less than 3MB.");
      return;
    }

    setAvatarFile(file);
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.trim();
    if (!cleanPhone) {
      setErrorMessage("Please enter your mobile phone number.");
      setIsSaving(false);
      return;
    }
    if (!/^01[3-9]\d{8}$/.test(cleanPhone) || cleanPhone.length !== 11) {
      setErrorMessage("Please enter a valid 11-digit mobile number (e.g. 017XXXXXXXX).");
      setIsSaving(false);
      return;
    }

    setErrorMessage("");
    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      if (email.trim()) formData.append("email", email.trim());
      formData.append("phone", cleanPhone);
      if (gender) formData.append("gender", gender);
      if (address.trim()) formData.append("address", address.trim());
      if (avatarFile) formData.append("avatar", avatarFile);

      const res = await updateCustomerProfileApi(formData);
      if (res.success && res.resources) {
        setProfile(res.resources);
        if (typeof window !== "undefined") {
          localStorage.setItem("customer_user", JSON.stringify(res.resources));
          window.dispatchEvent(new Event("customer-auth-changed"));
        }
        if (onProfileUpdated) onProfileUpdated(res.resources);
        toast.success("Profile updated successfully!", {
          style: { background: "#18181b", color: "#f4f4f5", border: "1px solid #27272a" },
        });
      } else {
        setErrorMessage(res.message || "Failed to update profile.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 shadow-xs">
      <div className="border-b border-zinc-100 pb-5 mb-6">
        <h2 className="text-base sm:text-lg font-bold text-zinc-900">Personal Information</h2>
        <p className="text-xs text-zinc-500 mt-0.5">
          Update your personal details, profile picture, and contact info.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle size={15} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 pb-6 border-b border-zinc-100">
          <div className="relative group">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-zinc-100 border-2 border-zinc-200 flex items-center justify-center relative shadow-xs">
              {avatarPreview ? (
                <Image
                  src={avatarPreview}
                  alt={name || "Avatar"}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <User size={36} className="text-zinc-400" />
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2 bg-[#BA478F] hover:bg-[#A33D7D] text-white rounded-full shadow-md transition-transform active:scale-95 cursor-pointer"
              title="Change Profile Photo"
            >
              <Camera size={14} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>

          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-zinc-900">Profile Picture</h4>
            <p className="text-xs text-zinc-500">
              Upload a clear JPEG, PNG, or WebP photo (Max 3MB).
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-semibold text-[#BA478F] hover:underline pt-1 inline-block"
            >
              Upload New Photo
            </button>
          </div>
        </div>

        {/* Input Fields Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                <User size={15} />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Full Name"
                className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-zinc-300 rounded-xl focus:outline-none focus:border-[#BA478F] focus:ring-1 focus:ring-[#BA478F] text-zinc-900 placeholder:text-zinc-400"
                required
              />
            </div>
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
              Mobile Number <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                <Phone size={15} />
              </div>
              <input
                type="tel"
                value={phone}
                maxLength={11}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                placeholder="017XXXXXXXX"
                className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-zinc-300 rounded-xl focus:outline-none focus:border-[#BA478F] focus:ring-1 focus:ring-[#BA478F] text-zinc-900 placeholder:text-zinc-400 font-mono"
                required
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
              Email Address <span className="text-zinc-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                <Mail size={15} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-zinc-300 rounded-xl focus:outline-none focus:border-[#BA478F] focus:ring-1 focus:ring-[#BA478F] text-zinc-900 placeholder:text-zinc-400"
              />
            </div>
          </div>

          {/* Gender Selector */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
              Gender <span className="text-zinc-400 font-normal">(Optional)</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Female", value: "female" },
                { label: "Male", value: "male" },
                { label: "Other", value: "other" },
              ].map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => setGender(g.value)}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                    gender === g.value
                      ? "bg-[#FDF2F8] border-[#BA478F] text-[#BA478F]"
                      : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
            Default Delivery Address <span className="text-zinc-400 font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <div className="absolute top-2.5 left-3.5 pointer-events-none text-zinc-400">
              <MapPin size={15} />
            </div>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
              placeholder="House/Street, Area, City, District"
              className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-zinc-300 rounded-xl focus:outline-none focus:border-[#BA478F] focus:ring-1 focus:ring-[#BA478F] text-zinc-900 placeholder:text-zinc-400 resize-none"
            />
          </div>
        </div>

        {/* Submit Action */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-[#BA478F] hover:bg-[#A33D7D] disabled:opacity-70 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Check size={16} />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
