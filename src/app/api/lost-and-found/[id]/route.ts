import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from "@/lib/api-response";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();

    const item = await db.lostAndFoundItem.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                fullName: true,
                avatarUrl: true,
                branch: true,
                phone: true,
              },
            },
          },
        },
        collegeDomain: {
          select: {
            id: true,
            collegeName: true,
            domain: true,
          },
        },
        claims: {
          orderBy: { createdAt: "desc" },
          include: {
            claimant: {
              select: {
                id: true,
                email: true,
                profile: {
                  select: {
                    fullName: true,
                    avatarUrl: true,
                    branch: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!item) {
      return errorResponse("Lost & Found item not found", 404);
    }

    // Security check: Only the poster or the claimant should see secret verification proof & OTP
    const isOwner = session?.id === item.userId;
    const isAdmin = session?.role === "ADMIN" || session?.role === "MODERATOR";

    const filteredClaims = item.claims.map((claim) => {
      const isClaimant = session?.id === claim.claimantId;
      if (isOwner || isAdmin || isClaimant) {
        return claim;
      }
      // For public / other users, sanitize claim details
      return {
        id: claim.id,
        itemId: claim.itemId,
        claimantId: claim.claimantId,
        status: claim.status,
        createdAt: claim.createdAt,
        proofText: "[Restricted]",
        verificationOtp: null,
      };
    });

    return successResponse({
      ...item,
      claims: filteredClaims,
    });
  } catch (error: any) {
    console.error("Fetch Lost & Found item detail error:", error);
    return errorResponse("Failed to fetch item details", 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) return unauthorizedResponse();

    const item = await db.lostAndFoundItem.findUnique({
      where: { id },
    });

    if (!item) {
      return errorResponse("Item not found", 404);
    }

    const isOwner = session.id === item.userId;
    const isAdmin = session.role === "ADMIN" || session.role === "MODERATOR";

    if (!isOwner && !isAdmin) {
      return forbiddenResponse("You are not authorized to delete this item");
    }

    await db.lostAndFoundItem.delete({
      where: { id },
    });

    return successResponse(null, "Item deleted successfully");
  } catch (error: any) {
    console.error("Delete Lost & Found item error:", error);
    return errorResponse("Failed to delete item", 500);
  }
}
