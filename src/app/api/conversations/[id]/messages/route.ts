import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { sendMessageSchema } from "@/lib/validations/interaction";
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
    const session = await getSession();
    if (!session) return unauthorizedResponse();

    // Membership Guard: Ensure caller is part of conversation
    const membership = await db.conversationMember.findUnique({
      where: {
        conversationId_userId: {
          conversationId: id,
          userId: session.id,
        },
      },
    });

    if (!membership) {
      return forbiddenResponse("You are not a member of this conversation");
    }

    const conversation = await db.conversation.findUnique({
      where: { id },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            price: true,
            status: true,
            images: { take: 1, select: { url: true } },
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                profile: { select: { fullName: true, avatarUrl: true, branch: true } },
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: "asc" },
          include: {
            sender: {
              select: {
                id: true,
                profile: { select: { fullName: true, avatarUrl: true } },
              },
            },
          },
        },
      },
    });

    if (!conversation) return notFoundResponse("Conversation not found");

    // Mark messages as read asynchronously
    await db.message.updateMany({
      where: {
        conversationId: id,
        senderId: { not: session.id },
        isRead: false,
      },
      data: { isRead: true },
    });

    return successResponse(conversation);
  } catch (error) {
    console.error("Messages fetch error:", error);
    return errorResponse("Failed to fetch messages", 500);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) return unauthorizedResponse();

    // Membership guard
    const membership = await db.conversationMember.findUnique({
      where: {
        conversationId_userId: {
          conversationId: id,
          userId: session.id,
        },
      },
    });

    if (!membership) {
      return forbiddenResponse("You cannot send messages in a conversation you are not a member of");
    }

    const body = await req.json();
    const validated = sendMessageSchema.safeParse(body);

    if (!validated.success) {
      return errorResponse("Invalid message content", 422, validated.error.flatten());
    }

    const { content } = validated.data;

    // Create message and update conversation timestamp
    const message = await db.message.create({
      data: {
        conversationId: id,
        senderId: session.id,
        content,
      },
      include: {
        sender: {
          select: {
            id: true,
            profile: { select: { fullName: true, avatarUrl: true } },
          },
        },
      },
    });

    await db.conversation.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    // Notify other members
    const otherMembers = await db.conversationMember.findMany({
      where: {
        conversationId: id,
        userId: { not: session.id },
      },
    });

    for (const member of otherMembers) {
      await db.notification.create({
        data: {
          userId: member.userId,
          type: "MESSAGE",
          title: "New Message Received",
          content: `${session.fullName}: ${content.slice(0, 60)}${content.length > 60 ? "..." : ""}`,
          link: `/conversations/${id}`,
        },
      });
    }

    return successResponse(message, "Message sent", 201);
  } catch (error) {
    console.error("Send message error:", error);
    return errorResponse("Failed to send message", 500);
  }
}
