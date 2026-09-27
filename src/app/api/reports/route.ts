import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { reportSchema } from "@/lib/validations/interaction";
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from "@/lib/api-response";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return unauthorizedResponse();

    // Only staff can view reports queue
    if (session.role !== "ADMIN" && session.role !== "MODERATOR") {
      return forbiddenResponse("Only campus moderators and administrators can view reports");
    }

    const reports = await db.report.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        reporter: {
          select: {
            id: true,
            email: true,
            profile: { select: { fullName: true, branch: true } },
          },
        },
        targetListing: {
          include: {
            images: { take: 1 },
            user: { select: { id: true, email: true, profile: { select: { fullName: true } } } },
          },
        },
        targetUser: {
          select: {
            id: true,
            email: true,
            status: true,
            profile: { select: { fullName: true, enrollmentNumber: true } },
          },
        },
        moderationActions: {
          include: {
            moderator: {
              select: {
                profile: { select: { fullName: true } },
              },
            },
          },
        },
      },
    });

    return successResponse(reports);
  } catch (error) {
    console.error("Reports fetch error:", error);
    return errorResponse("Failed to fetch reports", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorizedResponse();

    const body = await req.json();
    const validated = reportSchema.safeParse(body);

    if (!validated.success) {
      return errorResponse("Invalid report submission", 422, validated.error.flatten());
    }

    const { targetType, targetListingId, targetUserId, reason, details } = validated.data;

    const report = await db.report.create({
      data: {
        reporterId: session.id,
        targetType,
        targetListingId: targetListingId || null,
        targetUserId: targetUserId || null,
        reason,
        details: details || null,
      },
    });

    return successResponse(report, "Report submitted successfully for campus review", 201);
  } catch (error) {
    console.error("Submit report error:", error);
    return errorResponse("Failed to submit report", 500);
  }
}
