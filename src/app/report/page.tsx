"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

function ReportForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const targetType = searchParams.get("type") === "USER" ? "USER" : "LISTING";
  const targetId = searchParams.get("targetId") || "";

  const [reason, setReason] = useState("Suspected counterfeit or prohibited campus item");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const reasons = [
    "Suspected counterfeit or prohibited campus item",
    "Misleading product description or false condition",
    "Unreasonable pricing or suspected price gouging",
    "Suspicious outside-campus payment request / phishing",
    "Harassment or inappropriate behavior in messages",
    "Item already sold or inactive duplicate listing",
    "Other campus policy violation",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push("/login");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType,
          targetListingId: targetType === "LISTING" ? targetId : undefined,
          targetUserId: targetType === "USER" ? targetId : undefined,
          reason,
          details,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Failed to submit report");
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Network error submitting report");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4 bg-white p-8 rounded-3xl border border-zinc-200">
        <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
        <h2 className="text-xl font-bold text-zinc-900">Report Submitted</h2>
        <p className="text-sm text-zinc-500">
          Thank you for keeping CampusConnect safe. Our student council moderators and administrators will review this report promptly.
        </p>
        <div className="pt-2">
          <Link href="/browse">
            <Button size="sm">Return to Marketplace</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-8">
      <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-10 shadow-xs space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
              Report {targetType === "USER" ? "Student Account" : "Marketplace Listing"}
            </h1>
            <p className="text-xs text-zinc-500">Confidential report to campus council moderation</p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-700">Violation Reason</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-zinc-300 bg-white"
            >
              {reasons.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-700">
              Additional Details / Evidence <span className="text-zinc-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={4}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Provide context regarding the issue (e.g. seller demanded off-campus UPI transfer upfront, item is damaged, etc.)..."
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-zinc-300 bg-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <Button
            type="submit"
            variant="destructive"
            size="lg"
            isLoading={isSubmitting}
            className="w-full rounded-xl font-semibold mt-2"
          >
            Submit Report for Campus Review
          </Button>

          <p className="text-center text-xs text-zinc-400 pt-2">
            False or malicious reports violate university student conduct codes.
          </p>
        </form>
      </div>
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading report form...</div>}>
      <ReportForm />
    </Suspense>
  );
}
