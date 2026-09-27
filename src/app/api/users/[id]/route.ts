import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { updateProfileSchema } from "@/lib/validations/auth";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
} from "@/lib/api-response";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        isEmailVerified: true,
        createdAt: true,
        collegeDomain: {
          select: { collegeName: true, domain: true },
        },
        profile: true,
        listings: {
          where: { status: "AVAILABLE" },
          orderBy: { createdAt: "desc" },
          include: {
            images: { take: 1 },
            category: true,
          },
        },
      },
    });

    if (!user) return notFoundResponse("Student not found");

    return successResponse(user);
  } catch (error) {
    console.error("Student profile fetch error:", error);
    return errorResponse("Failed to fetch student profile", 500);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) return unauthorizedResponse();

    if (session.id !== id && session.role !== "ADMIN") {
      return forbiddenResponse("You can only modify your own profile");
    }

    const body = await req.json();
    const validated = updateProfileSchema.safeParse(body);

    if (!validated.success) {
      return errorResponse("Invalid profile information", 422, validated.error.flatten());
    }

    const { fullName, branch, yearOfStudy, phone, bio, avatarUrl } = validated.data;

    const updatedProfile = await db.studentProfile.update({
      where: { userId: id },
      data: {
        ...(fullName && { fullName }),
        ...(branch !== undefined && { branch }),
        ...(yearOfStudy !== undefined && { yearOfStudy }),
        ...(phone !== undefined && { phone }),
        ...(bio !== undefined && { bio }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      },
    });

    return successResponse(updatedProfile, "Profile updated successfully");
  } catch (error) {
    console.error("Profile update error:", error);
    return errorResponse("Failed to update profile", 500);
  }
}
