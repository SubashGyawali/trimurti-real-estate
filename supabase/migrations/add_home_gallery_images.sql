-- =====================================================
-- Migration: Add home_gallery_images Table
-- For managing hero carousel and rotating home page images
-- =====================================================

CREATE TABLE IF NOT EXISTS home_gallery_images (
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

-- Index for ordering active images efficiently
CREATE INDEX IF NOT EXISTS idx_home_gallery_images_order
  ON home_gallery_images (display_order ASC)
  WHERE is_active = TRUE;

-- Enable Row Level Security
ALTER TABLE home_gallery_images ENABLE ROW LEVEL SECURITY;

-- Policy 1: Public read access for active images (and admin view for all)
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

-- Policy 2: Admin insert
CREATE POLICY "Admins can insert gallery images"
  ON home_gallery_images FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Policy 3: Admin update
CREATE POLICY "Admins can update gallery images"
  ON home_gallery_images FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Policy 4: Admin delete
CREATE POLICY "Admins can delete gallery images"
  ON home_gallery_images FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Trigger for auto-updating updated_at
CREATE TRIGGER set_home_gallery_images_updated_at
  BEFORE UPDATE ON home_gallery_images
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Seed initial building images if table is empty
INSERT INTO home_gallery_images (src, alt, display_order)
SELECT * FROM (VALUES
  ('/Building Images/ChatGPT Image Sunset View Balcany.png', 'Sunset balcony view of residential towers in Kandivali West', 0),
  ('/Building Images/IMG_8146.JPG', 'Apartment building in Kandivali West', 1),
  ('/Building Images/Avarai Abrol.JPG', 'Avarai Abrol Building in Kandivali West', 2),
  ('/Building Images/Bhoomi Park O wing.JPG', 'Bhoomi Park O Wing residential complex', 3),
  ('/Building Images/Bhoomi Park Swimming pool.JPG', 'Bhoomi Park Swimming Pool amenities', 2),
  ('/Building Images/Club house bhoomi park.JPG', 'Bhoomi Park Club House facilities', 3),
  ('/Building Images/IMG_2161.JPG', 'Residential building in Kandivali West', 4),
  ('/Building Images/IMG_7690.JPG', 'Modern apartment complex in Kandivali', 5),
  ('/Building Images/IMG_8143.JPG', 'Residential building exterior in Kandivali West', 6),
  ('/Building Images/IMG_8146.JPG', 'Apartment building in Kandivali West', 7),
  ('/Building Images/IMG_8174.JPG', 'Residential towers in Kandivali West', 8),
  ('/Building Images/Marina Garden.JPG', 'Marina Garden residential complex', 9),
  ('/Building Images/Mhada 30.JPG', 'Residential building in Kandivali', 10),
  ('/Building Images/Mhada 55, 56.JPG', 'Residential buildings in Kandivali West', 11),
  ('/Building Images/Mhada 55.JPG', 'Building exterior view in Kandivali West', 12),
  ('/Building Images/Pancharatna.JPG', 'Pancharatna residential building', 13),
  ('/Building Images/Royal Oarsis Podium View.JPG', 'Royal Oasis Podium View', 14),
  ('/Building Images/Royal Oarsis View.JPG', 'Royal Oasis building view', 15),
  ('/Building Images/Royal Oasis Main Gate.JPG', 'Royal Oasis Main Gate entrance', 16),
  ('/Building Images/Royal Oasis Podium.JPG', 'Royal Oasis Podium area', 17),
  ('/Building Images/Royal Oasis Swimming Pool.JPG', 'Royal Oasis Swimming Pool amenities', 18),
  ('/Building Images/SBI Bhoomi park.JPG', 'SBI Bhoomi Park complex', 19)
) AS v(src, alt, display_order)
WHERE NOT EXISTS (SELECT 1 FROM home_gallery_images);
