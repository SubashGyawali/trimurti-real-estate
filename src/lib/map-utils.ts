import type { PropertyWithImages } from "@/types";

/**
 * Represents a group of properties at the same map location
 */
export interface PropertyGroup {
  /** Composite key "lat,lng" for identification */
  key: string;
  /** Latitude of the location */
  lat: number;
  /** Longitude of the location */
  lng: number;
  /** Properties at this location (sorted: featured first, then by listing type) */
  properties: PropertyWithImages[];
}

/**
 * Groups properties by their geographic location.
 * Properties within the same precision threshold are grouped together.
 *
 * @param properties - Array of properties to group
 * @param precision - Decimal precision for coordinate comparison (default 6 = ~0.1m accuracy)
 * @returns Array of PropertyGroups, each containing properties at the same location
 */
export function groupPropertiesByLocation(
  properties: PropertyWithImages[],
  precision: number = 6
): PropertyGroup[] {
  const groups = new Map<string, PropertyGroup>();

  properties.forEach((property) => {
    // Skip properties without valid coordinates
    if (property.location_lat === null || property.location_lng === null) {
      return;
    }

    // Round coordinates to specified precision
    const lat = Number(property.location_lat.toFixed(precision));
    const lng = Number(property.location_lng.toFixed(precision));
    const key = `${lat},${lng}`;

    if (!groups.has(key)) {
      groups.set(key, {
        key,
        lat,
        lng,
        properties: [],
      });
    }

    groups.get(key)!.properties.push(property);
  });

  // Sort properties within each group: featured first, then rent, then sale
  groups.forEach((group) => {
    group.properties.sort((a, b) => {
      // Featured properties first
      if (a.is_featured !== b.is_featured) {
        return a.is_featured ? -1 : 1;
      }
      // Then sort by listing type (rent before sale for consistency)
      if (a.listing_type !== b.listing_type) {
        return a.listing_type === "rent" ? -1 : 1;
      }
      // Finally by price (ascending)
      return a.price - b.price;
    });
  });

  return Array.from(groups.values());
}

/**
 * Finds the group and index for a specific property ID
 *
 * @param groups - Array of property groups
 * @param propertyId - ID of the property to find
 * @returns Object with groupKey and index, or null if not found
 */
export function findPropertyInGroups(
  groups: PropertyGroup[],
  propertyId: string
): { groupKey: string; index: number } | null {
  for (const group of groups) {
    const index = group.properties.findIndex((p) => p.id === propertyId);
    if (index !== -1) {
      return { groupKey: group.key, index };
    }
  }
  return null;
}
