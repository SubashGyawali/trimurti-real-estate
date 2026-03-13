# Trimurti Real Estate - Codebase Cleanup Plan

Comprehensive review identified **6 phases** of cleanup work, ordered by impact and dependency.

---

## Phase 1: Critical Security Fixes
**Estimated scope: 3 files | High urgency**

### 1a. Remove hardcoded admin email and debug logs from `src/hooks/use-auth.ts`
- **Lines 115-120:** Remove `console.log("Auth Debug:", ...)` that leaks admin email, profile status, and env vars to browser console in production
- **Lines 119, 128:** Remove hardcoded `"saurau.gyawali.sg@gmail.com"` admin email check. The `isAdmin` logic should only use `profile?.is_admin` and the `NEXT_PUBLIC_ADMIN_EMAIL` env var (which `auth-provider.tsx` already does correctly)
- After fix, `use-auth.ts` admin logic should match `auth-provider.tsx` lines 125-131

### 1b. Restrict wildcard image domain in `next.config.ts`
- **Line 13:** Replace `hostname: "**"` (allows any domain) with an explicit whitelist:
  - `res.cloudinary.com` (image uploads)
  - `lh3.googleusercontent.com` (Google OAuth avatars)
  - `maps.googleapis.com` (map tiles if needed)
- This prevents potential XSS via malicious image URLs

### 1c. Audit remaining console statements (31 files)
- Remove all `console.log` debug statements from production code
- Keep `console.error` only in catch blocks where errors are genuinely unexpected
- Key offenders: `use-auth.ts`, `lib/email.ts`, `lib/cloudinary/upload.ts`, `auth-provider.tsx`, all admin API routes

---

## Phase 2: Eliminate Code Duplication
**Estimated scope: 15+ files | High impact on maintainability**

### 2a. Extract shared `verifyAdmin()` utility
- Currently copy-pasted identically across **11 API route files**:
  - `src/app/api/admin/properties/route.ts`
  - `src/app/api/admin/properties/[id]/route.ts`
  - `src/app/api/admin/buildings/route.ts`
  - `src/app/api/admin/buildings/[id]/route.ts`
  - `src/app/api/admin/inquiries/route.ts`
  - `src/app/api/admin/inquiries/[id]/route.ts`
  - `src/app/api/admin/visits/route.ts`
  - `src/app/api/admin/visits/[id]/route.ts`
  - `src/app/api/upload/route.ts`
  - `src/app/api/upload/[filename]/route.ts`
  - `src/app/api/upload/delete/route.ts`
- **Action:** Create `src/lib/supabase/admin.ts` with a single exported `verifyAdmin()` function, then update all 11 files to import it

### 2b. Create `src/lib/constants.ts` for business contact info
- Currently hardcoded across **11+ files**:
  - WhatsApp: `"919819446163"` in property-card.tsx, header.tsx, footer.tsx, mobile-nav.tsx, contact-card.tsx, whatsapp-button.tsx, cta-section.tsx, contact-content.tsx, property-header.tsx, requirements-form.tsx, landing-data.ts
  - Phone: `"+91 98194 46163"` in 8 files
  - Email: `"info@trimurtirealestate.com"` and `"contact@trimurtirealestate.com"` in 4 files
  - Address: Kandivali West address in 3+ files
- **Action:** Create constants file, export `BUSINESS_PHONE`, `BUSINESS_WHATSAPP`, `BUSINESS_EMAIL`, `BUSINESS_ADDRESS`, then update all files

### 2c. Consolidate duplicate auth logic
- `src/hooks/use-auth.ts` and `src/components/auth/auth-provider.tsx` have nearly identical `fetchProfile()`, `handleSignOut()`, and auth initialization code
- **Action:** Remove the standalone `use-auth.ts` hook. The `AuthProvider` + `useAuthContext()` pattern in `auth-provider.tsx` is the correct approach (Context-based, single source of truth). Update any files importing `useAuth` to use `useAuthContext` instead

---

## Phase 3: TypeScript Strictness
**Estimated scope: 25+ files | Medium impact**

### 3a. Replace `any` types with proper types (52+ instances)
Priority files (most `any` usage):
- `src/components/forms/requirements-form.tsx` (5 instances)
- `src/app/api/admin/properties/route.ts` (3 instances, lines 43, 71, 79)
- `src/app/api/admin/properties/[id]/route.ts` (3 instances)
- `src/components/admin/property-form.tsx` (2 instances, line 82: `initialData?: any`)
- `src/app/admin/properties/[id]/edit/client.tsx` (lines 42, 50)
- `src/app/(public)/contact/_components/contact-content.tsx` (3 instances)
- `src/app/api/inquiries/route.ts` (2 instances)

**Action:** Replace with proper Supabase-generated types from `src/types/database.ts`, or create specific interfaces where needed. The Supabase `.select()` calls should use generic type parameters.

### 3b. Remove type hacks
- `src/components/property/favorite-button.tsx` line 73: `as never` cast
- `src/app/(public)/properties/[slug]/page.tsx`: `as unknown as MetadataProperty` double-cast
- **Action:** Fix the underlying type mismatches instead of using casts

---

## Phase 4: Code Quality & Patterns
**Estimated scope: 12+ files | Medium impact**

### 4a. Replace `window.location.href` with Next.js router (10 instances)
- `src/components/property/property-card.tsx:68` - navigation
- `src/components/property/property-header.tsx:51` - navigation
- `src/components/property/contact-card.tsx:100, 515` - phone calls (use `<a href="tel:">` instead)
- `src/app/(public)/contact/_components/contact-content.tsx:107` - phone call
- `src/app/error.tsx:38` - redirect (use `router.push` or `redirect()`)
- **Action:** Use `useRouter().push()` for navigation, `<a href="tel:...">` for phone links, keep `window.location.href` only where reading the current URL is necessary (sharing features)

### 4b. Fix hardcoded "MHADA Complex" in property card
- `src/components/property/property-card.tsx:157-162` shows "MHADA Complex" for all properties with a `building_id`
- The comment says "Building name would come from join - showing placeholder"
- **Action:** Update the `PropertyWithImages` type and queries to include building name via a join, or remove the placeholder

### 4c. Clean up orphaned route files
- `src/app/properties/loading.tsx` - outside the `(public)` route group, likely unreachable
- `src/app/dashboard/loading.tsx` - no corresponding dashboard route exists
- **Action:** Remove these orphaned files or move them to correct route groups

### 4d. Fix Tailwind config
- `tailwind.config.ts:6` references `./src/pages/**/*.{js,ts,jsx,tsx,mdx}` - no `/pages` directory exists in this App Router project
- **Action:** Remove the unused content path

---

## Phase 5: Performance Optimizations
**Estimated scope: 5-8 files | Lower urgency**

### 5a. Optimize property list queries
- `src/app/api/admin/properties/route.ts:34-42` fetches ALL images for ALL properties
- Code comment at line 49 acknowledges this: "Optimize: Maybe filter images to only primary for list view?"
- **Action:** Filter query to only fetch primary images for list views, or add pagination. Full images only needed on detail page

### 5b. Add `reactStrictMode` to Next.js config
- `next.config.ts` is missing `reactStrictMode: true`
- Helps catch bugs during development (double-renders, effect cleanup issues)
- **Action:** Add `reactStrictMode: true` to the config

### 5c. Extract repeated utility functions
- `formatCurrency`, `getOrdinal`, `capitalizeFirst` are defined locally in multiple components
- **Action:** Move these to `src/lib/utils.ts` and import from there

---

## Phase 6: Minor Cleanups
**Estimated scope: Various files | Low urgency**

### 6a. Add `inputMode="numeric"` to phone number inputs
- `src/components/property/contact-card.tsx` phone inputs lack this attribute
- Improves mobile UX by showing number keyboard

### 6b. Add missing aria-labels
- Some interactive elements (icon buttons, map markers) lack accessibility labels
- Audit all `<button>` elements with only icon children

### 6c. Optimize public images
- `public/Building Images/` directory contains large unoptimized JPGs
- Consider compressing or converting to WebP

---

## Execution Order & Dependencies

```
Phase 1 (Security)     -- No dependencies, do first
    |
Phase 2 (Duplication)  -- 2c depends on understanding 1a changes
    |
Phase 3 (TypeScript)   -- 3a benefits from 2a (shared types in admin utility)
    |
Phase 4 (Quality)      -- 4b may benefit from 3a (proper types for building join)
    |
Phase 5 (Performance)  -- Independent, can be done anytime after Phase 2
    |
Phase 6 (Minor)        -- Independent, lowest priority
```

Each phase is designed to be completable in a single session. Phases 1-2 are the most impactful and should be done first.
