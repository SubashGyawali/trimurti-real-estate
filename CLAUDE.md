# Trimurti Real Estate - Project Context

## Business Context
Trimurti Real Estate is a 20+ year old real estate business in Kandivali West, Mumbai, run by Mr. Niraj Koirala. They specialize in MHADA complex properties (53 seven-storied buildings + 24-storied towers) focusing on resales and rentals. They also handle nearby private buildings like Bhoomi Park, Marina, Dotam.

## Brand Guidelines
- **Primary Color:** Deep Blue (#1e3a5f) - Trust, professionalism
- **Secondary Color:** Gold/Amber (#d4a853) - Premium, warmth
- **Accent:** Light Blue (#3b82f6) - Modern, approachable
- **Background:** Off-white (#fafafa) and subtle gradients
- **Typography:** Modern, clean fonts - use "Plus Jakarta Sans" for headings, "Inter" for body (but styled uniquely)

## Technical Stack
- Next.js 16 with App Router
- TypeScript (strict mode)
- shadcn/ui components with Tailwind CSS
- Supabase for database, auth, and storage
- Leaflet + OpenStreetMap for maps
- Resend for transactional emails

## Code Conventions
- Use TypeScript for all files
- Use server components by default, client components only when needed
- Use Supabase client from `@/lib/supabase/client` (browser) or `@/lib/supabase/server` (server)
- All database queries should use the Supabase client, not raw SQL
- Use Zod for form validation
- Use React Hook Form for forms
- Images must use Next.js Image component with proper optimization
- All API routes in `app/api/` directory

## File Structure
src/
├── app/
│   ├── (public)/           # Public pages (landing, properties, about, contact)
│   ├── (auth)/             # Auth pages (login, register, forgot-password)
│   ├── (user)/             # User dashboard (favorites, profile)
│   ├── admin/              # Admin dashboard (protected)
│   └── api/                # API routes
├── components/
│   ├── ui/                 # shadcn components
│   ├── layout/             # Header, Footer, Navigation
│   ├── property/           # Property-related components
│   ├── forms/              # Form components
│   └── maps/               # Map components
├── lib/
│   ├── supabase/           # Supabase clients
│   ├── utils.ts            # Utility functions
│   └── validations/        # Zod schemas
├── types/                  # TypeScript types
└── hooks/                  # Custom React hooks


## Database Schema Reference
Main tables: properties, property_images, buildings, inquiries, property_visits, user_favorites, profiles

## Design Philosophy
- Clean, uncluttered UI - show info on hover/click, not all at once
- Professional but warm feel - this is people's homes
- Mobile-first responsive design
- Fast loading - optimize images, use ISR where possible
- Accessibility compliant (WCAG 2.1 AA)

## Current Phase
**Phase 2: Database Schema Created**
- [x] Project foundation setup (Next.js 16, TypeScript, Tailwind, shadcn/ui)
- [x] Database schema designed and created (`supabase/schema.sql`)
- [x] TypeScript types for database (`src/types/database.ts`)
- [ ] Run schema in Supabase SQL Editor
- [ ] Set up storage buckets for images
- [ ] Create UI components
- [ ] Build pages

## Important Notes
- Max 50 active property listings
- Max 10 images per property
- Single admin user (no role-based access)
- WhatsApp is primary contact method
- Target audience: Middle-class families in Mumbai looking for affordable housing

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
