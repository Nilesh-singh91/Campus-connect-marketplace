"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatPrice, timeAgo } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Heart, Repeat, UserCheck, GraduationCap, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export interface ListingCardProps {
  id: string;
  title: string;
  price: number | string | { toString(): string };
  condition: string;
  transactionType: string;
  createdAt: string | Date;
  imageUrl?: string;
  categoryName?: string;
  sellerName?: string;
  sellerBranch?: string;
  collegeDomainId?: string | null;
  collegeName?: string | null;
  initialFavorited?: boolean;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  id,
  title,
  price,
  condition,
  transactionType,
  createdAt,
  imageUrl,
  categoryName,
  sellerName,
  sellerBranch,
  collegeDomainId,
  collegeName,
  initialFavorited = false,
}) => {
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [isFavLoading, setIsFavLoading] = useState(false);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      window.location.href = "/login";
      return;
    }

    try {
      setIsFavLoading(true);
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: id }),
      });
      if (res.ok) {
        const json = await res.json();
        setIsFavorited(json.data.favorited);
      }
    } catch (e) {
      console.error("Favorite toggle error:", e);
    } finally {
      setIsFavLoading(false);
    }
  };

  const conditionLabels: Record<string, { label: string; variant: "default" | "success" | "warning" | "secondary" }> = {
    NEW: { label: "Brand New", variant: "success" },
    LIKE_NEW: { label: "Like New", variant: "default" },
    GOOD: { label: "Good Condition", variant: "secondary" },
    FAIR: { label: "Fair / Used", variant: "warning" },
  };

  const cond = conditionLabels[condition] || { label: condition, variant: "secondary" };
  const isCrossCampus = Boolean(user && user.collegeDomainId && collegeDomainId && user.collegeDomainId !== collegeDomainId);
  const collegeShortName = collegeName ? collegeName.split("(")[0].trim() : null;

  return (
    <div className={`group relative bg-white rounded-2xl border overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col h-full ${
      isCrossCampus ? "border-amber-200/80 hover:border-amber-300" : "border-zinc-200 hover:border-zinc-300"
    }`}>
      <Link href={`/listings/${id}`} className="block relative aspect-4/3 overflow-hidden bg-zinc-100">
        <img
          src={imageUrl || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80"}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10 max-w-[80%]">
          <Badge variant={cond.variant} className="shadow-xs text-[11px] backdrop-blur-xs">
            {cond.label}
          </Badge>
          {transactionType === "EXCHANGE" && (
            <Badge variant="warning" className="shadow-xs text-[11px] backdrop-blur-xs flex items-center gap-1">
              <Repeat className="w-3 h-3" /> Exchange Only
            </Badge>
          )}
          {transactionType === "BOTH" && (
            <Badge variant="default" className="shadow-xs text-[11px] backdrop-blur-xs flex items-center gap-1">
              <Repeat className="w-3 h-3" /> Buy or Exchange
            </Badge>
          )}
          {collegeShortName && (
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs backdrop-blur-xs ${
                isCrossCampus
                  ? "bg-amber-600/90 text-white"
                  : "bg-indigo-900/80 text-white"
              }`}
            >
              <GraduationCap className="w-3 h-3" />
              <span className="truncate max-w-[120px]">{collegeShortName}</span>
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={toggleFavorite}
          disabled={isFavLoading}
          aria-label="Add to favorites"
          className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-zinc-600 hover:text-rose-500 hover:scale-110 transition-all shadow-sm cursor-pointer"
        >
          <Heart
            className={`w-4 h-4 ${isFavorited ? "fill-rose-500 text-rose-500" : ""}`}
          />
        </button>

        {categoryName && (
          <div className="absolute bottom-2.5 left-2.5 z-10">
            <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-md bg-black/60 text-white backdrop-blur-xs">
              {categoryName}
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <Link href={`/listings/${id}`} className="block">
            <h3 className="font-semibold text-zinc-900 line-clamp-2 text-base leading-snug group-hover:text-indigo-600 transition-colors">
              {title}
            </h3>
          </Link>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="text-lg font-bold text-zinc-950">
              {transactionType === "EXCHANGE" ? "Exchange Only" : formatPrice(price)}
            </p>
            <span className="text-xs text-zinc-400 font-medium">
              {timeAgo(createdAt)}
            </span>
          </div>

          {isCrossCampus && (
            <div className="mt-2.5 py-1 px-2 rounded-lg bg-amber-50 border border-amber-200 text-[10px] text-amber-800 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
              <span>Purchase restricted to {collegeShortName}</span>
            </div>
          )}
        </div>

        {/* Seller Info */}
        <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-1.5 truncate">
            <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate font-medium text-zinc-700">{sellerName || "Campus Student"}</span>
          </div>
          {sellerBranch && <span className="text-zinc-400 truncate max-w-[90px]">{sellerBranch}</span>}
        </div>
      </div>
    </div>
  );
};
