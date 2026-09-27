import { db } from "@/lib/db";
import { ListingCard } from "@/components/marketplace/ListingCard";
import { FilterSidebar } from "@/components/marketplace/FilterSidebar";
import { Prisma } from "@prisma/client";
import Link from "next/link";
import { ChevronLeft, ChevronRight, PackageOpen } from "lucide-react";

export const dynamic = "force-dynamic";

interface BrowsePageProps {
  searchParams: Promise<{
    query?: string;
    category?: string;
    condition?: string;
    type?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const limit = 12;
  const skip = (page - 1) * limit;

  const where: Prisma.ListingWhereInput = {
    status: "AVAILABLE",
  };

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

  if (params.minPrice || params.maxPrice) {
    where.price = {};
    if (params.minPrice) where.price.gte = parseFloat(params.minPrice);
    if (params.maxPrice) where.price.lte = parseFloat(params.maxPrice);
  }

  let orderBy: Prisma.ListingOrderByWithRelationInput = { createdAt: "desc" };
  if (params.sort === "price_asc") orderBy = { price: "asc" };
  if (params.sort === "price_desc") orderBy = { price: "desc" };

  const [categories, listings, total] = await Promise.all([
    db.category.findMany({
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
        images: { take: 1, orderBy: { displayOrder: "asc" } },
        user: {
          select: {
            id: true,
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">Marketplace Catalog</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Showing {total} verified student {total === 1 ? "item" : "items"} available on campus
          </p>
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-zinc-500 text-xs font-medium">Sort by:</span>
          <select
            defaultValue={params.sort || "newest"}
            onChange={(e) => {
              window.location.href = buildUrlWithParam({ sort: e.target.value, page: 1 });
            }}
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 bg-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="newest">Recently Listed</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Filter Sidebar */}
        <div className="lg:col-span-1">
          <FilterSidebar categories={categories} />
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
