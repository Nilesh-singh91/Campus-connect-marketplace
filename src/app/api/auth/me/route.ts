import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return successResponse({ user: null });
    }

    const user = await db.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        email: true,
        role: true,
        isEmailVerified: true,
        status: true,
        collegeDomainId: true,
        collegeDomain: {
          select: { collegeName: true, domain: true },
        },
        profile: {
          select: {
            fullName: true,
            avatarUrl: true,
            branch: true,
            yearOfStudy: true,
          },
        },
      },
    });

    if (!user || user.status !== "ACTIVE") {
      return successResponse({ user: null });
    }

    return successResponse({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        fullName: user.profile?.fullName || "Student",
        avatarUrl: user.profile?.avatarUrl || null,
        branch: user.profile?.branch || null,
        yearOfStudy: user.profile?.yearOfStudy || null,
        collegeDomainId: user.collegeDomainId,
        collegeName: user.collegeDomain?.collegeName || null,
      },
    });
  } catch (error) {
    console.error("Auth check error:", error);
    return errorResponse("Failed to fetch session", 500);
  }
}
