-- =====================================================
-- Trimurti Real Estate - Supabase Database Schema
-- =====================================================
-- This schema defines all tables, types, policies, and functions
-- for the Trimurti Real Estate web application.
--
-- Run this in Supabase SQL Editor to set up the database.
-- =====================================================

-- =====================================================
-- SECTION 1: CUSTOM TYPES (ENUMS)
-- =====================================================

-- Building type - categorizes buildings by their type
CREATE TYPE building_type AS ENUM (
  'mhada_7_storey',  -- MHADA 7-storied buildings (53 buildings)
  'mhada_tower',     -- MHADA 24-storied towers
  'private'          -- Private buildings (Bhoomi Park, Marina, Dotam, etc.)
);

-- Property type - defines the configuration of the property
CREATE TYPE property_type AS ENUM (
  '1rk',    -- 1 Room Kitchen
  '1bhk',   -- 1 Bedroom Hall Kitchen
  '2bhk',   -- 2 Bedroom Hall Kitchen
  '3bhk',   -- 3 Bedroom Hall Kitchen
  'shop',   -- Commercial shop
  'office'  -- Commercial office space
);

-- Listing type - whether the property is for sale or rent
CREATE TYPE listing_type AS ENUM (
  'sale',   -- Property is for sale
  'rent'    -- Property is for rent
);

-- Furnishing type - level of furnishing in the property
CREATE TYPE furnishing_type AS ENUM (
  'unfurnished',      -- No furniture
  'semi_furnished',   -- Basic furniture (fans, lights, etc.)
  'fully_furnished'   -- Complete furniture
);

-- Inquiry type - categorizes the type of inquiry
CREATE TYPE inquiry_type AS ENUM (
  'general',           -- General website inquiry
  'property_specific', -- Inquiry about a specific property
  'requirements'       -- User submitted their requirements
);

-- Inquiry status - tracks the status of an inquiry
CREATE TYPE inquiry_status AS ENUM (
  'new',       -- New inquiry, not yet reviewed
  'contacted', -- Admin has contacted the user
  'closed'     -- Inquiry has been resolved/closed
);

-- Visit status - tracks property visit appointment status
CREATE TYPE visit_status AS ENUM (
  'pending',    -- Visit requested, awaiting confirmation
  'confirmed',  -- Visit confirmed by admin
  'completed',  -- Visit has been completed
  'cancelled'   -- Visit was cancelled
);

-- =====================================================
-- SECTION 2: TABLES
-- =====================================================

-- -----------------------------------------------------
-- Table: profiles
-- Extends Supabase auth.users with additional user info
-- Auto-created via trigger when a new user signs up
-- -----------------------------------------------------
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

COMMENT ON TABLE profiles IS 'Extended user profiles linked to Supabase auth.users';
COMMENT ON COLUMN profiles.avatar_url IS 'User profile avatar URL (from Google OAuth or custom upload)';
COMMENT ON COLUMN profiles.is_admin IS 'Single admin flag - must be manually set in database';

-- -----------------------------------------------------
-- Table: buildings
-- Master data for buildings in the area
-- MHADA complexes and nearby private buildings
-- -----------------------------------------------------
CREATE TABLE buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type building_type NOT NULL,
  address TEXT,
  total_floors INTEGER,
  year_built INTEGER,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

COMMENT ON TABLE buildings IS 'Master data for MHADA complexes and private buildings';
COMMENT ON COLUMN buildings.type IS 'Building category: MHADA 7-storey, MHADA tower, or private';

-- -----------------------------------------------------
-- Table: properties
-- Main property listings table
-- Limited to 50 active listings for quality control
-- -----------------------------------------------------
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID REFERENCES buildings(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  property_type property_type NOT NULL,
  listing_type listing_type NOT NULL,
  price INTEGER NOT NULL,                    -- Price in INR (rupees)
  deposit INTEGER,                           -- Security deposit for rentals
  maintenance INTEGER,                       -- Monthly maintenance charges
  carpet_area INTEGER,                       -- Area in square feet
  floor_number INTEGER,
  total_floors INTEGER,
  furnishing furnishing_type DEFAULT 'unfurnished',
  bedrooms INTEGER,
  bathrooms INTEGER,
  balconies INTEGER DEFAULT 0,
  parking BOOLEAN DEFAULT FALSE,
  facing TEXT,                               -- East, West, North, South, etc.
  availability_date DATE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  views_count INTEGER DEFAULT 0,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  amenities TEXT[] DEFAULT '{}',             -- Array of amenities
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

COMMENT ON TABLE properties IS 'Main property listings - max 50 active for quality control';
COMMENT ON COLUMN properties.slug IS 'URL-friendly identifier generated from title';
COMMENT ON COLUMN properties.price IS 'Price in INR (rupees) - no decimals';
COMMENT ON COLUMN properties.amenities IS 'Array of amenity strings like {gym, parking, security}';

-- -----------------------------------------------------
-- Table: property_images
-- Photos for property listings
-- Max 10 images per property
-- -----------------------------------------------------
CREATE TABLE property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

COMMENT ON TABLE property_images IS 'Property photos - max 10 per property';
COMMENT ON COLUMN property_images.display_order IS 'Order in which images appear in gallery';
COMMENT ON COLUMN property_images.is_primary IS 'Primary image shown in listing cards';

-- -----------------------------------------------------
-- Table: inquiries
-- Contact form submissions and lead management
-- Supports general inquiries and property-specific ones
-- -----------------------------------------------------
CREATE TABLE inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  message TEXT,
  inquiry_type inquiry_type NOT NULL DEFAULT 'general',
  status inquiry_status NOT NULL DEFAULT 'new',
  requirements_data JSONB,                   -- Flexible storage for requirement form data
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

COMMENT ON TABLE inquiries IS 'Contact form submissions and leads';
COMMENT ON COLUMN inquiries.requirements_data IS 'JSON data for requirements form: budget, preferred_areas, etc.';

-- -----------------------------------------------------
-- Table: property_visits
-- Appointment scheduling for property viewings
-- -----------------------------------------------------
CREATE TABLE property_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  preferred_date DATE,
  preferred_time TEXT,                       -- 'morning', 'afternoon', 'evening'
  message TEXT,
  status visit_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

COMMENT ON TABLE property_visits IS 'Property visit appointment requests';
COMMENT ON COLUMN property_visits.preferred_time IS 'Time slot: morning, afternoon, or evening';

-- -----------------------------------------------------
-- Table: user_favorites
-- Saved/bookmarked properties by users
-- -----------------------------------------------------
CREATE TABLE user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  UNIQUE(user_id, property_id)               -- Prevent duplicate favorites
);

COMMENT ON TABLE user_favorites IS 'User saved/favorited properties';

-- -----------------------------------------------------
-- Table: home_gallery_images
-- Rotating hero & CTA gallery images on the home page
-- -----------------------------------------------------
CREATE TABLE home_gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  src TEXT NOT NULL,
  alt TEXT NOT NULL DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

COMMENT ON TABLE home_gallery_images IS 'Rotating hero & CTA gallery images on the home page';
COMMENT ON COLUMN home_gallery_images.src IS 'Image source URL (local path or Cloudinary/CDN URL)';
COMMENT ON COLUMN home_gallery_images.alt IS 'Descriptive text for accessibility and SEO';
COMMENT ON COLUMN home_gallery_images.display_order IS 'Order in which images appear in hero rotation';
COMMENT ON COLUMN home_gallery_images.is_active IS 'Whether this image is included in active rotation';

-- =====================================================
-- SECTION 3: INDEXES
-- =====================================================

-- Properties indexes for common queries
CREATE INDEX idx_properties_slug ON properties(slug);
CREATE INDEX idx_properties_is_active ON properties(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_properties_listing_type ON properties(listing_type);
CREATE INDEX idx_properties_property_type ON properties(property_type);
CREATE INDEX idx_properties_building_id ON properties(building_id);
CREATE INDEX idx_properties_is_featured ON properties(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_properties_price ON properties(price);

-- Property images index
CREATE INDEX idx_property_images_property_id ON property_images(property_id);

-- Inquiries indexes
CREATE INDEX idx_inquiries_status ON inquiries(status);
CREATE INDEX idx_inquiries_property_id ON inquiries(property_id);
CREATE INDEX idx_inquiries_created_at ON inquiries(created_at DESC);

-- Property visits indexes
CREATE INDEX idx_property_visits_status ON property_visits(status);
CREATE INDEX idx_property_visits_property_id ON property_visits(property_id);

-- User favorites indexes
CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_property_id ON user_favorites(property_id);

-- Home gallery images index
CREATE INDEX idx_home_gallery_images_order ON home_gallery_images(display_order ASC) WHERE is_active = TRUE;

-- =====================================================
-- SECTION 4: ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_gallery_images ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------
-- Profiles Policies
-- -----------------------------------------------------

-- Anyone can view profiles (for displaying user info)
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- System can insert profiles (via trigger)
CREATE POLICY "System can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- -----------------------------------------------------
-- Buildings Policies
-- -----------------------------------------------------

-- Anyone can view buildings (reference data)
CREATE POLICY "Buildings are viewable by everyone"
  ON buildings FOR SELECT
  USING (true);

-- Only admins can insert buildings
CREATE POLICY "Admins can insert buildings"
  ON buildings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Only admins can update buildings
CREATE POLICY "Admins can update buildings"
  ON buildings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Only admins can delete buildings
CREATE POLICY "Admins can delete buildings"
  ON buildings FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- -----------------------------------------------------
-- Properties Policies
-- -----------------------------------------------------

-- Anyone can view active properties
CREATE POLICY "Active properties are viewable by everyone"
  ON properties FOR SELECT
  USING (is_active = TRUE OR (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  ));

-- Only admins can insert properties
CREATE POLICY "Admins can insert properties"
  ON properties FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Only admins can update properties
CREATE POLICY "Admins can update properties"
  ON properties FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Only admins can delete properties
CREATE POLICY "Admins can delete properties"
  ON properties FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- -----------------------------------------------------
-- Property Images Policies
-- -----------------------------------------------------

-- Anyone can view property images
CREATE POLICY "Property images are viewable by everyone"
  ON property_images FOR SELECT
  USING (true);

-- Only admins can insert images
CREATE POLICY "Admins can insert property images"
  ON property_images FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Only admins can update images
CREATE POLICY "Admins can update property images"
  ON property_images FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Only admins can delete images
CREATE POLICY "Admins can delete property images"
  ON property_images FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- -----------------------------------------------------
-- Inquiries Policies
-- -----------------------------------------------------

-- Anyone can submit an inquiry (contact form)
CREATE POLICY "Anyone can submit inquiries"
  ON inquiries FOR INSERT
  WITH CHECK (true);

-- Only admins can view inquiries
CREATE POLICY "Admins can view inquiries"
  ON inquiries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Only admins can update inquiries
CREATE POLICY "Admins can update inquiries"
  ON inquiries FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Only admins can delete inquiries
CREATE POLICY "Admins can delete inquiries"
  ON inquiries FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- -----------------------------------------------------
-- Property Visits Policies
-- -----------------------------------------------------

-- Anyone can book a visit
CREATE POLICY "Anyone can book property visits"
  ON property_visits FOR INSERT
  WITH CHECK (true);

-- Only admins can view visits
CREATE POLICY "Admins can view property visits"
  ON property_visits FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Only admins can update visits
CREATE POLICY "Admins can update property visits"
  ON property_visits FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Only admins can delete visits
CREATE POLICY "Admins can delete property visits"
  ON property_visits FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- -----------------------------------------------------
-- User Favorites Policies
-- -----------------------------------------------------

-- Users can view their own favorites
CREATE POLICY "Users can view own favorites"
  ON user_favorites FOR SELECT
  USING (auth.uid() = user_id);

-- Users can add to their favorites
CREATE POLICY "Users can add favorites"
  ON user_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can remove their favorites
CREATE POLICY "Users can remove own favorites"
  ON user_favorites FOR DELETE
  USING (auth.uid() = user_id);

-- -----------------------------------------------------
-- Home Gallery Images Policies
-- -----------------------------------------------------

-- Anyone can view active gallery images (admins can view all)
CREATE POLICY "Active gallery images are viewable by everyone"
  ON home_gallery_images FOR SELECT
  USING (
    is_active = TRUE OR (
      EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND is_admin = TRUE
      )
    )
  );

-- Only admins can insert gallery images
CREATE POLICY "Admins can insert gallery images"
  ON home_gallery_images FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Only admins can update gallery images
CREATE POLICY "Admins can update gallery images"
  ON home_gallery_images FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Only admins can delete gallery images
CREATE POLICY "Admins can delete gallery images"
  ON home_gallery_images FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- =====================================================
-- SECTION 5: FUNCTIONS
-- =====================================================

-- -----------------------------------------------------
-- Function: handle_updated_at
-- Automatically updates the updated_at timestamp
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION handle_updated_at IS 'Trigger function to auto-update updated_at timestamp';

-- -----------------------------------------------------
-- Function: generate_slug
-- Creates a URL-friendly slug from the property title
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION generate_slug(title TEXT)
RETURNS TEXT AS $$
DECLARE
  v_slug TEXT;
  counter INTEGER := 0;
  base_slug TEXT;
BEGIN
  -- Convert to lowercase, replace spaces with hyphens, remove special chars
  base_slug := lower(trim(title));
  base_slug := regexp_replace(base_slug, '[^a-z0-9\s-]', '', 'g');
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := trim(both '-' from base_slug);

  v_slug := base_slug;

  -- Ensure uniqueness by appending counter if needed
  WHILE EXISTS (SELECT 1 FROM properties WHERE properties.slug = v_slug) LOOP
    counter := counter + 1;
    v_slug := base_slug || '-' || counter;
  END LOOP;

  RETURN v_slug;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_slug IS 'Generates unique URL-friendly slug from property title';

-- -----------------------------------------------------
-- Function: enforce_active_property_limit
-- Prevents more than 50 active property listings
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION enforce_active_property_limit()
RETURNS TRIGGER AS $$
DECLARE
  active_count INTEGER;
BEGIN
  -- Only check when setting is_active to TRUE
  IF NEW.is_active = TRUE THEN
    -- Count current active properties (excluding the current one if updating)
    SELECT COUNT(*) INTO active_count
    FROM properties
    WHERE is_active = TRUE
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);

    IF active_count >= 50 THEN
      RAISE EXCEPTION 'Maximum of 50 active property listings allowed. Please deactivate an existing listing first.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION enforce_active_property_limit IS 'Enforces business rule: max 50 active listings';

-- -----------------------------------------------------
-- Function: enforce_property_images_limit
-- Prevents more than 10 images per property
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION enforce_property_images_limit()
RETURNS TRIGGER AS $$
DECLARE
  image_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO image_count
  FROM property_images
  WHERE property_id = NEW.property_id;

  IF image_count >= 10 THEN
    RAISE EXCEPTION 'Maximum of 10 images per property allowed.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION enforce_property_images_limit IS 'Enforces business rule: max 10 images per property';

-- -----------------------------------------------------
-- Function: handle_new_user
-- Creates a profile when a new user signs up
-- Updated to handle Google OAuth metadata correctly
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, phone, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',      -- Google uses 'name'
      split_part(NEW.email, '@', 1)         -- Fallback to email username
    ),
    NEW.raw_user_meta_data->>'phone',
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture'    -- Google uses 'picture'
    )
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists, update it instead
    UPDATE profiles
    SET
      full_name = COALESCE(
        NEW.raw_user_meta_data->>'name',
        NEW.raw_user_meta_data->>'full_name',
        profiles.full_name
      ),
      avatar_url = COALESCE(
        NEW.raw_user_meta_data->>'picture',
        NEW.raw_user_meta_data->>'avatar_url',
        profiles.avatar_url
      ),
      updated_at = now()
    WHERE id = NEW.id;
    RETURN NEW;
  WHEN OTHERS THEN
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION handle_new_user IS 'Auto-creates profile with Google OAuth compatibility (uses picture and name fields)';

-- -----------------------------------------------------
-- Function: auto_generate_slug
-- Trigger function to generate slug before insert
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION auto_generate_slug()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate slug if not provided or empty
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_slug(NEW.title);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION auto_generate_slug IS 'Trigger function to auto-generate slug from title';

-- =====================================================
-- SECTION 6: TRIGGERS
-- =====================================================

-- Updated_at triggers
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_home_gallery_images_updated_at
  BEFORE UPDATE ON home_gallery_images
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Property limit enforcement
CREATE TRIGGER check_active_property_limit
  BEFORE INSERT OR UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION enforce_active_property_limit();

-- Property images limit enforcement
CREATE TRIGGER check_property_images_limit
  BEFORE INSERT ON property_images
  FOR EACH ROW
  EXECUTE FUNCTION enforce_property_images_limit();

-- Auto-generate slug for properties
CREATE TRIGGER auto_generate_property_slug
  BEFORE INSERT ON properties
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_slug();

-- Create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- SECTION 7: SAMPLE DATA (OPTIONAL)
-- =====================================================
-- Uncomment to insert sample building data

/*
-- Sample MHADA buildings
INSERT INTO buildings (name, type, address, total_floors, year_built, location_lat, location_lng) VALUES
('MHADA Building 1', 'mhada_7_storey', 'Sector 1, MHADA Complex, Kandivali West', 7, 1985, 19.2095, 72.8347),
('MHADA Building 2', 'mhada_7_storey', 'Sector 1, MHADA Complex, Kandivali West', 7, 1985, 19.2097, 72.8349),
('MHADA Building 3', 'mhada_7_storey', 'Sector 2, MHADA Complex, Kandivali West', 7, 1986, 19.2100, 72.8352),
('MHADA Tower A', 'mhada_tower', 'MHADA Colony, Kandivali West', 24, 2005, 19.2088, 72.8340),
('MHADA Tower B', 'mhada_tower', 'MHADA Colony, Kandivali West', 24, 2005, 19.2090, 72.8342),
('Bhoomi Park', 'private', 'Bhoomi Park Complex, Kandivali West', 15, 2010, 19.2070, 72.8330),
('Marina Enclave', 'private', 'Marina Enclave, Kandivali West', 12, 2008, 19.2065, 72.8325),
('Dotam Complex', 'private', 'Dotam Building, Kandivali West', 10, 2012, 19.2060, 72.8320);
*/

-- =====================================================
-- SECTION 8: STORAGE POLICIES
-- =====================================================

-- Ensure the storage bucket exists (usually done via dashboard)
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy 1: Public Read Access
-- Allow anyone to view images in the 'property-images' bucket
CREATE POLICY "Public Access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'property-images');

-- Policy 2: Admin Upload Access
-- Only admins can upload images to 'property-images' bucket
CREATE POLICY "Admins can upload property images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'property-images' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- Policy 3: Admin Update Access
-- Only admins can update images
CREATE POLICY "Admins can update property images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'property-images' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- Policy 4: Admin Delete Access
-- Only admins can delete images
CREATE POLICY "Admins can delete property images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'property-images' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- =====================================================
-- SCHEMA COMPLETE
-- =====================================================
-- Remember to:
-- 1. Manually set is_admin = TRUE for the admin user after signup
-- 2. Configure email templates in Supabase Auth settings
-- =====================================================
