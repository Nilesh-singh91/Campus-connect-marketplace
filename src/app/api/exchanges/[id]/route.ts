import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { updateExchangeStatusSchema } from "@/lib/validations/interaction";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
} from "@/lib/api-response";
import { ExchangeStatus, ListingStatus } from "@prisma/client";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) return unauthorizedResponse();

    const exchange = await db.exchangeRequest.findUnique({
      where: { id },
      include: {
        targetListing: true,
        offeredListing: true,
      },
    });

    if (!exchange) return notFoundResponse("Exchange request not found");

    const body = await req.json();
    const validated = updateExchangeStatusSchema.safeParse(body);

    if (!validated.success) {
      return errorResponse("Invalid status update", 422, validated.error.flatten());
    }

    const { status } = validated.data;
    const isSeller = exchange.sellerId === session.id;
    const isBuyer = exchange.buyerId === session.id;

    if (!isSeller && !isBuyer) {
      return forbiddenResponse("You are not authorized to update this exchange");
    }

    if (exchange.status !== ExchangeStatus.PENDING) {
      return errorResponse(`Cannot modify an exchange that is already ${exchange.status}`, 400);
    }

    // Role specific rules
    if (status === ExchangeStatus.CANCELLED && !isBuyer) {
      return forbiddenResponse("Only the initiating student can cancel an exchange request");
    }
    if ((status === ExchangeStatus.ACCEPTED || status === ExchangeStatus.REJECTED) && !isSeller) {
      return forbiddenResponse("Only the listing owner can accept or reject an exchange request");
    }

    // Execute state transition atomically
    const result = await db.$transaction(async (tx) => {
      const updatedExchange = await tx.exchangeRequest.update({
        where: { id },
        data: { status },
      });

      // If accepted, reserve the listings
      if (status === ExchangeStatus.ACCEPTED) {
        await tx.listing.update({
          where: { id: exchange.targetListingId },
          data: { status: ListingStatus.RESERVED },
        });

        if (exchange.offeredListingId) {
          await tx.listing.update({
            where: { id: exchange.offeredListingId },
            data: { status: ListingStatus.RESERVED },
          });
        }
      }

      // Send notification to the opposite party
      const notifyUserId = isSeller ? exchange.buyerId : exchange.sellerId;
      await tx.notification.create({
        data: {
          userId: notifyUserId,
          type: "EXCHANGE_REQUEST",
          title: `Exchange Request ${status}`,
          content: `Your exchange proposal for "${exchange.targetListing.title}" was marked as ${status}.`,
          link: "/exchange-requests",
        },
      });

      return updatedExchange;
    });

    return successResponse(result, `Exchange request marked as ${status}`);
  } catch (error) {
    console.error("Exchange update error:", error);
    return errorResponse("Failed to update exchange request", 500);
  }
}
