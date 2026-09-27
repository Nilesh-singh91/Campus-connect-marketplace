"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ShieldCheck, CheckCircle2, AlertCircle, User, Lock } from "lucide-react";

export default function SettingsPage() {
  const { user, refreshUser, isLoading: isAuthLoading } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    branch: "",
    yearOfStudy: 1,
    phone: "",
    bio: "",
    avatarUrl: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    if (user?.id) {
      fetch(`/api/users/${user.id}`)
        .then((r) => r.json())
        .then((json) => {
          if (json.data?.profile) {
            const p = json.data.profile;
            setFormData({
              fullName: p.fullName || "",
              branch: p.branch || "",
              yearOfStudy: p.yearOfStudy || 1,
              phone: p.phone || "",
              bio: p.bio || "",
              avatarUrl: p.avatarUrl || "",
            });
          }
        })
        .finally(() => setIsLoading(false));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setIsSubmitting(true);
      setStatus("idle");

      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          branch: formData.branch,
          yearOfStudy: Number(formData.yearOfStudy),
          phone: formData.phone || null,
          bio: formData.bio || null,
          avatarUrl: formData.avatarUrl || null,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMessage(json.error || "Failed to update profile");
        return;
      }

      setStatus("success");
      setMessage("Student profile updated successfully");
      await refreshUser();
    } catch {
      setStatus("error");
      setMessage("Network error saving profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthLoading || isLoading) {
    return <div className="p-12 text-center text-sm text-zinc-500">Loading settings...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto py-6 space-y-6">
      <div className="pb-4 border-b border-zinc-200">
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">Account & Profile Settings</h1>
        <p className="text-sm text-zinc-500 mt-1">Manage your campus identity, contact info, and bio</p>
      </div>

      {status === "success" && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {status === "error" && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 shadow-xs space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Branch / Department"
              name="branch"
              value={formData.branch}
              onChange={handleChange}
            />

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-zinc-700">Year of Study</label>
              <select
                name="yearOfStudy"
                value={formData.yearOfStudy}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-zinc-300 bg-white"
              >
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
                <option value="5">5th Year</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Contact Phone (Optional)"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 98765 43210"
            />
            <Input
              label="Avatar Image URL (Optional)"
              name="avatarUrl"
              value={formData.avatarUrl}
              onChange={handleChange}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-700">Bio</label>
            <textarea
              name="bio"
              rows={3}
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell other students what semester books you buy/sell or which hostel you stay in..."
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-zinc-300 bg-white placeholder:text-zinc-400"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" isLoading={isSubmitting} className="rounded-xl font-semibold">
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>

      {/* Account Info Box */}
      <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-xs space-y-3">
        <h3 className="font-semibold text-zinc-900 text-sm">College Credentials & Role</h3>
        <div className="text-xs text-zinc-500 space-y-1">
          <p>
            Email: <strong className="text-zinc-800">{user?.email}</strong>
          </p>
          <p>
            Role: <strong className="text-zinc-800 uppercase">{user?.role}</strong>
          </p>
          <p>
            Verification:{" "}
            <strong className={user?.isEmailVerified ? "text-emerald-600" : "text-amber-600"}>
              {user?.isEmailVerified ? "Verified College Student" : "Pending Verification"}
            </strong>
          </p>
        </div>
      </div>
    </div>
  );
}
