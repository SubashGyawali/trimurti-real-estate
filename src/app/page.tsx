import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/server";
import {
  HeroSection,
  ServicesSection,
  AboutPreview,
  LocationSection,
  CTASection,
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
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <Skeleton className="mx-auto mb-8 h-10 w-64" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="aspect-[4/3] w-full rounded-lg" />
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
          <Skeleton className="mx-auto mb-8 h-10 w-64" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 w-full rounded-lg" />
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
  title: "MHADA Properties in Kandivali West, Mumbai",
  description:
    "Find your dream home in Kandivali West with Trimurti Real Estate. 20+ years of trusted service. MHADA flats, private buildings, 1BHK, 2BHK, 3BHK for sale and rent.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Trimurti Real Estate | MHADA Properties in Kandivali West",
    description:
      "Find your dream home in Kandivali West. 20+ years of trusted real estate service in Mumbai.",
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
      <HeroSection />
      <FeaturedProperties properties={featuredProperties || []} />
      <ServicesSection />
      <AboutPreview />
      <LocationSection />
      <CTASection />
      <TestimonialsSection />
    </>
  );
}
