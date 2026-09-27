import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
} from "@/lib/api-response";
import { UserStatus, Role } from "@/types/enums";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) return unauthorizedResponse();

    if (session.role !== "ADMIN") {
      return forbiddenResponse("Only administrators can manage user accounts");
    }

    const user = await db.user.findUnique({ where: { id } });
    if (!user) return notFoundResponse("User not found");

    const body = await req.json();
    const updateData: any = {};

    if (body.status && Object.values(UserStatus).includes(body.status)) {
      updateData.status = body.status;
    }

    if (body.role && Object.values(Role).includes(body.role)) {
      updateData.role = body.role;
    }

    const updated = await db.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        isEmailVerified: true,
      },
    });

    return successResponse(updated, "User status updated successfully");
  } catch (error) {
    console.error("Admin user update error:", error);
    return errorResponse("Failed to update user", 500);
  }
}
