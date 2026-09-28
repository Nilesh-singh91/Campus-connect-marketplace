"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import {
  Search,
  PlusCircle,
  ShieldCheck,
  MapPin,
  Lock,
  KeyRound,
  CheckCircle2,
  Clock,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Filter,
  Eye,
  Camera,
  X,
  GraduationCap,
  Building,
} from "lucide-react";
import Link from "next/link";

interface LostFoundItem {
  id: string;
  type: "LOST" | "FOUND";
  title: string;
  description: string;
  category: string;
  location: string;
  custodyLocation?: string | null;
  secretQuestion?: string | null;
  imageUrl?: string | null;
  status: "OPEN" | "CLAIMED" | "RESOLVED";
  createdAt: string;
  user: {
    id: string;
    email: string;
    profile?: {
      fullName: string;
      avatarUrl?: string;
      branch?: string;
    };
  };
  collegeDomain?: {
    id: string;
    collegeName: string;
  };
  claims?: Array<{
    id: string;
    status: string;
    claimantId: string;
    createdAt: string;
    proofText?: string;
    verificationOtp?: string | null;
    claimant?: {
      id: string;
      email: string;
      profile?: {
        fullName: string;
        phone?: string;
      };
    };
  }>;
}

export default function LostAndFoundPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [selectedType, setSelectedType] = useState<"ALL" | "FOUND" | "LOST" | "RESOLVED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Modals state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [isManageClaimsModalOpen, setIsManageClaimsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LostFoundItem | null>(null);

  // Report Form state
  const [reportForm, setReportForm] = useState({
    type: "FOUND" as "FOUND" | "LOST",
    title: "",
    category: "CALCULATOR",
    location: "",
    custodyLocation: "With Finder (Handover upon ID verification)",
    secretQuestion: "",
    description: "",
    imageUrl: "",
  });
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportError, setReportError] = useState("");
  const [isUploadingImg, setIsUploadingImg] = useState(false);

  // Claim Form state
  const [claimProof, setClaimProof] = useState("");
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);
  const [claimError, setClaimError] = useState("");
  const [claimSuccess, setClaimSuccess] = useState("");

  // Resolve OTP Handshake state
  const [otpInputs, setOtpInputs] = useState<Record<string, string>>({});
  const [isResolving, setIsResolving] = useState<Record<string, boolean>>({});

  const fetchItems = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      const params = new URLSearchParams();
      if (selectedType === "FOUND" || selectedType === "LOST") {
        params.set("type", selectedType);
      } else if (selectedType === "RESOLVED") {
        params.set("status", "RESOLVED");
      }
      if (selectedCategory) params.set("category", selectedCategory);
      if (searchQuery.trim()) params.set("query", searchQuery.trim());

      const res = await fetch(`/api/lost-and-found?${params.toString()}`);
      const json = await res.json();
      if (res.ok) {
        setItems(json.data || []);
      } else {
        setError(json.error || "Failed to load lost & found items");
      }
    } catch {
      setError("Network error loading items");
    } finally {
      setIsLoading(false);
    }
  }, [selectedType, selectedCategory, searchQuery]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingImg(true);
      setReportError("");
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (res.ok && json.data?.url) {
        setReportForm((prev) => ({ ...prev, imageUrl: json.data.url }));
      } else {
        setReportError(json.error || "Image upload failed");
      }
    } catch {
      setReportError("Network error uploading photo");
    } finally {
      setIsUploadingImg(false);
      e.target.value = "";
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please log in to report an item.");
      return;
    }

    try {
      setIsSubmittingReport(true);
      setReportError("");

      const res = await fetch("/api/lost-and-found", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportForm),
      });

      const json = await res.json();
      if (!res.ok) {
        setReportError(json.error || "Failed to report item");
        return;
      }

      setIsReportModalOpen(false);
      setReportForm({
        type: "FOUND",
        title: "",
        category: "CALCULATOR",
        location: "",
        custodyLocation: "With Finder (Handover upon ID verification)",
        secretQuestion: "",
        description: "",
        imageUrl: "",
      });
      fetchItems();
    } catch {
      setReportError("Network error submitting report");
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    try {
      setIsSubmittingClaim(true);
      setClaimError("");
      setClaimSuccess("");

      const res = await fetch(`/api/lost-and-found/${selectedItem.id}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proofText: claimProof }),
      });

      const json = await res.json();
      if (!res.ok) {
        setClaimError(json.error || "Failed to submit claim");
        return;
      }

      setClaimSuccess("Claim submitted! The finder has been notified to verify your proof.");
      setTimeout(() => {
        setIsClaimModalOpen(false);
        setClaimProof("");
        setClaimSuccess("");
        fetchItems();
      }, 2000);
    } catch {
      setClaimError("Network error submitting claim");
    } finally {
      setIsSubmittingClaim(false);
    }
  };

  const handleClaimAction = async (
    claimId: string,
    action: "APPROVE" | "REJECT" | "RESOLVE",
    verificationOtp?: string
  ) => {
    if (!selectedItem) return;
    try {
      setIsResolving((prev) => ({ ...prev, [claimId]: true }));
      const res = await fetch(`/api/lost-and-found/${selectedItem.id}/claim`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claimId, action, verificationOtp }),
      });

      const json = await res.json();
      if (!res.ok) {
        alert(json.error || "Failed to update claim");
        return;
      }

      // Refresh detailed item
      const itemRes = await fetch(`/api/lost-and-found/${selectedItem.id}`);
      const itemJson = await itemRes.json();
      if (itemRes.ok) {
        setSelectedItem(itemJson.data);
      }
      fetchItems();
    } catch {
      alert("Network error processing claim");
    } finally {
      setIsResolving((prev) => ({ ...prev, [claimId]: false }));
    }
  };

  const openManageClaims = async (item: LostFoundItem) => {
    try {
      const res = await fetch(`/api/lost-and-found/${item.id}`);
      const json = await res.json();
      if (res.ok) {
        setSelectedItem(json.data);
        setIsManageClaimsModalOpen(true);
      }
    } catch {
      alert("Failed to load claims");
    }
  };

  const categories = [
    { label: "Scientific Calculator", value: "CALCULATOR" },
    { label: "College ID / Metro Card", value: "ID_CARD" },
    { label: "Electronics & Audio", value: "ELECTRONICS" },
    { label: "Keys & Wallets", value: "KEYS_WALLET" },
    { label: "Lab Manuals / Notes", value: "DOCUMENTS" },
    { label: "Other Belongings", value: "OTHER" },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-4">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-zinc-900 text-white p-6 sm:p-10 shadow-lg">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 text-xs font-semibold backdrop-blur-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Campus Security &amp; Custody Handshake</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Campus Lost &amp; Found Tracker
            </h1>
            <p className="text-indigo-100 text-sm sm:text-base leading-relaxed">
              Lost an ID card, Casio fx-991EX, or ear-buds in library or lab? Found someone&apos;s belongings?
              Report securely with secret question verification and physical handshake OTP.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Button
              onClick={() => {
                if (!user) {
                  window.location.href = "/login";
                  return;
                }
                setReportForm((prev) => ({ ...prev, type: "FOUND" }));
                setIsReportModalOpen(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-md gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Report Found Item
            </Button>

            <Button
              onClick={() => {
                if (!user) {
                  window.location.href = "/login";
                  return;
                }
                setReportForm((prev) => ({ ...prev, type: "LOST" }));
                setIsReportModalOpen(true);
              }}
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-xl font-semibold gap-2"
            >
              <HelpCircle className="w-4 h-4" />
              I Lost Something
            </Button>
          </div>
        </div>

        {/* Security Mechanism Notice */}
        <div className="mt-8 pt-6 border-t border-indigo-700/50 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-indigo-200">
          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-full bg-indigo-700 flex items-center justify-center text-white shrink-0 text-[11px] font-bold">1</div>
            <div>
              <p className="font-semibold text-white">Safe Custody Tracking</p>
              <p className="text-indigo-200/80">Finder states where item is kept (with finder or department desk).</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-full bg-indigo-700 flex items-center justify-center text-white shrink-0 text-[11px] font-bold">2</div>
            <div>
              <p className="font-semibold text-white">Secret Identification Mark</p>
              <p className="text-indigo-200/80">Claimant must describe hidden details (engraving, sticker, or roll number).</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-full bg-indigo-700 flex items-center justify-center text-white shrink-0 text-[11px] font-bold">3</div>
            <div>
              <p className="font-semibold text-white">4-Digit Handshake OTP</p>
              <p className="text-indigo-200/80">Physical handover is verified by entering a one-time code to prevent fraud.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Type Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-zinc-100 p-1 rounded-xl">
          <button
            onClick={() => setSelectedType("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedType === "ALL" ? "bg-white text-zinc-900 shadow-xs" : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            All Items
          </button>
          <button
            onClick={() => setSelectedType("FOUND")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedType === "FOUND" ? "bg-emerald-600 text-white shadow-xs" : "text-zinc-600 hover:text-emerald-700"
            }`}
          >
            🟢 Found by Peers
          </button>
          <button
            onClick={() => setSelectedType("LOST")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedType === "LOST" ? "bg-amber-600 text-white shadow-xs" : "text-zinc-600 hover:text-amber-700"
            }`}
          >
            🟡 Lost &amp; Looking
          </button>
          <button
            onClick={() => setSelectedType("RESOLVED")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedType === "RESOLVED" ? "bg-indigo-600 text-white shadow-xs" : "text-zinc-600 hover:text-indigo-700"
            }`}
          >
            ✅ Reunited ({items.filter((i) => i.status === "RESOLVED").length})
          </button>
        </div>

        {/* Search & Category */}
        <div className="flex flex-1 max-w-lg items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by item, location (e.g. Lab 3)..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-xl border border-zinc-200 bg-white text-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-zinc-400 text-sm">Searching campus lost &amp; found records...</div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-zinc-200 p-8 space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-lg font-bold text-zinc-800">No matching lost or found records</h3>
          <p className="text-xs text-zinc-500 max-w-md mx-auto">
            Everything seems to be accounted for right now! If you found or misplaced something, be the first to report it.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => {
            const isOwner = user?.id === item.user.id;
            const userClaim = item.claims?.find((c) => c.claimantId === user?.id);

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-zinc-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                <div>
                  {/* Photo or Icon Cover */}
                  <div className="relative aspect-video bg-zinc-100 overflow-hidden">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 gap-1">
                        <Camera className="w-8 h-8 stroke-1" />
                        <span className="text-[11px]">No Photo Attached</span>
                      </div>
                    )}

                    {/* Status & Type Badges */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full shadow-xs text-white ${
                          item.type === "FOUND" ? "bg-emerald-600" : "bg-amber-600"
                        }`}
                      >
                        {item.type === "FOUND" ? "Found Item" : "Lost Item"}
                      </span>

                      {item.status === "RESOLVED" && (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-zinc-900 text-white shadow-xs flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          Reunited
                        </span>
                      )}

                      {item.status === "CLAIMED" && (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-600 text-white shadow-xs flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Handshake Pending
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-2.5 left-2.5">
                      <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-md bg-black/60 text-white backdrop-blur-xs">
                        {item.category.replace("_", " ")}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-bold text-zinc-900 text-base leading-snug line-clamp-1">{item.title}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-zinc-500 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span className="truncate">{item.location}</span>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed bg-zinc-50 p-2.5 rounded-xl border border-zinc-100">
                      {item.description}
                    </p>

                    {item.custodyLocation && (
                      <div className="text-[11px] text-zinc-700 bg-indigo-50/60 border border-indigo-100 p-2 rounded-lg flex items-start gap-1.5">
                        <Building className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-indigo-900">Current Custody: </span>
                          <span>{item.custodyLocation}</span>
                        </div>
                      </div>
                    )}

                    {item.secretQuestion && (
                      <div className="text-[11px] text-zinc-700 bg-amber-50/80 border border-amber-200 p-2 rounded-lg flex items-start gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-amber-900">Security Verification: </span>
                          <span>{item.secretQuestion}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 pt-0 border-t border-zinc-100 mt-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 truncate">
                    <GraduationCap className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span className="truncate">
                      {item.user.profile?.fullName || "Student"}
                      {item.collegeDomain ? ` • ${item.collegeDomain.collegeName.split("(")[0].trim()}` : ""}
                    </span>
                  </div>

                  <div>
                    {isOwner ? (
                      <button
                        type="button"
                        onClick={() => openManageClaims(item)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Review Claims ({item.claims?.length || 0})
                      </button>
                    ) : item.status === "RESOLVED" ? (
                      <span className="text-xs font-semibold text-zinc-400">Resolved</span>
                    ) : userClaim ? (
                      <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Claim: {userClaim.status}</span>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => {
                          if (!user) {
                            window.location.href = "/login";
                            return;
                          }
                          setSelectedItem(item);
                          setIsClaimModalOpen(true);
                        }}
                        className="rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white"
                      >
                        Claim Item
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal 1: Report Lost / Found Item */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title={reportForm.type === "FOUND" ? "Report an Item You Found on Campus" : "Report a Lost Belonging"}
      >
        <form onSubmit={handleReportSubmit} className="space-y-4">
          {reportError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{reportError}</span>
            </div>
          )}

          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-zinc-700">Reporting Type:</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setReportForm({ ...reportForm, type: "FOUND" })}
                className={`px-3 py-1 text-xs font-semibold rounded-lg cursor-pointer ${
                  reportForm.type === "FOUND" ? "bg-emerald-600 text-white" : "bg-zinc-100 text-zinc-700"
                }`}
              >
                I Found An Item
              </button>
              <button
                type="button"
                onClick={() => setReportForm({ ...reportForm, type: "LOST" })}
                className={`px-3 py-1 text-xs font-semibold rounded-lg cursor-pointer ${
                  reportForm.type === "LOST" ? "bg-amber-600 text-white" : "bg-zinc-100 text-zinc-700"
                }`}
              >
                I Lost An Item
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Item Title"
              placeholder="e.g. Casio fx-991EX Scientific Calculator"
              value={reportForm.title}
              onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })}
              required
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-700">Category</label>
              <select
                value={reportForm.category}
                onChange={(e) => setReportForm({ ...reportForm, category: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 bg-white text-zinc-900"
              >
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Location Found / Lost"
              placeholder="e.g. Computer Lab 3, 2nd row bench"
              value={reportForm.location}
              onChange={(e) => setReportForm({ ...reportForm, location: e.target.value })}
              required
            />

            <Input
              label="Current Safe Custody"
              placeholder="e.g. With Me (Will meet in canteen) / Deposited at Library desk"
              value={reportForm.custodyLocation}
              onChange={(e) => setReportForm({ ...reportForm, custodyLocation: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-zinc-700">
              Secret Question for Claimant (Prevents Fraud)
            </label>
            <input
              type="text"
              placeholder="e.g. What is the roll number/name written on back, or color of the sticker?"
              value={reportForm.secretQuestion}
              onChange={(e) => setReportForm({ ...reportForm, secretQuestion: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 bg-white text-zinc-900"
            />
            <p className="text-[11px] text-zinc-500">
              Anyone claiming the item must answer this question to prove ownership before you hand it over.
            </p>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-zinc-700">Description / Distinguishing Details</label>
            <textarea
              rows={3}
              placeholder="Describe condition, when found/lost, any case or markings (don't reveal the secret answer)..."
              value={reportForm.description}
              onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 bg-white text-zinc-900"
              required
            />
          </div>

          {/* Photo Upload */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-zinc-700">Item Photo (Optional)</label>
            {reportForm.imageUrl ? (
              <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-zinc-200">
                <img src={reportForm.imageUrl} alt="Upload preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setReportForm({ ...reportForm, imageUrl: "" })}
                  className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-zinc-300 hover:border-indigo-500 cursor-pointer text-xs text-zinc-600 bg-zinc-50">
                <Camera className="w-4 h-4 text-zinc-400" />
                <span>{isUploadingImg ? "Uploading..." : "Upload Photo"}</span>
                <input type="file" accept="image/*" disabled={isUploadingImg} onChange={handleImageUpload} className="hidden" />
              </label>
            )}
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-zinc-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsReportModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmittingReport} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Publish Notice
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal 2: Submit Claim for Item */}
      <Modal
        isOpen={isClaimModalOpen}
        onClose={() => setIsClaimModalOpen(false)}
        title={`Claim: ${selectedItem?.title || "Item"}`}
      >
        <form onSubmit={handleClaimSubmit} className="space-y-4">
          {claimError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{claimError}</span>
            </div>
          )}

          {claimSuccess && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{claimSuccess}</span>
            </div>
          )}

          <div className="bg-indigo-50/70 p-3 rounded-xl border border-indigo-100 text-xs space-y-1.5">
            <p className="font-semibold text-indigo-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              Secure Proof Verification
            </p>
            <p className="text-zinc-600">
              To prevent unauthorized collection, please describe unique characteristics only the rightful owner would know:
            </p>
            {selectedItem?.secretQuestion && (
              <p className="font-bold text-amber-900 bg-amber-50 p-2 rounded border border-amber-200">
                Finder&apos;s Verification Question: &quot;{selectedItem.secretQuestion}&quot;
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-zinc-700">
              Your Answer / Proof of Ownership <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="State the exact answer, roll number on label, scratched markings, case stickers, or contents inside..."
              value={claimProof}
              onChange={(e) => setClaimProof(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-300 bg-white text-zinc-900"
              required
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-zinc-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsClaimModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmittingClaim} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Send Claim to Finder
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal 3: Manage Claims (Finder / Owner View) */}
      <Modal
        isOpen={isManageClaimsModalOpen}
        onClose={() => setIsManageClaimsModalOpen(false)}
        title={`Verification Claims for "${selectedItem?.title || ""}"`}
      >
        <div className="space-y-4">
          <div className="text-xs text-zinc-600 bg-zinc-50 p-3 rounded-xl border border-zinc-200">
            Review the secret proof submitted by claimants below. When you approve the correct owner, a <b>4-digit Handshake OTP</b> will be generated for the physical meetup.
          </div>

          {(!selectedItem?.claims || selectedItem.claims.length === 0) ? (
            <p className="text-center py-6 text-xs text-zinc-400">No student claims have been submitted yet.</p>
          ) : (
            <div className="space-y-3">
              {selectedItem.claims.map((claim) => {
                const isApproved = claim.status === "APPROVED";
                const isResolved = claim.status === "RESOLVED";

                return (
                  <div
                    key={claim.id}
                    className={`p-3.5 rounded-xl border space-y-2.5 ${
                      isResolved
                        ? "bg-zinc-50 border-zinc-200"
                        : isApproved
                        ? "bg-emerald-50/50 border-emerald-300"
                        : "bg-white border-zinc-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-zinc-900">
                        {claim.claimant?.profile?.fullName || "Student Claimant"} ({claim.claimant?.email})
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          isResolved
                            ? "bg-zinc-800 text-white"
                            : isApproved
                            ? "bg-emerald-600 text-white"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {claim.status}
                      </span>
                    </div>

                    <div className="text-xs text-zinc-700 bg-white p-2.5 rounded-lg border border-zinc-200">
                      <p className="text-[10px] uppercase font-bold text-zinc-400 mb-1">Claimant&apos;s Submitted Proof:</p>
                      <p className="leading-relaxed">{claim.proofText}</p>
                    </div>

                    {isApproved && claim.verificationOtp && (
                      <div className="p-3 bg-emerald-100/70 border border-emerald-300 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-900">Handshake OTP:</span>
                          <span className="text-base font-extrabold tracking-widest text-emerald-950 font-mono bg-white px-2.5 py-0.5 rounded border border-emerald-300">
                            {claim.verificationOtp}
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-800">
                          During physical handover, verify that the claimant provides this 4-digit code. Then enter it below to complete handover.
                        </p>

                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="text"
                            maxLength={4}
                            placeholder="Enter 4-digit OTP"
                            value={otpInputs[claim.id] || ""}
                            onChange={(e) => setOtpInputs({ ...otpInputs, [claim.id]: e.target.value })}
                            className="w-36 px-2.5 py-1 text-xs rounded-lg border border-emerald-400 bg-white text-zinc-900 font-mono tracking-widest text-center"
                          />
                          <button
                            type="button"
                            onClick={() => handleClaimAction(claim.id, "RESOLVE", otpInputs[claim.id])}
                            disabled={isResolving[claim.id]}
                            className="px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors"
                          >
                            {isResolving[claim.id] ? "Confirming..." : "Confirm Handshake"}
                          </button>
                        </div>
                      </div>
                    )}

                    {!isApproved && !isResolved && (
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleClaimAction(claim.id, "REJECT")}
                          disabled={isResolving[claim.id]}
                          className="px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50 rounded-lg font-medium cursor-pointer"
                        >
                          Reject Proof
                        </button>
                        <button
                          type="button"
                          onClick={() => handleClaimAction(claim.id, "APPROVE")}
                          disabled={isResolving[claim.id]}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg cursor-pointer shadow-xs"
                        >
                          Approve Claim &amp; Generate OTP
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="pt-2 flex justify-end border-t border-zinc-100">
            <Button type="button" size="sm" onClick={() => setIsManageClaimsModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
