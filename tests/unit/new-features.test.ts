import { describe, it, expect } from "vitest";
import { estimateFairPrice } from "@/lib/ai/price-estimator";
import { listingSchema } from "@/lib/validations/listing";
import {
  createLostFoundSchema,
  claimLostFoundSchema,
  updateClaimStatusSchema,
} from "@/lib/validations/lost-and-found";
import {
  ItemCondition,
  TransactionType,
  LostFoundType,
  LostFoundCategory,
} from "@/types/enums";

describe("New Features Unit Tests", () => {
  describe("AI Fair Price Suggester & Valuation Engine", () => {
    it("should compute fair resale price and bounds for standard textbook", () => {
      const result = estimateFairPrice({
        originalMrp: 850,
        condition: ItemCondition.GOOD,
        category: "textbooks",
        ageYears: 1,
        transactionType: TransactionType.SELL,
      });

      expect(result.recommendedPrice).toBeGreaterThan(200);
      expect(result.recommendedPrice).toBeLessThan(850);
      expect(result.minPrice).toBeLessThanOrEqual(result.recommendedPrice);
      expect(result.maxPrice).toBeGreaterThanOrEqual(result.recommendedPrice);
      expect(result.savingsPercent).toBeGreaterThan(0);
      expect(result.fastSellProbability).toBeGreaterThanOrEqual(70);
      expect(result.demandScore).toBe("HIGH");
    });

    it("should enforce ₹0 and 100% savings for Community Donations (DONATION)", () => {
      const result = estimateFairPrice({
        originalMrp: 1200,
        condition: ItemCondition.GOOD,
        category: "engineering-tools",
        transactionType: TransactionType.DONATION,
      });

      expect(result.recommendedPrice).toBe(0);
      expect(result.minPrice).toBe(0);
      expect(result.maxPrice).toBe(0);
      expect(result.savingsPercent).toBe(100);
      expect(result.fastSellProbability).toBe(99);
    });

    it("should enforce ₹0 for Skill & Academic Barter (SKILL_EXCHANGE)", () => {
      const result = estimateFairPrice({
        originalMrp: 500,
        condition: ItemCondition.NEW,
        category: "notes",
        transactionType: TransactionType.SKILL_EXCHANGE,
      });

      expect(result.recommendedPrice).toBe(0);
      expect(result.savingsPercent).toBe(100);
    });

    it("should give higher valuation for NEW/LIKE_NEW condition than FAIR condition", () => {
      const newEstimate = estimateFairPrice({
        originalMrp: 1000,
        condition: ItemCondition.NEW,
        category: "calculators",
        ageYears: 0,
      });

      const fairEstimate = estimateFairPrice({
        originalMrp: 1000,
        condition: ItemCondition.FAIR,
        category: "calculators",
        ageYears: 3,
      });

      expect(newEstimate.recommendedPrice).toBeGreaterThan(fairEstimate.recommendedPrice);
    });
  });

  describe("Free Giveaway & Skill Barter Listing Validations", () => {
    const validUuid = "123e4567-e89b-12d3-a456-426614174000";

    it("should permit Free Giveaway (DONATION) with ₹0 price", () => {
      const validDonation = {
        title: "Free Omega Mini Drafter for Juniors",
        description: "Graduating senior passing down mini drafter in good condition for 1st year students.",
        price: 0,
        condition: ItemCondition.GOOD,
        transactionType: TransactionType.DONATION,
        categoryId: validUuid,
        campusOnly: true,
        images: ["/uploads/drafter.jpg"],
      };

      const result = listingSchema.safeParse(validDonation);
      expect(result.success).toBe(true);
    });

    it("should reject Free Giveaway (DONATION) with price > 0", () => {
      const invalidDonation = {
        title: "Free Omega Mini Drafter for Juniors",
        description: "Graduating senior passing down mini drafter in good condition for 1st year students.",
        price: 250, // Violation: Donation must be ₹0
        condition: ItemCondition.GOOD,
        transactionType: TransactionType.DONATION,
        categoryId: validUuid,
        campusOnly: true,
        images: ["/uploads/drafter.jpg"],
      };

      const result = listingSchema.safeParse(invalidDonation);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Free Giveaway items must have a price of ₹0");
      }
    });

    it("should accept Skill & Academic Barter listing", () => {
      const validSkillSwap = {
        title: "DSA Python Tutoring in Exchange for Engineering Graphics Sheets",
        description: "I will teach you trees and graphs on LeetCode in exchange for help with AutoCAD drawing sheets.",
        price: 0,
        condition: ItemCondition.NEW,
        transactionType: TransactionType.SKILL_EXCHANGE,
        categoryId: validUuid,
        campusOnly: true,
        images: ["/uploads/skill.jpg"],
      };

      const result = listingSchema.safeParse(validSkillSwap);
      expect(result.success).toBe(true);
    });
  });

  describe("Campus Lost & Found Validations & Handshake Rules", () => {
    it("should validate complete Lost & Found item creation", () => {
      const validFound = {
        type: LostFoundType.FOUND,
        title: "Casio fx-991EX Calculator",
        description: "Found in Computer Lab 3 on table 2 after data structures lab.",
        category: LostFoundCategory.CALCULATOR,
        location: "Computer Lab 3, 2nd Floor",
        custodyLocation: "With Finder (Handover at Canteen)",
        secretQuestion: "What is written inside the back slide cover?",
        imageUrl: "/uploads/calc.jpg",
      };

      const result = createLostFoundSchema.safeParse(validFound);
      expect(result.success).toBe(true);
    });

    it("should reject item missing specific location details", () => {
      const invalidFound = {
        type: LostFoundType.FOUND,
        title: "Casio fx-991EX Calculator",
        description: "Found in Computer Lab 3 on table 2 after data structures lab.",
        category: LostFoundCategory.CALCULATOR,
        location: "", // Missing location
      };

      const result = createLostFoundSchema.safeParse(invalidFound);
      expect(result.success).toBe(false);
    });

    it("should validate claimant proof text requirements", () => {
      const validClaim = {
        proofText: "My roll number LIET23CSE015 is engraved with pen on the battery lid.",
      };
      expect(claimLostFoundSchema.safeParse(validClaim).success).toBe(true);

      const invalidClaim = {
        proofText: "mine", // Too short (< 5 chars)
      };
      expect(claimLostFoundSchema.safeParse(invalidClaim).success).toBe(false);
    });

    it("should enforce 4-digit OTP format for Handshake Resolution", () => {
      const validResolve = {
        action: "RESOLVE" as const,
        verificationOtp: "4829",
      };
      expect(updateClaimStatusSchema.safeParse(validResolve).success).toBe(true);

      const invalidResolve = {
        action: "RESOLVE" as const,
        verificationOtp: "12", // Must be 4 digits
      };
      expect(updateClaimStatusSchema.safeParse(invalidResolve).success).toBe(false);
    });
  });
});
