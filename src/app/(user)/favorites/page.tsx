import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { PropertyCard } from "@/components/property/property-card";
import { FavoritesEmptyState } from "@/components/user/favorites-empty-state";
import type { PropertyWithImages } from "@/types";

// Force dynamic rendering for user-specific content
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Saved Properties | Trimurti Real Estate",
  description: "View and manage your saved properties",
};

export default async function FavoritesPage() {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <FavoritesEmptyState />;
  }

  // Fetch user's favorites with property details
  const { data: favorites, error } = await supabase
    .from("user_favorites")
    .select(
      `
      id,
      property_id,
      created_at,
      properties (
        *,
        property_images (*)
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching favorites:", error);
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">
          Failed to load saved properties. Please try again later.
        </p>
      </div>
    );
  }

  // Extract properties from favorites - use type assertion for the joined data
  type FavoriteWithProperty = {
    id: string;
    property_id: string;
    created_at: string;
    properties: PropertyWithImages | null;
  };

  const properties = (favorites as unknown as FavoriteWithProperty[])
    ?.map((fav) => fav.properties)
    .filter((property): property is PropertyWithImages =>
      property !== null && property.is_active
    ) || [];

  // Get all favorite property IDs for the PropertyCard component
  const favoriteIds = properties.map((p) => p.id);

  if (properties.length === 0) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold md:text-3xl">Saved Properties</h1>
          <p className="mt-1 text-muted-foreground">
            Properties you&apos;ve saved for later
          </p>
        </div>
        <FavoritesEmptyState />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold md:text-3xl">Saved Properties</h1>
        <p className="mt-1 text-muted-foreground">
          {properties.length} {properties.length === 1 ? "property" : "properties"} saved
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {properties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            isFavorited={favoriteIds.includes(property.id)}
          />
        ))}
      </div>
    </div>
  );
}
