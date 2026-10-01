"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { showToast } from "@/context/ToastContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AlertCircle, ArrowLeft, CheckCircle2, Lock, Globe } from "lucide-react";
import Link from "next/link";

interface EditListingPageProps {
  params: Promise<{ id: string }>;
}

export default function EditListingPage({ params }: EditListingPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();

  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    condition: "GOOD",
    transactionType: "SELL",
    categoryId: "",
    status: "AVAILABLE",
    campusOnly: true,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch(`/api/listings/${id}`).then((r) => r.json()),
    ])
      .then(([catRes, listRes]) => {
        if (catRes.data) setCategories(catRes.data);
        if (listRes.data) {
          const l = listRes.data;
          setFormData({
            title: l.title,
            description: l.description,
            price: l.price.toString(),
            condition: l.condition,
            transactionType: l.transactionType,
            categoryId: l.categoryId,
            status: l.status,
            campusOnly: l.campusOnly !== undefined ? l.campusOnly : true,
          });
        }
      })
      .catch((e) => {
        console.error("Load error:", e);
        setServerError("Failed to load listing details");
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/listings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price || "0"),
          condition: formData.condition,
          transactionType: formData.transactionType,
          categoryId: formData.categoryId,
          status: formData.status,
          campusOnly: formData.campusOnly,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        const errorMsg = json.error || "Failed to update listing";
        setServerError(errorMsg);
        showToast(errorMsg, "error");
        return;
      }

      showToast("Item updated successfully", "success");
      setSuccess(true);
      setTimeout(() => {
        router.push(`/listings/${id}`);
      }, 1000);
    } catch {
      const errorMsg = "Network error updating listing";
      setServerError(errorMsg);
      showToast(errorMsg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-12 text-center text-sm text-zinc-500">Loading listing details...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto py-6 space-y-4">
      <Link href={`/listings/${id}`} className="text-xs font-semibold text-zinc-500 hover:text-indigo-600 flex items-center gap-1">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Listing
      </Link>

      <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-10 shadow-xs space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Edit Listing</h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Update pricing, item details, or change availability status
          </p>
        </div>

        {serverError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Listing updated successfully! Redirecting...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-zinc-700">Category</label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-zinc-300 bg-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-zinc-700">Availability Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-zinc-300 bg-white"
              >
                <option value="AVAILABLE">Available</option>
                <option value="RESERVED">Reserved</option>
                <option value="SOLD">Sold</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-zinc-700">Condition</label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-zinc-300 bg-white"
              >
                <option value="NEW">Brand New</option>
                <option value="LIKE_NEW">Like New</option>
                <option value="GOOD">Good</option>
                <option value="FAIR">Fair</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-zinc-700">Transaction Type</label>
              <select
                name="transactionType"
                value={formData.transactionType}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-zinc-300 bg-white"
              >
                <option value="SELL">Sell Only</option>
                <option value="EXCHANGE">Exchange Only</option>
                <option value="BOTH">Sell or Exchange</option>
              </select>
            </div>

            <Input
              label="Price (₹)"
              name="price"
              type="number"
              min={0}
              value={formData.price}
              onChange={handleChange}
              disabled={formData.transactionType === "EXCHANGE"}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-700">Description</label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-zinc-300 bg-white"
              required
            />
          </div>

          {/* Campus Restriction Scope */}
          <div className="space-y-3 p-4 sm:p-5 rounded-2xl bg-zinc-50 border border-zinc-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <label className="block text-sm font-semibold text-zinc-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600" />
                Campus Restriction &amp; Visibility
              </label>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full self-start sm:self-auto">
                Campus Isolation
              </span>
            </div>
            <p className="text-xs text-zinc-500">
              Decide whether this listing is exclusively restricted to your college campus or open to multi-college discovery.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Option 1: Strictly My Campus Only */}
              <div
                onClick={() => setFormData({ ...formData, campusOnly: true })}
                className={`relative p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                  formData.campusOnly
                    ? "border-emerald-500 bg-emerald-50/50 shadow-xs"
                    : "border-zinc-200 bg-white hover:border-zinc-300"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    formData.campusOnly ? "bg-emerald-600 text-white" : "bg-zinc-100 text-zinc-600"
                  }`}>
                    <Lock className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-sm font-bold text-zinc-900">
                        Restricted to My Campus
                      </span>
                      {formData.campusOnly && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                    </div>
                    <span className="inline-block mt-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                      Recommended
                    </span>
                    <p className="text-xs text-zinc-600 mt-1.5 leading-relaxed">
                      Only verified students from your campus can view and buy this item for safe on-campus handover.
                    </p>
                  </div>
                </div>
              </div>

              {/* Option 2: Multi-College Discovery */}
              <div
                onClick={() => setFormData({ ...formData, campusOnly: false })}
                className={`relative p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                  !formData.campusOnly
                    ? "border-indigo-500 bg-indigo-50/50 shadow-xs"
                    : "border-zinc-200 bg-white hover:border-zinc-300"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    !formData.campusOnly ? "bg-indigo-600 text-white" : "bg-zinc-100 text-zinc-600"
                  }`}>
                    <Globe className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-sm font-bold text-zinc-900">
                        Multi-College Discovery
                      </span>
                      {!formData.campusOnly && (
                        <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                      )}
                    </div>
                    <span className="inline-block mt-0.5 text-[10px] font-semibold text-zinc-600 bg-zinc-200/70 px-1.5 py-0.5 rounded">
                      Inter-College
                    </span>
                    <p className="text-xs text-zinc-600 mt-1.5 leading-relaxed">
                      Visible in catalogs across partner institutions (LIET, AKTU, NIT).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
            <Link href={`/listings/${id}`}>
              <Button variant="ghost" type="button">
                Cancel
              </Button>
            </Link>
            <Button type="submit" isLoading={isSubmitting} className="rounded-xl font-semibold">
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
