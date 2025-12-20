import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PropertyGallery } from "@/components/property/property-gallery";
import { PropertyDetailsGrid } from "@/components/property/property-details-grid";
import { PropertyHeader } from "@/components/property/property-header";
import { ContactCard, MobileContactBar } from "@/components/property/contact-card";
import { SimilarProperties } from "@/components/property/similar-properties";
import { formatPrice } from "@/components/property/price-display";
import { PropertyMapContainer } from "@/components/maps";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PropertyWithDetails, PropertyWithImages } from "@/types";

// ISR - revalidate every 60 seconds for fresh property data
export const revalidate = 60;

// Allow dynamic params - pages are generated on-demand and cached via ISR
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Type for metadata query
interface MetadataProperty {
  title: string;
  description: string | null;
  price: number;
  listing_type: "sale" | "rent";
  property_images: { image_url: string; is_primary: boolean }[];
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("properties")
    .select("title, description, price, listing_type, property_images(image_url, is_primary)")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!data) {
    return { title: "Property Not Found" };
  }

  const property = data as unknown as MetadataProperty;
  const primaryImage =
    property.property_images?.find((img) => img.is_primary)?.image_url ||
    property.property_images?.[0]?.image_url ||
    "/images/property-placeholder.jpg";

  const priceText = formatPrice(property.price, property.listing_type);

  return {
    title: property.title,
    description:
      property.description ||
      `${property.title} - ${priceText} in Kandivali West, Mumbai`,
    openGraph: {
      title: property.title,
      description:
        property.description ||
        `${priceText} - ${property.listing_type === "rent" ? "For Rent" : "For Sale"}`,
      images: [{ url: primaryImage, width: 1200, height: 630, alt: property.title }],
      type: "website",
      locale: "en_IN",
    },
    twitter: {
      card: "summary_large_image",
      title: property.title,
      description: property.description || priceText,
      images: [primaryImage],
    },
  };
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  // Fetch property with images and building info
  const { data: property, error } = await supabase
    .from("properties")
    .select(`
      *,
      property_images (*),
      building:buildings (*)
    `)
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !property) {
    notFound();
  }

  const typedProperty = property as unknown as PropertyWithDetails;

  // Increment views count (fire-and-forget)
  // Using type assertion to work around Supabase generic inference issue
  void (supabase
    .from("properties")
    .update({ views_count: (typedProperty.views_count || 0) + 1 } as never)
    .eq("id", typedProperty.id));

  // Fetch similar properties
  const { data: similarProperties } = await supabase
    .from("properties")
    .select("*, property_images (*)")
    .eq("is_active", true)
    .neq("id", typedProperty.id)
    .or(
      `building_id.eq.${typedProperty.building_id || "00000000-0000-0000-0000-000000000000"},property_type.eq.${typedProperty.property_type}`
    )
    .limit(4);

  // Generate JSON-LD structured data
  const jsonLd = generatePropertyJsonLd(typedProperty);

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="container mx-auto px-4 py-6 pb-24 lg:pb-6">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-1 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/properties" className="hover:text-foreground">
            Properties
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="line-clamp-1 text-foreground">
            {typedProperty.title}
          </span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Left Column - Main Content */}
          <div className="space-y-8">
            {/* Image Gallery */}
            <PropertyGallery
              images={typedProperty.property_images}
              propertyTitle={typedProperty.title}
            />

            {/* Property Header */}
            <PropertyHeader property={typedProperty} />

            {/* Key Details Grid */}
            <section>
              <h2 className="mb-4 text-xl font-semibold">Property Details</h2>
              <PropertyDetailsGrid property={typedProperty} />
            </section>

            {/* Description */}
            {typedProperty.description && (
              <DescriptionSection description={typedProperty.description} />
            )}

            {/* Amenities */}
            {typedProperty.amenities && typedProperty.amenities.length > 0 && (
              <AmenitiesSection amenities={typedProperty.amenities} />
            )}

            {/* Location Map */}
            {typedProperty.location_lat && typedProperty.location_lng && (
              <LocationSection
                property={typedProperty}
                buildingName={typedProperty.building?.name}
              />
            )}
          </div>

          {/* Right Column - Contact Card (Desktop) */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <ContactCard
                propertyId={typedProperty.id}
                propertyTitle={typedProperty.title}
                propertySlug={typedProperty.slug}
              />
            </div>
          </aside>
        </div>

        {/* Similar Properties */}
        {similarProperties && similarProperties.length > 0 && (
          <SimilarProperties
            properties={similarProperties as PropertyWithImages[]}
            currentPropertyId={typedProperty.id}
            className="mt-8 border-t pt-8"
          />
        )}

        {/* Mobile Contact Bar */}
        <MobileContactBar
          propertyTitle={typedProperty.title}
          className="lg:hidden"
        />
      </main>
    </>
  );
}

// Description Section
function DescriptionSection({ description }: { description: string }) {
  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold">Description</h2>
      <p className="whitespace-pre-line text-muted-foreground">{description}</p>
    </section>
  );
}

// Amenities Section
function AmenitiesSection({ amenities }: { amenities: string[] }) {
  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold">Amenities</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {amenities.map((amenity) => (
          <div
            key={amenity}
            className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2"
          >
            <Check className="h-4 w-4 text-green-600" />
            <span className="text-sm">{amenity}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

// Location Section
function LocationSection({
  property,
  buildingName,
}: {
  property: PropertyWithDetails;
  buildingName?: string | null;
}) {
  const propertyForMap: PropertyWithImages = {
    ...property,
    property_images: property.property_images || [],
  };

  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold">Location</h2>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            {buildingName || "Property Location"}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Kandivali West, Mumbai
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[300px] w-full overflow-hidden rounded-b-lg">
            <PropertyMapContainer
              properties={[propertyForMap]}
              center={{
                lat: property.location_lat!,
                lng: property.location_lng!,
              }}
              zoom={16}
              className="h-full w-full"
            />
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

// JSON-LD Generator
function generatePropertyJsonLd(property: PropertyWithDetails) {
  const primaryImage =
    property.property_images?.find((img) => img.is_primary)?.image_url ||
    property.property_images?.[0]?.image_url;

  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: property.description,
    url: `https://trimurtirealestate.com/properties/${property.slug}`,
    datePosted: property.created_at,
    price: property.price,
    priceCurrency: "INR",
    image: primaryImage,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Kandivali West",
      addressRegion: "Mumbai",
      postalCode: "400067",
      addressCountry: "IN",
    },
    geo:
      property.location_lat && property.location_lng
        ? {
            "@type": "GeoCoordinates",
            latitude: property.location_lat,
            longitude: property.location_lng,
          }
        : undefined,
    numberOfRooms: property.bedrooms,
    floorSize: property.carpet_area
      ? {
          "@type": "QuantitativeValue",
          value: property.carpet_area,
          unitCode: "FTK",
        }
      : undefined,
    broker: {
      "@type": "RealEstateAgent",
      name: "Trimurti Real Estate",
      telephone: "+91-98765-43210",
      url: "https://trimurtirealestate.com",
    },
  };
}
