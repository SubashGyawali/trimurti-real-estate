-- =====================================================
-- Migration: Add avatar_url to profiles table
-- Description: Add avatar_url column to store user profile images
--              from Google OAuth or custom uploads
-- =====================================================

-- Add avatar_url column to profiles table
ALTER TABLE profiles ADD COLUMN avatar_url TEXT;

COMMENT ON COLUMN profiles.avatar_url IS 'User profile avatar URL (from Google OAuth or custom upload)';

-- Update handle_new_user function to extract avatar_url from OAuth metadata
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, phone, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION handle_new_user IS 'Auto-creates profile with avatar_url when new user signs up';

-- Backfill existing Google OAuth users with their avatar URLs
UPDATE profiles p
SET avatar_url = (
  SELECT raw_user_meta_data->>'avatar_url'
  FROM auth.users
  WHERE id = p.id
)
WHERE avatar_url IS NULL
  AND EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = p.id
    AND raw_user_meta_data->>'avatar_url' IS NOT NULL
  );

-- =====================================================
-- Migration Complete
-- =====================================================
