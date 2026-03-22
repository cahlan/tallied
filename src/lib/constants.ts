export const CATEGORIES = [
  "Food & Drink",
  "Transportation",
  "Office Supplies",
  "Software & SaaS",
  "Travel",
  "Utilities",
  "Entertainment",
  "Healthcare",
  "Professional Services",
  "Advertising & Marketing",
  "Insurance",
  "Rent & Facilities",
  "Equipment",
  "Shipping & Postage",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const PLAN_LIMITS = {
  free: { scansPerMonth: 25 },
  pro: { scansPerMonth: Infinity },
  self_hosted: { scansPerMonth: Infinity },
} as const;

export type SubscriptionStatus = "free" | "pro" | "self_hosted" | "canceled";

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const ACCEPTED_FILE_TYPES = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "application/pdf": [".pdf"],
} as const;
