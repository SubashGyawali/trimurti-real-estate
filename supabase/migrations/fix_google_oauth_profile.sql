-- =====================================================
-- Fix: Google OAuth Profile Creation Issue
-- Description: Fix handle_new_user trigger to work with
--              Google OAuth metadata structure
-- =====================================================

-- Step 1: Check current auth users and their metadata
-- (Run this first to see what Google provides)
-- SELECT id, email, raw_user_meta_data FROM auth.users ORDER BY created_at DESC LIMIT 5;

-- Step 2: Fix the handle_new_user function
-- Google OAuth uses 'picture' not 'avatar_url', and 'name' not 'full_name'
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, phone, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)  -- Fallback to email username
    ),
    NEW.raw_user_meta_data->>'phone',
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture'  -- Google uses 'picture'
    )
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists, update it instead
    UPDATE profiles
    SET
      full_name = COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        profiles.full_name
      ),
      avatar_url = COALESCE(
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.raw_user_meta_data->>'picture',
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

COMMENT ON FUNCTION handle_new_user IS 'Auto-creates profile with Google OAuth compatibility (uses picture field)';

-- Step 3: Manually create profiles for existing users who don't have one
-- This will fix any users who logged in but didn't get a profile
INSERT INTO profiles (id, full_name, phone, avatar_url)
SELECT
  u.id,
  COALESCE(
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'name',
    split_part(u.email, '@', 1)
  ) as full_name,
  u.raw_user_meta_data->>'phone' as phone,
  COALESCE(
    u.raw_user_meta_data->>'avatar_url',
    u.raw_user_meta_data->>'picture'
  ) as avatar_url
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO UPDATE
SET
  full_name = EXCLUDED.full_name,
  avatar_url = EXCLUDED.avatar_url,
  updated_at = now();

-- Step 4: Update existing profiles with Google avatar URLs if missing
UPDATE profiles p
SET avatar_url = COALESCE(
  u.raw_user_meta_data->>'avatar_url',
  u.raw_user_meta_data->>'picture'
)
FROM auth.users u
WHERE p.id = u.id
  AND p.avatar_url IS NULL
  AND (
    u.raw_user_meta_data->>'picture' IS NOT NULL
    OR u.raw_user_meta_data->>'avatar_url' IS NOT NULL
  );

-- =====================================================
-- Fix Complete
-- =====================================================

-- Verification queries (uncomment to run):

-- 1. Check all users and their profiles
-- SELECT
--   u.email,
--   u.raw_user_meta_data->>'name' as google_name,
--   u.raw_user_meta_data->>'picture' as google_picture,
--   p.full_name,
--   p.avatar_url
-- FROM auth.users u
-- LEFT JOIN profiles p ON u.id = p.id
-- ORDER BY u.created_at DESC;

-- 2. Find users without profiles
-- SELECT u.id, u.email, u.created_at
-- FROM auth.users u
-- LEFT JOIN profiles p ON u.id = p.id
-- WHERE p.id IS NULL;
