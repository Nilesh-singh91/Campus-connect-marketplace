import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { listingSchema } from "@/lib/validations/listing";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
} from "@/lib/api-response";
import { ListingStatus } from "@/types/enums";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();

    // Increment view count atomically
    const listing = await db.listing.update({
      where: { id },
      data: { views: { increment: 1 } },
      include: {
        images: {
          orderBy: { displayOrder: "asc" },
        },
        category: true,
        collegeDomain: {
          select: { id: true, collegeName: true, domain: true },
        },
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            isEmailVerified: true,
            createdAt: true,
            collegeDomain: {
              select: { id: true, collegeName: true, domain: true },
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

    if (!listing) {
      return notFoundResponse("Listing not found");
    }

    // Check if user favorited
    let isFavorited = false;
    if (session) {
      const fav = await db.favorite.findUnique({
        where: {
          userId_listingId: {
            userId: session.id,
            listingId: id,
          },
        },
      });
      isFavorited = !!fav;
    }

    // Related listings in the same category on the same campus
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
      select: {
        id: true,
        title: true,
        price: true,
        condition: true,
        transactionType: true,
        collegeDomainId: true,
        collegeDomain: {
          select: { id: true, collegeName: true, domain: true },
        },
        images: {
          take: 1,
          select: { url: true },
        },
      },
    });

    return successResponse({
      ...listing,
      isFavorited,
      relatedListings,
    });
  } catch (error) {
    console.error("Listing detail error:", error);
    return notFoundResponse("Listing not found");
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();

    if (!session) {
      return unauthorizedResponse();
    }

    const listing = await db.listing.findUnique({
      where: { id },
    });

    if (!listing) {
      return notFoundResponse("Listing not found");
    }

    // IDOR & Authorization check: only owner or Admin/Moderator
    const isOwner = listing.userId === session.id;
    const isStaff = session.role === "ADMIN" || session.role === "MODERATOR";

    if (!isOwner && !isStaff) {
      return forbiddenResponse("You do not have permission to modify this listing");
    }

    const body = await req.json();

    // Partial update or status change
    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.price !== undefined) updateData.price = body.price;
    if (body.condition !== undefined) updateData.condition = body.condition;
    if (body.transactionType !== undefined) updateData.transactionType = body.transactionType;
    if (body.categoryId !== undefined) updateData.categoryId = body.categoryId;
    if (body.status !== undefined && Object.values(ListingStatus).includes(body.status)) {
      updateData.status = body.status;
    }

    const updated = await db.listing.update({
      where: { id },
      data: updateData,
      include: {
        images: true,
        category: true,
      },
    });

    return successResponse(updated, "Listing updated successfully");
  } catch (error) {
    console.error("Update listing error:", error);
    return errorResponse("Failed to update listing", 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();

    if (!session) {
      return unauthorizedResponse();
    }

    const listing = await db.listing.findUnique({
      where: { id },
    });

    if (!listing) {
      return notFoundResponse("Listing not found");
    }

    const isOwner = listing.userId === session.id;
    const isStaff = session.role === "ADMIN" || session.role === "MODERATOR";

    if (!isOwner && !isStaff) {
      return forbiddenResponse("You do not have permission to delete this listing");
    }

    await db.listing.delete({
      where: { id },
    });

    return successResponse({ deleted: true }, "Listing deleted successfully");
  } catch (error) {
    console.error("Delete listing error:", error);
    return errorResponse("Failed to delete listing", 500);
  }
}
