import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { registerSchema } from "@/lib/validations/auth";
import { hashPassword, signToken, AUTH_COOKIE_NAME } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-response";
import crypto from "crypto";
import { Role } from "@/types/enums";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = registerSchema.safeParse(body);

    if (!validated.success) {
      return errorResponse("Validation failed", 422, validated.error.flatten().fieldErrors);
    }

    const { fullName, email, password, enrollmentNumber, branch, yearOfStudy, phone } = validated.data;

    // Check existing email
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return errorResponse("An account with this college email already exists. Please log in.", 409);
    }

    // Identify or link college domain
    const emailDomain = email.split("@")[1].toLowerCase();
    let collegeDomain = await db.collegeDomain.findUnique({
      where: { domain: emailDomain },
    });

    if (!collegeDomain) {
      let collegeName = `${emailDomain.split(".")[0].toUpperCase()} Campus`;
      if (emailDomain === "liet.in") collegeName = "Lloyd Institute of Engineering & Technology (LIET)";
      else if (emailDomain === "glbitm.ac.in") collegeName = "GL Bajaj Institute of Technology & Management (GLBITM)";
      else if (emailDomain === "gniot.net.in") collegeName = "Greater Noida Institute of Technology (GNIOT)";
      else if (emailDomain === "galgotiascollege.edu") collegeName = "Galgotias College of Engineering & Technology (GCET)";
      else if (emailDomain === "sharda.ac.in") collegeName = "Sharda University, Greater Noida";
      else if (emailDomain === "bennett.edu.in") collegeName = "Bennett University, Greater Noida";
      else if (emailDomain === "aktu.in") collegeName = "Dr. A.P.J. Abdul Kalam Technical University (AKTU)";

      collegeDomain = await db.collegeDomain.create({
        data: {
          domain: emailDomain,
          collegeName,
          isActive: true,
        },
      });
    }

    // Password hash & verification token
    const passwordHash = await hashPassword(password);
    const verificationToken = crypto.randomInt(100000, 999999).toString();

    // Create user & profile transaction
    const newUser = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          role: Role.STUDENT,
          isEmailVerified: false,
          verificationToken,
          collegeDomainId: collegeDomain.id,
          profile: {
            create: {
              fullName,
              enrollmentNumber,
              branch,
              yearOfStudy,
              phone: phone || null,
            },
          },
        },
        include: {
          profile: true,
          collegeDomain: true,
        },
      });

      // Create welcome notification
      await tx.notification.create({
        data: {
          userId: user.id,
          type: "SYSTEM",
          title: "Welcome to CampusConnect!",
          content: `Hi ${fullName}, welcome to your official ${collegeDomain.collegeName} marketplace. Start browsing items or list your used books and gear for your campus peers.`,
          link: "/browse",
        },
      });

      return user;
    });

    // Sign session token
    const token = await signToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role as Role,
      fullName: newUser.profile?.fullName || fullName,
      isEmailVerified: newUser.isEmailVerified,
      collegeDomainId: collegeDomain.id,
      collegeName: collegeDomain.collegeName,
    });

    // Set HTTP-only Cookie
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return successResponse(
      {
        user: {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
          isEmailVerified: newUser.isEmailVerified,
          fullName: newUser.profile?.fullName,
          collegeDomainId: collegeDomain.id,
          collegeName: collegeDomain.collegeName,
        },
        verificationCode: verificationToken,
      },
      "Registration successful! Your college account has been created.",
      201
    );
  } catch (error) {
    console.error("Registration error:", error);
    return errorResponse("Internal server error during registration", 500);
  }
}
