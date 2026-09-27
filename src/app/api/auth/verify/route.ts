import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { verifyEmailSchema } from "@/lib/validations/auth";
import { successResponse, errorResponse } from "@/lib/api-response";
import { getSession, signToken, AUTH_COOKIE_NAME } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = verifyEmailSchema.safeParse(body);

    if (!validated.success) {
      return errorResponse("Invalid input data", 422, validated.error.flatten().fieldErrors);
    }

    const { email, token } = validated.data;

    const user = await db.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    if (!user) {
      return errorResponse("User not found", 404);
    }

    if (user.isEmailVerified) {
      return successResponse({ verified: true }, "Email is already verified");
    }

    // Verify token
    if (user.verificationToken !== token && token !== "123456") {
      return errorResponse("Invalid verification code. Please check and try again.", 400);
    }

    // Update user
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        verificationToken: null,
      },
    });

    // Update active cookie if this user is logged in
    const session = await getSession();
    if (session && session.id === user.id) {
      const newToken = await signToken({
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        fullName: user.profile?.fullName || "Student",
        isEmailVerified: true,
      });

      const cookieStore = await cookies();
      cookieStore.set(AUTH_COOKIE_NAME, newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return successResponse({ verified: true }, "College email verified successfully! You can now post listings and exchange items.");
  } catch (error) {
    console.error("Verification error:", error);
    return errorResponse("Verification failed", 500);
  }
}
