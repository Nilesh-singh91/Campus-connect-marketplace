export const Role = {
  STUDENT: "STUDENT",
  MODERATOR: "MODERATOR",
  ADMIN: "ADMIN",
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const UserStatus = {
  ACTIVE: "ACTIVE",
  SUSPENDED: "SUSPENDED",
  BANNED: "BANNED",
} as const;
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

export const ItemCondition = {
  NEW: "NEW",
  LIKE_NEW: "LIKE_NEW",
  GOOD: "GOOD",
  FAIR: "FAIR",
} as const;
export type ItemCondition = (typeof ItemCondition)[keyof typeof ItemCondition];

export const TransactionType = {
  SELL: "SELL",
  EXCHANGE: "EXCHANGE",
  BOTH: "BOTH",
  DONATION: "DONATION", // 🎁 End-of-Semester Free Campus Giveaway (₹0)
  SKILL_EXCHANGE: "SKILL_EXCHANGE", // 💡 Skill & Academic Barter
} as const;
export type TransactionType = (typeof TransactionType)[keyof typeof TransactionType];

export const ListingStatus = {
  AVAILABLE: "AVAILABLE",
  RESERVED: "RESERVED",
  SOLD: "SOLD",
  REMOVED: "REMOVED",
} as const;
export type ListingStatus = (typeof ListingStatus)[keyof typeof ListingStatus];

export const ExchangeStatus = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
} as const;
export type ExchangeStatus = (typeof ExchangeStatus)[keyof typeof ExchangeStatus];

export const ReportTargetType = {
  LISTING: "LISTING",
  USER: "USER",
} as const;
export type ReportTargetType = (typeof ReportTargetType)[keyof typeof ReportTargetType];

export const ReportStatus = {
  PENDING: "PENDING",
  INVESTIGATING: "INVESTIGATING",
  RESOLVED: "RESOLVED",
  DISMISSED: "DISMISSED",
} as const;
export type ReportStatus = (typeof ReportStatus)[keyof typeof ReportStatus];

export const ModerationActionType = {
  WARN_USER: "WARN_USER",
  SUSPEND_USER: "SUSPEND_USER",
  BAN_USER: "BAN_USER",
  REMOVE_LISTING: "REMOVE_LISTING",
  DISMISS_REPORT: "DISMISS_REPORT",
} as const;
export type ModerationActionType = (typeof ModerationActionType)[keyof typeof ModerationActionType];

export const NotificationType = {
  MESSAGE: "MESSAGE",
  EXCHANGE_REQUEST: "EXCHANGE_REQUEST",
  LISTING_UPDATE: "LISTING_UPDATE",
  REPORT_STATUS: "REPORT_STATUS",
  LOST_FOUND_CLAIM: "LOST_FOUND_CLAIM",
  SYSTEM: "SYSTEM",
} as const;
export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

export const LostFoundType = {
  LOST: "LOST",
  FOUND: "FOUND",
} as const;
export type LostFoundType = (typeof LostFoundType)[keyof typeof LostFoundType];

export const LostFoundCategory = {
  ID_CARD: "ID_CARD",
  CALCULATOR: "CALCULATOR",
  ELECTRONICS: "ELECTRONICS",
  KEYS_WALLET: "KEYS_WALLET",
  DOCUMENTS: "DOCUMENTS",
  OTHER: "OTHER",
} as const;
export type LostFoundCategory = (typeof LostFoundCategory)[keyof typeof LostFoundCategory];

export const LostFoundStatus = {
  OPEN: "OPEN",
  CLAIMED: "CLAIMED",
  RESOLVED: "RESOLVED",
} as const;
export type LostFoundStatus = (typeof LostFoundStatus)[keyof typeof LostFoundStatus];

export const LostFoundClaimStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  RESOLVED: "RESOLVED",
} as const;
export type LostFoundClaimStatus = (typeof LostFoundClaimStatus)[keyof typeof LostFoundClaimStatus];
