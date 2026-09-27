import Link from "next/link";
import { db } from "@/lib/db";
import { ListingCard } from "@/components/marketplace/ListingCard";
import { Button } from "@/components/ui/Button";
import {
  GraduationCap,
  ShieldCheck,
  Repeat,
  Sparkles,
  ArrowRight,
  BookOpen,
  Laptop,
  Wrench,
  FileText,
  Home,
  Bike,
  Trophy,
} from "lucide-react";

export const dynamic = "force-dynamic";

const iconMap: Record<string, React.ReactNode> = {
  BookOpen: <BookOpen className="w-6 h-6 text-indigo-600" />,
  Laptop: <Laptop className="w-6 h-6 text-indigo-600" />,
  Wrench: <Wrench className="w-6 h-6 text-indigo-600" />,
  FileText: <FileText className="w-6 h-6 text-indigo-600" />,
  Home: <Home className="w-6 h-6 text-indigo-600" />,
  Bike: <Bike className="w-6 h-6 text-indigo-600" />,
  Trophy: <Trophy className="w-6 h-6 text-indigo-600" />,
};

export default async function HomePage() {
  let categories: any[] = [];
  let recentListings: any[] = [];

  try {
    [categories, recentListings] = await Promise.all([
      db.category.findMany({
        where: { isActive: true },
        take: 6,
        include: {
          _count: { select: { listings: { where: { status: "AVAILABLE" } } } },
        },
      }),
      db.listing.findMany({
        where: { status: "AVAILABLE" },
        orderBy: { createdAt: "desc" },
        take: 8,
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
    ]);
  } catch (e) {
    console.error("Home page DB fetch error:", e);
  }

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative rounded-3xl bg-linear-to-b from-indigo-900 via-indigo-950 to-zinc-950 text-white p-8 md:p-14 overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold backdrop-blur-md">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Exclusive to Verified Campus Students
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
            Buy, Sell & Exchange Used Campus Gear with Peer Trust.
          </h1>

          <p className="text-base md:text-lg text-indigo-200/90 leading-relaxed max-w-2xl">
            Pass on your previous semester engineering textbooks, lab drafters, scientific calculators, bicycles, and notes directly to your juniors without any middlemen or commission.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link href="/browse">
              <Button size="lg" className="rounded-xl font-semibold gap-2 shadow-lg shadow-indigo-600/30">
                Explore Campus Market
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/listings/create">
              <Button variant="outline" size="lg" className="rounded-xl font-semibold text-zinc-900 border-white/20 hover:bg-white/10 hover:text-white bg-white/5 backdrop-blur-md">
                Post an Item for Sale / Exchange
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature Badges */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-12 mt-8 border-t border-indigo-800/40 text-xs text-indigo-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-300">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span>College Email ID Required</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-300">
              <Repeat className="w-4 h-4" />
            </div>
            <span>Direct Student Exchanges</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <span>Zero Platform Fees</span>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">Browse by Category</h2>
            <p className="text-sm text-zinc-500 mt-1">Discover items curated specifically for university life</p>
          </div>
          <Link href="/browse" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
            All Categories <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/browse?category=${cat.slug}`}
              className="p-5 rounded-2xl bg-white border border-zinc-200 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col items-center text-center group"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-50 group-hover:bg-indigo-100 flex items-center justify-center transition-colors mb-3">
                {iconMap[cat.icon || "BookOpen"] || <BookOpen className="w-6 h-6 text-indigo-600" />}
              </div>
              <h3 className="font-semibold text-zinc-900 text-xs sm:text-sm line-clamp-1">{cat.name}</h3>
              <p className="text-[11px] text-zinc-400 mt-1">{cat._count?.listings || 0} items</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Recently Listed Items */}
      <section className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">Freshly Added on Campus</h2>
            <p className="text-sm text-zinc-500 mt-1">Recently listed by students in your academic community</p>
          </div>
          <Link href="/browse" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
            View All Items <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {recentListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {recentListings.map((item) => (
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
          <div className="p-12 text-center bg-white rounded-2xl border border-zinc-200 space-y-3">
            <BookOpen className="w-10 h-10 text-zinc-300 mx-auto" />
            <h3 className="font-semibold text-zinc-800">No active listings yet</h3>
            <p className="text-sm text-zinc-500 max-w-sm mx-auto">
              Be the first to list a textbook, calculator, or hostel item for your campus peers!
            </p>
            <Link href="/listings/create" className="inline-block pt-2">
              <Button size="sm">Create First Listing</Button>
            </Link>
          </div>
        )}
      </section>

      {/* Safety & Trust Banner */}
      <section className="rounded-3xl bg-zinc-900 text-zinc-100 p-8 md:p-12">
        <div className="max-w-3xl space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold">Why Choose CampusConnect?</h2>
          <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
            Standard classified sites are plagued by anonymous scammers and logistical friction. CampusConnect guarantees:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div className="p-4 rounded-xl bg-zinc-800/60 border border-zinc-700/60">
              <h4 className="font-semibold text-white text-sm">Strict College Verification</h4>
              <p className="text-xs text-zinc-400 mt-1">Every account belongs to an authenticated student with verified college enrollment.</p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-800/60 border border-zinc-700/60">
              <h4 className="font-semibold text-white text-sm">Safe On-Campus Handover</h4>
              <p className="text-xs text-zinc-400 mt-1">Exchange or buy items directly at the campus library, cafeteria, or department hostel.</p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-800/60 border border-zinc-700/60">
              <h4 className="font-semibold text-white text-sm">Item Exchange Engine</h4>
              <p className="text-xs text-zinc-400 mt-1">Trade your 2nd year books for 3rd year books without spending actual currency.</p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-800/60 border border-zinc-700/60">
              <h4 className="font-semibold text-white text-sm">Student Council Moderation</h4>
              <p className="text-xs text-zinc-400 mt-1">Dedicated campus moderators ensure all listings comply with academic safety standards.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
