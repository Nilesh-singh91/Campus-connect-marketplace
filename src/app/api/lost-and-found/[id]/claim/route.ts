import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { claimLostFoundSchema } from "@/lib/validations/lost-and-found";
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from "@/lib/api-response";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: itemId } = await params;
    const session = await getSession();
    if (!session) return unauthorizedResponse();

    const body = await req.json();
    const validated = claimLostFoundSchema.safeParse(body);

    if (!validated.success) {
      return errorResponse("Validation error", 422, validated.error.flatten());
    }

    const { proofText } = validated.data;

    const item = await db.lostAndFoundItem.findUnique({
      where: { id: itemId },
      include: { user: true, collegeDomain: true },
    });

    if (!item) {
      return errorResponse("Item not found", 404);
    }

    if (item.userId === session.id) {
      return errorResponse("You cannot claim an item you posted yourself", 400);
    }

    if (item.status === "RESOLVED") {
      return errorResponse("This item has already been returned and resolved", 400);
    }

    // Campus restriction check
    if (session.collegeDomainId && item.collegeDomainId && session.collegeDomainId !== item.collegeDomainId) {
      return forbiddenResponse("Claims are restricted to students from the same college campus");
    }

    // Check if user already submitted a claim
    const existingClaim = await db.lostFoundClaim.findFirst({
      where: {
        itemId,
        claimantId: session.id,
        status: { in: ["PENDING", "APPROVED"] },
      },
    });

    if (existingClaim) {
      return errorResponse("You have already submitted a claim for this item", 400);
    }

    const claim = await db.lostFoundClaim.create({
      data: {
        itemId,
        claimantId: session.id,
        proofText,
        status: "PENDING",
      },
    });

    // Notify the finder/poster
    await db.notification.create({
      data: {
        userId: item.userId,
        type: "LOST_FOUND_CLAIM",
        title: "New Claim Submitted",
        content: `A student has claimed "${item.title}". Review their proof in the Lost & Found portal.`,
        link: `/lost-and-found?itemId=${item.id}`,
      },
    });

    return successResponse(claim, "Claim submitted successfully. Awaiting finder verification.", 201);
  } catch (error: any) {
    console.error("Submit Lost & Found claim error:", error);
    return errorResponse("Failed to submit claim", 500);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: itemId } = await params;
    const session = await getSession();
    if (!session) return unauthorizedResponse();

    const body = await req.json();
    const { claimId, action, verificationOtp } = body;

    if (!claimId || !action || !["APPROVE", "REJECT", "RESOLVE"].includes(action)) {
      return errorResponse("Invalid action or missing claimId", 400);
    }

    const item = await db.lostAndFoundItem.findUnique({
      where: { id: itemId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: { select: { fullName: true } },
          },
        },
      },
    });

    if (!item) {
      return errorResponse("Item not found", 404);
    }

    const claim = await db.lostFoundClaim.findUnique({
      where: { id: claimId },
      include: {
        claimant: {
          select: {
            id: true,
            email: true,
            profile: { select: { fullName: true } },
          },
        },
      },
    });

    if (!claim || claim.itemId !== itemId) {
      return errorResponse("Claim not found for this item", 404);
    }

    const isItemOwner = session.id === item.userId;
    const isClaimant = session.id === claim.claimantId;
    const isAdmin = session.role === "ADMIN" || session.role === "MODERATOR";

    if (action === "APPROVE") {
      if (!isItemOwner && !isAdmin) {
        return forbiddenResponse("Only the finder or moderator can approve a claim");
      }

      // Generate a 4-digit verification code
      const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();

      const updatedClaim = await db.lostFoundClaim.update({
        where: { id: claimId },
        data: {
          status: "APPROVED",
          verificationOtp: generatedOtp,
          reviewedAt: new Date(),
        },
      });

      await db.lostAndFoundItem.update({
        where: { id: itemId },
        data: { status: "CLAIMED" },
      });

      const finderName = item.user.profile?.fullName || "The finder";
      const custodyNote = item.custodyLocation ? ` Custody: ${item.custodyLocation}.` : "";

      // Notify the claimant with OTP
      await db.notification.create({
        data: {
          userId: claim.claimantId,
          type: "LOST_FOUND_CLAIM",
          title: "Claim Approved! Handshake Code Generated",
          content: `Your claim for "${item.title}" was approved by ${finderName}.${custodyNote} Handshake OTP: ${generatedOtp}. Present this code during handover to confirm custody.`,
          link: `/lost-and-found?itemId=${item.id}`,
        },
      });

      return successResponse(updatedClaim, "Claim approved and verification handshake code generated");
    }

    if (action === "REJECT") {
      if (!isItemOwner && !isAdmin) {
        return forbiddenResponse("Only the finder or moderator can reject a claim");
      }

      const updatedClaim = await db.lostFoundClaim.update({
        where: { id: claimId },
        data: {
          status: "REJECTED",
          reviewedAt: new Date(),
        },
      });

      // If no other approved claims remain, return item status to OPEN
      const activeApproved = await db.lostFoundClaim.count({
        where: { itemId, status: "APPROVED" },
      });

      if (activeApproved === 0 && item.status !== "RESOLVED") {
        await db.lostAndFoundItem.update({
          where: { id: itemId },
          data: { status: "OPEN" },
        });
      }

      await db.notification.create({
        data: {
          userId: claim.claimantId,
          type: "LOST_FOUND_CLAIM",
          title: "Claim Verification Update",
          content: `The claim for "${item.title}" could not be verified by the finder.`,
          link: `/lost-and-found?itemId=${item.id}`,
        },
      });

      return successResponse(updatedClaim, "Claim rejected");
    }

    if (action === "RESOLVE") {
      // Both finder or claimant can complete the final handover handshake by submitting the matching OTP
      if (!isItemOwner && !isClaimant && !isAdmin) {
        return forbiddenResponse("Unauthorized to complete handshake");
      }

      if (!verificationOtp) {
        return errorResponse("Please enter the 4-digit verification OTP", 400);
      }

      if (claim.verificationOtp !== verificationOtp.trim()) {
        return errorResponse("Invalid OTP code. Please verify the 4-digit handshake code with the student.", 400);
      }

      const updatedClaim = await db.lostFoundClaim.update({
        where: { id: claimId },
        data: {
          status: "RESOLVED",
        },
      });

      await db.lostAndFoundItem.update({
        where: { id: itemId },
        data: {
          status: "RESOLVED",
          resolvedAt: new Date(),
        },
      });

      // Notify both parties
      await db.notification.createMany({
        data: [
          {
            userId: item.userId,
            type: "LOST_FOUND_CLAIM",
            title: "Item Successfully Returned",
            content: `Handshake complete! "${item.title}" has been successfully returned and marked as resolved.`,
            link: `/lost-and-found?itemId=${item.id}`,
          },
          {
            userId: claim.claimantId,
            type: "LOST_FOUND_CLAIM",
            title: "Item Custody Resolved",
            content: `Handshake confirmed! Thank you for using CampusConnect Lost & Found.`,
            link: `/lost-and-found?itemId=${item.id}`,
          },
        ],
      });

      return successResponse(updatedClaim, "Handshake completed successfully. Item marked as resolved!");
    }

    return errorResponse("Invalid action requested", 400);
  } catch (error: any) {
    console.error("Update claim status error:", error);
    return errorResponse("Failed to update claim status", 500);
  }
}
