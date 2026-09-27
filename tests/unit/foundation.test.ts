import { describe, it, expect } from "vitest";
import { registerSchema, loginSchema } from "@/lib/validations/auth";
import { listingSchema } from "@/lib/validations/listing";
import { exchangeRequestSchema, reportSchema } from "@/lib/validations/interaction";
import { hashPassword, comparePassword, signToken, verifyToken } from "@/lib/auth";
import { ItemCondition, TransactionType, Role, ReportTargetType } from "@prisma/client";

describe("Foundation Unit Tests", () => {
  describe("Authentication Validations & College Domain Verification", () => {
    it("should accept valid college email domains", () => {
      const validStudent = {
        fullName: "Rahul Verma",
        email: "rahul@college.edu",
        password: "Password123",
        enrollmentNumber: "2024CSE01",
        branch: "Computer Science",
        yearOfStudy: 2,
      };
      const result = registerSchema.safeParse(validStudent);
      expect(result.success).toBe(true);
    });

    it("should accept Indian academic domains (.ac.in)", () => {
      const validStudent = {
        fullName: "Ananya Sen",
        email: "ananya@lit.ac.in",
        password: "SecurePassword9",
        enrollmentNumber: "2023ECE04",
        branch: "Electronics",
        yearOfStudy: 3,
      };
      const result = registerSchema.safeParse(validStudent);
      expect(result.success).toBe(true);
    });

    it("should reject non-campus public emails like gmail.com", () => {
      const invalidStudent = {
        fullName: "Random User",
        email: "random@gmail.com",
        password: "Password123",
        enrollmentNumber: "2024CSE01",
        branch: "Computer Science",
        yearOfStudy: 1,
      };
      const result = registerSchema.safeParse(invalidStudent);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("college/university email");
      }
    });

    it("should reject weak passwords lacking numbers or uppercase", () => {
      const weakPassword = {
        fullName: "Test User",
        email: "test@college.edu",
        password: "weakpassword",
        enrollmentNumber: "2024CSE01",
        branch: "Computer Science",
        yearOfStudy: 1,
      };
      const result = registerSchema.safeParse(weakPassword);
      expect(result.success).toBe(false);
    });
  });

  describe("Password Hashing & JWT Security", () => {
    it("should securely hash and verify passwords using bcrypt", async () => {
      const plainPassword = "CampusPassword@987";
      const hash = await hashPassword(plainPassword);

      expect(hash).not.toBe(plainPassword);
      expect(hash.startsWith("$2")).toBe(true);

      const isValid = await comparePassword(plainPassword, hash);
      expect(isValid).toBe(true);

      const isInvalid = await comparePassword("WrongPassword", hash);
      expect(isInvalid).toBe(false);
    });

    it("should sign and verify tamper-proof JWT tokens", async () => {
      const payload = {
        id: "user-12345",
        email: "student@college.edu",
        role: Role.STUDENT,
        fullName: "Test Student",
        isEmailVerified: true,
      };

      const token = await signToken(payload);
      expect(typeof token).toBe("string");

      const decoded = await verifyToken(token);
      expect(decoded).not.toBeNull();
      expect(decoded?.email).toBe(payload.email);
      expect(decoded?.role).toBe(Role.STUDENT);
    });
  });

  describe("Listing Validation & Price Boundaries", () => {
    const validListing = {
      title: "Data Structures & Algorithms in Java",
      description: "Complete textbook by Robert Sedgewick in excellent condition. No torn pages.",
      price: 450,
      condition: ItemCondition.GOOD,
      transactionType: TransactionType.SELL,
      categoryId: "a0000000-0000-0000-0000-000000000001",
      images: ["https://example.com/item.jpg"],
    };

    it("should validate a proper marketplace listing", () => {
      const result = listingSchema.safeParse(validListing);
      expect(result.success).toBe(true);
    });

    it("should reject negative prices", () => {
      const invalid = { ...validListing, price: -50 };
      const result = listingSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("should reject listings with no images", () => {
      const invalid = { ...validListing, images: [] };
      const result = listingSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("should reject listings with more than 6 images", () => {
      const invalid = {
        ...validListing,
        images: [
          "https://example.com/1.jpg",
          "https://example.com/2.jpg",
          "https://example.com/3.jpg",
          "https://example.com/4.jpg",
          "https://example.com/5.jpg",
          "https://example.com/6.jpg",
          "https://example.com/7.jpg",
        ],
      };
      const result = listingSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("Exchange & Report Validation Rules", () => {
    it("should validate exchange requests with optional cash difference", () => {
      const validExchange = {
        targetListingId: "a0000000-0000-0000-0000-000000000001",
        cashDifference: 100,
        message: "Can exchange with my drafter plus 100 rs cash",
      };
      const result = exchangeRequestSchema.safeParse(validExchange);
      expect(result.success).toBe(true);
    });

    it("should enforce targetListingId when reporting a listing", () => {
      const validReport = {
        targetType: ReportTargetType.LISTING,
        targetListingId: "a0000000-0000-0000-0000-000000000001",
        reason: "Suspected non-academic prohibited item",
      };
      const result = reportSchema.safeParse(validReport);
      expect(result.success).toBe(true);

      const invalidReport = {
        targetType: ReportTargetType.LISTING,
        reason: "Missing listing target ID",
      };
      const invalidResult = reportSchema.safeParse(invalidReport);
      expect(invalidResult.success).toBe(false);
    });
  });
});
