"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ShieldCheck, CheckCircle2, AlertCircle, Mail } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, refreshUser } = useAuth();

  const [email, setEmail] = useState(searchParams.get("email") || user?.email || "");
  const [token, setToken] = useState(searchParams.get("code") || "");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("email")) {
      setEmail(searchParams.get("email")!);
    } else if (user?.email) {
      setEmail(user.email);
    }
    if (searchParams.get("code")) {
      setToken(searchParams.get("code")!);
    }
  }, [searchParams, user]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !token) {
      setMessage("Please provide both email address and verification code");
      setStatus("error");
      return;
    }

    try {
      setIsLoading(true);
      setStatus("idle");
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token }),
      });

      const json = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(json.error || "Verification failed");
        return;
      }

      setStatus("success");
      setMessage(json.message || "Email verified successfully!");
      await refreshUser();
      setTimeout(() => {
        router.push("/browse");
      }, 1500);
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="bg-white rounded-3xl border border-zinc-200 p-8 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mx-auto">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Verify College Email</h1>
          <p className="text-sm text-zinc-500">
            Confirm your campus email address to enable listing creation, peer trading, and in-app chat.
          </p>
        </div>

        {status === "error" && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {status === "success" && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-semibold">Verification Complete!</p>
              <p className="text-xs">Redirecting to marketplace...</p>
            </div>
          </div>
        )}

        {status !== "success" && (
          <form onSubmit={handleVerify} className="space-y-4">
            <Input
              label="College Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@college.edu"
              required
            />

            <Input
              label="Verification Code (OTP)"
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter 6-digit code (e.g. 123456)"
              helperText="For demo/local testing, any registered code or '123456' is accepted."
              required
            />

            <Button type="submit" size="lg" isLoading={isLoading} className="w-full rounded-xl font-semibold mt-2">
              Verify College ID
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading verification...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
