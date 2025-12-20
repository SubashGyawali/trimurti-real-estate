import { z } from "zod";

export const SUBJECT_OPTIONS = [
  { value: "general", label: "General Inquiry" },
  { value: "buying", label: "Buying a Property" },
  { value: "renting", label: "Renting a Property" },
  { value: "selling", label: "Selling my Property" },
  { value: "other", label: "Other" },
] as const;

export type SubjectType = (typeof SUBJECT_OPTIONS)[number]["value"];

export const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number"),
  email: z
    .string()
    .email("Please enter a valid email address")
    .optional()
    .or(z.literal("")),
  subject: z.enum(["general", "buying", "renting", "selling", "other"] as any),
  message: z
    .string()
    .max(500, "Message must be less than 500 characters")
    .optional()
    .or(z.literal("")),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
