import { z } from "zod";

// Indian phone validation - must start with 6-9 and be 10 digits
const phoneRegex = /^[6-9]\d{9}$/;

/**
 * Schema for quick inquiry form on property detail page
 */
export const inquirySchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long"),
  phone: z
    .string()
    .regex(phoneRegex, "Please enter a valid 10-digit mobile number"),
  email: z
    .string()
    .email("Please enter a valid email")
    .optional()
    .or(z.literal("")),
  message: z
    .string()
    .max(500, "Message is too long")
    .optional()
    .or(z.literal("")),
  property_id: z.string().uuid().optional(),
  inquiry_type: z.enum(["general", "property_specific", "requirements"]),
});

/**
 * Schema for property visit booking form
 */
export const propertyVisitSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long"),
  phone: z
    .string()
    .regex(phoneRegex, "Please enter a valid 10-digit mobile number"),
  email: z
    .string()
    .email("Please enter a valid email")
    .optional()
    .or(z.literal("")),
  property_id: z.string().uuid(),
  preferred_date: z.string().optional(), // ISO date string
  preferred_time: z.enum(["morning", "afternoon", "evening"]).optional(),
  message: z
    .string()
    .max(500, "Message is too long")
    .optional()
    .or(z.literal("")),
});

export type InquiryFormData = z.infer<typeof inquirySchema>;
export type PropertyVisitFormData = z.infer<typeof propertyVisitSchema>;
