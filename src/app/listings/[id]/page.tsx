import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { formatPrice, formatDate, timeAgo } from "@/lib/utils";
import { ImageGallery } from "@/components/marketplace/ImageGallery";
import { ListingCard } from "@/components/marketplace/ListingCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  GraduationCap,
  ShieldCheck,
  Repeat,
  Heart,
  MessageSquare,
  AlertTriangle,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Share2,
  Lock,
  Globe,
} from "lucide-react";
import { DetailActions } from "./DetailActions";

export const dynamic = "force-dynamic";

interface ListingDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ListingDetailPage({ params }: ListingDetailPageProps) {
  const { id } = await params;
  const session = await getSession();

  let listing: any = null;
  try {
    listing = await db.listing.update({
      where: { id },
      data: { views: { increment: 1 } },
      include: {
        images: { orderBy: { displayOrder: "asc" } },
        category: true,
        collegeDomain: true,
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            isEmailVerified: true,
            createdAt: true,
            collegeDomainId: true,
            collegeDomain: {
              select: { collegeName: true, domain: true },
            },
            profile: {
              select: {
                fullName: true,
                branch: true,
                yearOfStudy: true,
                avatarUrl: true,
                phone: true,
                bio: true,
              },
            },
          },
        },
        _count: {
          select: { favorites: true },
        },
      },
    });
  } catch {
    notFound();
  }

  if (!listing) notFound();

  // Check if favorited by session
  let isFavorited = false;
  if (session) {
    const fav = await db.favorite.findUnique({
      where: { userId_listingId: { userId: session.id, listingId: id } },
    });
    isFavorited = !!fav;
  }

  // Related listings (scoped to same campus)
  const relatedWhere: any = {
    categoryId: listing.categoryId,
    id: { not: listing.id },
    status: "AVAILABLE",
  };
  if (listing.collegeDomainId) {
    relatedWhere.collegeDomainId = listing.collegeDomainId;
  }

  const relatedListings = await db.listing.findMany({
    where: relatedWhere,
    take: 4,
    include: {
      category: true,
      collegeDomain: true,
      images: { take: 1 },
      user: {
        select: {
          id: true,
          profile: { select: { fullName: true, branch: true } },
        },
      },
    },
  });

  const isOwner = session?.id === listing.userId;
  const isStaff = session?.role === "ADMIN" || session?.role === "MODERATOR";

  const conditionLabels: Record<string, { label: string; variant: "default" | "success" | "warning" | "secondary" }> = {
    NEW: { label: "Brand New", variant: "success" },
    LIKE_NEW: { label: "Like New", variant: "default" },
    GOOD: { label: "Good Condition", variant: "secondary" },
    FAIR: { label: "Fair / Used", variant: "warning" },
  };

  const statusLabels: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" }> = {
    AVAILABLE: { label: "Available", variant: "success" },
    RESERVED: { label: "Reserved", variant: "warning" },
    SOLD: { label: "Sold", variant: "destructive" },
    REMOVED: { label: "Removed by Staff", variant: "destructive" },
  };

  const cond = conditionLabels[listing.condition] || { label: listing.condition, variant: "secondary" };
  const stat = statusLabels[listing.status] || { label: listing.status, variant: "secondary" };

  return (
    <div className="space-y-12">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
        <Link href="/" className="hover:text-indigo-600">
          Home
        </Link>
        <span>/</span>
        <Link href="/browse" className="hover:text-indigo-600">
          Marketplace
        </Link>
        <span>/</span>
        <Link href={`/browse?category=${listing.category.slug}`} className="hover:text-indigo-600">
          {listing.category.name}
        </Link>
        <span>/</span>
        <span className="text-zinc-800 truncate max-w-[200px]">{listing.title}</span>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-7">
          <ImageGallery images={listing.images} title={listing.title} />
        </div>

        {/* Right Column: Listing Metadata & Action Controls */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 space-y-6 shadow-xs">
            {/* Status & Category Badges */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={stat.variant}>{stat.label}</Badge>
                <Badge variant={cond.variant}>{cond.label}</Badge>
                {listing.campusOnly !== false ? (
                  <Badge variant="success" className="flex items-center gap-1 bg-emerald-50 text-emerald-800 border-emerald-300">
                    <Lock className="w-3 h-3 text-emerald-700" />
                    Campus Only
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="flex items-center gap-1 bg-indigo-50 text-indigo-700 border-indigo-200">
                    <Globe className="w-3 h-3 text-indigo-600" />
                    Multi-Campus
                  </Badge>
                )}
                {listing.transactionType === "EXCHANGE" && (
                  <Badge variant="warning" className="flex items-center gap-1">
                    <Repeat className="w-3 h-3" /> Exchange Only
                  </Badge>
                )}
                {listing.transactionType === "BOTH" && (
                  <Badge variant="default" className="flex items-center gap-1">
                    <Repeat className="w-3 h-3" /> Buy or Exchange
                  </Badge>
                )}
                <Badge variant="secondary" className="flex items-center gap-1 bg-indigo-50 text-indigo-700 border-indigo-200">
                  <GraduationCap className="w-3.5 h-3.5" />
                  {listing.collegeDomain?.collegeName?.split("(")[0]?.trim() || listing.user.collegeDomain?.collegeName?.split("(")[0]?.trim() || "Campus Verified"}
                </Badge>
              </div>

              <span className="text-xs text-zinc-400 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" /> {listing.views} views
              </span>
            </div>

            {/* Title & Price */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 leading-tight">
                {listing.title}
              </h1>
              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-zinc-950">
                  {listing.transactionType === "EXCHANGE" ? "Exchange Only" : formatPrice(listing.price)}
                </span>
                {listing.transactionType === "BOTH" && (
                  <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded">
                    Open to trades
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="border-t border-zinc-100 pt-4 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Item Description</h3>
              <p className="text-sm text-zinc-700 whitespace-pre-line leading-relaxed">
                {listing.description}
              </p>
            </div>

            {/* Campus Isolation Info Banner */}
            {listing.campusOnly !== false && (
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-xs text-emerald-800 font-medium">
                <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Campus Exclusive:</strong> Restricted strictly to verified students of {listing.collegeDomain?.collegeName?.split("(")[0]?.trim() || "this campus"} for direct hand-to-hand exchange.
                </span>
              </div>
            )}

            {/* Interaction Buttons (Client Actions) */}
            <DetailActions
              listingId={listing.id}
              sellerId={listing.user.id}
              isOwner={isOwner}
              isStaff={isStaff}
              isFavorited={isFavorited}
              favoritesCount={listing._count.favorites}
              status={listing.status}
              title={listing.title}
              sellerCollegeDomainId={listing.collegeDomainId || listing.user.collegeDomainId}
              sellerCollegeName={listing.collegeDomain?.collegeName || listing.user.collegeDomain?.collegeName}
              campusOnly={listing.campusOnly !== false}
            />

            {/* Report Link */}
            {!isOwner && (
              <div className="pt-2 text-center">
                <Link
                  href={`/report?type=LISTING&targetId=${listing.id}`}
                  className="text-xs text-zinc-400 hover:text-rose-600 inline-flex items-center gap-1"
                >
                  <AlertTriangle className="w-3.5 h-3.5" /> Report suspicious or prohibited item
                </Link>
              </div>
            )}
          </div>

          {/* Seller Profile Card */}
          <div className="bg-white rounded-3xl border border-zinc-200 p-6 space-y-4 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Seller Information</h3>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 font-bold text-lg flex items-center justify-center shrink-0">
                {listing.user.profile?.fullName?.charAt(0).toUpperCase() || "S"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-semibold text-zinc-900 truncate">
                    {listing.user.profile?.fullName || "Verified Student"}
                  </h4>
                  {listing.user.isEmailVerified && (
                    <span title="Verified Campus Email">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-500 truncate mt-0.5">
                  {listing.user.profile?.branch || "Engineering Student"} • Year {listing.user.profile?.yearOfStudy || "N/A"}
                </p>
                <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5" />
                  {listing.user.collegeDomain?.collegeName || "Verified College Campus"}
                </p>
              </div>
            </div>

            {listing.user.profile?.bio && (
              <p className="text-xs text-zinc-600 italic bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                &ldquo;{listing.user.profile.bio}&rdquo;
              </p>
            )}

            <Link
              href={`/profile/${listing.user.id}`}
              className="block w-full text-center py-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-xl transition-colors border border-indigo-100"
            >
              View Student Profile & More Listings
            </Link>
          </div>
        </div>
      </div>

      {/* Related Listings */}
      {relatedListings.length > 0 && (
        <section className="space-y-6 pt-8 border-t border-zinc-200">
          <h2 className="text-xl font-bold text-zinc-900 tracking-tight">
            More in {listing.category.name}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedListings.map((item: any) => (
              <ListingCard
                key={item.id}
                id={item.id}
                title={item.title}
                price={item.price}
                condition={item.condition}
                transactionType={item.transactionType}
                createdAt={item.createdAt}
                imageUrl={item.images[0]?.url}
                categoryName={item.category.name}
                sellerName={item.user.profile?.fullName}
                sellerBranch={item.user.profile?.branch || undefined}
                collegeDomainId={item.collegeDomainId}
                collegeName={item.collegeDomain?.collegeName}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
