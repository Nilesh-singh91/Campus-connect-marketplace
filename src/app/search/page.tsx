import { db } from "@/lib/db";
import { ListingCard } from "@/components/marketplace/ListingCard";
import Link from "next/link";
import { Search, ArrowLeft, PackageOpen } from "lucide-react";

export const dynamic = "force-dynamic";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q?.trim() || "";

  let listings: any[] = [];
  if (query) {
    listings = await db.listing.findMany({
      where: {
        status: "AVAILABLE",
        OR: [
          { title: { contains: query } },
          { description: { contains: query } },
        ],
      },
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        images: { take: 1 },
        user: {
          select: {
            id: true,
            profile: { select: { fullName: true, branch: true } },
          },
        },
      },
    });
  }

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="space-y-4">
        <Link href="/browse" className="text-xs font-semibold text-zinc-500 hover:text-indigo-600 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Catalog
        </Link>

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
            Search Results for &ldquo;{query}&rdquo;
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Found {listings.length} campus {listings.length === 1 ? "match" : "matches"}
          </p>
        </div>
      </div>

      {listings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
        <div className="p-16 text-center bg-white rounded-3xl border border-zinc-200 space-y-4 max-w-lg mx-auto">
          <Search className="w-12 h-12 text-zinc-300 mx-auto" />
          <h3 className="font-semibold text-zinc-900 text-lg">No matches found for &ldquo;{query}&rdquo;</h3>
          <p className="text-sm text-zinc-500">
            Check the spelling or try searching for keywords like &ldquo;Casio&rdquo;, &ldquo;Algorithms&rdquo;, &ldquo;Drafter&rdquo;, or &ldquo;Bicycle&rdquo;.
          </p>
          <div className="pt-2">
            <Link
              href="/browse"
              className="inline-block px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              Browse All Listings
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
