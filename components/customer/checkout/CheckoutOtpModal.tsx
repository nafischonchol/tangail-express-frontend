"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  ShieldCheck,
  RefreshCw,
  Loader2,
  ArrowRight,
  Phone,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  sendCustomerOtp,
  loginWithOtpApi,
  persistCustomerSession,
  CustomerAuthData,
} from "@/lib/api/customerAuth";

interface CheckoutOtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  phone: string;
  customerName?: string;
  onVerificationSuccess: (authData: CustomerAuthData) => Promise<void> | void;
}

export function CheckoutOtpModal({
  isOpen,
  onClose,
  phone,
  customerName,
  onVerificationSuccess,
}: CheckoutOtpModalProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(60);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Send OTP when modal opens
  useEffect(() => {
    if (isOpen && phone) {
      setOtp(["", "", "", "", "", ""]);
      setErrorMessage("");
      handleSendOtp();
    }
  }, [isOpen, phone]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendOtp = async () => {
    const cleanPhone = phone.trim();
    if (!cleanPhone) return;

    setIsSending(true);
    setErrorMessage("");

    try {
      const res = await sendCustomerOtp(cleanPhone, "login");
      if (res.success) {
        setCountdown(60);
        if (res.resources?.dev_otp) {
          setDevOtp(res.resources.dev_otp);
        }
        toast.success("Verification code sent to your phone", {
          style: {
            background: "#18181b",
            color: "#f4f4f5",
            border: "1px solid #27272a",
          },
        });
        // Auto-focus first input
        setTimeout(() => {
          inputRefs.current[0]?.focus();
        }, 100);
      } else {
        setErrorMessage(
          res.message || "Failed to send verification code. Please try again.",
        );
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to send verification code.");
    } finally {
      setIsSending(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    // Only accept numeric
    const cleanValue = value.replace(/\D/g, "");

    if (cleanValue.length > 1) {
      // User pasted full OTP
      const pastedDigits = cleanValue.slice(0, 6).split("");
      const newOtp = [...otp];
      pastedDigits.forEach((d, i) => {
        if (i < 6) newOtp[i] = d;
      });
      setOtp(newOtp);
      const nextFocus = Math.min(pastedDigits.length, 5);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = cleanValue;
    setOtp(newOtp);

    // Auto move to next input
    if (cleanValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!pastedData) return;

    const newOtp = [...otp];
    pastedData.split("").forEach((char, idx) => {
      if (idx < 6) newOtp[idx] = char;
    });
    setOtp(newOtp);

    const focusIdx = Math.min(pastedData.length, 5);
    inputRefs.current[focusIdx]?.focus();
  };

  const fullOtp = otp.join("");

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage("");

    if (fullOtp.length !== 6) {
      setErrorMessage("Please enter the complete 6-digit OTP code.");
      return;
    }

    setIsVerifying(true);
    try {
      const res = await loginWithOtpApi(
        phone.trim(),
        fullOtp,
        customerName?.trim(),
      );

      if (res.success && res.resources) {
        persistCustomerSession(res.resources);
        toast.success("Mobile number verified successfully!", {
          style: {
            background: "#18181b",
            color: "#f4f4f5",
            border: "1px solid #27272a",
          },
        });
        await onVerificationSuccess(res.resources);
        onClose();
      } else {
        setErrorMessage(res.message || "Invalid or expired verification code.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl w-full max-w-md border border-zinc-200 shadow-xl overflow-hidden animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-800 flex items-center justify-center">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">
                Verify Mobile Number
              </h3>
              <p className="text-xs text-zinc-500">
                Confirm OTP to complete order
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isVerifying}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          <div className="text-center space-y-1">
            <p className="text-xs text-zinc-500">
              We have sent a 6-digit verification code to
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 text-zinc-900 text-sm font-medium">
              <Phone size={13} className="text-zinc-500" />
              <span>{phone}</span>
            </div>
          </div>

          {/* OTP Input Grid */}
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="flex items-center justify-center gap-2">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    inputRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  onPaste={idx === 0 ? handlePaste : undefined}
                  disabled={isVerifying}
                  className="w-11 h-12 text-center text-lg font-bold text-zinc-900 bg-zinc-50 border border-zinc-200 rounded-xl focus:border-zinc-900 focus:bg-white focus:outline-none transition-colors"
                />
              ))}
            </div>

            {errorMessage && (
              <p className="text-xs text-rose-600 text-center font-medium bg-rose-50 border border-rose-100 py-1.5 px-2 rounded-lg">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={isVerifying || fullOtp.length !== 6}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-950 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isVerifying ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Verifying & Placing Order...</span>
                </>
              ) : (
                <>
                  <span>Verify & Place Order</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Resend OTP */}
          <div className="text-center pt-1 border-t border-zinc-100">
            {countdown > 0 ? (
              <p className="text-xs text-zinc-500">
                Resend code in{" "}
                <span className="font-semibold text-zinc-700">
                  {countdown}s
                </span>
              </p>
            ) : (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isSending || isVerifying}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-800 hover:text-zinc-950 disabled:opacity-50"
              >
                <RefreshCw
                  size={13}
                  className={isSending ? "animate-spin" : ""}
                />
                <span>Resend Verification Code</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
