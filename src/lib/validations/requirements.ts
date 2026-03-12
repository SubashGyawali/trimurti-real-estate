import { z } from "zod";
import type { PropertyType, FurnishingType } from "@/types";

// Options for form dropdowns and radio groups
export const FLOOR_PREFERENCE_OPTIONS = [
  { value: "low", label: "Low (Ground - 3rd)" },
  { value: "mid", label: "Mid (4th - 8th)" },
  { value: "high", label: "High (9th+)" },
] as const;

export const MOVE_IN_TIMELINE_OPTIONS = [
  { value: "immediate", label: "Immediate" },
  { value: "1_month", label: "Within 1 Month" },
  { value: "3_months", label: "Within 3 Months" },
  { value: "flexible", label: "Flexible" },
] as const;

export const PROPERTY_TYPE_OPTIONS = [
  { value: "1rk", label: "1 RK" },
  { value: "1bhk", label: "1 BHK" },
  { value: "2bhk", label: "2 BHK" },
  { value: "3bhk", label: "3 BHK" },
  { value: "shop", label: "Shop" },
] as const;

export const FURNISHING_OPTIONS = [
  { value: "unfurnished", label: "Unfurnished" },
  { value: "semi_furnished", label: "Semi Furnished" },
  { value: "fully_furnished", label: "Fully Furnished" },
] as const;

export const LISTING_TYPE_OPTIONS = [
  { value: "rent", label: "Rent" },
  { value: "sale", label: "Buy" },
] as const;

// Budget ranges
export const RENT_BUDGET = {
  min: 5000,
  max: 50000,
  step: 1000,
  presets: [10000, 15000, 20000, 30000],
};

export const SALE_BUDGET = {
  min: 1000000, // 10 Lac
  max: 20000000, // 2 Cr
  step: 500000,
  presets: [2500000, 5000000, 7500000, 10000000], // 25L, 50L, 75L, 1Cr
};

export type FloorPreference = (typeof FLOOR_PREFERENCE_OPTIONS)[number]["value"];
export type MoveInTimeline = (typeof MOVE_IN_TIMELINE_OPTIONS)[number]["value"];

// Step-by-step validation schemas
export const step1Schema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number"),
  email: z
    .string()
    .email("Please enter a valid email")
    .optional()
    .or(z.literal("")),
});

export const step2Schema = z.object({
  listing_type: z.enum(["sale", "rent"] as const),
  property_types: z
    .array(z.enum(["1rk", "1bhk", "2bhk", "3bhk", "shop", "office"]))
    .min(1, "Please select at least one property type"),
});

export const step3Schema = z.object({
  budget_min: z.number().min(0, "Budget minimum is required"),
  budget_max: z.number().min(0, "Budget maximum is required"),
});

export const step4Schema = z.object({
  floor_preference: z
    .array(z.enum(["low", "mid", "high"]))
    .optional(),
  furnishing: z
    .enum(["unfurnished", "semi_furnished", "fully_furnished"])
    .optional(),
  building_id: z.string().uuid().optional().or(z.literal("")),
  move_in_timeline: z
    .enum(["immediate", "1_month", "3_months", "flexible"])
    .optional(),
  notes: z
    .string()
    .max(500, "Notes must be less than 500 characters")
    .optional()
    .or(z.literal("")),
});

export const step5Schema = z.object({
  whatsapp_updates: z.boolean().default(true),
});

// Combined full schema
export const requirementsFormSchema = z.object({
  // Step 1
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number"),
  email: z
    .string()
    .email("Please enter a valid email")
    .optional()
    .or(z.literal("")),

  // Step 2
  listing_type: z.enum(["sale", "rent"] as const),
  property_types: z
    .array(z.enum(["1rk", "1bhk", "2bhk", "3bhk", "shop", "office"]))
    .min(1, "Please select at least one property type"),

  // Step 3
  budget_min: z.number().min(0),
  budget_max: z.number().min(0),

  // Step 4 (optional)
  floor_preference: z.array(z.enum(["low", "mid", "high"])).optional(),
  furnishing: z
    .enum(["unfurnished", "semi_furnished", "fully_furnished"])
    .optional(),
  building_id: z.string().uuid().optional().or(z.literal("")),
  move_in_timeline: z
    .enum(["immediate", "1_month", "3_months", "flexible"])
    .optional(),
  notes: z.string().max(500).optional().or(z.literal("")),

  // Step 5
  whatsapp_updates: z.boolean().default(true),
});

export type RequirementsFormData = z.infer<typeof requirementsFormSchema>;

// Default values for the form
export const defaultFormValues: RequirementsFormData = {
  name: "",
  phone: "",
  email: "",
  listing_type: "rent",
  property_types: [],
  budget_min: RENT_BUDGET.min,
  budget_max: RENT_BUDGET.max,
  floor_preference: [],
  furnishing: undefined,
  building_id: "",
  move_in_timeline: undefined,
  notes: "",
  whatsapp_updates: true,
};

// Helper to format budget for display
export function formatBudget(amount: number, listingType: "sale" | "rent"): string {
  if (listingType === "rent") {
    return `₹${(amount / 1000).toFixed(0)}K`;
  }

  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }

  return `₹${(amount / 100000).toFixed(0)} Lac`;
}

// Helper to generate WhatsApp message
export function generateWhatsAppMessage(data: RequirementsFormData): string {
  const propertyTypes = data.property_types
    .map((t) => PROPERTY_TYPE_OPTIONS.find((o) => o.value === t)?.label || t)
    .join(", ");

  const budgetRange =
    data.listing_type === "rent"
      ? `${formatBudget(data.budget_min, "rent")} - ${formatBudget(data.budget_max, "rent")}/month`
      : `${formatBudget(data.budget_min, "sale")} - ${formatBudget(data.budget_max, "sale")}`;

  let message = `Hi, I'm looking for a property:\n\n`;
  message += `Looking to: ${data.listing_type === "rent" ? "Rent" : "Buy"}\n`;
  message += `Property Type: ${propertyTypes}\n`;
  message += `Budget: ${budgetRange}\n`;

  if (data.furnishing) {
    const furnishingLabel = FURNISHING_OPTIONS.find(
      (o) => o.value === data.furnishing
    )?.label;
    message += `Furnishing: ${furnishingLabel}\n`;
  }

  if (data.move_in_timeline) {
    const timelineLabel = MOVE_IN_TIMELINE_OPTIONS.find(
      (o) => o.value === data.move_in_timeline
    )?.label;
    message += `Timeline: ${timelineLabel}\n`;
  }

  message += `\nName: ${data.name}\n`;
  message += `Phone: ${data.phone}`;

  if (data.notes) {
    message += `\n\nAdditional Notes: ${data.notes}`;
  }

  return encodeURIComponent(message);
}
