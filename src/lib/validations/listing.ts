import { z } from "zod";
import { ItemCondition, TransactionType, ListingStatus } from "@/types/enums";

export const listingSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title cannot exceed 100 characters")
    .trim(),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2500, "Description cannot exceed 2500 characters")
    .trim(),
  price: z.coerce
    .number()
    .min(0, "Price cannot be negative")
    .max(500000, "Price exceeds allowed campus limit"),
  condition: z.nativeEnum(ItemCondition, {
    errorMap: () => ({ message: "Please select a valid condition" }),
  }),
  transactionType: z.nativeEnum(TransactionType, {
    errorMap: () => ({ message: "Please select a valid transaction type" }),
  }),
  categoryId: z.string().uuid("Please select a valid category"),
  images: z
    .array(z.string().url("Image URL must be valid"))
    .min(1, "At least one product image is required")
    .max(6, "Maximum 6 images allowed per listing"),
});

export const updateListingStatusSchema = z.object({
  status: z.nativeEnum(ListingStatus, {
    errorMap: () => ({ message: "Invalid listing status" }),
  }),
});

export const listingQuerySchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  condition: z.string().optional(),
  transactionType: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  college: z.string().optional(),
  sort: z.enum(["newest", "price_asc", "price_desc"]).default("newest"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export type ListingInput = z.infer<typeof listingSchema>;
export type UpdateListingStatusInput = z.infer<typeof updateListingStatusSchema>;
export type ListingQueryInput = z.infer<typeof listingQuerySchema>;
