"use client";

import { useState, useCallback } from "react";
import { List, Map as MapIcon, Search } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PropertyFilters } from "./property-filters";
import { PropertyGrid } from "./property-grid";
import { PropertiesMapView } from "./properties-map-view";
import { SortDropdown } from "./sort-dropdown";
import { EmptyState } from "@/components/ui/empty-state";
import { usePropertyFilters } from "@/hooks/use-property-filters";
import { cn } from "@/lib/utils";
import type { PropertyWithImages, Building } from "@/types";

interface PropertiesPageContentProps {
  initialProperties: PropertyWithImages[];
  totalCount: number;
  buildings: Building[];
  currentPage: number;
  pageSize: number;
}

export function PropertiesPageContent({
  initialProperties,
  totalCount,
  buildings,
  currentPage,
  pageSize,
}: PropertiesPageContentProps) {
  // Bidirectional selection state
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
    null
  );
  const [hoveredPropertyId, setHoveredPropertyId] = useState<string | null>(
    null
  );

  // Mobile view toggle
  const [mobileView, setMobileView] = useState<"list" | "map">("list");

  const { clearFilters } = usePropertyFilters();

  const handlePropertySelect = useCallback((property: PropertyWithImages) => {
    setSelectedPropertyId(property.id);
  }, []);

  const handlePropertyHover = useCallback((propertyId: string | null) => {
    setHoveredPropertyId(propertyId);
  }, []);

  // Results text
  const getResultsText = () => {
    if (totalCount === 0) return "No properties found";
    if (totalCount === 1) return "1 property found";
    return `${totalCount} properties found`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Filter Bar */}
      <div className="mb-6 space-y-4">
        {/* Desktop filters */}
        <div className="hidden items-center justify-between gap-4 md:flex">
          <PropertyFilters buildings={buildings} className="flex-1" />
          <SortDropdown />
        </div>

        {/* Mobile: Filter button + Sort */}
        <div className="flex items-center justify-between gap-2 md:hidden">
          <PropertyFilters buildings={buildings} className="flex-1" />
          <SortDropdown className="w-auto min-w-[140px]" />
        </div>
      </div>

      {/* Results count + Mobile view toggle */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{getResultsText()}</p>

        {/* Mobile view toggle */}
        <div className="md:hidden">
          <Tabs
            value={mobileView}
            onValueChange={(v) => setMobileView(v as "list" | "map")}
          >
            <TabsList className="h-9">
              <TabsTrigger value="list" className="px-3" aria-label="List view">
                <List className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="map" className="px-3" aria-label="Map view">
                <MapIcon className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Empty State */}
      {totalCount === 0 ? (
        <EmptyState
          title="No properties found"
          description="We couldn't find any properties matching your current filters. Try adjusting your search criteria or clearing all filters."
          icon={Search}
          actionLabel="Clear all filters"
          onAction={clearFilters}
        />
      ) : (
        /* Two-column layout */
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Property Grid - Desktop always visible, Mobile: list view only */}
          <div className={cn("lg:col-span-2", mobileView === "map" && "hidden md:block")}>
            <PropertyGrid
              properties={initialProperties}
              totalCount={totalCount}
              currentPage={currentPage}
              pageSize={pageSize}
              selectedPropertyId={selectedPropertyId}
              hoveredPropertyId={hoveredPropertyId}
              onPropertyHover={handlePropertyHover}
              onPropertySelect={handlePropertySelect}
            />
          </div>

          {/* Map - Desktop: sticky sidebar, Mobile: full view when toggled */}
          <div
            className={cn(
              "lg:sticky lg:top-20 lg:h-[calc(100vh-120px)]",
              mobileView === "list" && "hidden md:block"
            )}
          >
            <PropertiesMapView
              properties={initialProperties}
              selectedPropertyId={selectedPropertyId || hoveredPropertyId}
              onPropertySelect={handlePropertySelect}
              className="h-[500px] md:h-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}
