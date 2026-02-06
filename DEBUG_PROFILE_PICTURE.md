# 🔍 Debug: Profile Picture Not Showing

## Checklist - Let's Find the Issue

### ✅ Step 1: Verify Database Has Avatar URL

Run this in Supabase SQL Editor:

```sql
-- Check your profile data
SELECT
  p.id,
  p.full_name,
  p.avatar_url,
  u.email,
  u.raw_user_meta_data->>'picture' as google_picture,
  u.raw_user_meta_data->>'name' as google_name
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'YOUR_GOOGLE_EMAIL@gmail.com';  -- Replace with your actual email
```

**Expected Result:**
- ✅ `avatar_url` column should have a URL like: `https://lh3.googleusercontent.com/a/...`
- ✅ `full_name` should have your name
- ✅ `google_picture` should match `avatar_url`

**If `avatar_url` is NULL:**
→ The trigger didn't work. Run the fix migration again.

**If `avatar_url` has a URL:**
→ Good! Database is correct. Issue is in the frontend.

---

### ✅ Step 2: Check Browser Console

1. **Open your app** in browser: http://localhost:3000
2. **Open DevTools** (Press F12)
3. **Go to Console tab**
4. **Look for errors**

**Common Errors to Look For:**

**Error 1: "Error fetching profile"**
```
Error fetching profile: {}
```
→ Profile fetch is failing. Check if you're logged in.

**Error 2: Image CORS/404 errors**
```
Failed to load resource: net::ERR_FAILED
```
→ Google image URL might be blocked or invalid.

**Error 3: TypeScript errors**
```
Property 'avatar_url' does not exist on type 'Profile'
```
→ Need to restart dev server to pick up TypeScript changes.

---

### ✅ Step 3: Verify User Session

Open Console and run:

```javascript
// Check auth context
console.log('User:', window.__AUTH_USER__);
console.log('Profile:', window.__AUTH_PROFILE__);
```

Or check React DevTools:
1. Install React DevTools extension
2. Open Components tab
3. Find `AuthProvider` component
4. Check `user` and `profile` in hooks

**What to Look For:**
- `user.user_metadata.picture` should have Google image URL
- `profile.avatar_url` should have Google image URL

**If both are NULL:**
→ Log out and log back in to refresh the session

---

### ✅ Step 4: Restart Development Server

Sometimes TypeScript changes aren't picked up by hot reload:

```bash
# Stop the dev server (Ctrl+C in terminal)
# Then restart:
npm run dev
```

**Why?**
- We added `avatar_url` to the TypeScript `Profile` type
- Changes to types require a full restart
- Hot reload doesn't always pick up type changes

---

### ✅ Step 5: Hard Refresh Browser

Clear browser cache and reload:

**Windows/Linux:**
- Press: `Ctrl + Shift + R`
- Or: `Ctrl + F5`

**Mac:**
- Press: `Cmd + Shift + R`

**Why?**
- Browser might have cached the old component without avatar
- Service workers might be serving stale code

---

### ✅ Step 6: Verify Avatar Component is Using Correct Props

Check the header component is receiving the `user` object:

In DevTools Console, run:

```javascript
// This will show if the avatar image is in the DOM
document.querySelector('[alt="User avatar"]');

// This will show the image source
document.querySelector('[alt="User avatar"]')?.getAttribute('src');
```

**Expected Result:**
- Should return an `<img>` element
- `src` should be a Google image URL

**If returns `null`:**
→ The component isn't rendering the AvatarImage

---

### ✅ Step 7: Check Network Tab

1. Open DevTools → **Network tab**
2. Filter by **Img**
3. Reload the page
4. Look for Google image requests

**What to Look For:**

**Success (200):**
```
https://lh3.googleusercontent.com/a/...
Status: 200 OK
Type: image/jpeg
```
→ Image is loading! Issue might be CSS.

**Failed (404/403):**
```
Status: 404 Not Found
```
→ Image URL is invalid or expired.

**Not Listed:**
```
No Google image requests
```
→ Component isn't trying to load the image. Check props.

---

### ✅ Step 8: Check Avatar Fallback

The avatar component should show either:
1. **Google picture** (if available)
2. **Initials** (fallback)

Run this in Console:

```javascript
// Check if avatar fallback is showing
document.querySelector('[class*="AvatarFallback"]')?.textContent;
```

**If showing initials:**
→ The AvatarImage isn't rendering or failed to load

**If showing nothing:**
→ Component might not be rendering at all

---

## 🔧 Quick Fixes

### Fix 1: Force Profile Refresh

Log out and back in:
1. Click profile dropdown → Sign Out
2. Sign back in with Google
3. Check header again

### Fix 2: Manual Database Update

If the avatar_url is NULL in database, update it manually:

```sql
-- Replace YOUR_EMAIL with your actual Google email
UPDATE profiles p
SET avatar_url = u.raw_user_meta_data->>'picture'
FROM auth.users u
WHERE p.id = u.id
  AND u.email = 'YOUR_EMAIL@gmail.com';
```

Then hard refresh browser.

### Fix 3: Check RLS Policies

Verify you can read your own profile:

```sql
-- Run this while logged in
SELECT * FROM profiles WHERE id = auth.uid();
```

**If returns empty:**
→ RLS policies might be blocking you

---

## 🐛 Common Issues & Solutions

### Issue 1: "Still showing initials after fix"

**Cause:** Browser cache or stale session

**Solution:**
1. Log out
2. Clear browser cache (Ctrl+Shift+Delete)
3. Close all browser tabs
4. Restart browser
5. Log back in

### Issue 2: "Image flashes then disappears"

**Cause:** Image URL is invalid or CORS blocked

**Solution:**
1. Check Network tab for failed image request
2. Try the Google image URL directly in a new tab
3. If 404, the URL expired - sign out and back in

### Issue 3: "Console shows avatar_url is undefined"

**Cause:** TypeScript changes not picked up

**Solution:**
1. Stop dev server (Ctrl+C)
2. Delete `.next` folder
3. Restart: `npm run dev`
4. Hard refresh browser

### Issue 4: "Different image showing"

**Cause:** Cached old Google avatar

**Solution:**
This is normal! Google images are cached. To refresh:
1. Sign out and back in
2. Or manually update in database with new URL

---

## 📋 Debug Checklist

Go through these in order:

- [ ] Database has `avatar_url` column
- [ ] Profile row exists for your user
- [ ] `avatar_url` has a Google image URL
- [ ] No console errors
- [ ] Dev server restarted after TypeScript changes
- [ ] Browser hard refreshed (Ctrl+Shift+R)
- [ ] Logged out and back in
- [ ] Network tab shows image request (200 OK)
- [ ] Avatar component in DOM with correct src

---

## 🎯 Expected Final State

When working correctly:

**In Database:**
```sql
profiles.avatar_url = 'https://lh3.googleusercontent.com/a/...'
profiles.full_name = 'Your Name'
```

**In Browser DevTools:**
```javascript
user.user_metadata.picture = 'https://lh3.googleusercontent.com/a/...'
profile.avatar_url = 'https://lh3.googleusercontent.com/a/...'
```

**In DOM:**
```html
<img
  src="https://lh3.googleusercontent.com/a/..."
  alt="Your Name"
  class="object-cover"
/>
```

**Visible Result:**
- Your Google profile picture in the top-right header
- Same picture in mobile navigation sidebar
- Initials shown if image fails to load

---

## 💡 Still Not Working?

If you've tried everything above:

1. **Share these details:**
   - What the SQL query returns (avatar_url value)
   - Any console errors
   - Network tab results for image requests
   - Screenshot of the header

2. **Check these files are updated:**
   - `src/types/database.ts` has `avatar_url` field
   - `src/components/layout/header.tsx` imports AvatarImage
   - `src/components/layout/header.tsx` uses `user` from context

3. **Try email/password login:**
   - Create a test user with email/password
   - Should show initials (proves fallback works)
   - Then we know issue is specific to Google OAuth

---

## 🚀 Next Steps

Once you identify the issue, let me know:
- [ ] Database issue (NULL avatar_url)
- [ ] Frontend issue (console errors)
- [ ] Network issue (image not loading)
- [ ] Session issue (stale data)

I can help fix any of these!
