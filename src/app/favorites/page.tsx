import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ListingCard } from "@/components/marketplace/ListingCard";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Heart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export default async function FavoritesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const favorites = await db.favorite.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "desc" },
    include: {
      listing: {
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
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-zinc-200">
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">Saved Favorites</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Items you bookmarked for later consideration or campus purchase
        </p>
      </div>

      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {favorites.map((fav) => (
            <ListingCard
              key={fav.id}
              id={fav.listing.id}
              title={fav.listing.title}
              price={fav.listing.price}
              condition={fav.listing.condition}
              transactionType={fav.listing.transactionType}
              createdAt={fav.listing.createdAt}
              imageUrl={fav.listing.images[0]?.url}
              categoryName={fav.listing.category.name}
              sellerName={fav.listing.user.profile?.fullName}
              sellerBranch={fav.listing.user.profile?.branch || undefined}
              initialFavorited={true}
            />
          ))}
        </div>
      ) : (
        <div className="p-16 text-center bg-white rounded-3xl border border-zinc-200 space-y-4 max-w-md mx-auto">
          <Heart className="w-12 h-12 text-zinc-300 mx-auto" />
          <h3 className="font-semibold text-zinc-900 text-lg">No saved favorites yet</h3>
          <p className="text-sm text-zinc-500">
            Click the heart icon on any listing while browsing to save it to your wishlist.
          </p>
          <div className="pt-2">
            <Link href="/browse">
              <Button size="sm" className="gap-1.5 font-semibold">
                Explore Marketplace <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
