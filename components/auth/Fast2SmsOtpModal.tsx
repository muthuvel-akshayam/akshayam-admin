"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface Fast2SmsOtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (phone: string) => void;
}

export default function Fast2SmsOtpModal({ isOpen, onClose, onSuccess }: Fast2SmsOtpModalProps) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [countdown, setCountdown] = useState(0);

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  if (!isOpen) return null;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val.length <= 10) setPhone(val);
  };

  const handleSendOtp = async () => {
    setError("");
    if (phone.length !== 10) {
      setError("சரியான 10 இலக்க எண்ணை உள்ளிடவும்");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (data.success) {
        setStep("otp");
        setSuccess(data.message);
        setCountdown(30);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("ஏதோ தவறு நடந்துவிட்டது, மீண்டும் முயற்சிக்கவும்");
    }
    setLoading(false);
  };

  const handleOtpChange = (index: number, value: string) => {
    const val = value.replace(/\D/g, "");
    if (!val) {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = val[val.length - 1]; // take last char if multiple
    setOtp(newOtp);

    if (index < 5 && val) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 6) return;

    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp: otpValue }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(data.message);
        setTimeout(() => {
          onSuccess(phone);
          onClose();
        }, 1500);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("ஏதோ தவறு நடந்துவிட்டது, மீண்டும் முயற்சிக்கவும்");
    }
    setLoading(false);
  };

  // Auto-submit OTP
  useEffect(() => {
    if (step === "otp" && otp.every((d) => d !== "") && otp.join("").length === 6) {
      handleVerifyOtp();
    }
  }, [otp]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900">OTP சரிபார்ப்பு</h2>
          <p className="mt-2 text-sm text-gray-600">
            {step === "phone"
              ? "உங்கள் மொபைல் எண்ணை சரிபார்க்கவும்"
              : `+91 ${phone} எண்ணிற்கு அனுப்பப்பட்ட குறியீட்டை உள்ளிடவும்`}
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            <AlertCircle size={18} />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-600">
            <CheckCircle2 size={18} />
            <p>{success}</p>
          </div>
        )}

        {step === "phone" ? (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                மொபைல் எண்
              </label>
              <div className="flex overflow-hidden rounded-lg border border-gray-300 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
                <span className="flex items-center bg-gray-50 px-3 text-gray-500 border-r border-gray-300 font-medium">
                  +91
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  className="w-full px-4 py-3 outline-none text-gray-900"
                  placeholder="9876543210"
                  autoFocus
                />
              </div>
            </div>

            <button
              onClick={handleSendOtp}
              disabled={loading || phone.length !== 10}
              className="w-full flex items-center justify-center rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  அனுப்பப்படுகிறது...
                </>
              ) : (
                "OTP பெறுக"
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-center gap-2">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={inputRefs[i]}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-12 h-14 rounded-lg border border-gray-300 text-center text-xl font-semibold text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              ))}
            </div>

            <button
              onClick={handleVerifyOtp}
              disabled={loading || otp.join("").length !== 6}
              className="w-full flex items-center justify-center rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  சரிபார்க்கப்படுகிறது...
                </>
              ) : (
                "சரிபார்க்கவும்"
              )}
            </button>

            <div className="text-center text-sm">
              <span className="text-gray-600">OTP வரவில்லையா? </span>
              {countdown > 0 ? (
                <span className="font-medium text-gray-400">
                  {countdown} வினாடிகளில் மீண்டும் அனுப்பு
                </span>
              ) : (
                <button
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
                >
                  மீண்டும் அனுப்பு
                </button>
              )}
            </div>
            
            <div className="text-center">
              <button
                onClick={() => {
                  setStep("phone");
                  setOtp(["", "", "", "", "", ""]);
                  setSuccess("");
                  setError("");
                }}
                className="text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                எண்ணை மாற்றவும்
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
