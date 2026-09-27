import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from "@/lib/api-response";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return unauthorizedResponse();

    if (session.role !== "ADMIN") {
      return forbiddenResponse("Admin privilege required");
    }

    const [
      totalUsers,
      totalListings,
      activeListings,
      soldListings,
      totalExchanges,
      pendingReports,
      recentUsers,
      categories,
    ] = await Promise.all([
      db.user.count(),
      db.listing.count(),
      db.listing.count({ where: { status: "AVAILABLE" } }),
      db.listing.count({ where: { status: "SOLD" } }),
      db.exchangeRequest.count(),
      db.report.count({ where: { status: "PENDING" } }),
      db.user.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
          isEmailVerified: true,
          createdAt: true,
          profile: { select: { fullName: true, branch: true, enrollmentNumber: true } },
        },
      }),
      db.category.findMany({
        include: {
          _count: { select: { listings: true } },
        },
      }),
    ]);

    return successResponse({
      metrics: {
        totalUsers,
        totalListings,
        activeListings,
        soldListings,
        totalExchanges,
        pendingReports,
      },
      recentUsers,
      categories,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return errorResponse("Failed to fetch admin stats", 500);
  }
}
