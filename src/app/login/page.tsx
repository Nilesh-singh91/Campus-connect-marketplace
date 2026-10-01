"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GraduationCap, AlertCircle, KeyRound, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { showToast } from "@/context/ToastContext";

export default function LoginPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in both email and password");
      showToast("Please fill in both email and password", "error");
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();

      if (!res.ok) {
        const errorMsg = json.error || "Login failed";
        setError(errorMsg);
        showToast(errorMsg, "error");
        return;
      }

      showToast("Login successful! Welcome back.", "success");
      await refreshUser();
      router.push("/browse");
    } catch {
      const errorMsg = "Network error. Please try again.";
      setError(errorMsg);
      showToast(errorMsg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError("");
  };

  return (
    <div className="max-w-md mx-auto py-10 sm:py-16">
      <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-10 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Student & Staff Login</h1>
          <p className="text-xs sm:text-sm text-zinc-500">Sign in with your verified campus credentials</p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="College Email"
            type="email"
            name="email"
            placeholder="student@liet.in, @aktu.in, or @college.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" size="lg" isLoading={isLoading} className="w-full rounded-xl font-semibold mt-2">
            Sign In
          </Button>

          <p className="text-center text-xs text-zinc-500 pt-1">
            New student on campus?{" "}
            <Link href="/register" className="text-indigo-600 font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </form>

        {/* Multi-College Demo Accounts Panel */}
        <div className="pt-4 border-t border-zinc-100 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700">
            <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
            <span>1-Click Test Logins (Verify Campus Isolation):</span>
          </div>

          <div className="space-y-1.5">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickDemo("aman@liet.in", "Campus@1234")}
                className="p-2 rounded-xl border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100 text-left transition-colors cursor-pointer"
              >
                <p className="font-bold text-indigo-900 flex items-center gap-1">
                  🏛️ Lloyd Student
                </p>
                <p className="text-[10px] text-indigo-700 truncate font-mono">aman@liet.in</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo("sneha@aktu.in", "Campus@1234")}
                className="p-2 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100 text-left transition-colors cursor-pointer"
              >
                <p className="font-bold text-emerald-900 flex items-center gap-1">
                  🏛️ AKTU Student
                </p>
                <p className="text-[10px] text-emerald-700 truncate font-mono">sneha@aktu.in</p>
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => handleQuickDemo("aarav@college.edu", "Campus@1234")}
                className="p-1.5 rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-left transition-colors cursor-pointer"
              >
                <p className="font-semibold text-zinc-800 text-[11px]">NIT Student</p>
                <p className="text-[9px] text-zinc-500 truncate">aarav@...</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo("moderator@college.edu", "Campus@1234")}
                className="p-1.5 rounded-lg border border-amber-200 bg-amber-50/50 hover:bg-amber-100 text-left transition-colors cursor-pointer"
              >
                <p className="font-semibold text-amber-800 text-[11px]">Moderator</p>
                <p className="text-[9px] text-zinc-500 truncate">moderator@...</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo("admin@college.edu", "Campus@1234")}
                className="p-1.5 rounded-lg border border-purple-200 bg-purple-50/50 hover:bg-purple-100 text-left transition-colors cursor-pointer"
              >
                <p className="font-semibold text-purple-800 text-[11px]">Admin</p>
                <p className="text-[9px] text-zinc-500 truncate">admin@...</p>
              </button>
            </div>
          </div>
          <p className="text-[10px] text-zinc-400 italic text-center">Password for all test accounts: Campus@1234</p>
        </div>
      </div>
    </div>
  );
}
