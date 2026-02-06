# 🚨 DATABASE MIGRATION REQUIRED

## Current Issue
You're seeing this error:
```
Error fetching profile: {}
```

This is because the `avatar_url` column doesn't exist in your database yet. **You need to run the migration SQL file to fix this.**

---

## 📋 Step-by-Step Instructions

### ✅ EASY METHOD: Supabase Dashboard (5 minutes)

#### Step 1: Open Supabase Dashboard
1. Go to: https://supabase.com/dashboard
2. Log in to your account
3. Click on your **"trimurti-real-estate"** project

#### Step 2: Open SQL Editor
1. Look at the left sidebar
2. Click on **"SQL Editor"** (icon looks like `</>`)
3. Click the **"New Query"** button at the top

#### Step 3: Copy the Migration SQL
1. Open this file on your computer:
   ```
   supabase/migrations/add_avatar_url.sql
   ```
2. Select ALL the text (Ctrl+A)
3. Copy it (Ctrl+C)

#### Step 4: Paste and Run
1. Go back to the Supabase SQL Editor tab
2. Paste the SQL (Ctrl+V)
3. Click the **"Run"** button (or press Ctrl+Enter)
4. Wait for the success message (green checkmark)

#### Step 5: Verify Success
You should see a message like:
```
Success. No rows returned.
```

If you see this, the migration was successful! ✅

---

## 🎯 What Happens After Running the Migration

1. **Error will disappear** - No more `Error fetching profile` messages
2. **Database updated** - `profiles` table now has `avatar_url` column
3. **Existing users backfilled** - If you signed up with Google, your avatar URL is now stored
4. **New users automatic** - Future Google signups will automatically get their avatar

---

## 🔄 Final Steps After Migration

1. **Hard refresh your browser**
   - Press: `Ctrl + Shift + R` (Windows/Linux)
   - Or: `Cmd + Shift + R` (Mac)

2. **Check the console**
   - Open browser DevTools (F12)
   - Look at Console tab
   - Errors should be gone ✅

3. **Log out and log back in** (if using Google OAuth)
   - This ensures you get the latest profile data
   - Your Google profile picture should now appear! 🎉

---

## 🔍 How to Verify It Worked

### Check 1: Database Column Exists
1. Go to Supabase Dashboard
2. Click "Table Editor" in sidebar
3. Select "profiles" table
4. You should see an `avatar_url` column

### Check 2: Google Users Have URLs
1. Still in "profiles" table
2. Look at rows where you signed up with Google
3. The `avatar_url` column should have a Google image URL
   - Example: `https://lh3.googleusercontent.com/a/...`

### Check 3: Application Works
1. Open your app: http://localhost:3000
2. Log in with Google OAuth
3. Look at the header (top-right corner)
4. You should see your Google profile picture! 🖼️

---

## ❓ Troubleshooting

### Problem: "Permission denied" error when running SQL
**Solution:** Make sure you're logged in as the project owner in Supabase Dashboard

### Problem: Still seeing errors after migration
**Solution:**
1. Hard refresh browser (Ctrl+Shift+R)
2. Log out and log back in
3. Check browser console for new errors

### Problem: Avatar still showing initials
**Possible causes:**
1. Migration not run yet → Run the migration
2. Browser cache → Hard refresh (Ctrl+Shift+R)
3. Not logged in with Google → Only Google OAuth users get avatars
4. Image URL invalid → Check the `avatar_url` value in database

### Problem: Don't see "SQL Editor" in Supabase Dashboard
**Solution:** You might not have the right permissions. Ask the project owner to run the migration.

---

## 📧 Need Help?

If you're still having issues:
1. Check the browser console for errors (F12 → Console tab)
2. Check Supabase logs (Dashboard → Logs)
3. Verify the migration SQL ran successfully (should see success message)

---

## ✨ That's It!

Once you run the migration, everything should work perfectly. Google OAuth users will see their profile pictures, and email/password users will continue to see their initials.
