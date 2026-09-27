"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PlusCircle, Upload, X, AlertCircle, ShieldAlert, Sparkles, Image as ImageIcon, GraduationCap } from "lucide-react";
import Link from "next/link";

export default function CreateListingPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    condition: "GOOD",
    transactionType: "SELL",
    categoryId: "",
  });

  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((json) => {
        if (json.data && json.data.length > 0) {
          setCategories(json.data);
          setFormData((prev) => ({ ...prev, categoryId: json.data[0].id }));
        }
      })
      .catch((e) => console.error("Error fetching categories:", e));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 6) {
      setServerError("Maximum 6 images allowed per listing");
      return;
    }

    try {
      setIsUploading(true);
      setServerError("");

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const data = new FormData();
        data.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: data,
        });

        const json = await res.json();
        if (res.ok && json.data?.url) {
          setImages((prev) => [...prev, json.data.url]);
        } else {
          setServerError(json.error || "Failed to upload image");
          break;
        }
      }
    } catch {
      setServerError("Network error uploading image");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (formData.description.length < 10) newErrors.description = "Description must be at least 10 characters";
    if (images.length === 0) newErrors.images = "At least one product image is required";

    const priceNum = formData.transactionType === "EXCHANGE" ? 0 : parseFloat(formData.price || "0");
    if (formData.transactionType !== "EXCHANGE" && (isNaN(priceNum) || priceNum < 0)) {
      newErrors.price = "Valid price is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          price: priceNum,
          condition: formData.condition,
          transactionType: formData.transactionType,
          categoryId: formData.categoryId,
          images,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        if (json.details && typeof json.details === "object") {
          const fieldErrs: Record<string, string> = {};
          const errMsgs: string[] = [];
          for (const [k, v] of Object.entries(json.details)) {
            const msg = Array.isArray(v) ? v.join(", ") : String(v);
            fieldErrs[k] = msg;
            errMsgs.push(msg);
          }
          setErrors(fieldErrs);
          setServerError(errMsgs.length > 0 ? errMsgs.join(". ") : (json.error || "Validation error"));
        } else {
          setServerError(json.error || "Failed to create listing");
        }
        return;
      }

      router.push(`/listings/${json.data.id}`);
    } catch {
      setServerError("Network error creating listing");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthLoading) {
    return <div className="p-12 text-center text-sm text-zinc-500">Loading student session...</div>;
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4 bg-white p-8 rounded-3xl border border-zinc-200">
        <ShieldAlert className="w-12 h-12 text-indigo-600 mx-auto" />
        <h2 className="text-xl font-bold text-zinc-900">Student Login Required</h2>
        <p className="text-sm text-zinc-500">
          Only verified campus students can publish marketplace listings.
        </p>
        <Link href="/login" className="inline-block pt-2">
          <Button>Log In with College ID</Button>
        </Link>
      </div>
    );
  }

  if (!user.isEmailVerified) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4 bg-white p-8 rounded-3xl border border-amber-200">
        <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold text-zinc-900">Verification Required</h2>
        <p className="text-sm text-zinc-600">
          Your college email ({user.email}) must be verified before you can post listings on CampusConnect.
        </p>
        <Link href={`/verify-email?email=${encodeURIComponent(user.email)}`} className="inline-block pt-2">
          <Button variant="secondary">Verify College Email Now</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6">
      <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-10 shadow-xs space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-zinc-100 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">Post a Campus Listing</h1>
            <p className="text-sm text-zinc-500 mt-1">
              Sell or trade your used textbooks, drafters, gadgets, and supplies directly to students
            </p>
          </div>
          {user.collegeName && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold self-start sm:self-auto">
              <GraduationCap className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Campus: {user.collegeName.split("(")[0].trim()}</span>
            </div>
          )}
        </div>

        {serverError && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Images Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-zinc-800">
                Product Images <span className="text-rose-500">*</span>
              </label>
              <span className="text-xs text-zinc-400">{images.length} of 6 uploaded</span>
            </div>

            {/* Image Preview Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {images.map((url, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-zinc-200 group bg-zinc-50">
                  <img src={url} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/70 text-white hover:bg-rose-600 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-1.5 left-1.5 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-indigo-600 text-white">
                      Cover
                    </span>
                  )}
                </div>
              ))}

              {images.length < 6 && (
                <label className="relative aspect-square rounded-xl border-2 border-dashed border-zinc-300 hover:border-indigo-500 flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-colors bg-zinc-50 hover:bg-indigo-50/50">
                  <Upload className="w-6 h-6 text-zinc-400 mb-1" />
                  <span className="text-xs font-medium text-zinc-600">
                    {isUploading ? "Uploading..." : "Add Photo"}
                  </span>
                  <span className="text-[10px] text-zinc-400 mt-0.5">PNG, JPG, WebP</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={isUploading}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            {errors.images && <p className="text-xs text-rose-500 font-medium">{errors.images}</p>}
          </div>

          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Listing Title"
                name="title"
                placeholder="e.g. Thomas Calculus 14th Edition with Solution Manual"
                value={formData.title}
                onChange={handleInputChange}
                error={errors.title}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-zinc-700">Category</label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-zinc-300 bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Condition, Type, Price */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-zinc-700">Item Condition</label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-zinc-300 bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="NEW">Brand New (Unopened)</option>
                <option value="LIKE_NEW">Like New (Minimal Wear)</option>
                <option value="GOOD">Good (Lightly Used)</option>
                <option value="FAIR">Fair (Noticeable Usage)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-zinc-700">Transaction Type</label>
              <select
                name="transactionType"
                value={formData.transactionType}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-zinc-300 bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="SELL">For Sale Only</option>
                <option value="EXCHANGE">Exchange Only</option>
                <option value="BOTH">Sell or Exchange</option>
              </select>
            </div>

            <Input
              label="Price (₹)"
              name="price"
              type="number"
              min={0}
              placeholder="e.g. 500"
              value={formData.price}
              onChange={handleInputChange}
              error={errors.price}
              disabled={formData.transactionType === "EXCHANGE"}
              helperText={formData.transactionType === "EXCHANGE" ? "Not applicable for exchange-only" : ""}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-zinc-700">
              Detailed Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Mention semester relevance, author, edition, scratches, accessories included, and preferred meeting point on campus (e.g. Library foyer or Mess 3)..."
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-zinc-300 bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            {errors.description && <p className="text-xs text-rose-500 font-medium">{errors.description}</p>}
          </div>

          <Button
            type="submit"
            size="lg"
            isLoading={isSubmitting}
            className="w-full rounded-xl font-semibold mt-4 shadow-sm"
          >
            Publish Campus Listing
          </Button>
        </form>
      </div>
    </div>
  );
}
