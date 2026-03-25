<img width="2560" height="1600" alt="image" src="https://github.com/user-attachments/assets/ba8b3e00-cb23-4616-8c73-15994034daff" /># Trimurti Real Estate

A modern real estate web application for Trimurti Real Estate, specializing in MHADA complex properties in Kandivali West, Mumbai.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS + shadcn/ui (New York style, Slate theme)
- **Database & Auth:** Supabase
- **Forms:** React Hook Form + Zod validation
- **Maps:** Leaflet + OpenStreetMap
- **Email:** Resend
- **Package Manager:** pnpm

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (install with `npm install -g pnpm`)
- Supabase account

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Fill in your Supabase credentials
   - Add other required API keys

4. Run the development server:
   ```bash
   pnpm dev
   ```

5. Open [http://www.trimurtirealestate.com](https://www.trimurtirealestate.com)

## Project Structure

```
src/
├── app/
│   ├── (public)/       # Public pages (landing, properties, about, contact)
│   ├── (auth)/         # Auth pages (login, register, forgot-password)
│   ├── (user)/         # User dashboard (favorites, profile)
│   ├── admin/          # Admin dashboard (protected)
│   └── api/            # API routes
├── components/
│   ├── ui/             # shadcn/ui components
│   ├── layout/         # Header, Footer, Navigation
│   ├── property/       # Property-related components
│   ├── forms/          # Form components
│   └── maps/           # Map components
├── lib/
│   ├── supabase/       # Supabase client utilities
│   ├── validations/    # Zod schemas
│   ├── utils.ts        # Utility functions
│   └── env.ts          # Environment variable validation
├── types/              # TypeScript type definitions
└── hooks/              # Custom React hooks
```

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## Key Features (Planned)

- Property listings with advanced search/filtering
- Interactive map integration
- User authentication and favorites
- Admin dashboard for property management
- WhatsApp integration
- Email notifications
- Responsive mobile-first design

## Environment Variables

See `.env.example` for required environment variables.

## Contributing

This is a private project. For questions, contact the development team.

## License

Private & Confidential
