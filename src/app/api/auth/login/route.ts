import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { loginSchema } from "@/lib/validations/auth";
import { comparePassword, signToken, AUTH_COOKIE_NAME } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-response";
import { Role } from "@/types/enums";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = loginSchema.safeParse(body);

    if (!validated.success) {
      return errorResponse("Invalid input credentials", 422, validated.error.flatten().fieldErrors);
    }

    const { email, password } = validated.data;

    const user = await db.user.findUnique({
      where: { email },
      include: {
        profile: true,
      },
    });

    if (!user) {
      return errorResponse("Invalid email or password", 401);
    }

    if (user.status === "BANNED" || user.status === "SUSPENDED") {
      return errorResponse("Your student account has been suspended by campus moderators. Please contact student affairs.", 403);
    }

    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return errorResponse("Invalid email or password", 401);
    }

    const token = await signToken({
      id: user.id,
      email: user.email,
      role: user.role as Role,
      fullName: user.profile?.fullName || "Student",
      isEmailVerified: user.isEmailVerified,
    });

    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return successResponse(
      {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          fullName: user.profile?.fullName,
        },
      },
      "Logged in successfully"
    );
  } catch (error) {
    console.error("Login error:", error);
    return errorResponse("Internal server error during login", 500);
  }
}
