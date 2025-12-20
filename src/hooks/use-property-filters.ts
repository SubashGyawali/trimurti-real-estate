"use client";

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { PropertySearchFilters } from "@/types";
import { PARAM_KEYS, parseFiltersFromParams, filtersToParams } from "@/lib/filters";

export interface UsePropertyFiltersReturn {
  filters: PropertySearchFilters;
  setFilter: <K extends keyof PropertySearchFilters>(
    key: K,
    value: PropertySearchFilters[K]
  ) => void;
  setFilters: (filters: Partial<PropertySearchFilters>) => void;
  clearFilters: () => void;
  clearFilter: (key: keyof PropertySearchFilters) => void;
  toggleArrayFilter: <K extends "property_types" | "bedrooms" | "furnishing">(
    key: K,
    value: NonNullable<PropertySearchFilters[K]>[number]
  ) => void;
  activeFilterCount: number;
  isFiltered: boolean;
  getFilterUrl: (newFilters?: Partial<PropertySearchFilters>) => string;
}

export function usePropertyFilters(): UsePropertyFiltersReturn {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Parse current filters from URL
  const filters = useMemo(
    () => parseFiltersFromParams(searchParams),
    [searchParams]
  );

  // Count active filters (excluding pagination and sorting)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.listing_type) count++;
    if (filters.property_types?.length) count += filters.property_types.length;
    if (filters.building_id) count++;
    if (filters.min_price !== undefined || filters.max_price !== undefined) count++;
    if (filters.min_carpet_area !== undefined || filters.max_carpet_area !== undefined) count++;
    if (filters.bedrooms?.length) count += filters.bedrooms.length;
    if (filters.furnishing?.length) count += filters.furnishing.length;
    if (filters.parking) count++;
    if (filters.query) count++;
    return count;
  }, [filters]);

  const isFiltered = activeFilterCount > 0;

  // Generate URL with filters
  const getFilterUrl = useCallback(
    (newFilters?: Partial<PropertySearchFilters>) => {
      const mergedFilters = { ...filters, ...newFilters };
      const params = filtersToParams(mergedFilters);
      const queryString = params.toString();
      return queryString ? `${pathname}?${queryString}` : pathname;
    },
    [filters, pathname]
  );

  // Update URL with new filters
  const updateUrl = useCallback(
    (newFilters: PropertySearchFilters) => {
      const params = filtersToParams(newFilters);
      const queryString = params.toString();
      const url = queryString ? `${pathname}?${queryString}` : pathname;
      router.push(url, { scroll: false });
    },
    [pathname, router]
  );

  // Set a single filter
  const setFilter = useCallback(
    <K extends keyof PropertySearchFilters>(
      key: K,
      value: PropertySearchFilters[K]
    ) => {
      const newFilters = { ...filters };

      if (value === undefined || value === null || value === "" ||
          (Array.isArray(value) && value.length === 0)) {
        delete newFilters[key];
      } else {
        newFilters[key] = value;
      }

      // Reset page when filters change (except for page itself)
      if (key !== "page") {
        delete newFilters.page;
      }

      updateUrl(newFilters);
    },
    [filters, updateUrl]
  );

  // Set multiple filters at once
  const setFilters = useCallback(
    (newFilters: Partial<PropertySearchFilters>) => {
      const mergedFilters = { ...filters };

      Object.entries(newFilters).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "" ||
            (Array.isArray(value) && value.length === 0)) {
          delete mergedFilters[key as keyof PropertySearchFilters];
        } else {
          (mergedFilters as Record<string, unknown>)[key] = value;
        }
      });

      // Reset page when filters change
      delete mergedFilters.page;

      updateUrl(mergedFilters);
    },
    [filters, updateUrl]
  );

  // Clear all filters
  const clearFilters = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [pathname, router]);

  // Clear a single filter
  const clearFilter = useCallback(
    (key: keyof PropertySearchFilters) => {
      const newFilters = { ...filters };
      delete newFilters[key];
      // Reset page when filters change
      delete newFilters.page;
      updateUrl(newFilters);
    },
    [filters, updateUrl]
  );

  // Toggle a value in an array filter
  const toggleArrayFilter = useCallback(
    <K extends "property_types" | "bedrooms" | "furnishing">(
      key: K,
      value: NonNullable<PropertySearchFilters[K]>[number]
    ) => {
      const currentArray = (filters[key] as unknown[]) || [];
      const newArray = currentArray.includes(value)
        ? currentArray.filter((v) => v !== value)
        : [...currentArray, value];

      setFilter(key, newArray.length > 0 ? (newArray as PropertySearchFilters[K]) : undefined);
    },
    [filters, setFilter]
  );

  return {
    filters,
    setFilter,
    setFilters,
    clearFilters,
    clearFilter,
    toggleArrayFilter,
    activeFilterCount,
    isFiltered,
    getFilterUrl,
  };
}

// Re-export utilities from lib/filters for convenience
export { PARAM_KEYS, parseFiltersFromParams, filtersToParams } from "@/lib/filters";
