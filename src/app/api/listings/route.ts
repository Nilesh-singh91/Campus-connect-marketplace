import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAuth, getSession } from "@/lib/auth";
import { listingSchema, listingQuerySchema } from "@/lib/validations/listing";
import { successResponse, errorResponse, unauthorizedResponse, forbiddenResponse } from "@/lib/api-response";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const parsedQuery = listingQuerySchema.safeParse(Object.fromEntries(searchParams.entries()));

    if (!parsedQuery.success) {
      return errorResponse("Invalid search parameters", 400, parsedQuery.error.flatten());
    }

    const session = await getSession();

    const {
      query,
      category,
      condition,
      transactionType,
      minPrice,
      maxPrice,
      college,
      campusOnly,
      sort,
      page,
      limit,
    } = parsedQuery.data;

    const where: Prisma.ListingWhereInput = {
      status: "AVAILABLE",
    };

    if (campusOnly === "true") {
      where.campusOnly = true;
    } else if (campusOnly === "false") {
      where.campusOnly = false;
    }

    // Campus-level filtering:
    // If college param is specified:
    // - "all": return listings from all colleges
    // - specific ID or domain string: filter by that college domain
    // If college param is NOT specified, default to the logged-in user's college
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
        { description: { contains: query } },
      ];
    }

    if (category) {
      where.category = { slug: category };
    }

    if (condition) {
      where.condition = condition as any;
    }

    if (transactionType) {
      where.transactionType = transactionType as any;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    let orderBy: Prisma.ListingOrderByWithRelationInput = { createdAt: "desc" };
    if (sort === "price_asc") orderBy = { price: "asc" };
    if (sort === "price_desc") orderBy = { price: "desc" };

    const skip = (page - 1) * limit;

    const [listings, total] = await Promise.all([
      db.listing.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          condition: true,
          transactionType: true,
          status: true,
          campusOnly: true,
          views: true,
          collegeDomainId: true,
          createdAt: true,
          collegeDomain: {
            select: { id: true, collegeName: true, domain: true },
          },
          category: {
            select: { id: true, name: true, slug: true },
          },
          images: {
            orderBy: { displayOrder: "asc" },
            take: 1,
            select: { id: true, url: true },
          },
          user: {
            select: {
              id: true,
              role: true,
              collegeDomainId: true,
              collegeDomain: {
                select: { id: true, collegeName: true, domain: true },
              },
              profile: {
                select: { fullName: true, branch: true, avatarUrl: true },
              },
            },
          },
          _count: {
            select: { favorites: true },
          },
        },
      }),
      db.listing.count({ where }),
    ]);

    return successResponse({
      listings,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Listings fetch error:", error);
    return errorResponse("Failed to fetch listings", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return unauthorizedResponse("You must be logged in to create a listing");
    }

    const user = await db.user.findUnique({
      where: { id: session.id },
      select: { isEmailVerified: true, status: true, collegeDomainId: true },
    });

    if (!user || user.status !== "ACTIVE") {
      return forbiddenResponse("Account is not active");
    }

    // Require verified college email to post
    if (!user.isEmailVerified) {
      return forbiddenResponse("You must verify your college email address before posting listings");
    }

    const body = await req.json();
    const validated = listingSchema.safeParse(body);

    if (!validated.success) {
      return errorResponse("Validation error", 422, validated.error.flatten().fieldErrors);
    }

    const { title, description, price, condition, transactionType, categoryId, campusOnly, images } = validated.data;

    // Verify category exists
    const cat = await db.category.findUnique({ where: { id: categoryId } });
    if (!cat) {
      return errorResponse("Selected category does not exist", 400);
    }

    const listing = await db.listing.create({
      data: {
        title,
        description,
        price,
        condition,
        transactionType,
        categoryId,
        campusOnly: campusOnly !== undefined ? campusOnly : true,
        userId: session.id,
        collegeDomainId: user.collegeDomainId || session.collegeDomainId || null,
        images: {
          create: images.map((url, index) => ({
            url,
            displayOrder: index,
          })),
        },
      },
      include: {
        images: true,
        category: true,
        collegeDomain: true,
      },
    });

    return successResponse(listing, "Listing created successfully", 201);
  } catch (error) {
    console.error("Create listing error:", error);
    return errorResponse("Failed to create listing", 500);
  }
}
