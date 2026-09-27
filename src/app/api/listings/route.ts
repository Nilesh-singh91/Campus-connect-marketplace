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

    const {
      query,
      category,
      condition,
      transactionType,
      minPrice,
      maxPrice,
      sort,
      page,
      limit,
    } = parsedQuery.data;

    const where: Prisma.ListingWhereInput = {
      status: "AVAILABLE",
    };

    if (query) {
      where.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
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
          views: true,
          createdAt: true,
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
      select: { isEmailVerified: true, status: true },
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

    const { title, description, price, condition, transactionType, categoryId, images } = validated.data;

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
        userId: session.id,
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
      },
    });

    return successResponse(listing, "Listing created successfully", 201);
  } catch (error) {
    console.error("Create listing error:", error);
    return errorResponse("Failed to create listing", 500);
  }
}
