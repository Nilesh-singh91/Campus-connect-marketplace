"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Heart, MessageSquare, Repeat, Edit, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";

interface DetailActionsProps {
  listingId: string;
  sellerId: string;
  isOwner: boolean;
  isStaff: boolean;
  isFavorited: boolean;
  favoritesCount: number;
  status: string;
  title: string;
}

export const DetailActions: React.FC<DetailActionsProps> = ({
  listingId,
  sellerId,
  isOwner,
  isStaff,
  isFavorited: initialFav,
  favoritesCount: initialCount,
  status,
  title,
}) => {
  const router = useRouter();
  const { user } = useAuth();
  const [favorited, setFavorited] = useState(initialFav);
  const [favCount, setFavCount] = useState(initialCount);
  const [isFavLoading, setIsFavLoading] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Exchange Modal State
  const [isExchangeModalOpen, setIsExchangeModalOpen] = useState(false);
  const [myListings, setMyListings] = useState<any[]>([]);
  const [selectedMyListing, setSelectedMyListing] = useState("");
  const [cashDiff, setCashDiff] = useState("0");
  const [exchangeMsg, setExchangeMsg] = useState("");
  const [isSubmittingExchange, setIsSubmittingExchange] = useState(false);
  const [exchangeSuccess, setExchangeSuccess] = useState(false);
  const [exchangeError, setExchangeError] = useState("");

  // Delete Confirmation Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Status Change State
  const [currentStatus, setCurrentStatus] = useState(status);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const toggleFavorite = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    try {
      setIsFavLoading(true);
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });
      if (res.ok) {
        const json = await res.json();
        setFavorited(json.data.favorited);
        setFavCount((prev) => (json.data.favorited ? prev + 1 : Math.max(0, prev - 1)));
      }
    } finally {
      setIsFavLoading(false);
    }
  };

  const handleStartChat = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    try {
      setIsChatLoading(true);
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, recipientId: sellerId }),
      });
      const json = await res.json();
      if (res.ok && json.data?.id) {
        router.push(`/conversations/${json.data.id}`);
      }
    } catch (e) {
      console.error("Chat error:", e);
    } finally {
      setIsChatLoading(false);
    }
  };

  const openExchangeModal = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    setIsExchangeModalOpen(true);
    setExchangeError("");
    setExchangeSuccess(false);

    try {
      // Fetch user's own active listings to offer
      const res = await fetch(`/api/users/${user.id}`);
      if (res.ok) {
        const json = await res.json();
        setMyListings(json.data?.listings || []);
      }
    } catch (e) {
      console.error("Error loading user listings:", e);
    }
  };

  const handleExchangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setExchangeError("");
    try {
      setIsSubmittingExchange(true);
      const res = await fetch("/api/exchanges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetListingId: listingId,
          offeredListingId: selectedMyListing || undefined,
          cashDifference: parseFloat(cashDiff) || 0,
          message: exchangeMsg,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setExchangeError(json.error || "Failed to submit exchange proposal");
        return;
      }

      setExchangeSuccess(true);
      setTimeout(() => {
        setIsExchangeModalOpen(false);
        router.push("/exchange-requests");
      }, 1500);
    } catch {
      setExchangeError("Network error. Please try again.");
    } finally {
      setIsSubmittingExchange(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      setIsUpdatingStatus(true);
      const res = await fetch(`/api/listings/${listingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setCurrentStatus(newStatus);
        router.refresh();
      }
    } catch (e) {
      console.error("Status update error:", e);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDeleteListing = async () => {
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/listings/${listingId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/my-listings");
      }
    } catch (e) {
      console.error("Delete error:", e);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4 pt-2">
      {/* Buyer Actions */}
      {!isOwner ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="primary"
              size="lg"
              isLoading={isChatLoading}
              onClick={handleStartChat}
              className="w-full rounded-xl font-semibold gap-2 shadow-sm"
            >
              <MessageSquare className="w-4 h-4" /> Message Seller
            </Button>

            <Button
              variant="secondary"
              size="lg"
              onClick={openExchangeModal}
              className="w-full rounded-xl font-semibold gap-2 shadow-sm"
            >
              <Repeat className="w-4 h-4" /> Propose Trade
            </Button>
          </div>

          <Button
            variant="outline"
            size="md"
            isLoading={isFavLoading}
            onClick={toggleFavorite}
            className="w-full rounded-xl gap-2 font-medium"
          >
            <Heart className={`w-4 h-4 ${favorited ? "fill-rose-500 text-rose-500" : ""}`} />
            {favorited ? "Saved in Favorites" : "Add to Favorites"} ({favCount})
          </Button>
        </div>
      ) : (
        /* Owner Management Actions */
        <div className="space-y-3 p-4 rounded-2xl bg-zinc-50 border border-zinc-200">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-600">Your Listing Controls</p>

          <div className="flex items-center gap-2">
            <Link href={`/listings/${listingId}/edit`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full gap-1.5 font-semibold">
                <Edit className="w-3.5 h-3.5" /> Edit Details
              </Button>
            </Link>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsDeleteModalOpen(true)}
              className="gap-1.5 font-semibold"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </Button>
          </div>

          <div className="pt-2 border-t border-zinc-200">
            <label className="text-xs font-medium text-zinc-600 block mb-1.5">Availability Status</label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                disabled={isUpdatingStatus}
                onClick={() => handleStatusChange("AVAILABLE")}
                className={`text-xs py-1.5 rounded-lg border font-medium cursor-pointer transition-colors ${
                  currentStatus === "AVAILABLE"
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100"
                }`}
              >
                Available
              </button>
              <button
                disabled={isUpdatingStatus}
                onClick={() => handleStatusChange("RESERVED")}
                className={`text-xs py-1.5 rounded-lg border font-medium cursor-pointer transition-colors ${
                  currentStatus === "RESERVED"
                    ? "bg-amber-600 text-white border-amber-600"
                    : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100"
                }`}
              >
                Reserved
              </button>
              <button
                disabled={isUpdatingStatus}
                onClick={() => handleStatusChange("SOLD")}
                className={`text-xs py-1.5 rounded-lg border font-medium cursor-pointer transition-colors ${
                  currentStatus === "SOLD"
                    ? "bg-zinc-800 text-white border-zinc-800"
                    : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100"
                }`}
              >
                Mark Sold
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Staff Override Controls */}
      {!isOwner && isStaff && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
          <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Staff Moderation Action</p>
          <div className="flex gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleStatusChange("REMOVED")}
              className="text-xs py-1"
            >
              Remove Listing (TOS Violation)
            </Button>
          </div>
        </div>
      )}

      {/* Propose Exchange Modal */}
      <Modal
        isOpen={isExchangeModalOpen}
        onClose={() => setIsExchangeModalOpen(false)}
        title="Propose Item Exchange"
        description={`Offer an item or cash adjustment for "${title}"`}
      >
        {exchangeSuccess ? (
          <div className="py-6 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-zinc-900 text-lg">Proposal Sent!</h4>
            <p className="text-sm text-zinc-500">The seller has been notified of your exchange offer.</p>
          </div>
        ) : (
          <form onSubmit={handleExchangeSubmit} className="space-y-4">
            {exchangeError && (
              <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-xs flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{exchangeError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                Select Your Item to Offer (Optional)
              </label>
              {myListings.length > 0 ? (
                <select
                  value={selectedMyListing}
                  onChange={(e) => setSelectedMyListing(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 bg-white"
                >
                  <option value="">-- No item (Cash only offer) --</option>
                  {myListings.map((l: any) => (
                    <option key={l.id} value={l.id}>
                      {l.title} (Valued at ₹{l.price})
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-xs text-zinc-500 bg-zinc-50 p-2.5 rounded-lg border border-zinc-200">
                  You don&apos;t have any active listings to trade. You can offer cash or{" "}
                  <Link href="/listings/create" className="text-indigo-600 font-semibold underline">
                    create a listing first
                  </Link>
                  .
                </p>
              )}
            </div>

            <Input
              label="Cash Adjustment (₹)"
              type="number"
              min={0}
              value={cashDiff}
              onChange={(e) => setCashDiff(e.target.value)}
              helperText="Additional amount you will pay alongside your trade item (0 if equal trade)"
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                Note for Seller
              </label>
              <textarea
                value={exchangeMsg}
                onChange={(e) => setExchangeMsg(e.target.value)}
                placeholder="Hi, I'm willing to trade my engineering drafter and meet you near the central library..."
                rows={3}
                className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 bg-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <Button
              type="submit"
              size="md"
              isLoading={isSubmittingExchange}
              className="w-full rounded-xl font-semibold mt-2"
            >
              Submit Trade Proposal
            </Button>
          </form>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Listing Deletion"
        description="Are you sure you want to permanently delete this listing? This action cannot be undone."
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-zinc-500">
            Removing this listing will remove it from all buyer searches and favorites.
          </p>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              isLoading={isDeleting}
              onClick={handleDeleteListing}
            >
              Confirm Permanent Deletion
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
