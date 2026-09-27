import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse } from "@/lib/api-response";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return unauthorizedResponse();

    const notifications = await db.notification.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
      take: 40,
    });

    const unreadCount = await db.notification.count({
      where: { userId: session.id, isRead: false },
    });

    return successResponse({ notifications, unreadCount });
  } catch (error) {
    console.error("Notifications fetch error:", error);
    return errorResponse("Failed to fetch notifications", 500);
  }
}

export async function PATCH() {
  try {
    const session = await getSession();
    if (!session) return unauthorizedResponse();

    await db.notification.updateMany({
      where: { userId: session.id, isRead: false },
      data: { isRead: true },
    });

    return successResponse({ markedAsRead: true }, "All notifications marked as read");
  } catch (error) {
    console.error("Mark notifications error:", error);
    return errorResponse("Failed to update notifications", 500);
  }
}
