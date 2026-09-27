import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from "@/lib/api-response";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return unauthorizedResponse();

    const conversations = await db.conversation.findMany({
      where: {
        members: {
          some: { userId: session.id },
        },
      },
      orderBy: { updatedAt: "desc" },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            price: true,
            status: true,
            collegeDomainId: true,
            collegeDomain: { select: { collegeName: true, domain: true } },
            images: { take: 1, select: { url: true } },
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                collegeDomainId: true,
                collegeDomain: { select: { collegeName: true, domain: true } },
                profile: { select: { fullName: true, avatarUrl: true, branch: true } },
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    return successResponse(conversations);
  } catch (error) {
    console.error("Conversations fetch error:", error);
    return errorResponse("Failed to fetch conversations", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorizedResponse();

    const { listingId, recipientId } = await req.json();

    if (!recipientId) {
      return errorResponse("Recipient user ID is required", 400);
    }

    if (recipientId === session.id) {
      return errorResponse("You cannot start a conversation with yourself", 400);
    }

    // College Isolation Check: Verify current user and recipient/listing campus
    const currentUser = await db.user.findUnique({
      where: { id: session.id },
      include: { collegeDomain: true },
    });

    if (listingId) {
      const listing = await db.listing.findUnique({
        where: { id: listingId },
        include: {
          collegeDomain: true,
          user: { include: { collegeDomain: true } },
        },
      });

      if (!listing) {
        return errorResponse("Item not found", 404);
      }

      const listingCampusId = listing.collegeDomainId || listing.user.collegeDomainId;
      if (
        currentUser?.collegeDomainId &&
        listingCampusId &&
        currentUser.collegeDomainId !== listingCampusId
      ) {
        const listingCollege = listing.collegeDomain?.collegeName || listing.user.collegeDomain?.collegeName || "another college";
        const myCollege = currentUser.collegeDomain?.collegeName || "your college";
        return forbiddenResponse(
          `Campus Restriction: You can only communicate about and purchase items from students at ${myCollege}. This listing is restricted to ${listingCollege}.`
        );
      }
    } else {
      // Direct recipient check
      const recipientUser = await db.user.findUnique({
        where: { id: recipientId },
        include: { collegeDomain: true },
      });

      if (
        currentUser?.collegeDomainId &&
        recipientUser?.collegeDomainId &&
        currentUser.collegeDomainId !== recipientUser.collegeDomainId
      ) {
        return forbiddenResponse(
          "Campus Restriction: Direct messaging is restricted to students registered at the same college campus."
        );
      }
    }

    // Check if conversation already exists between these 2 users for this listing
    const existing = await db.conversation.findFirst({
      where: {
        listingId: listingId || undefined,
        AND: [
          { members: { some: { userId: session.id } } },
          { members: { some: { userId: recipientId } } },
        ],
      },
    });

    if (existing) {
      return successResponse(existing, "Conversation retrieved");
    }

    // Create new conversation with members
    const newConv = await db.conversation.create({
      data: {
        listingId: listingId || null,
        members: {
          create: [{ userId: session.id }, { userId: recipientId }],
        },
      },
    });

    return successResponse(newConv, "Conversation created", 201);
  } catch (error) {
    console.error("Create conversation error:", error);
    return errorResponse("Failed to create conversation", 500);
  }
}
