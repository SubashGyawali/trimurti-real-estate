# Track Spec: Refine Trust Features & Lead Handling

## 1. Background
The core value proposition for Trimurti Real Estate is being a "Trustworthy Agency" and a "Helpful Guide." To manifest this, we need visual cues (Verified Badges) and efficient intake mechanisms (Requirement/Sell forms) that reflect professional excellence and regional authority in the Kandivali/Malad West market.

## 2. Goals
- **Verified Listings:** Establish a system where specific listings can be marked as "Verified" by the agency, signaling to users that the property is vetted, genuine, and available.
- **Requirement Form Optimization:** Refine the existing buyer intake flow to capture specific local needs (e.g., preferred society, budget range, urgency) to enable faster lead matching.
- **Sell Form Optimization:** Improve the property owner intake flow to capture higher-quality data, making it easier for the agency to evaluate and "verify" new listings.
- **Trust-Driven UI:** Infuse the forms and badges with "Indian Warmth" while maintaining a professional/corporate foundation.

## 3. Functional Requirements
### 3.1 Verified Listings System
- Add a `is_verified` boolean field to the properties table in Supabase.
- Create a reusable `VerifiedBadge` component using shadcn/ui.
- Display the badge prominently on property cards and details pages.
- Add a tool-tip or brief explanation of what "Verified" means to build trust.

### 3.2 Requirement Form Optimization
- Update the form to include hyper-local fields (e.g., specific society/locality selection in Kandivali/Malad).
- Add guidance text (80% Helpful/Guided voice) to help users fill out their requirements.
- Ensure the form is frictionless and mobile-first, with direct WhatsApp triggers upon submission.

### 3.3 Sell Form Optimization
- Improve the field layout to capture key property details efficiently.
- Add "Trust cues" (e.g., "Why sell with us?") to the form sidebar or header.
- Streamline the image upload process for owners.

## 4. Technical Requirements
- **Frontend:** React 19, Next.js 16, Tailwind CSS.
- **Components:** shadcn/ui (Badge, Form, Tooltip).
- **Data:** Supabase (PostgreSQL schema updates).
- **Validation:** Zod schemas for forms.
- **Communication:** Integration with existing WhatsApp/Email flows.

## 5. Success Criteria
- "Verified" badge is visible on designated listings.
- Requirement and Sell forms are easier to use on mobile (tested via Safari/Chrome dev tools).
- Test coverage for new components and form logic exceeds 80%.
- No regression in existing property listing functionality.
