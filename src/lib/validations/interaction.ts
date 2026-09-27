import { z } from "zod";
import { ReportTargetType, ModerationActionType, ExchangeStatus } from "@prisma/client";

export const exchangeRequestSchema = z.object({
  targetListingId: z.string().uuid("Invalid target listing ID"),
  offeredListingId: z.string().uuid("Invalid offered listing ID").optional().nullable(),
  cashDifference: z.coerce.number().min(0, "Cash difference cannot be negative").default(0),
  message: z.string().max(500, "Message cannot exceed 500 characters").optional(),
});

export const updateExchangeStatusSchema = z.object({
  status: z.nativeEnum(ExchangeStatus, {
    errorMap: () => ({ message: "Invalid exchange status" }),
  }),
});

export const reportSchema = z.object({
  targetType: z.nativeEnum(ReportTargetType),
  targetListingId: z.string().uuid().optional().nullable(),
  targetUserId: z.string().uuid().optional().nullable(),
  reason: z.string().min(3, "Reason must be at least 3 characters").max(100),
  details: z.string().max(1000, "Details cannot exceed 1000 characters").optional().nullable(),
}).refine(
  (data) => {
    if (data.targetType === ReportTargetType.LISTING) return !!data.targetListingId;
    if (data.targetType === ReportTargetType.USER) return !!data.targetUserId;
    return false;
  },
  {
    message: "A target listing ID or user ID must be provided according to the target type",
    path: ["targetType"],
  }
);

export const moderationActionSchema = z.object({
  reportId: z.string().uuid().optional().nullable(),
  actionType: z.nativeEnum(ModerationActionType),
  internalNotes: z.string().max(1000).optional().nullable(),
  targetUserId: z.string().uuid().optional().nullable(),
  targetListingId: z.string().uuid().optional().nullable(),
});

export const sendMessageSchema = z.object({
  conversationId: z.string().uuid().optional(),
  listingId: z.string().uuid().optional(),
  recipientId: z.string().uuid().optional(),
  content: z.string().min(1, "Message cannot be empty").max(1000, "Message cannot exceed 1000 characters").trim(),
});

export type ExchangeRequestInput = z.infer<typeof exchangeRequestSchema>;
export type ReportInput = z.infer<typeof reportSchema>;
export type ModerationActionInput = z.infer<typeof moderationActionSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
