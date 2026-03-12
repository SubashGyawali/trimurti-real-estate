import { z } from "zod";

// =====================================================
// Admin API Validation Schemas
// =====================================================

// Property image sub-schema (used in property create/update)
const propertyImageSchema = z.object({
  image_url: z.string().url("Invalid image URL"),
  is_primary: z.boolean(),
  display_order: z.number().int().min(0).optional(),
});

// Property create schema
export const propertyCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).nullable().optional(),
  building_id: z.string().uuid().nullable().optional(),
  property_type: z.enum(["1rk", "1bhk", "2bhk", "3bhk", "shop", "office"] as const),
  listing_type: z.enum(["sale", "rent"] as const),
  price: z.number().positive("Price must be positive"),
  deposit: z.number().min(0).nullable().optional(),
  maintenance: z.number().min(0).nullable().optional(),
  carpet_area: z.number().positive().nullable().optional(),
  floor_number: z.number().int().min(0).nullable().optional(),
  total_floors: z.number().int().positive().nullable().optional(),
  furnishing: z.enum(["unfurnished", "semi_furnished", "fully_furnished"] as const),
  bedrooms: z.number().int().min(0).nullable().optional(),
  bathrooms: z.number().int().min(0).nullable().optional(),
  balconies: z.number().int().min(0).default(0),
  parking: z.boolean().default(false),
  facing: z.string().max(50).nullable().optional(),
  availability_date: z.string().nullable().optional(),
  is_verified: z.boolean().default(false),
  is_featured: z.boolean().default(false),
  is_active: z.boolean().default(true),
  location_lat: z.number().min(-90).max(90).nullable().optional(),
  location_lng: z.number().min(-180).max(180).nullable().optional(),
  amenities: z.array(z.string()).default([]),
  images: z.array(propertyImageSchema).max(10).optional(),
});

// Property update schema (all fields optional)
export const propertyUpdateSchema = propertyCreateSchema.partial().extend({
  images: z.array(propertyImageSchema).max(10).optional(),
});

// Building create schema
export const buildingCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  type: z.enum(["mhada_7_storey", "mhada_tower", "private"] as const),
  address: z.string().max(500).nullable().optional(),
  total_floors: z.number().int().positive().nullable().optional(),
  year_built: z.number().int().min(1900).max(2100).nullable().optional(),
  location_lat: z.number().min(-90).max(90).nullable().optional(),
  location_lng: z.number().min(-180).max(180).nullable().optional(),
});

// Building update schema (all fields optional)
export const buildingUpdateSchema = buildingCreateSchema.partial();

// Inquiry update schema
export const inquiryUpdateSchema = z.object({
  status: z.enum(["new", "contacted", "closed"] as const),
});

// Visit update schema
export const visitUpdateSchema = z.object({
  status: z.enum(["pending", "confirmed", "completed", "cancelled"] as const).optional(),
  preferred_date: z.string().nullable().optional(),
  preferred_time: z.string().nullable().optional(),
}).refine(
  (data) => data.status !== undefined || data.preferred_date !== undefined || data.preferred_time !== undefined,
  { message: "At least one field must be provided" }
);

// Type exports
export type PropertyCreateInput = z.infer<typeof propertyCreateSchema>;
export type PropertyUpdateInput = z.infer<typeof propertyUpdateSchema>;
export type BuildingCreateInput = z.infer<typeof buildingCreateSchema>;
export type BuildingUpdateInput = z.infer<typeof buildingUpdateSchema>;
export type InquiryUpdateInput = z.infer<typeof inquiryUpdateSchema>;
export type VisitUpdateInput = z.infer<typeof visitUpdateSchema>;
