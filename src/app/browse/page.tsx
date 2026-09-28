import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ListingCard } from "@/components/marketplace/ListingCard";
import { FilterSidebar } from "@/components/marketplace/FilterSidebar";
import { SortSelect } from "@/components/marketplace/SortSelect";
import { Prisma } from "@prisma/client";
import Link from "next/link";
import { ChevronLeft, ChevronRight, PackageOpen, GraduationCap, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

interface BrowsePageProps {
  searchParams: Promise<{
    query?: string;
    category?: string;
    condition?: string;
    type?: string;
    minPrice?: string;
    maxPrice?: string;
    college?: string;
    campusOnly?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const session = await getSession();
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const limit = 12;
  const skip = (page - 1) * limit;

  const where: Prisma.ListingWhereInput = {
    status: "AVAILABLE",
  };

  // College campus scoping:
  // If ?college= is provided, filter by that college or show all if "all".
  // If not provided and user is authenticated, default to their campus.
  const activeCollegeFilter = params.college !== undefined ? params.college : (session?.collegeDomainId ? "my_campus" : "all");

  if (activeCollegeFilter === "my_campus" && session?.collegeDomainId) {
    where.collegeDomainId = session.collegeDomainId;
  } else if (activeCollegeFilter && activeCollegeFilter !== "all" && activeCollegeFilter !== "my_campus") {
    where.collegeDomain = {
      OR: [{ id: activeCollegeFilter }, { domain: activeCollegeFilter }],
    };
  }

  if (params.query) {
    where.OR = [
      { title: { contains: params.query } },
      { description: { contains: params.query } },
    ];
  }

  if (params.category) {
    where.category = { slug: params.category };
  }

  if (params.condition) {
    where.condition = params.condition as any;
  }

  if (params.type) {
    where.transactionType = params.type as any;
  }

  if (params.campusOnly === "true") {
    where.campusOnly = true;
  } else if (params.campusOnly === "false") {
    where.campusOnly = false;
  }

  if (params.minPrice || params.maxPrice) {
    where.price = {};
    if (params.minPrice) where.price.gte = parseFloat(params.minPrice);
    if (params.maxPrice) where.price.lte = parseFloat(params.maxPrice);
  }

  let orderBy: Prisma.ListingOrderByWithRelationInput = { createdAt: "desc" };
  if (params.sort === "price_asc") orderBy = { price: "asc" };
  if (params.sort === "price_desc") orderBy = { price: "desc" };

  const [categories, collegeDomains, listings, total] = await Promise.all([
    db.category.findMany({
      where: { isActive: true },
      include: {
        _count: { select: { listings: { where: { status: "AVAILABLE" } } } },
      },
    }),
    db.collegeDomain.findMany({
      where: { isActive: true },
      include: {
        _count: { select: { listings: { where: { status: "AVAILABLE" } } } },
      },
    }),
    db.listing.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        category: true,
        collegeDomain: true,
        images: { take: 1, orderBy: { displayOrder: "asc" } },
        user: {
          select: {
            id: true,
            collegeDomainId: true,
            collegeDomain: true,
            profile: { select: { fullName: true, branch: true } },
          },
        },
      },
    }),
    db.listing.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  const buildUrlWithParam = (newParams: Record<string, string | number>) => {
    const current = new URLSearchParams(params as any);
    for (const key in newParams) {
      current.set(key, String(newParams[key]));
    }
    return `/browse?${current.toString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Heading */}
      <div className="space-y-4 pb-4 border-b border-zinc-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">Marketplace Catalog</h1>
            <p className="text-sm text-zinc-500 mt-1">
              Showing {total} verified student {total === 1 ? "item" : "items"} available on campus
            </p>
          </div>

          {/* Sort Select */}
          <SortSelect currentSort={params.sort || "newest"} />
        </div>

        {/* Multi-College Campus Quick Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {session?.collegeDomainId && (
            <Link
              href={buildUrlWithParam({ college: "my_campus", page: 1 })}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all ${
                activeCollegeFilter === "my_campus"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>My Campus ({session.collegeName?.split("(")[0]?.trim() || "Verified"})</span>
            </Link>
          )}

          <Link
            href={buildUrlWithParam({ college: "all", page: 1 })}
            className={`text-xs font-medium px-3 py-1.5 rounded-full transition-all ${
              activeCollegeFilter === "all"
                ? "bg-zinc-900 text-white"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
            }`}
          >
            All Campuses
          </Link>

          {collegeDomains.map((col) => {
            const isSelected = activeCollegeFilter === col.id || activeCollegeFilter === col.domain;
            return (
              <Link
                key={col.id}
                href={buildUrlWithParam({ college: col.domain, page: 1 })}
                className={`text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1 transition-all ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                }`}
              >
                <GraduationCap className="w-3 h-3" />
                <span>{col.collegeName.split("(")[0].trim()}</span>
              </Link>
            );
          })}
        </div>

        {/* Transaction Type Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-zinc-100">
          <span className="text-xs font-semibold text-zinc-400 mr-1">Mode:</span>
          <Link
            href={buildUrlWithParam({ type: "", page: 1 })}
            className={`text-xs font-medium px-3 py-1 rounded-full transition-all ${
              !params.type
                ? "bg-zinc-900 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            All Items
          </Link>
          <Link
            href={buildUrlWithParam({ type: "SELL", page: 1 })}
            className={`text-xs font-medium px-3 py-1 rounded-full transition-all ${
              params.type === "SELL"
                ? "bg-indigo-600 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            💰 Buy &amp; Sell
          </Link>
          <Link
            href={buildUrlWithParam({ type: "EXCHANGE", page: 1 })}
            className={`text-xs font-medium px-3 py-1 rounded-full transition-all ${
              params.type === "EXCHANGE"
                ? "bg-amber-600 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            🔄 Item Exchanges
          </Link>
          <Link
            href={buildUrlWithParam({ type: "DONATION", page: 1 })}
            className={`text-xs font-semibold px-3 py-1 rounded-full transition-all ${
              params.type === "DONATION"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
            }`}
          >
            🎁 Free Giveaways (₹0)
          </Link>
          <Link
            href={buildUrlWithParam({ type: "SKILL_EXCHANGE", page: 1 })}
            className={`text-xs font-semibold px-3 py-1 rounded-full transition-all ${
              params.type === "SKILL_EXCHANGE"
                ? "bg-purple-600 text-white shadow-xs"
                : "bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200"
            }`}
          >
            💡 Skill Barter
          </Link>
        </div>

        {/* Isolation Policy Banner */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-200/80 text-[11px] text-zinc-600">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Campus Isolation Active:</strong> You can explore listings from all affiliated colleges, but transactions, in-person handovers, and chats are strictly restricted to students from the same college campus.
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Filter Sidebar */}
        <div className="lg:col-span-1">
          <FilterSidebar
            categories={categories}
            colleges={collegeDomains}
            userCollegeId={session?.collegeDomainId}
          />
        </div>

        {/* Listings Grid */}
        <div className="lg:col-span-3 space-y-8">
          {listings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {listings.map((item) => (
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
                  campusOnly={item.campusOnly}
                />
              ))}
            </div>
          ) : (
            <div className="p-16 text-center bg-white rounded-3xl border border-zinc-200 space-y-3">
              <PackageOpen className="w-12 h-12 text-zinc-300 mx-auto" />
              <h3 className="font-semibold text-zinc-900 text-lg">No listings match your criteria</h3>
              <p className="text-sm text-zinc-500 max-w-sm mx-auto">
                Try widening your price range, choosing another category, or resetting your active filters.
              </p>
              <Link href="/browse" className="inline-block pt-2">
                <span className="text-xs font-semibold px-4 py-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition-colors">
                  Reset All Filters
                </span>
              </Link>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6 border-t border-zinc-200">
              {page > 1 ? (
                <Link
                  href={buildUrlWithParam({ page: page - 1 })}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </Link>
              ) : (
                <span className="px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-400 cursor-not-allowed flex items-center gap-1">
                  <ChevronLeft className="w-4 h-4" /> Previous
                </span>
              )}

              <span className="text-xs text-zinc-500 px-3">
                Page {page} of {totalPages}
              </span>

              {page < totalPages ? (
                <Link
                  href={buildUrlWithParam({ page: page + 1 })}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 flex items-center gap-1"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </Link>
              ) : (
                <span className="px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-400 cursor-not-allowed flex items-center gap-1">
                  Next <ChevronRight className="w-4 h-4" />
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
