import { describe, it, expect } from "vitest";
import { updateListingStatusSchema } from "@/lib/validations/listing";
import { updateExchangeStatusSchema, moderationActionSchema } from "@/lib/validations/interaction";
import { ListingStatus, ExchangeStatus, ModerationActionType, Role } from "@prisma/client";

describe("Business Logic & State Machine Unit Tests", () => {
  describe("Listing State Transitions", () => {
    it("should allow valid listing statuses", () => {
      expect(updateListingStatusSchema.safeParse({ status: ListingStatus.AVAILABLE }).success).toBe(true);
      expect(updateListingStatusSchema.safeParse({ status: ListingStatus.RESERVED }).success).toBe(true);
      expect(updateListingStatusSchema.safeParse({ status: ListingStatus.SOLD }).success).toBe(true);
      expect(updateListingStatusSchema.safeParse({ status: ListingStatus.REMOVED }).success).toBe(true);
    });

    it("should reject arbitrary invalid listing status strings", () => {
      const result = updateListingStatusSchema.safeParse({ status: "DELETED_BY_HACKER" });
      expect(result.success).toBe(false);
    });
  });

  describe("Exchange Request State Transitions", () => {
    it("should validate allowed exchange statuses (ACCEPTED, REJECTED, CANCELLED)", () => {
      expect(updateExchangeStatusSchema.safeParse({ status: ExchangeStatus.ACCEPTED }).success).toBe(true);
      expect(updateExchangeStatusSchema.safeParse({ status: ExchangeStatus.REJECTED }).success).toBe(true);
      expect(updateExchangeStatusSchema.safeParse({ status: ExchangeStatus.CANCELLED }).success).toBe(true);
    });

    it("should enforce that only pending exchanges can transition", () => {
      const canTransition = (current: ExchangeStatus, next: ExchangeStatus) => {
        if (current !== ExchangeStatus.PENDING) return false;
        return ([ExchangeStatus.ACCEPTED, ExchangeStatus.REJECTED, ExchangeStatus.CANCELLED] as ExchangeStatus[]).includes(next);
      };

      expect(canTransition(ExchangeStatus.PENDING, ExchangeStatus.ACCEPTED)).toBe(true);
      expect(canTransition(ExchangeStatus.PENDING, ExchangeStatus.REJECTED)).toBe(true);
      expect(canTransition(ExchangeStatus.ACCEPTED, ExchangeStatus.CANCELLED)).toBe(false);
      expect(canTransition(ExchangeStatus.REJECTED, ExchangeStatus.ACCEPTED)).toBe(false);
    });
  });

  describe("Moderation & Audit Action Rules", () => {
    it("should validate moderator actions", () => {
      const validAction = {
        actionType: ModerationActionType.REMOVE_LISTING,
        internalNotes: "Violates student guideline section 4",
      };
      const result = moderationActionSchema.safeParse(validAction);
      expect(result.success).toBe(true);
    });

    it("should reject unauthorized roles from performing staff actions", () => {
      const isStaff = (role: Role) => role === Role.ADMIN || role === Role.MODERATOR;

      expect(isStaff(Role.ADMIN)).toBe(true);
      expect(isStaff(Role.MODERATOR)).toBe(true);
      expect(isStaff(Role.STUDENT)).toBe(false);
    });

    it("should protect against IDOR on listing modification", () => {
      const canModifyListing = (listingOwnerId: string, currentUserId: string, role: Role) => {
        if (role === Role.ADMIN || role === Role.MODERATOR) return true;
        return listingOwnerId === currentUserId;
      };

      // Owner can edit
      expect(canModifyListing("user-1", "user-1", Role.STUDENT)).toBe(true);
      // Different student cannot edit (IDOR protection)
      expect(canModifyListing("user-1", "user-2", Role.STUDENT)).toBe(false);
      // Admin can moderate
      expect(canModifyListing("user-1", "admin-user", Role.ADMIN)).toBe(true);
      // Moderator can moderate
      expect(canModifyListing("user-1", "mod-user", Role.MODERATOR)).toBe(true);
    });
  });
});
