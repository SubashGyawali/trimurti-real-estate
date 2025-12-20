"use client";

import { useState } from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { usePropertyFilters } from "@/hooks/use-property-filters";
import {
  ListingTypeToggle,
  PropertyTypeSelect,
  PriceRangeFilter,
  BuildingSelect,
  MoreFiltersPopover,
  ActiveFilterBadges,
} from "./filter-components";
import type { Building } from "@/types";
import { cn } from "@/lib/utils";

interface PropertyFiltersProps {
  buildings?: Building[];
  className?: string;
}

export function PropertyFilters({
  buildings = [],
  className,
}: PropertyFiltersProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const {
    filters,
    setFilter,
    clearFilters,
    clearFilter,
    activeFilterCount,
    isFiltered,
  } = usePropertyFilters();

  return (
    <div className={cn("w-full", className)}>
      {/* Desktop Filters */}
      <div className="hidden md:block">
        <div className="flex flex-wrap items-center gap-3">
          {/* Listing Type Toggle */}
          <ListingTypeToggle
            value={filters.listing_type}
            onChange={(value) => setFilter("listing_type", value)}
            className="w-[180px]"
          />

          {/* Property Type */}
          <PropertyTypeSelect
            value={filters.property_types}
            onChange={(value) => setFilter("property_types", value)}
            className="w-[160px]"
          />

          {/* Price Range */}
          <PriceRangeFilter
            minPrice={filters.min_price}
            maxPrice={filters.max_price}
            listingType={filters.listing_type}
            onMinChange={(value) => setFilter("min_price", value)}
            onMaxChange={(value) => setFilter("max_price", value)}
            className="w-[180px]"
          />

          {/* Building Select */}
          {buildings.length > 0 && (
            <BuildingSelect
              value={filters.building_id}
              onChange={(value) => setFilter("building_id", value)}
              buildings={buildings}
              className="w-[180px]"
            />
          )}

          {/* More Filters */}
          <MoreFiltersPopover
            furnishing={filters.furnishing}
            bedrooms={filters.bedrooms}
            minArea={filters.min_carpet_area}
            maxArea={filters.max_carpet_area}
            parking={filters.parking}
            onFurnishingChange={(value) => setFilter("furnishing", value)}
            onBedroomsChange={(value) => setFilter("bedrooms", value)}
            onMinAreaChange={(value) => setFilter("min_carpet_area", value)}
            onMaxAreaChange={(value) => setFilter("max_carpet_area", value)}
            onParkingChange={(value) => setFilter("parking", value)}
          />

          {/* Clear All */}
          {isFiltered && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground"
            >
              <X className="mr-1 h-4 w-4" />
              Clear all
            </Button>
          )}
        </div>

        {/* Active Filter Badges */}
        {isFiltered && (
          <ActiveFilterBadges
            filters={filters}
            buildings={buildings}
            onClearFilter={clearFilter}
            onClearAll={clearFilters}
            className="mt-3"
          />
        )}
      </div>

      {/* Mobile Filters */}
      <div className="md:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <span className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </span>
              {activeFilterCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh]">
            <SheetHeader>
              <SheetTitle className="flex items-center justify-between">
                <span>Filters</span>
                {isFiltered && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-muted-foreground"
                  >
                    Clear all
                  </Button>
                )}
              </SheetTitle>
            </SheetHeader>

            <div className="mt-6 space-y-6 overflow-y-auto pb-20">
              {/* Listing Type */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Listing Type
                </label>
                <ListingTypeToggle
                  value={filters.listing_type}
                  onChange={(value) => setFilter("listing_type", value)}
                  className="w-full"
                />
              </div>

              <Separator />

              {/* Property Type */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Property Type
                </label>
                <PropertyTypeSelect
                  value={filters.property_types}
                  onChange={(value) => setFilter("property_types", value)}
                  className="w-full"
                />
              </div>

              <Separator />

              {/* Price Range */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Price Range
                </label>
                <PriceRangeFilter
                  minPrice={filters.min_price}
                  maxPrice={filters.max_price}
                  listingType={filters.listing_type}
                  onMinChange={(value) => setFilter("min_price", value)}
                  onMaxChange={(value) => setFilter("max_price", value)}
                  className="w-full"
                />
              </div>

              <Separator />

              {/* Building */}
              {buildings.length > 0 && (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Building
                    </label>
                    <BuildingSelect
                      value={filters.building_id}
                      onChange={(value) => setFilter("building_id", value)}
                      buildings={buildings}
                      className="w-full"
                    />
                  </div>
                  <Separator />
                </>
              )}

              {/* More Filters inline for mobile */}
              <div>
                <label className="mb-2 block text-sm font-medium">
                  More Options
                </label>
                <MoreFiltersPopover
                  furnishing={filters.furnishing}
                  bedrooms={filters.bedrooms}
                  minArea={filters.min_carpet_area}
                  maxArea={filters.max_carpet_area}
                  parking={filters.parking}
                  onFurnishingChange={(value) => setFilter("furnishing", value)}
                  onBedroomsChange={(value) => setFilter("bedrooms", value)}
                  onMinAreaChange={(value) => setFilter("min_carpet_area", value)}
                  onMaxAreaChange={(value) => setFilter("max_carpet_area", value)}
                  onParkingChange={(value) => setFilter("parking", value)}
                  className="w-full"
                />
              </div>
            </div>

            <SheetFooter className="absolute bottom-0 left-0 right-0 border-t bg-background p-4">
              <Button
                className="w-full"
                onClick={() => setMobileOpen(false)}
              >
                Show Results
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {/* Active filters on mobile */}
        {isFiltered && (
          <ActiveFilterBadges
            filters={filters}
            buildings={buildings}
            onClearFilter={clearFilter}
            onClearAll={clearFilters}
            className="mt-3"
          />
        )}
      </div>
    </div>
  );
}
