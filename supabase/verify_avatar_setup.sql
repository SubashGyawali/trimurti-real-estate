-- =====================================================
-- Verification Script: Check Avatar Setup
-- Run this to diagnose why profile picture isn't showing
-- =====================================================

-- 1. Check if avatar_url column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'avatar_url';
-- Expected: 1 row showing avatar_url column

-- 2. Check all users and their profiles
SELECT
  u.email,
  u.created_at as user_created,
  p.full_name,
  p.avatar_url,
  u.raw_user_meta_data->>'name' as google_name,
  u.raw_user_meta_data->>'picture' as google_picture,
  CASE
    WHEN p.id IS NULL THEN '❌ NO PROFILE'
    WHEN p.avatar_url IS NULL THEN '⚠️ NO AVATAR URL'
    WHEN p.avatar_url IS NOT NULL THEN '✅ HAS AVATAR'
  END as status
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- 3. Find users without profiles (should be empty)
SELECT
  u.id,
  u.email,
  u.created_at,
  u.raw_user_meta_data
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM profiles WHERE id = u.id
);
-- Expected: 0 rows (all users have profiles)

-- 4. Find profiles without avatar_url (Google OAuth users)
SELECT
  p.id,
  p.full_name,
  u.email,
  u.raw_user_meta_data->>'picture' as missing_picture
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.avatar_url IS NULL
  AND u.raw_user_meta_data->>'picture' IS NOT NULL;
-- Expected: 0 rows (all Google users have avatars)

-- 5. Test the handle_new_user function (check if it exists)
SELECT
  proname as function_name,
  prosrc as function_body
FROM pg_proc
WHERE proname = 'handle_new_user';
-- Expected: 1 row showing the function

-- 6. Check if trigger is active
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
-- Expected: 1 row showing AFTER INSERT trigger on auth.users

-- =====================================================
-- QUICK FIX: Update missing avatars
-- Uncomment and run this if step 4 found users without avatars
-- =====================================================

/*
UPDATE profiles p
SET avatar_url = u.raw_user_meta_data->>'picture'
FROM auth.users u
WHERE p.id = u.id
  AND p.avatar_url IS NULL
  AND u.raw_user_meta_data->>'picture' IS NOT NULL;
*/

-- =====================================================
-- Verification Complete
-- =====================================================

-- Summary: Check these results
-- ✅ Step 1: avatar_url column exists
-- ✅ Step 2: All users have status "HAS AVATAR"
-- ✅ Step 3: No users without profiles
-- ✅ Step 4: No Google users missing avatars
-- ✅ Step 5: handle_new_user function exists
-- ✅ Step 6: Trigger is active
