import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET() {
  try {
    const categories = await db.category.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            listings: {
              where: { status: "AVAILABLE" },
            },
          },
        },
      },
    });

    return successResponse(categories);
  } catch (error) {
    console.error("Categories fetch error:", error);
    return errorResponse("Failed to fetch categories", 500);
  }
}
