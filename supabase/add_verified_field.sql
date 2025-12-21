-- =====================================================
-- Migration: Add is_verified to properties
-- =====================================================

-- Add is_verified column to properties table
ALTER TABLE properties 
ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;

-- Add comment
COMMENT ON COLUMN properties.is_verified IS 'Verified badge status - set by admin to indicate vetted listing';

-- Create index for filtering by verified status
CREATE INDEX idx_properties_is_verified ON properties(is_verified) WHERE is_verified = TRUE;
