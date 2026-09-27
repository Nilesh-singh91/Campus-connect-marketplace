import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminClient } from "./AdminClient";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  const [
    totalUsers,
    totalListings,
    activeListings,
    soldListings,
    totalExchanges,
    pendingReports,
    users,
    categories,
  ] = await Promise.all([
    db.user.count(),
    db.listing.count(),
    db.listing.count({ where: { status: "AVAILABLE" } }),
    db.listing.count({ where: { status: "SOLD" } }),
    db.exchangeRequest.count(),
    db.report.count({ where: { status: "PENDING" } }),
    db.user.findMany({
      take: 25,
      orderBy: { createdAt: "desc" },
      include: {
        profile: true,
        collegeDomain: true,
      },
    }),
    db.category.findMany({
      include: {
        _count: { select: { listings: true } },
      },
    }),
  ]);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="pb-4 border-b border-zinc-200 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
            Campus Administrator Console
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            System overview, student account privileges, security enforcement, and marketplace analytics
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-100 text-purple-800">
          Admin Privilege Active
        </span>
      </div>

      <AdminClient
        metrics={{
          totalUsers,
          totalListings,
          activeListings,
          soldListings,
          totalExchanges,
          pendingReports,
        }}
        initialUsers={users}
        categories={categories}
      />
    </div>
  );
}
