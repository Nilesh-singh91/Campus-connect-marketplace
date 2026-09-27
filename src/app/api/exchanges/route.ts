import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { exchangeRequestSchema } from "@/lib/validations/interaction";
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from "@/lib/api-response";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return unauthorizedResponse();

    const exchanges = await db.exchangeRequest.findMany({
      where: {
        OR: [{ buyerId: session.id }, { sellerId: session.id }],
      },
      orderBy: { createdAt: "desc" },
      include: {
        targetListing: {
          include: {
            images: { take: 1 },
          },
        },
        offeredListing: {
          include: {
            images: { take: 1 },
          },
        },
        buyer: {
          select: {
            id: true,
            email: true,
            profile: { select: { fullName: true, branch: true } },
          },
        },
        seller: {
          select: {
            id: true,
            email: true,
            profile: { select: { fullName: true, branch: true } },
          },
        },
      },
    });

    return successResponse(exchanges);
  } catch (error) {
    console.error("Exchanges fetch error:", error);
    return errorResponse("Failed to fetch exchange requests", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorizedResponse();

    const body = await req.json();
    const validated = exchangeRequestSchema.safeParse(body);

    if (!validated.success) {
      return errorResponse("Invalid exchange request data", 422, validated.error.flatten());
    }

    const { targetListingId, offeredListingId, cashDifference, message } = validated.data;

    const targetListing = await db.listing.findUnique({
      where: { id: targetListingId },
      include: { user: true },
    });

    if (!targetListing) {
      return errorResponse("Target listing not found", 404);
    }

    if (targetListing.userId === session.id) {
      return errorResponse("You cannot submit an exchange request for your own listing", 400);
    }

    if (targetListing.status !== "AVAILABLE") {
      return errorResponse("This listing is no longer available for exchange", 400);
    }

    // If an offered listing is specified, verify ownership
    if (offeredListingId) {
      const offered = await db.listing.findUnique({
        where: { id: offeredListingId },
      });
      if (!offered || offered.userId !== session.id) {
        return forbiddenResponse("You can only offer items from your own active listings");
      }
    }

    const exchange = await db.exchangeRequest.create({
      data: {
        targetListingId,
        offeredListingId: offeredListingId || null,
        buyerId: session.id,
        sellerId: targetListing.userId,
        cashDifference,
        message: message || null,
      },
      include: {
        targetListing: true,
        offeredListing: true,
      },
    });

    // Notify seller
    await db.notification.create({
      data: {
        userId: targetListing.userId,
        type: "EXCHANGE_REQUEST",
        title: "New Exchange Proposal",
        content: `${session.fullName} submitted an exchange proposal for "${targetListing.title}".`,
        link: "/exchange-requests",
      },
    });

    return successResponse(exchange, "Exchange proposal submitted successfully", 201);
  } catch (error) {
    console.error("Exchange creation error:", error);
    return errorResponse("Failed to submit exchange proposal", 500);
  }
}
