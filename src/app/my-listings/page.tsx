import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { formatPrice, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Package, PlusCircle, Edit, ExternalLink, Eye, Heart } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MyListingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const listings = await db.listing.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      images: { take: 1 },
      _count: {
        select: { favorites: true },
      },
    },
  });

  const statusVariants: Record<string, "success" | "warning" | "destructive" | "secondary"> = {
    AVAILABLE: "success",
    RESERVED: "warning",
    SOLD: "destructive",
    REMOVED: "secondary",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">My Marketplace Listings</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Manage your items, adjust prices, and update availability status
          </p>
        </div>
        <Link href="/listings/create">
          <Button size="sm" className="gap-2 rounded-xl font-semibold shadow-xs">
            <PlusCircle className="w-4 h-4" /> Add New Item
          </Button>
        </Link>
      </div>

      {listings.length > 0 ? (
        <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-xs divide-y divide-zinc-200">
          {listings.map((item) => (
            <div key={item.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-zinc-50 transition-colors">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-zinc-100 shrink-0 border border-zinc-200">
                  <img
                    src={item.images[0]?.url || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=300&q=80"}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant={statusVariants[item.status] || "secondary"} className="text-[10px]">
                      {item.status}
                    </Badge>
                    <span className="text-xs text-zinc-400">{item.category.name}</span>
                  </div>
                  <h3 className="font-semibold text-zinc-900 text-base truncate mt-1">{item.title}</h3>
                  <div className="flex items-center gap-4 text-xs text-zinc-500 mt-1">
                    <span className="font-bold text-zinc-800 text-sm">{formatPrice(item.price)}</span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" /> {item.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 text-rose-500" /> {item._count.favorites}
                    </span>
                    <span>{formatDate(item.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <Link href={`/listings/${item.id}`}>
                  <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                    <ExternalLink className="w-3.5 h-3.5" /> View
                  </Button>
                </Link>
                <Link href={`/listings/${item.id}/edit`}>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-16 text-center bg-white rounded-3xl border border-zinc-200 space-y-4 max-w-md mx-auto">
          <Package className="w-12 h-12 text-zinc-300 mx-auto" />
          <h3 className="font-semibold text-zinc-900 text-lg">You haven&apos;t posted any items yet</h3>
          <p className="text-sm text-zinc-500">
            Have old engineering books, notes, or gadgets? List them now and connect directly with campus buyers!
          </p>
          <div className="pt-2">
            <Link href="/listings/create">
              <Button size="sm">Create Your First Listing</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
