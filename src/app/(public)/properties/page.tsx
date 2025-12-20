import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { parseFiltersFromParams } from "@/lib/filters";
import { PropertiesPageContent } from "@/components/property";
import type { PropertySearchFilters, PropertyWithImages, Building } from "@/types";
import type { SupabaseClient } from "@supabase/supabase-js";

export const metadata: Metadata = {
  title: "Properties for Sale & Rent | Trimurti Real Estate",
  description:
    "Browse apartments, flats, and shops for sale and rent in Kandivali West, Mumbai. Find your perfect home in MHADA Complex, Bhoomi Park, Marina Enclave, and more.",
  openGraph: {
    title: "Properties for Sale & Rent | Trimurti Real Estate",
    description:
      "Browse apartments, flats, and shops for sale and rent in Kandivali West, Mumbai.",
  },
};

const DEFAULT_PAGE_SIZE = 12;

// Sort mapping for Supabase queries
const SORT_MAP: Record<string, { column: string; ascending: boolean }> = {
  price_asc: { column: "price", ascending: true },
  price_desc: { column: "price", ascending: false },
  newest: { column: "created_at", ascending: false },
  oldest: { column: "created_at", ascending: true },
  area_asc: { column: "carpet_area", ascending: true },
  area_desc: { column: "carpet_area", ascending: false },
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PropertiesPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;

  // Convert searchParams to URLSearchParams for parsing
  const urlParams = new URLSearchParams();
  Object.entries(resolvedParams).forEach(([key, value]) => {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        value.forEach((v) => urlParams.append(key, v));
      } else {
        urlParams.set(key, value);
      }
    }
  });

  // Parse filters from URL
  const filters = parseFiltersFromParams(urlParams);
  const page = filters.page || 1;
  const limit = filters.limit || DEFAULT_PAGE_SIZE;

  const supabase = await createClient();

  // Parallel fetches for properties and buildings
  const [propertiesResult, buildingsResult] = await Promise.all([
    fetchProperties(supabase, filters, page, limit),
    supabase.from("buildings").select("*").order("name"),
  ]);

  return (
    <PropertiesPageContent
      initialProperties={(propertiesResult.data as PropertyWithImages[]) || []}
      totalCount={propertiesResult.count || 0}
      buildings={(buildingsResult.data as Building[]) || []}
      currentPage={page}
      pageSize={limit}
    />
  );
}

// Helper function to build and execute Supabase query with filters
async function fetchProperties(
  supabase: SupabaseClient,
  filters: PropertySearchFilters,
  page: number,
  limit: number
) {
  let query = supabase
    .from("properties")
    .select("*, property_images(*)", { count: "exact" })
    .eq("is_active", true);

  // Listing type filter
  if (filters.listing_type) {
    query = query.eq("listing_type", filters.listing_type);
  }

  // Property types filter (multiple)
  if (filters.property_types && filters.property_types.length > 0) {
    query = query.in("property_type", filters.property_types);
  }

  // Building filter
  if (filters.building_id) {
    query = query.eq("building_id", filters.building_id);
  }

  // Price range
  if (filters.min_price !== undefined) {
    query = query.gte("price", filters.min_price);
  }
  if (filters.max_price !== undefined) {
    query = query.lte("price", filters.max_price);
  }

  // Carpet area range
  if (filters.min_carpet_area !== undefined) {
    query = query.gte("carpet_area", filters.min_carpet_area);
  }
  if (filters.max_carpet_area !== undefined) {
    query = query.lte("carpet_area", filters.max_carpet_area);
  }

  // Bedrooms filter (multiple)
  if (filters.bedrooms && filters.bedrooms.length > 0) {
    query = query.in("bedrooms", filters.bedrooms);
  }

  // Furnishing filter (multiple)
  if (filters.furnishing && filters.furnishing.length > 0) {
    query = query.in("furnishing", filters.furnishing);
  }

  // Parking filter
  if (filters.parking === true) {
    query = query.eq("parking", true);
  }

  // Search query (title search)
  if (filters.query) {
    query = query.ilike("title", `%${filters.query}%`);
  }

  // Apply sorting
  const sortConfig = SORT_MAP[filters.sort_by || "newest"];
  query = query.order(sortConfig.column, { ascending: sortConfig.ascending });

  // Apply pagination using range
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  return query;
}
