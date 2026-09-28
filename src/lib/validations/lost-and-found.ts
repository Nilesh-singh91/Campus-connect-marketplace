import { z } from "zod";
import { LostFoundType, LostFoundCategory, LostFoundStatus } from "@/types/enums";

export const createLostFoundSchema = z.object({
  type: z.nativeEnum(LostFoundType, {
    errorMap: () => ({ message: "Select type: Lost or Found" }),
  }),
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title cannot exceed 100 characters")
    .trim(),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description cannot exceed 2000 characters")
    .trim(),
  category: z.nativeEnum(LostFoundCategory, {
    errorMap: () => ({ message: "Select a valid item category" }),
  }),
  location: z
    .string()
    .min(3, "Location details required (e.g. Lab 3, Canteen, Library)")
    .max(150, "Location cannot exceed 150 characters")
    .trim(),
  custodyLocation: z.string().max(150).optional().default("With Finder"),
  secretQuestion: z
    .string()
    .max(200, "Secret question cannot exceed 200 characters")
    .optional(),
  imageUrl: z
    .string()
    .refine(
      (val) => !val || val.startsWith("/") || val.startsWith("http://") || val.startsWith("https://") || val.startsWith("data:image/"),
      "Image must be a valid uploaded file or URL"
    )
    .optional(),
});

export const claimLostFoundSchema = z.object({
  proofText: z
    .string()
    .min(5, "Proof/explanation must be at least 5 characters (describe secret mark, contents, or serial)")
    .max(1000, "Proof cannot exceed 1000 characters")
    .trim(),
});

export const updateClaimStatusSchema = z.object({
  action: z.enum(["APPROVE", "REJECT", "RESOLVE"]),
  verificationOtp: z.string().length(4, "OTP must be 4 digits").optional(),
});

export type CreateLostFoundInput = z.infer<typeof createLostFoundSchema>;
export type ClaimLostFoundInput = z.infer<typeof claimLostFoundSchema>;
export type UpdateClaimStatusInput = z.infer<typeof updateClaimStatusSchema>;
