import type { PropertyWithImages } from "@/types";

export type MarkerTier = "rich" | "pill" | "dot";

export interface PropertyGroup {
  key: string;
  lat: number;
  lng: number;
  properties: PropertyWithImages[];
}

// Pixel distance thresholds for marker tiers
// These ensure two markers of the same tier don't overlap
const TIER_THRESHOLDS = {
  rich: 150, // two rich mini-cards (~140px wide each) need 150px+ apart
  pill: 80, // two pills (~70px wide each) need 80px+ apart
} as const;

// Groups closer than this in pixels get merged to prevent dot overlap
const MERGE_PIXEL_THRESHOLD = 20;

/**
 * Web Mercator projection: convert lat/lng to pixel coordinates at a given zoom.
 */
function latLngToPixel(
  lat: number,
  lng: number,
  zoom: number
): { x: number; y: number } {
  const scale = 256 * Math.pow(2, zoom);
  const x = ((lng + 180) / 360) * scale;
  const latRad = (lat * Math.PI) / 180;
  const y =
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) *
    scale;
  return { x, y };
}

/**
 * Pixel distance between two lat/lng points at a given zoom level.
 */
export function pixelDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
  zoom: number
): number {
  const p1 = latLngToPixel(lat1, lng1, zoom);
  const p2 = latLngToPixel(lat2, lng2, zoom);
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}

/**
 * Merges PropertyGroups that are closer than minPixels apart.
 * Prevents overlap even at the smallest marker tier (dots).
 */
function mergeOverlappingGroups(
  groups: PropertyGroup[],
  zoom: number,
  minPixels: number
): PropertyGroup[] {
  if (minPixels <= 0 || groups.length <= 1) return groups;

  const used = new Set<number>();
  const merged: PropertyGroup[] = [];

  for (let i = 0; i < groups.length; i++) {
    if (used.has(i)) continue;
    used.add(i);

    let lat = groups[i].lat;
    let lng = groups[i].lng;
    const props = [...groups[i].properties];
    let count = 1;

    for (let j = i + 1; j < groups.length; j++) {
      if (used.has(j)) continue;
      const dist = pixelDistance(lat, lng, groups[j].lat, groups[j].lng, zoom);
      if (dist < minPixels) {
        used.add(j);
        lat = (lat * count + groups[j].lat) / (count + 1);
        lng = (lng * count + groups[j].lng) / (count + 1);
        count++;
        props.push(...groups[j].properties);
      }
    }

    sortProperties(props);

    merged.push({
      key: `${lat.toFixed(6)},${lng.toFixed(6)}`,
      lat,
      lng,
      properties: props,
    });
  }

  return merged;
}

/**
 * Assigns a visual tier to each group based on pixel distance to nearest neighbor.
 */
export function assignMarkerTiers(
  groups: PropertyGroup[],
  zoom: number
): Map<string, MarkerTier> {
  const tiers = new Map<string, MarkerTier>();

  if (groups.length <= 1) {
    groups.forEach((g) => tiers.set(g.key, "rich"));
    return tiers;
  }

  for (const group of groups) {
    let minDist = Infinity;
    for (const other of groups) {
      if (other.key === group.key) continue;
      const dist = pixelDistance(
        group.lat,
        group.lng,
        other.lat,
        other.lng,
        zoom
      );
      if (dist < minDist) minDist = dist;
    }

    if (minDist > TIER_THRESHOLDS.rich) tiers.set(group.key, "rich");
    else if (minDist > TIER_THRESHOLDS.pill) tiers.set(group.key, "pill");
    else tiers.set(group.key, "dot");
  }

  return tiers;
}

/**
 * Full pipeline: group by location → merge overlapping → assign tiers.
 */
export function prepareMapMarkers(
  properties: PropertyWithImages[],
  zoom: number
): { groups: PropertyGroup[]; tiers: Map<string, MarkerTier> } {
  const groups = groupPropertiesByLocation(properties);
  const merged = mergeOverlappingGroups(groups, zoom, MERGE_PIXEL_THRESHOLD);
  const tiers = assignMarkerTiers(merged, zoom);
  return { groups: merged, tiers };
}

/**
 * Sort properties: featured first, rent before sale, then ascending price.
 */
function sortProperties(props: PropertyWithImages[]) {
  props.sort((a, b) => {
    if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;
    if (a.listing_type !== b.listing_type)
      return a.listing_type === "rent" ? -1 : 1;
    return a.price - b.price;
  });
}

/**
 * Groups properties by their geographic location.
 * Properties within the same precision threshold are grouped together.
 */
export function groupPropertiesByLocation(
  properties: PropertyWithImages[],
  precision: number = 6
): PropertyGroup[] {
  const groups = new Map<string, PropertyGroup>();

  properties.forEach((property) => {
    if (property.location_lat === null || property.location_lng === null) {
      return;
    }

    const lat = Number(property.location_lat.toFixed(precision));
    const lng = Number(property.location_lng.toFixed(precision));
    const key = `${lat},${lng}`;

    if (!groups.has(key)) {
      groups.set(key, { key, lat, lng, properties: [] });
    }

    groups.get(key)!.properties.push(property);
  });

  groups.forEach((group) => sortProperties(group.properties));

  return Array.from(groups.values());
}

/**
 * Finds the group and index for a specific property ID.
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
