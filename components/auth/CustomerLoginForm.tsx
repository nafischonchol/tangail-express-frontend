"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Phone, Lock, Eye, EyeOff, Loader2, ArrowRight, ShieldCheck, Mail } from "lucide-react";
import toast from "react-hot-toast";
import {
  sendCustomerOtp,
  loginWithOtpApi,
  loginWithPasswordApi,
  persistCustomerSession,
} from "@/lib/api/customerAuth";
import { useCustomerAuth } from "@/lib/hooks/useCustomerAuth";

export function CustomerLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const redirectPath = redirectParam && redirectParam !== "/login" && redirectParam !== "/register" ? redirectParam : "/account";

  const { isLoggedIn, loading: authLoading } = useCustomerAuth();

  useEffect(() => {
    if (!authLoading && isLoggedIn) {
      router.replace(redirectPath);
    }
  }, [authLoading, isLoggedIn, router, redirectPath]);

  // Mode: "otp" | "password"
  const [authMode, setAuthMode] = useState<"otp" | "password">("otp");

  // OTP Mode State
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  // Password Mode State
  const [loginInput, setLoginInput] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // General Loading & Error State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Countdown timer effect
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage("");

    const cleanPhone = phone.trim();
    if (!cleanPhone) {
      setErrorMessage("Please enter your mobile number.");
      return;
    }

    setIsSendingOtp(true);
    try {
      const res = await sendCustomerOtp(cleanPhone, "login");
      if (res.success) {
        setOtpSent(true);
        setCountdown(60);
        const devOtpMsg = res.resources?.dev_otp ? ` (Dev OTP: ${res.resources.dev_otp})` : "";
        toast.success(`Verification code sent!${devOtpMsg}`, {
          duration: 6000,
          style: { background: "#18181b", color: "#f4f4f5", border: "1px solid #27272a" },
        });
      } else {
        setErrorMessage(res.message || "Failed to send verification code. Please try again.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected error occurred.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!otp.trim()) {
      setErrorMessage("Please enter the 6-digit OTP code.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await loginWithOtpApi(phone.trim(), otp.trim());
      if (res.success && res.resources?.token) {
        persistCustomerSession(res.resources);
        toast.success("Signed in successfully!", {
          style: { background: "#18181b", color: "#f4f4f5", border: "1px solid #27272a" },
        });
        router.push(redirectPath);
      } else {
        setErrorMessage(res.message || "Invalid or expired OTP code.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!loginInput.trim()) {
      setErrorMessage("Please enter your mobile number or email.");
      return;
    }
    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await loginWithPasswordApi(loginInput.trim(), password);
      if (res.success && res.resources?.token) {
        persistCustomerSession(res.resources);
        toast.success("Signed in successfully!", {
          style: { background: "#18181b", color: "#f4f4f5", border: "1px solid #27272a" },
        });
        router.push(redirectPath);
      } else {
        setErrorMessage(res.message || "Invalid credentials or account not active.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialClick = (provider: string) => {
    toast(`Social sign-in with ${provider} will be available soon.`, {
      icon: "ℹ️",
      style: { background: "#18181b", color: "#f4f4f5", border: "1px solid #27272a" },
    });
  };

  if (authLoading || isLoggedIn) {
    return (
      <div className="w-full max-w-md mx-auto bg-white border border-zinc-200 rounded-2xl p-12 shadow-xs flex flex-col items-center justify-center min-h-[320px] gap-3">
        <Loader2 className="animate-spin text-[#BA478F]" size={28} />
        <p className="text-xs text-zinc-500 font-medium">Redirecting to account...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 shadow-xs">
      {/* Brand Logo Header */}
      <div className="flex flex-col items-center justify-center mb-6">
        <Link href="/" className="inline-block transition-opacity hover:opacity-90 mb-2">
          <Image
            src="/logo.jpeg"
            alt="Tangail Express"
            width={320}
            height={96}
            className="h-20 sm:h-24 w-auto object-contain"
            priority
            unoptimized
          />
        </Link>
        <p className="text-xs sm:text-sm text-zinc-500 text-center">
          Sign in to access your orders and wishlist.
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="grid grid-cols-2 bg-zinc-100 p-1 rounded-xl mb-6 text-xs font-semibold">
        <button
          type="button"
          onClick={() => {
            setAuthMode("otp");
            setErrorMessage("");
          }}
          className={`py-2 rounded-lg transition-all text-center ${
            authMode === "otp"
              ? "bg-white text-zinc-900 shadow-xs"
              : "text-zinc-600 hover:text-zinc-900"
          }`}
        >
          Mobile OTP Login
        </button>
        <button
          type="button"
          onClick={() => {
            setAuthMode("password");
            setErrorMessage("");
          }}
          className={`py-2 rounded-lg transition-all text-center ${
            authMode === "password"
              ? "bg-white text-zinc-900 shadow-xs"
              : "text-zinc-600 hover:text-zinc-900"
          }`}
        >
          Password Login
        </button>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {errorMessage}
        </div>
      )}

      {/* Mode 1: Mobile & OTP */}
      {authMode === "otp" && (
        <>
          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                  Mobile Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                    <Phone size={16} />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01712345678"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-zinc-300 rounded-xl focus:outline-none focus:border-[#BA478F] focus:ring-1 focus:ring-[#BA478F] text-zinc-900 placeholder:text-zinc-400"
                    required
                    autoFocus
                  />
                </div>
                <p className="text-[11px] text-zinc-500 mt-1.5">
                  We will send a 6-digit verification code to this number.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSendingOtp}
                className="w-full py-2.5 bg-[#BA478F] hover:bg-[#A33D7D] disabled:opacity-70 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSendingOtp ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleOtpLogin} className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-zinc-700">
                    Enter Verification Code
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setOtp("");
                    }}
                    className="text-[11px] text-[#BA478F] hover:underline font-medium"
                  >
                    Change Number
                  </button>
                </div>

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
                    className="w-full pl-10 pr-4 py-2.5 text-base tracking-widest font-mono bg-white border border-zinc-300 rounded-xl focus:outline-none focus:border-[#BA478F] focus:ring-1 focus:ring-[#BA478F] text-zinc-900 placeholder:text-zinc-400"
                    required
                    autoFocus
                  />
                </div>
                <div className="flex justify-between items-center text-[11px] text-zinc-500 mt-2">
                  <span>Sent to {phone}</span>
                  {countdown > 0 ? (
                    <span className="text-zinc-400">Resend in {countdown}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSendOtp()}
                      disabled={isSendingOtp}
                      className="text-[#BA478F] hover:underline font-semibold"
                    >
                      Resend Code
                    </button>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-[#BA478F] hover:bg-[#A33D7D] disabled:opacity-70 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Verifying & Signing In...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>
          )}
        </>
      )}

      {/* Mode 2: Password Login */}
      {authMode === "password" && (
        <form onSubmit={handlePasswordLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
              Mobile Number or Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                <Mail size={16} />
              </div>
              <input
                type="text"
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                placeholder="01712345678 or name@domain.com"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-zinc-300 rounded-xl focus:outline-none focus:border-[#BA478F] focus:ring-1 focus:ring-[#BA478F] text-zinc-900 placeholder:text-zinc-400"
                required
                autoFocus
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-zinc-700">Password</label>
              <Link
                href="/forgot-password"
                className="text-[11px] text-[#BA478F] hover:underline font-medium"
              >
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                <Lock size={16} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 text-sm bg-white border border-zinc-300 rounded-xl focus:outline-none focus:border-[#BA478F] focus:ring-1 focus:ring-[#BA478F] text-zinc-900 placeholder:text-zinc-400"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-zinc-600"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-[#BA478F] hover:bg-[#A33D7D] disabled:opacity-70 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>
      )}

      {/* Social Login Options Divider */}
      <div className="relative my-6 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-200" />
        </div>
        <span className="relative bg-white px-3 text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
          Or continue with
        </span>
      </div>

      {/* Social Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => handleSocialClick("Google")}
          className="flex items-center justify-center gap-2 py-2 px-3 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Google</span>
        </button>

        <button
          type="button"
          onClick={() => handleSocialClick("Facebook")}
          className="flex items-center justify-center gap-2 py-2 px-3 border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          <span>Facebook</span>
        </button>
      </div>

      {/* Footer Switcher */}
      <div className="mt-6 pt-5 border-t border-zinc-100 text-center text-xs text-zinc-600">
        Don&apos;t have an account?{" "}
        <Link
          href={`/register${phone ? `?phone=${encodeURIComponent(phone)}` : ""}`}
          className="font-semibold text-[#BA478F] hover:underline"
        >
          Register now
        </Link>
      </div>
    </div>
  );
}
