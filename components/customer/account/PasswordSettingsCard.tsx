"use client";

import { useState, useEffect } from "react";
import { Lock, Eye, EyeOff, KeyRound, ShieldCheck, Loader2, Check, AlertCircle, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { sendPasswordOtpApi, updatePasswordApi, CustomerProfile } from "@/lib/api/customerProfile";

interface PasswordSettingsCardProps {
  profile: CustomerProfile;
  onPasswordUpdated?: () => void;
}

export function PasswordSettingsCard({ profile, onPasswordUpdated }: PasswordSettingsCardProps) {
  const hasPassword = profile.has_password ?? false;
  const [method, setMethod] = useState<"current_password" | "otp">(
    hasPassword ? "current_password" : "otp"
  );

  // Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // OTP State
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  // Submitting & Feedback State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendOtp = async () => {
    setErrorMessage("");
    setIsSendingOtp(true);

    try {
      const res = await sendPasswordOtpApi();
      if (res.success) {
        setOtpSent(true);
        setCountdown(60);
        const devOtpMsg = res.resources?.dev_otp ? ` (Dev OTP: ${res.resources.dev_otp})` : "";
        toast.success(`Verification code sent to ${profile.phone}!${devOtpMsg}`, {
          duration: 6000,
          style: { background: "#18181b", color: "#f4f4f5", border: "1px solid #27272a" },
        });
      } else {
        setErrorMessage(res.message || "Failed to send verification code.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected error occurred.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (newPassword.length < 6) {
      setErrorMessage("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage("New password and confirm password do not match.");
      return;
    }

    if (method === "current_password" && hasPassword && !currentPassword) {
      setErrorMessage("Please enter your current password.");
      return;
    }

    if (method === "otp" && !otp.trim()) {
      setErrorMessage("Please enter the 6-digit OTP verification code.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: { current_password?: string; otp?: string; new_password: string } = {
        new_password: newPassword,
      };

      if (method === "current_password" && hasPassword) {
        payload.current_password = currentPassword;
      } else if (method === "otp") {
        payload.otp = otp.trim();
      }

      const res = await updatePasswordApi(payload);
      if (res.success) {
        toast.success("Password updated successfully!", {
          style: { background: "#18181b", color: "#f4f4f5", border: "1px solid #27272a" },
        });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setOtp("");
        setOtpSent(false);
        if (onPasswordUpdated) onPasswordUpdated();
      } else {
        setErrorMessage(res.message || "Failed to update password.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to update password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 shadow-xs">
      <div className="border-b border-zinc-100 pb-5 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-zinc-900">Security & Password</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Set or update your account password using your old password or SMS OTP.
            </p>
          </div>
          <span
            className={`self-start text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
              hasPassword
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
            }`}
          >
            {hasPassword ? "Password Active" : "No Password Set (OTP Only)"}
          </span>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle size={15} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Method Tabs */}
      <div className="grid grid-cols-2 bg-zinc-100 p-1 rounded-xl mb-6 text-xs font-semibold">
        <button
          type="button"
          onClick={() => {
            setMethod("otp");
            setErrorMessage("");
          }}
          className={`py-2 rounded-lg transition-all text-center ${
            method === "otp"
              ? "bg-white text-zinc-900 shadow-xs"
              : "text-zinc-600 hover:text-zinc-900"
          }`}
        >
          Verify with Mobile OTP
        </button>
        <button
          type="button"
          onClick={() => {
            setMethod("current_password");
            setErrorMessage("");
          }}
          className={`py-2 rounded-lg transition-all text-center ${
            method === "current_password"
              ? "bg-white text-zinc-900 shadow-xs"
              : "text-zinc-600 hover:text-zinc-900"
          }`}
        >
          Use Old Password
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Method 1: OTP Flow */}
        {method === "otp" && (
          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-semibold text-zinc-800 block">
                  Verify via Mobile Number
                </span>
                <span className="text-[11px] text-zinc-500">
                  A verification code will be sent to <strong>{profile.phone}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isSendingOtp || countdown > 0}
                className="px-4 py-2 bg-[#BA478F] hover:bg-[#A33D7D] disabled:opacity-60 text-white text-xs font-semibold rounded-xl transition-colors shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isSendingOtp ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Sending Code...</span>
                  </>
                ) : countdown > 0 ? (
                  <span>Resend in {countdown}s</span>
                ) : (
                  <>
                    <span>{otpSent ? "Resend OTP" : "Send OTP"}</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>

            {otpSent && (
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  Enter 6-Digit Verification Code <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                    <ShieldCheck size={16} />
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    className="w-full pl-10 pr-4 py-2 text-base font-mono tracking-widest bg-white border border-zinc-300 rounded-xl focus:outline-none focus:border-[#BA478F] focus:ring-1 focus:ring-[#BA478F] text-zinc-900 placeholder:text-zinc-400"
                    required
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Method 2: Current Password */}
        {method === "current_password" && (
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
              Current Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                <KeyRound size={15} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                className="w-full pl-10 pr-10 py-2 text-sm bg-white border border-zinc-300 rounded-xl focus:outline-none focus:border-[#BA478F] focus:ring-1 focus:ring-[#BA478F] text-zinc-900 placeholder:text-zinc-400"
                required={hasPassword}
              />
            </div>
            {!hasPassword && (
              <p className="text-[11px] text-amber-600 mt-1">
                You do not have a password set yet. Please switch to the &quot;Verify with Mobile OTP&quot; tab.
              </p>
            )}
          </div>
        )}

        {/* New Password & Confirm Password */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
              New Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                <Lock size={15} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full pl-10 pr-10 py-2 text-sm bg-white border border-zinc-300 rounded-xl focus:outline-none focus:border-[#BA478F] focus:ring-1 focus:ring-[#BA478F] text-zinc-900 placeholder:text-zinc-400"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-600"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
              Confirm New Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                <Lock size={15} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type new password"
                className="w-full pl-10 pr-10 py-2 text-sm bg-white border border-zinc-300 rounded-xl focus:outline-none focus:border-[#BA478F] focus:ring-1 focus:ring-[#BA478F] text-zinc-900 placeholder:text-zinc-400"
                required
              />
            </div>
          </div>
        </div>

        {/* Submit Action */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-[#BA478F] hover:bg-[#A33D7D] disabled:opacity-70 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              <>
                <Check size={16} />
                <span>Save Password</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
