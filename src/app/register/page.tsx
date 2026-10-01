"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GraduationCap, ShieldCheck, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { showToast } from "@/context/ToastContext";

export default function RegisterPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    enrollmentNumber: "",
    branch: "Computer Science & Engineering",
    yearOfStudy: "3",
    phone: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const branches = [
    "Computer Science & Engineering",
    "Information Technology",
    "Electronics & Communication",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Chemical Engineering",
    "Biotechnology",
    "Master of Business Administration (MBA)",
    "Other Academic Department",
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.trim()) newErrors.email = "College email is required";
    if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    if (!formData.enrollmentNumber.trim()) newErrors.enrollmentNumber = "Enrollment number is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast("Please correct the form errors", "error");
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          enrollmentNumber: formData.enrollmentNumber,
          branch: formData.branch,
          yearOfStudy: Number(formData.yearOfStudy),
          phone: formData.phone || undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        const errorMsg = json.error || "Registration failed";
        setServerError(errorMsg);
        showToast(errorMsg, "error");
        if (json.details) {
          const fieldErrs: Record<string, string> = {};
          for (const k in json.details) {
            fieldErrs[k] = json.details[k][0];
          }
          setErrors(fieldErrs);
        }
        return;
      }

      showToast("Registration successful! Verify your college account.", "success");
      await refreshUser();
      // Redirect to verification screen with generated token pre-loaded for convenience
      router.push(`/verify-email?email=${encodeURIComponent(formData.email)}&code=${json.data?.verificationCode || ""}`);
    } catch {
      const errorMsg = "Network error. Please try again.";
      setServerError(errorMsg);
      showToast(errorMsg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6 sm:py-10">
      <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-10 shadow-sm space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">Create Student Account</h1>
          <p className="text-sm text-zinc-500 max-w-md mx-auto">
            Join your college peer marketplace. Please register using your official university or institute email ID.
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
            <ShieldCheck className="w-4 h-4" /> Supported: @liet.in (Lloyd), @aktu.in (AKTU), .edu, .ac.in
          </div>
        </div>

        {serverError && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Registration Failed</p>
              <p className="text-xs mt-0.5">{serverError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              name="fullName"
              placeholder="e.g. Aman Verma"
              value={formData.fullName}
              onChange={handleChange}
              error={errors.fullName}
              required
            />
            <Input
              label="College Email Address"
              name="email"
              type="email"
              placeholder="student@liet.in or @aktu.in"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              helperText="e.g. @liet.in (Lloyd), @aktu.in (AKTU), .edu, or .ac.in"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Enrollment / Roll Number"
              name="enrollmentNumber"
              placeholder="e.g. 2023CSE042"
              value={formData.enrollmentNumber}
              onChange={handleChange}
              error={errors.enrollmentNumber}
              required
            />
            <Input
              label="Contact Phone (Optional)"
              name="phone"
              type="tel"
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-zinc-700">Department / Branch</label>
              <select
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-zinc-300 bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {branches.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-zinc-700">Year of Study</label>
              <select
                name="yearOfStudy"
                value={formData.yearOfStudy}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-zinc-300 bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="1">1st Year (Freshman)</option>
                <option value="2">2nd Year (Sophomore)</option>
                <option value="3">3rd Year (Junior)</option>
                <option value="4">4th Year (Senior / Final)</option>
                <option value="5">5th Year (Dual Degree / Postgrad)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="Min. 8 chars, 1 uppercase, 1 number"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required
            />
            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="Re-enter password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              required
            />
          </div>

          <Button type="submit" size="lg" isLoading={isLoading} className="w-full rounded-xl mt-4 font-semibold">
            Create Campus Account
          </Button>

          <p className="text-center text-xs text-zinc-500 pt-2">
            Already registered?{" "}
            <Link href="/login" className="text-indigo-600 font-semibold hover:underline">
              Log in to your account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
