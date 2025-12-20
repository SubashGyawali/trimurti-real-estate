import type { PropertySearchFilters, PropertyType, FurnishingType } from "@/types";

// URL parameter keys (shortened for cleaner URLs)
export const PARAM_KEYS = {
  listing_type: "listing",
  property_types: "types",
  building_id: "building",
  min_price: "min_price",
  max_price: "max_price",
  min_carpet_area: "min_area",
  max_carpet_area: "max_area",
  bedrooms: "beds",
  furnishing: "furnishing",
  parking: "parking",
  sort_by: "sort",
  page: "page",
  limit: "limit",
  query: "q",
} as const;

/**
 * Parse URL search params into PropertySearchFilters
 */
export function parseFiltersFromParams(searchParams: URLSearchParams): PropertySearchFilters {
  const filters: PropertySearchFilters = {};

  // Listing type
  const listing = searchParams.get(PARAM_KEYS.listing_type);
  if (listing === "sale" || listing === "rent") {
    filters.listing_type = listing;
  }

  // Property types (comma-separated)
  const types = searchParams.get(PARAM_KEYS.property_types);
  if (types) {
    filters.property_types = types.split(",") as PropertyType[];
  }

  // Building ID
  const building = searchParams.get(PARAM_KEYS.building_id);
  if (building) {
    filters.building_id = building;
  }

  // Price range
  const minPrice = searchParams.get(PARAM_KEYS.min_price);
  if (minPrice) {
    filters.min_price = parseInt(minPrice, 10);
  }
  const maxPrice = searchParams.get(PARAM_KEYS.max_price);
  if (maxPrice) {
    filters.max_price = parseInt(maxPrice, 10);
  }

  // Area range
  const minArea = searchParams.get(PARAM_KEYS.min_carpet_area);
  if (minArea) {
    filters.min_carpet_area = parseInt(minArea, 10);
  }
  const maxArea = searchParams.get(PARAM_KEYS.max_carpet_area);
  if (maxArea) {
    filters.max_carpet_area = parseInt(maxArea, 10);
  }

  // Bedrooms (comma-separated)
  const beds = searchParams.get(PARAM_KEYS.bedrooms);
  if (beds) {
    filters.bedrooms = beds.split(",").map((b) => parseInt(b, 10));
  }

  // Furnishing (comma-separated)
  const furnishing = searchParams.get(PARAM_KEYS.furnishing);
  if (furnishing) {
    filters.furnishing = furnishing.split(",") as FurnishingType[];
  }

  // Parking
  const parking = searchParams.get(PARAM_KEYS.parking);
  if (parking === "true") {
    filters.parking = true;
  }

  // Sort
  const sort = searchParams.get(PARAM_KEYS.sort_by);
  if (sort) {
    filters.sort_by = sort as PropertySearchFilters["sort_by"];
  }

  // Pagination
  const page = searchParams.get(PARAM_KEYS.page);
  if (page) {
    filters.page = parseInt(page, 10);
  }
  const limit = searchParams.get(PARAM_KEYS.limit);
  if (limit) {
    filters.limit = parseInt(limit, 10);
  }

  // Search query
  const query = searchParams.get(PARAM_KEYS.query);
  if (query) {
    filters.query = query;
  }

  return filters;
}

/**
 * Convert PropertySearchFilters to URL search params
 */
export function filtersToParams(filters: PropertySearchFilters): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.listing_type) {
    params.set(PARAM_KEYS.listing_type, filters.listing_type);
  }

  if (filters.property_types?.length) {
    params.set(PARAM_KEYS.property_types, filters.property_types.join(","));
  }

  if (filters.building_id) {
    params.set(PARAM_KEYS.building_id, filters.building_id);
  }

  if (filters.min_price !== undefined) {
    params.set(PARAM_KEYS.min_price, filters.min_price.toString());
  }

  if (filters.max_price !== undefined) {
    params.set(PARAM_KEYS.max_price, filters.max_price.toString());
  }

  if (filters.min_carpet_area !== undefined) {
    params.set(PARAM_KEYS.min_carpet_area, filters.min_carpet_area.toString());
  }

  if (filters.max_carpet_area !== undefined) {
    params.set(PARAM_KEYS.max_carpet_area, filters.max_carpet_area.toString());
  }

  if (filters.bedrooms?.length) {
    params.set(PARAM_KEYS.bedrooms, filters.bedrooms.join(","));
  }

  if (filters.furnishing?.length) {
    params.set(PARAM_KEYS.furnishing, filters.furnishing.join(","));
  }

  if (filters.parking) {
    params.set(PARAM_KEYS.parking, "true");
  }

  if (filters.sort_by) {
    params.set(PARAM_KEYS.sort_by, filters.sort_by);
  }

  if (filters.page && filters.page > 1) {
    params.set(PARAM_KEYS.page, filters.page.toString());
  }

  if (filters.limit) {
    params.set(PARAM_KEYS.limit, filters.limit.toString());
  }

  if (filters.query) {
    params.set(PARAM_KEYS.query, filters.query);
  }

  return params;
}
