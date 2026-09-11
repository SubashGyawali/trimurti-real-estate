import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/server";
import { siteConfig } from "@/lib/site-config";
import {
  HeroSection,
  FeaturesSection,
  BackgroundBanner,
  AgentProfileSection,
  LandingContactForm,
} from "./(public)/_components";
import { getHomeGalleryImages } from "@/lib/data/gallery";
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
  title:
    "Find Your Dream Home in Mumbai, Kandivali and Malad West | Trimurti Real Estate",
  description:
    "20+ years of trusted real estate service. Apartments & flats for sale and rent in Kandivali West and Malad West, Mumbai. Expert guidance, hassle-free documentation.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title:
      "Find Your Dream Home in Mumbai, Kandivali and Malad West | Trimurti Real Estate",
    description:
      "20+ years of trusted real estate service. Apartments & flats for sale and rent in Kandivali West and Malad West, Mumbai.",
    url: "/",
    type: "website",
    locale: "en_IN",
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.images.ogDefault,
        width: siteConfig.images.ogWidth,
        height: siteConfig.images.ogHeight,
        alt: siteConfig.images.ogDefaultAlt,
        type: "image/jpeg",
      },
    ],
  },
};

export default async function HomePage() {
  const supabase = await createClient();

  // Fetch featured properties and home gallery images in parallel
  const [featuredResult, galleryImages] = await Promise.all([
    supabase
      .from("properties")
      .select("*, property_images(*)")
      .eq("is_featured", true)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(6),
    getHomeGalleryImages(),
  ]);

  const featuredProperties = featuredResult.data;

  return (
    <>
      {/* Hero with background image, search bar, and CTAs */}
      <HeroSection images={galleryImages} />

      {/* Featured property listings from database */}
      <FeaturedProperties properties={featuredProperties || []} />

      {/* Team member profiles */}
      <AgentProfileSection />

      {/* Feature tiles highlighting value propositions */}
      <FeaturesSection />

      {/* Full-width CTA banner with background image */}
      <BackgroundBanner images={galleryImages} />

      {/* Customer testimonials carousel */}
      <TestimonialsSection />

      {/* Contact form with validation */}
      <LandingContactForm />
    </>
  );
}
