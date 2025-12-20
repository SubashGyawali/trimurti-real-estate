// =====================================================
// Form Types for Trimurti Real Estate
// =====================================================
// These types are used for form validation and submission
// Works with React Hook Form and Zod validation
// =====================================================

import type {
  PropertyType,
  ListingType,
  FurnishingType,
  BuildingType,
  InquiryType,
} from "./database";

// -----------------------------------------------------
// Contact / Inquiry Form
// -----------------------------------------------------

export interface ContactFormData {
  name: string;
  email?: string;
  phone: string;
  message?: string;
  inquiry_type: InquiryType;
  property_id?: string; // If inquiry is about a specific property
}

// -----------------------------------------------------
// Requirements Form (What are you looking for?)
// -----------------------------------------------------

export interface RequirementsFormData {
  name: string;
  email?: string;
  phone: string;
  listing_type: ListingType;
  property_types: PropertyType[];
  budget_min?: number;
  budget_max?: number;
  bedrooms_min?: number;
  bedrooms_max?: number;
  preferred_areas?: string[];
  furnishing_preference?: FurnishingType;
  parking_required?: boolean;
  notes?: string;
}

// -----------------------------------------------------
// Property Visit Booking Form
// -----------------------------------------------------

export interface PropertyVisitFormData {
  property_id: string;
  name: string;
  phone: string;
  email?: string;
  preferred_date?: string; // ISO date string
  preferred_time?: "morning" | "afternoon" | "evening";
  message?: string;
}

// -----------------------------------------------------
// User Profile Form
// -----------------------------------------------------

export interface ProfileFormData {
  full_name: string;
  phone?: string;
}

// -----------------------------------------------------
// Admin: Property Form
// -----------------------------------------------------

export interface PropertyFormData {
  title: string;
  description?: string;
  building_id?: string;
  property_type: PropertyType;
  listing_type: ListingType;
  price: number;
  deposit?: number;
  maintenance?: number;
  carpet_area?: number;
  floor_number?: number;
  total_floors?: number;
  furnishing: FurnishingType;
  bedrooms?: number;
  bathrooms?: number;
  balconies?: number;
  parking: boolean;
  facing?: string;
  availability_date?: string; // ISO date string
  is_featured: boolean;
  is_active: boolean;
  location_lat?: number;
  location_lng?: number;
  amenities: string[];
}

// -----------------------------------------------------
// Admin: Building Form
// -----------------------------------------------------

export interface BuildingFormData {
  name: string;
  type: BuildingType;
  address?: string;
  total_floors?: number;
  year_built?: number;
  location_lat?: number;
  location_lng?: number;
}

// -----------------------------------------------------
// Admin: Inquiry Status Update Form
// -----------------------------------------------------

export interface InquiryStatusFormData {
  status: "new" | "contacted" | "closed";
}

// -----------------------------------------------------
// Admin: Visit Status Update Form
// -----------------------------------------------------

export interface VisitStatusFormData {
  status: "pending" | "confirmed" | "completed" | "cancelled";
}

// -----------------------------------------------------
// Property Image Upload
// -----------------------------------------------------

export interface PropertyImageUploadData {
  property_id: string;
  file: File;
  display_order?: number;
  is_primary?: boolean;
}

// -----------------------------------------------------
// Search / Filter Forms
// -----------------------------------------------------

export interface PropertySearchFilters {
  query?: string;
  listing_type?: ListingType;
  property_types?: PropertyType[];
  building_id?: string;
  min_price?: number;
  max_price?: number;
  min_carpet_area?: number;
  max_carpet_area?: number;
  bedrooms?: number[];
  furnishing?: FurnishingType[];
  parking?: boolean;
  sort_by?: "price_asc" | "price_desc" | "newest" | "oldest" | "area_asc" | "area_desc";
  page?: number;
  limit?: number;
}

// -----------------------------------------------------
// Authentication Forms
// -----------------------------------------------------

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirm_password: string;
  full_name: string;
  phone?: string;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  password: string;
  confirm_password: string;
}

// -----------------------------------------------------
// WhatsApp Quick Contact
// -----------------------------------------------------

export interface WhatsAppContactData {
  property_id?: string;
  property_title?: string;
  message?: string;
}

// -----------------------------------------------------
// Form State Types
// -----------------------------------------------------

export interface FormState<T> {
  data: T | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: string | null;
}

// -----------------------------------------------------
// API Response Types
// -----------------------------------------------------

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// -----------------------------------------------------
// Form Option Types (for selects/dropdowns)
// -----------------------------------------------------

export interface SelectOption<T = string> {
  value: T;
  label: string;
}

export const PROPERTY_TYPE_OPTIONS: SelectOption<PropertyType>[] = [
  { value: "1rk", label: "1 RK" },
  { value: "1bhk", label: "1 BHK" },
  { value: "2bhk", label: "2 BHK" },
  { value: "3bhk", label: "3 BHK" },
  { value: "shop", label: "Shop" },
  { value: "office", label: "Office" },
];

export const LISTING_TYPE_OPTIONS: SelectOption<ListingType>[] = [
  { value: "sale", label: "For Sale" },
  { value: "rent", label: "For Rent" },
];

export const FURNISHING_OPTIONS: SelectOption<FurnishingType>[] = [
  { value: "unfurnished", label: "Unfurnished" },
  { value: "semi_furnished", label: "Semi-Furnished" },
  { value: "fully_furnished", label: "Fully Furnished" },
];

export const BUILDING_TYPE_OPTIONS: SelectOption<BuildingType>[] = [
  { value: "mhada_7_storey", label: "MHADA 7-Storey" },
  { value: "mhada_tower", label: "MHADA Tower" },
  { value: "private", label: "Private Building" },
];

export const PREFERRED_TIME_OPTIONS: SelectOption[] = [
  { value: "morning", label: "Morning (9 AM - 12 PM)" },
  { value: "afternoon", label: "Afternoon (12 PM - 5 PM)" },
  { value: "evening", label: "Evening (5 PM - 8 PM)" },
];

export const FACING_OPTIONS: SelectOption[] = [
  { value: "east", label: "East" },
  { value: "west", label: "West" },
  { value: "north", label: "North" },
  { value: "south", label: "South" },
  { value: "north-east", label: "North-East" },
  { value: "north-west", label: "North-West" },
  { value: "south-east", label: "South-East" },
  { value: "south-west", label: "South-West" },
];

export const BEDROOM_OPTIONS: SelectOption<number>[] = [
  { value: 1, label: "1 Bedroom" },
  { value: 2, label: "2 Bedrooms" },
  { value: 3, label: "3 Bedrooms" },
  { value: 4, label: "4+ Bedrooms" },
];

export const COMMON_AMENITIES: string[] = [
  "Lift",
  "Security",
  "Parking",
  "Power Backup",
  "Water Storage",
  "Garden",
  "Gym",
  "Swimming Pool",
  "Club House",
  "Children Play Area",
  "Visitor Parking",
  "CCTV",
  "Intercom",
  "Fire Safety",
  "Piped Gas",
  "Rainwater Harvesting",
];
