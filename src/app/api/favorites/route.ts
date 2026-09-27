import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse } from "@/lib/api-response";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return unauthorizedResponse();
    }

    const favorites = await db.favorite.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
      include: {
        listing: {
          include: {
            images: { take: 1 },
            category: true,
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

    return successResponse(favorites);
  } catch (error) {
    console.error("Favorites fetch error:", error);
    return errorResponse("Failed to fetch favorites", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return unauthorizedResponse();
    }

    const { listingId } = await req.json();
    if (!listingId) {
      return errorResponse("Listing ID is required", 400);
    }

    const existing = await db.favorite.findUnique({
      where: {
        userId_listingId: {
          userId: session.id,
          listingId,
        },
      },
    });

    if (existing) {
      await db.favorite.delete({
        where: { id: existing.id },
      });
      return successResponse({ favorited: false }, "Removed from favorites");
    } else {
      await db.favorite.create({
        data: {
          userId: session.id,
          listingId,
        },
      });
      return successResponse({ favorited: true }, "Saved to favorites");
    }
  } catch (error) {
    console.error("Toggle favorite error:", error);
    return errorResponse("Failed to update favorite status", 500);
  }
}
