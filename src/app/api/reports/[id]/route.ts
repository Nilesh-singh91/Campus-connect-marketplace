import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { moderationActionSchema } from "@/lib/validations/interaction";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
} from "@/lib/api-response";
import { ModerationActionType, ReportStatus, ListingStatus, UserStatus } from "@prisma/client";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) return unauthorizedResponse();

    if (session.role !== "ADMIN" && session.role !== "MODERATOR") {
      return forbiddenResponse("Only staff can resolve moderation reports");
    }

    const report = await db.report.findUnique({
      where: { id },
      include: { targetListing: true, targetUser: true },
    });

    if (!report) return notFoundResponse("Report not found");

    const body = await req.json();
    const validated = moderationActionSchema.safeParse(body);

    if (!validated.success) {
      return errorResponse("Invalid moderation parameters", 422, validated.error.flatten());
    }

    const { actionType, internalNotes } = validated.data;

    const result = await db.$transaction(async (tx) => {
      // 1. Record moderation action audit trail
      const action = await tx.moderationAction.create({
        data: {
          reportId: id,
          moderatorId: session.id,
          actionType,
          internalNotes: internalNotes || null,
        },
      });

      // 2. Perform requested enforcement
      let nextReportStatus: ReportStatus = ReportStatus.RESOLVED;

      if (actionType === ModerationActionType.REMOVE_LISTING && report.targetListingId) {
        await tx.listing.update({
          where: { id: report.targetListingId },
          data: { status: ListingStatus.REMOVED },
        });
      } else if (actionType === ModerationActionType.SUSPEND_USER) {
        const targetUserId = report.targetUserId || report.targetListing?.userId;
        if (targetUserId) {
          await tx.user.update({
            where: { id: targetUserId },
            data: { status: UserStatus.SUSPENDED },
          });
        }
      } else if (actionType === ModerationActionType.BAN_USER) {
        const targetUserId = report.targetUserId || report.targetListing?.userId;
        if (targetUserId) {
          await tx.user.update({
            where: { id: targetUserId },
            data: { status: UserStatus.BANNED },
          });
        }
      } else if (actionType === ModerationActionType.DISMISS_REPORT) {
        nextReportStatus = ReportStatus.DISMISSED;
      }

      // 3. Update report status
      const updatedReport = await tx.report.update({
        where: { id },
        data: { status: nextReportStatus },
      });

      return { action, report: updatedReport };
    });

    return successResponse(result, "Moderation action executed and logged in audit trail");
  } catch (error) {
    console.error("Moderation action error:", error);
    return errorResponse("Failed to execute moderation action", 500);
  }
}
