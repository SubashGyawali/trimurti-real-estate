// =====================================================
// Database Types for Trimurti Real Estate
// =====================================================
// These types match the Supabase database schema
// Generated manually - keep in sync with schema.sql
// =====================================================

// -----------------------------------------------------
// Enum Types
// -----------------------------------------------------

export type BuildingType = 'mhada_7_storey' | 'mhada_tower' | 'private';

export type PropertyType = '1rk' | '1bhk' | '2bhk' | '3bhk' | 'shop' | 'office';

export type ListingType = 'sale' | 'rent';

export type FurnishingType = 'unfurnished' | 'semi_furnished' | 'fully_furnished';

export type InquiryType = 'general' | 'property_specific' | 'requirements';

export type InquiryStatus = 'new' | 'contacted' | 'closed';

export type VisitStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

// -----------------------------------------------------
// Table Types
// -----------------------------------------------------

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Building {
  id: string;
  name: string;
  type: BuildingType;
  address: string | null;
  total_floors: number | null;
  year_built: number | null;
  location_lat: number | null;
  location_lng: number | null;
  created_at: string;
}

export interface Property {
  id: string;
  building_id: string | null;
  title: string;
  slug: string;
  description: string | null;
  property_type: PropertyType;
  listing_type: ListingType;
  price: number;
  deposit: number | null;
  maintenance: number | null;
  carpet_area: number | null;
  floor_number: number | null;
  total_floors: number | null;
  furnishing: FurnishingType;
  bedrooms: number | null;
  bathrooms: number | null;
  balconies: number;
  parking: boolean;
  facing: string | null;
  availability_date: string | null;
  is_verified: boolean;
  is_featured: boolean;
  is_active: boolean;
  views_count: number;
  location_lat: number | null;
  location_lng: number | null;
  amenities: string[];
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface PropertyImage {
  id: string;
  property_id: string;
  image_url: string;
  display_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface Inquiry {
  id: string;
  property_id: string | null;
  name: string;
  email: string | null;
  phone: string;
  message: string | null;
  inquiry_type: InquiryType;
  status: InquiryStatus;
  requirements_data: RequirementsData | null;
  created_at: string;
}

export interface PropertyVisit {
  id: string;
  property_id: string;
  name: string;
  phone: string;
  email: string | null;
  preferred_date: string | null;
  preferred_time: string | null;
  message: string | null;
  status: VisitStatus;
  created_at: string;
}

export interface UserFavorite {
  id: string;
  user_id: string;
  property_id: string;
  created_at: string;
}

// -----------------------------------------------------
// JSONB Types
// -----------------------------------------------------

export interface RequirementsData {
  budget_min?: number;
  budget_max?: number;
  preferred_areas?: string[];
  property_types?: PropertyType[];
  listing_type?: ListingType;
  bedrooms_min?: number;
  bedrooms_max?: number;
  notes?: string;
}

// -----------------------------------------------------
// Insert Types (for creating new records)
// -----------------------------------------------------

export type ProfileInsert = Omit<Profile, 'created_at' | 'updated_at'>;

export type BuildingInsert = Omit<Building, 'id' | 'created_at'>;

export type PropertyInsert = Omit<Property, 'id' | 'slug' | 'views_count' | 'created_at' | 'updated_at'>;

export type PropertyImageInsert = Omit<PropertyImage, 'id' | 'created_at'>;

export type InquiryInsert = Omit<Inquiry, 'id' | 'status' | 'created_at'>;

export type PropertyVisitInsert = Omit<PropertyVisit, 'id' | 'status' | 'created_at'>;

export type UserFavoriteInsert = Omit<UserFavorite, 'id' | 'created_at'>;

// -----------------------------------------------------
// Update Types (for updating records)
// -----------------------------------------------------

export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;

export type BuildingUpdate = Partial<Omit<Building, 'id' | 'created_at'>>;

export type PropertyUpdate = Partial<Omit<Property, 'id' | 'slug' | 'created_at' | 'updated_at'>>;

export type PropertyImageUpdate = Partial<Omit<PropertyImage, 'id' | 'property_id' | 'created_at'>>;

export type InquiryUpdate = Partial<Pick<Inquiry, 'status'>>;

export type PropertyVisitUpdate = Partial<Pick<PropertyVisit, 'status' | 'preferred_date' | 'preferred_time'>>;

// -----------------------------------------------------
// Extended Types (with relations)
// -----------------------------------------------------

export interface PropertyWithImages extends Property {
  property_images: PropertyImage[];
}

export interface PropertyWithBuilding extends Property {
  building: Building | null;
}

export interface PropertyWithDetails extends Property {
  property_images: PropertyImage[];
  building: Building | null;
}

export interface InquiryWithProperty extends Inquiry {
  property: Property | null;
}

export interface PropertyVisitWithProperty extends PropertyVisit {
  property: Property;
}

export interface UserFavoriteWithProperty extends UserFavorite {
  property: PropertyWithImages;
}

// -----------------------------------------------------
// Supabase Database Type Definition
// -----------------------------------------------------

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      buildings: {
        Row: Building;
        Insert: BuildingInsert;
        Update: BuildingUpdate;
      };
      properties: {
        Row: Property;
        Insert: PropertyInsert;
        Update: PropertyUpdate;
      };
      property_images: {
        Row: PropertyImage;
        Insert: PropertyImageInsert;
        Update: PropertyImageUpdate;
      };
      inquiries: {
        Row: Inquiry;
        Insert: InquiryInsert;
        Update: InquiryUpdate;
      };
      property_visits: {
        Row: PropertyVisit;
        Insert: PropertyVisitInsert;
        Update: PropertyVisitUpdate;
      };
      user_favorites: {
        Row: UserFavorite;
        Insert: UserFavoriteInsert;
        Update: never;
      };
    };
    Enums: {
      building_type: BuildingType;
      property_type: PropertyType;
      listing_type: ListingType;
      furnishing_type: FurnishingType;
      inquiry_type: InquiryType;
      inquiry_status: InquiryStatus;
      visit_status: VisitStatus;
    };
  };
}
