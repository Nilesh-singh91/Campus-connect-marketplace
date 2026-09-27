"use client";

import React, { useState } from "react";
import { formatPrice, timeAgo } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Repeat, Check, X, Ban, ArrowRight, UserCheck, PackageOpen } from "lucide-react";

interface ExchangeClientProps {
  initialExchanges: any[];
  currentUserId: string;
}

export const ExchangeClient: React.FC<ExchangeClientProps> = ({ initialExchanges, currentUserId }) => {
  const [exchanges, setExchanges] = useState(initialExchanges);
  const [tab, setTab] = useState<"received" | "sent">("received");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const received = exchanges.filter((e) => e.sellerId === currentUserId);
  const sent = exchanges.filter((e) => e.buyerId === currentUserId);

  const activeList = tab === "received" ? received : sent;

  const handleAction = async (id: string, newStatus: string) => {
    try {
      setLoadingId(id);
      const res = await fetch(`/api/exchanges/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setExchanges((prev) =>
          prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e))
        );
      } else {
        const json = await res.json();
        alert(json.error || "Failed to update status");
      }
    } catch {
      alert("Network error updating exchange");
    } finally {
      setLoadingId(null);
    }
  };

  const statusVariants: Record<string, "warning" | "success" | "destructive" | "secondary"> = {
    PENDING: "warning",
    ACCEPTED: "success",
    REJECTED: "destructive",
    CANCELLED: "secondary",
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200">
        <button
          onClick={() => setTab("received")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            tab === "received"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-zinc-500 hover:text-zinc-800"
          }`}
        >
          Received Offers ({received.length})
        </button>
        <button
          onClick={() => setTab("sent")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ml-4 ${
            tab === "sent"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-zinc-500 hover:text-zinc-800"
          }`}
        >
          My Trade Proposals ({sent.length})
        </button>
      </div>

      {activeList.length > 0 ? (
        <div className="space-y-4">
          {activeList.map((item) => {
            const isSeller = item.sellerId === currentUserId;
            const otherUser = isSeller ? item.buyer : item.seller;

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-zinc-200 p-5 sm:p-6 shadow-xs space-y-4 hover:border-zinc-300 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-100">
                  <div className="flex items-center gap-2">
                    <Badge variant={statusVariants[item.status] || "secondary"} className="text-xs">
                      {item.status}
                    </Badge>
                    <span className="text-xs text-zinc-400">{timeAgo(item.createdAt)}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-zinc-600">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isSeller ? "Offered by:" : "Sent to:"}</span>
                    <strong className="text-zinc-900">{otherUser.profile?.fullName || "Student"}</strong>
                  </div>
                </div>

                {/* Items comparison grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  {/* Target Listing */}
                  <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-zinc-200 overflow-hidden shrink-0">
                      <img
                        src={item.targetListing.images[0]?.url || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=200&q=80"}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Target Item</p>
                      <Link href={`/listings/${item.targetListing.id}`} className="font-semibold text-zinc-900 text-sm hover:text-indigo-600 truncate block">
                        {item.targetListing.title}
                      </Link>
                      <p className="text-xs font-bold text-zinc-800">{formatPrice(item.targetListing.price)}</p>
                    </div>
                  </div>

                  {/* Offered item or Cash adjustment */}
                  <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-indigo-100 overflow-hidden shrink-0 flex items-center justify-center text-indigo-600 font-bold">
                      {item.offeredListing ? (
                        <img
                          src={item.offeredListing.images[0]?.url || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=200&q=80"}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Repeat className="w-6 h-6" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Offered in Return</p>
                      <p className="font-semibold text-zinc-900 text-sm truncate">
                        {item.offeredListing ? item.offeredListing.title : "Direct Cash Trade"}
                      </p>
                      <p className="text-xs text-indigo-700 font-medium">
                        {parseFloat(item.cashDifference) > 0
                          ? `+ ₹${item.cashDifference} cash difference`
                          : "Direct barter trade"}
                      </p>
                    </div>
                  </div>
                </div>

                {item.message && (
                  <p className="text-xs text-zinc-600 bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                    &ldquo;{item.message}&rdquo;
                  </p>
                )}

                {/* Actions */}
                {item.status === "PENDING" && (
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
                    {isSeller ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          isLoading={loadingId === item.id}
                          onClick={() => handleAction(item.id, "REJECTED")}
                          className="text-xs gap-1 border-rose-200 text-rose-600 hover:bg-rose-50"
                        >
                          <X className="w-3.5 h-3.5" /> Decline
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          isLoading={loadingId === item.id}
                          onClick={() => handleAction(item.id, "ACCEPTED")}
                          className="text-xs gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> Accept Proposal
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        isLoading={loadingId === item.id}
                        onClick={() => handleAction(item.id, "CANCELLED")}
                        className="text-xs gap-1 text-zinc-500 hover:text-rose-600"
                      >
                        <Ban className="w-3.5 h-3.5" /> Cancel Proposal
                      </Button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-16 text-center bg-white rounded-3xl border border-zinc-200 space-y-3 max-w-md mx-auto">
          <PackageOpen className="w-12 h-12 text-zinc-300 mx-auto" />
          <h3 className="font-semibold text-zinc-900 text-lg">No exchange requests found</h3>
          <p className="text-sm text-zinc-500">
            {tab === "received"
              ? "You haven't received any trade proposals for your listings yet."
              : "You haven't submitted any exchange proposals yet. Find items marked 'Exchange' to swap gear!"}
          </p>
          <div className="pt-2">
            <Link href="/browse?type=EXCHANGE">
              <Button size="sm">Browse Items Open to Exchange</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
