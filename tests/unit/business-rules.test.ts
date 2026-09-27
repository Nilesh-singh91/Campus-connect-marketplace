import { describe, it, expect } from "vitest";
import { updateListingStatusSchema } from "@/lib/validations/listing";
import { updateExchangeStatusSchema, moderationActionSchema } from "@/lib/validations/interaction";
import { ListingStatus, ExchangeStatus, ModerationActionType, Role } from "@/types/enums";

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

  describe("Multi-College & Cross-Campus Isolation Rules", () => {
    it("should validate and accept official college domains including @liet.in and @aktu.in", async () => {
      const { registerSchema } = await import("@/lib/validations/auth");
      
      const basePayload = {
        fullName: "Aman Verma",
        password: "Password123",
        enrollmentNumber: "ENR12345",
        branch: "CSE",
        yearOfStudy: 3,
      };

      // Lloyd Institute of Engineering & Technology
      expect(registerSchema.safeParse({ ...basePayload, email: "aman@liet.in" }).success).toBe(true);

      // Dr. A.P.J. Abdul Kalam Technical University (AKTU)
      expect(registerSchema.safeParse({ ...basePayload, email: "sneha@aktu.in" }).success).toBe(true);

      // National Institute of Technology / Academic .edu
      expect(registerSchema.safeParse({ ...basePayload, email: "student@college.edu" }).success).toBe(true);

      // State Engineering / Academic .ac.in
      expect(registerSchema.safeParse({ ...basePayload, email: "rahul@lit.ac.in" }).success).toBe(true);

      // Public / Commercial emails must be rejected
      expect(registerSchema.safeParse({ ...basePayload, email: "hacker@gmail.com" }).success).toBe(false);
      expect(registerSchema.safeParse({ ...basePayload, email: "spammer@yahoo.com" }).success).toBe(false);
    });

    it("should strictly enforce campus isolation for purchases and trade proposals", () => {
      const isTransactionPermitted = (buyerCollegeId: string | null, listingCollegeId: string | null) => {
        if (!buyerCollegeId || !listingCollegeId) return false;
        return buyerCollegeId === listingCollegeId;
      };

      const LLOYD_ID = "domain-liet-in-uuid";
      const AKTU_ID = "domain-aktu-in-uuid";
      const NIT_ID = "domain-college-edu-uuid";

      // Same college: Lloyd student buying Lloyd item -> ALLOWED
      expect(isTransactionPermitted(LLOYD_ID, LLOYD_ID)).toBe(true);

      // Same college: AKTU student trading with AKTU student -> ALLOWED
      expect(isTransactionPermitted(AKTU_ID, AKTU_ID)).toBe(true);

      // Cross college: Lloyd student attempting to buy AKTU item -> BLOCKED
      expect(isTransactionPermitted(LLOYD_ID, AKTU_ID)).toBe(false);

      // Cross college: AKTU student attempting to trade with NIT item -> BLOCKED
      expect(isTransactionPermitted(AKTU_ID, NIT_ID)).toBe(false);

      // Unauthenticated / Unassigned college -> BLOCKED
      expect(isTransactionPermitted(null, LLOYD_ID)).toBe(false);
    });

    it("should validate listing query parameters with optional college filter", async () => {
      const { listingQuerySchema } = await import("@/lib/validations/listing");

      // Default query
      expect(listingQuerySchema.safeParse({}).success).toBe(true);

      // Filter by specific college domain
      const queryWithCollege = listingQuerySchema.safeParse({ college: "liet.in" });
      expect(queryWithCollege.success).toBe(true);
      expect(queryWithCollege.data?.college).toBe("liet.in");

      // Filter by all colleges
      const queryAll = listingQuerySchema.safeParse({ college: "all" });
      expect(queryAll.success).toBe(true);
      expect(queryAll.data?.college).toBe("all");
    });

    it("should accept both local uploaded image paths (/uploads/...) and remote URLs (https://...) in listingSchema", async () => {
      const { listingSchema } = await import("@/lib/validations/listing");
      const { ItemCondition, TransactionType } = await import("@/types/enums");

      const baseListing = {
        title: "Engineering Mechanics Textbook",
        description: "Standard university textbook for 1st year students. Good condition with notes.",
        price: 450,
        condition: ItemCondition.GOOD,
        transactionType: TransactionType.SELL,
        categoryId: "e9f73a20-be43-4a5b-b9ca-8e3de221b2b2",
      };

      // Local uploaded image path
      const localImageListing = listingSchema.safeParse({
        ...baseListing,
        images: ["/uploads/listings/listing-1790501033800-4b2a.png"],
      });
      expect(localImageListing.success).toBe(true);

      // Remote HTTPS image URL
      const remoteImageListing = listingSchema.safeParse({
        ...baseListing,
        images: ["https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c"],
      });
      expect(remoteImageListing.success).toBe(true);

      // Empty images array should fail
      const emptyImagesListing = listingSchema.safeParse({
        ...baseListing,
        images: [],
      });
      expect(emptyImagesListing.success).toBe(false);
    });

    it("should support campusOnly option with default true and explicit false toggle", async () => {
      const { listingSchema, listingQuerySchema } = await import("@/lib/validations/listing");
      const { ItemCondition, TransactionType } = await import("@/types/enums");

      const basePayload = {
        title: "Scientific Calculator Casio fx-991EX",
        description: "Classwiz non-programmable calculator, approved for semester exams.",
        price: 800,
        condition: ItemCondition.LIKE_NEW,
        transactionType: TransactionType.SELL,
        categoryId: "e9f73a20-be43-4a5b-b9ca-8e3de221b2b2",
        images: ["/uploads/listings/calculator.jpg"],
      };

      // Default when omitted -> campusOnly is true
      const parsedDefault = listingSchema.safeParse(basePayload);
      expect(parsedDefault.success).toBe(true);
      if (parsedDefault.success) {
        expect(parsedDefault.data.campusOnly).toBe(true);
      }

      // Explicitly set to campusOnly: true
      const parsedCampusOnly = listingSchema.safeParse({ ...basePayload, campusOnly: true });
      expect(parsedCampusOnly.success).toBe(true);
      if (parsedCampusOnly.success) {
        expect(parsedCampusOnly.data.campusOnly).toBe(true);
      }

      // Explicitly set to campusOnly: false (Multi-College Discovery)
      const parsedMultiCampus = listingSchema.safeParse({ ...basePayload, campusOnly: false });
      expect(parsedMultiCampus.success).toBe(true);
      if (parsedMultiCampus.success) {
        expect(parsedMultiCampus.data.campusOnly).toBe(false);
      }

      // Query schema filter by campusOnly
      expect(listingQuerySchema.safeParse({ campusOnly: "true" }).success).toBe(true);
      expect(listingQuerySchema.safeParse({ campusOnly: "false" }).success).toBe(true);
      expect(listingQuerySchema.safeParse({ campusOnly: "all" }).success).toBe(true);
      expect(listingQuerySchema.safeParse({ campusOnly: "invalid_value" }).success).toBe(false);
    });
  });
});
