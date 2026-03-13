import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/server";
import {
  HeroSectionV2,
  TrustBadgesSection,
  FeaturesSection,
  BackgroundBanner,
  AgentProfileSection,
  LandingContactForm,
} from "./(public)/_components";
import { Skeleton } from "@/components/ui/skeleton";

// Dynamic imports for heavy components with carousels and animations
const FeaturedProperties = dynamic(
  () =>
    import("./(public)/_components/featured-properties").then(
      (mod) => mod.FeaturedProperties
    ),
  {
    loading: () => (
      <section className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <Skeleton className="mx-auto mb-2 h-4 w-32" />
          <Skeleton className="mx-auto mb-8 h-10 w-64" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="aspect-[4/3] w-full rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    ),
  }
);

const TestimonialsSection = dynamic(
  () =>
    import("./(public)/_components/testimonials-section").then(
      (mod) => mod.TestimonialsSection
    ),
  {
    loading: () => (
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <Skeleton className="mx-auto mb-2 h-4 w-32" />
          <Skeleton className="mx-auto mb-8 h-10 w-64" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    ),
  }
);

// Homepage - revalidate every 5 minutes for fresh featured properties
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Find Your Dream Home in Kandivali West | Trimurti Real Estate",
  description:
    "20+ years of trusted real estate service. MHADA flats, apartments for sale and rent in Kandivali West, Mumbai. Expert guidance, hassle-free documentation.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Find Your Dream Home in Kandivali West | Trimurti Real Estate",
    description:
      "20+ years of trusted real estate service. MHADA flats, apartments for sale and rent in Kandivali West, Mumbai.",
    url: "/",
  },
};

export default async function HomePage() {
  const supabase = await createClient();

  // Fetch featured properties
  const { data: featuredProperties } = await supabase
    .from("properties")
    .select("*, property_images(*)")
    .eq("is_featured", true)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(6);

  return (
    <>
      {/* Hero with background image, search bar, and CTAs */}
      <HeroSectionV2 />

      {/* Trust badges with animated stats */}
      <TrustBadgesSection />

      {/* Featured property listings from database */}
      <FeaturedProperties properties={featuredProperties || []} />

      {/* Team member profiles */}
      <AgentProfileSection />

      {/* Feature tiles highlighting value propositions */}
      <FeaturesSection />

      {/* Full-width CTA banner with background image */}
      <BackgroundBanner />

      {/* Customer testimonials carousel */}
      <TestimonialsSection />

      {/* Contact form with validation */}
      <LandingContactForm />
    </>
  );
}
