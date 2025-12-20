"use client";

import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PROPERTY_TYPE_OPTIONS, FURNISHING_OPTIONS, LISTING_TYPE_OPTIONS } from "@/types/forms";
import { formatPrice } from "../price-display";
import type { PropertySearchFilters, Building } from "@/types";
import { cn } from "@/lib/utils";

interface ActiveFilterBadgesProps {
  filters: PropertySearchFilters;
  buildings?: Building[];
  onClearFilter: (key: keyof PropertySearchFilters) => void;
  onClearAll: () => void;
  className?: string;
}

export function ActiveFilterBadges({
  filters,
  buildings = [],
  onClearFilter,
  onClearAll,
  className,
}: ActiveFilterBadgesProps) {
  const badges: Array<{
    key: keyof PropertySearchFilters;
    label: string;
  }> = [];

  // Listing type
  if (filters.listing_type) {
    const option = LISTING_TYPE_OPTIONS.find((o) => o.value === filters.listing_type);
    badges.push({ key: "listing_type", label: option?.label || filters.listing_type });
  }

  // Property types
  if (filters.property_types?.length) {
    filters.property_types.forEach((type) => {
      const option = PROPERTY_TYPE_OPTIONS.find((o) => o.value === type);
      badges.push({ key: "property_types", label: option?.label || type });
    });
  }

  // Building
  if (filters.building_id) {
    const building = buildings.find((b) => b.id === filters.building_id);
    badges.push({ key: "building_id", label: building?.name || "Building" });
  }

  // Price range
  if (filters.min_price !== undefined || filters.max_price !== undefined) {
    const listingType = filters.listing_type || "rent";
    let priceLabel = "";
    if (filters.min_price && filters.max_price) {
      priceLabel = `${formatPrice(filters.min_price, listingType)} - ${formatPrice(filters.max_price, listingType)}`;
    } else if (filters.min_price) {
      priceLabel = `${formatPrice(filters.min_price, listingType)}+`;
    } else if (filters.max_price) {
      priceLabel = `Up to ${formatPrice(filters.max_price, listingType)}`;
    }
    badges.push({ key: "min_price", label: priceLabel });
  }

  // Area range
  if (filters.min_carpet_area !== undefined || filters.max_carpet_area !== undefined) {
    let areaLabel = "";
    if (filters.min_carpet_area && filters.max_carpet_area) {
      areaLabel = `${filters.min_carpet_area} - ${filters.max_carpet_area} sq ft`;
    } else if (filters.min_carpet_area) {
      areaLabel = `${filters.min_carpet_area}+ sq ft`;
    } else if (filters.max_carpet_area) {
      areaLabel = `Up to ${filters.max_carpet_area} sq ft`;
    }
    badges.push({ key: "min_carpet_area", label: areaLabel });
  }

  // Bedrooms
  if (filters.bedrooms?.length) {
    const bedsLabel = filters.bedrooms.map((b) => (b === 4 ? "4+" : b)).join(", ") + " BHK";
    badges.push({ key: "bedrooms", label: bedsLabel });
  }

  // Furnishing
  if (filters.furnishing?.length) {
    filters.furnishing.forEach((f) => {
      const option = FURNISHING_OPTIONS.find((o) => o.value === f);
      badges.push({ key: "furnishing", label: option?.label || f });
    });
  }

  // Parking
  if (filters.parking) {
    badges.push({ key: "parking", label: "Parking" });
  }

  // Search query
  if (filters.query) {
    badges.push({ key: "query", label: `"${filters.query}"` });
  }

  if (badges.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {badges.map((badge, index) => (
        <Badge
          key={`${badge.key}-${index}`}
          variant="secondary"
          className="gap-1 pr-1"
        >
          {badge.label}
          <button
            onClick={() => onClearFilter(badge.key)}
            className="ml-1 rounded-full p-0.5 hover:bg-muted"
            aria-label={`Remove ${badge.label} filter`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      {badges.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="h-6 px-2 text-xs text-muted-foreground"
        >
          Clear all
        </Button>
      )}
    </div>
  );
}
