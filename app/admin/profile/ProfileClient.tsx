"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  User,
  Mail,
  Phone,
  Lock,
  UploadCloud,
  Image as ImageIcon,
  X,
  Check,
  AlertCircle,
  Loader2,
  Save,
} from "lucide-react";
import { updateProfile, Profile } from "@/lib/api/profile";

interface ProfileClientProps {
  initialProfile: Profile | null;
}

export default function ProfileClient({ initialProfile }: ProfileClientProps) {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(initialProfile);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setEmail(profile.email);
      setPhone(profile.phone || "");
      setAvatarPreview(profile.avatar || null);
    }
  }, [profile]);

  useEffect(() => {
    setProfile(initialProfile);
  }, [initialProfile]);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleClearAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(profile?.avatar || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showNotification("error", "Name is required.");
      return;
    }

    if (!email.trim()) {
      showNotification("error", "Email is required.");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("phone", phone);

    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }

    const response = await updateProfile(formData);

    setIsSubmitting(false);

    if (response.success) {
      showNotification("success", response.message);
      router.refresh();
    } else {
      showNotification("error", response.message);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      showNotification("error", "Current password is required.");
      return;
    }

    if (!newPassword) {
      showNotification("error", "New password is required.");
      return;
    }

    if (newPassword !== confirmPassword) {
      showNotification("error", "New password and confirmation do not match.");
      return;
    }

    setIsPasswordSubmitting(true);

    const formData = new FormData();
    formData.append("current_password", currentPassword);
    formData.append("new_password", newPassword);
    formData.append("new_password_confirmation", confirmPassword);

    const response = await updateProfile(formData);

    setIsPasswordSubmitting(false);

    if (response.success) {
      showNotification("success", response.message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      showNotification("error", response.message);
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

      <PageHeader title="My Profile" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Avatar Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
              <ImageIcon size={16} className="text-indigo-600" />
              Profile Picture
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            {avatarPreview ? (
              <div className="relative group">
                <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-slate-100 bg-slate-50">
                  <img
                    src={avatarPreview}
                    alt="Avatar"
                    className="object-cover w-full h-full"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleClearAvatar}
                  className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white shadow-md border border-slate-200 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:border-rose-200 transition-all"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <div className="w-32 h-32 rounded-2xl bg-indigo-50 border-2 border-dashed border-indigo-200 flex items-center justify-center text-indigo-400">
                <User size={40} />
              </div>
            )}

            <div className="text-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                <UploadCloud size={14} />
                {avatarPreview ? "Change Photo" : "Upload Photo"}
              </button>
              <p className="text-[10px] text-slate-400 mt-1">PNG, JPG, WEBP up to 2MB</p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </CardContent>
        </Card>

        {/* Profile Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                <User size={16} className="text-indigo-600" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form id="info-form" onSubmit={handleInfoSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="profile-name" className="text-xs font-bold text-slate-500 uppercase">Full Name <span className="text-rose-500">*</span></Label>
                    <div className="relative">
                      <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="profile-name"
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="rounded-xl h-9 pl-10 border-slate-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profile-email" className="text-xs font-bold text-slate-500 uppercase">Email <span className="text-rose-500">*</span></Label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="profile-email"
                        type="email"
                        placeholder="john@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="rounded-xl h-9 pl-10 border-slate-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profile-phone" className="text-xs font-bold text-slate-500 uppercase">Phone</Label>
                    <div className="relative">
                      <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="profile-phone"
                        type="tel"
                        placeholder="+880 1XXX-XXXXXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="rounded-xl h-9 pl-10 border-slate-200"
                      />
                    </div>
                  </div>
                </div>
              </form>
            </CardContent>
            <div className="flex justify-end px-6 py-4 border-t border-slate-100 bg-slate-50/40">
              <Button
                type="submit"
                form="info-form"
                disabled={isSubmitting}
                className="h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/10"
              >
                {isSubmitting ? (
                  <><Loader2 size={16} className="animate-spin mr-2" />Saving...</>
                ) : (
                  <><Save size={16} className="mr-1.5" />Save Changes</>
                )}
              </Button>
            </div>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Lock size={16} className="text-indigo-600" />
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form id="password-form" onSubmit={handlePasswordSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="profile-current-password" className="text-xs font-bold text-slate-500 uppercase">Current Password</Label>
                  <Input
                    id="profile-current-password"
                    type="password"
                    placeholder="Enter current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="rounded-xl h-9 border-slate-200"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="profile-new-password" className="text-xs font-bold text-slate-500 uppercase">New Password</Label>
                    <Input
                      id="profile-new-password"
                      type="password"
                      placeholder="Min 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="rounded-xl h-9 border-slate-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-confirm-password" className="text-xs font-bold text-slate-500 uppercase">Confirm New Password</Label>
                    <Input
                      id="profile-confirm-password"
                      type="password"
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="rounded-xl h-9 border-slate-200"
                    />
                  </div>
                </div>
              </form>
            </CardContent>
            <div className="flex justify-end px-6 py-4 border-t border-slate-100 bg-slate-50/40">
              <Button
                type="submit"
                form="password-form"
                disabled={isPasswordSubmitting}
                className="h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/10"
              >
                {isPasswordSubmitting ? (
                  <><Loader2 size={16} className="animate-spin mr-2" />Updating...</>
                ) : (
                  <><Lock size={16} className="mr-1.5" />Update Password</>
                )}
              </Button>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
