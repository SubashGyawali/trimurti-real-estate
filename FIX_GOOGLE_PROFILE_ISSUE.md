# 🔧 Fix: Google OAuth Profile Not Created

## Problem
You logged in with a new Google account, but no profile was created in the `profiles` table.

## Why This Happened
Google OAuth uses different metadata field names than we expected:
- Google uses `picture` (not `avatar_url`) for profile images
- Google uses `name` (not `full_name`) for user names

The trigger function was looking for the wrong fields!

---

## 🚀 Quick Fix (5 minutes)

### Step 1: Run the Fix Migration

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Click "SQL Editor"** in the left sidebar
3. **Click "New Query"**
4. **Open this file**: `supabase/migrations/fix_google_oauth_profile.sql`
5. **Copy ALL the contents** and paste into SQL Editor
6. **Click "Run"** (or press Ctrl+Enter)

### What This Fix Does:

✅ **Updates the trigger function** to use correct Google OAuth fields (`picture`, `name`)
✅ **Creates missing profiles** for users who already logged in
✅ **Backfills avatar URLs** for existing profiles
✅ **Handles duplicate profile creation** gracefully

---

## Step 2: Verify the Fix

### Check 1: Profile Was Created

Run this query in SQL Editor:
```sql
SELECT
  u.email,
  u.raw_user_meta_data->>'name' as google_name,
  u.raw_user_meta_data->>'picture' as google_picture,
  p.full_name,
  p.avatar_url,
  p.created_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC
LIMIT 5;
```

You should see:
- ✅ Your email in the `email` column
- ✅ Your Google name in both `google_name` and `full_name`
- ✅ A Google image URL in both `google_picture` and `avatar_url`

### Check 2: Profile Table

1. Go to **Table Editor** in Supabase
2. Select **profiles** table
3. Look for your user
4. Check that `avatar_url` has a Google URL like:
   ```
   https://lh3.googleusercontent.com/a/...
   ```

---

## Step 3: Test in Application

1. **Hard refresh** your browser (Ctrl+Shift+R)
2. **Look at the header** (top-right corner)
3. **Your Google profile picture should now appear!** 🎉

If not showing:
- Log out and log back in
- Clear browser cache
- Check browser console for errors

---

## 📊 What Changed in the Fix

### Before (Broken):
```sql
-- Looking for wrong fields
NEW.raw_user_meta_data->>'full_name'  -- ❌ Doesn't exist in Google OAuth
NEW.raw_user_meta_data->>'avatar_url' -- ❌ Doesn't exist in Google OAuth
```

### After (Fixed):
```sql
-- Using correct Google OAuth fields with fallbacks
COALESCE(
  NEW.raw_user_meta_data->>'full_name',
  NEW.raw_user_meta_data->>'name',      -- ✅ Google uses 'name'
  split_part(NEW.email, '@', 1)         -- ✅ Fallback to email username
)

COALESCE(
  NEW.raw_user_meta_data->>'avatar_url',
  NEW.raw_user_meta_data->>'picture'    -- ✅ Google uses 'picture'
)
```

---

## 🔍 Debug: Find Users Without Profiles

If you want to see which users don't have profiles, run this:

```sql
SELECT u.id, u.email, u.created_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL;
```

This should return **zero rows** after running the fix!

---

## 📝 Technical Details

### Google OAuth Metadata Structure

When a user signs in with Google, Supabase receives this metadata:

```json
{
  "iss": "https://accounts.google.com",
  "sub": "1234567890",
  "email": "user@gmail.com",
  "email_verified": true,
  "name": "John Doe",              ← Use this for full_name
  "picture": "https://lh3...",     ← Use this for avatar_url
  "given_name": "John",
  "family_name": "Doe",
  "locale": "en"
}
```

**Key fields:**
- `name` → maps to `profiles.full_name`
- `picture` → maps to `profiles.avatar_url`

### The Fixed Trigger

The updated `handle_new_user()` function now:

1. **Tries multiple fields** with COALESCE for maximum compatibility
2. **Handles conflicts** gracefully (updates existing profiles)
3. **Uses email as fallback** if no name is provided
4. **Logs warnings** but doesn't block authentication

---

## ✅ Success Criteria

After running the fix:

- ✅ All auth.users have corresponding profiles
- ✅ Google OAuth users have `avatar_url` populated
- ✅ Google OAuth users have `full_name` populated
- ✅ No errors in browser console
- ✅ Profile pictures show in header and mobile nav

---

## 🎉 You're Done!

Once you run the fix migration:
1. All existing users will have profiles
2. Future Google sign-ups will work correctly
3. Profile pictures will display automatically

If you still have issues, check:
- Supabase logs (Dashboard → Logs → Postgres Logs)
- Browser console (F12 → Console tab)
- Network tab for failed API calls
