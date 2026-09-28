import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { createLostFoundSchema } from "@/lib/validations/lost-and-found";
import { successResponse, errorResponse, unauthorizedResponse } from "@/lib/api-response";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // LOST or FOUND
    const status = searchParams.get("status"); // OPEN, CLAIMED, RESOLVED
    const category = searchParams.get("category");
    const query = searchParams.get("query");
    const college = searchParams.get("college");

    const session = await getSession();

    const where: Prisma.LostAndFoundItemWhereInput = {};

    if (type && (type === "LOST" || type === "FOUND")) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    if (category) {
      where.category = category;
    }

    // Campus-level filtering:
    if (college) {
      if (college !== "all") {
        where.collegeDomain = {
          OR: [{ id: college }, { domain: college }],
        };
      }
    } else if (session?.collegeDomainId) {
      where.collegeDomainId = session.collegeDomainId;
    }

    if (query) {
      where.OR = [
        { title: { contains: query } },
        { location: { contains: query } },
        { description: { contains: query } },
      ];
    }

    const items = await db.lostAndFoundItem.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                fullName: true,
                avatarUrl: true,
                branch: true,
                yearOfStudy: true,
              },
            },
          },
        },
        collegeDomain: {
          select: {
            id: true,
            collegeName: true,
            domain: true,
          },
        },
        claims: {
          select: {
            id: true,
            status: true,
            claimantId: true,
            createdAt: true,
          },
        },
      },
    });

    return successResponse(items);
  } catch (error: any) {
    console.error("Lost & Found fetch error:", error);
    return errorResponse("Failed to fetch lost and found items", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorizedResponse();

    const body = await req.json();
    const validated = createLostFoundSchema.safeParse(body);

    if (!validated.success) {
      return errorResponse("Validation error", 422, validated.error.flatten());
    }

    const { type, title, description, category, location, custodyLocation, secretQuestion, imageUrl } =
      validated.data;

    const item = await db.lostAndFoundItem.create({
      data: {
        type,
        title,
        description,
        category,
        location,
        custodyLocation: custodyLocation || (type === "FOUND" ? "With Student Finder" : undefined),
        secretQuestion: secretQuestion || null,
        imageUrl: imageUrl || null,
        status: "OPEN",
        userId: session.id,
        collegeDomainId: session.collegeDomainId || null,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                fullName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    return successResponse(item, "Item reported successfully", 201);
  } catch (error: any) {
    console.error("Create Lost & Found item error:", error);
    return errorResponse("Failed to report item", 500);
  }
}
