import { z } from "zod";

export const registerSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(80, "Full name must be under 80 characters")
    .trim(),
  email: z
    .string()
    .email("Please provide a valid email address")
    .toLowerCase()
    .trim()
    .refine((val) => {
      // Must be an academic / college domain or match college domain criteria
      const parts = val.split("@");
      if (parts.length !== 2) return false;
      const domain = parts[1];
      return (
        domain.endsWith(".edu") ||
        domain.endsWith(".ac.in") ||
        domain.endsWith(".edu.in") ||
        domain.endsWith(".in") ||
        domain.includes("college") ||
        domain.includes("campus") ||
        domain.includes("univ") ||
        domain.includes("liet") ||
        domain.includes("aktu")
      );
    }, "Registration requires a recognized college/university email address (e.g. @liet.in, @aktu.in, @college.edu)"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be under 100 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  enrollmentNumber: z
    .string()
    .min(3, "Enrollment number is required")
    .max(30, "Enrollment number is too long")
    .trim(),
  branch: z
    .string()
    .min(2, "Academic branch / department is required")
    .max(60)
    .trim(),
  yearOfStudy: z
    .coerce
    .number()
    .int()
    .min(1, "Year must be at least 1")
    .max(5, "Year cannot exceed 5"),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z.string().min(1, "Password is required"),
});

export const verifyEmailSchema = z.object({
  email: z.string().email(),
  token: z.string().min(6, "Verification token must be at least 6 characters"),
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).max(80).trim().optional(),
  branch: z.string().max(60).trim().optional(),
  yearOfStudy: z.coerce.number().int().min(1).max(5).optional(),
  phone: z.string().max(20).optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
  avatarUrl: z.string().url().optional().nullable().or(z.literal("")),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
