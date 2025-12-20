"use client";

import { PropertyMapContainer } from "@/components/maps/map-container";
import type { PropertyWithImages } from "@/types";
import { cn } from "@/lib/utils";

interface PropertiesMapViewProps {
  properties: PropertyWithImages[];
  selectedPropertyId?: string | null;
  onPropertySelect?: (property: PropertyWithImages) => void;
  className?: string;
}

export function PropertiesMapView({
  properties,
  selectedPropertyId,
  onPropertySelect,
  className,
}: PropertiesMapViewProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border bg-card",
        className
      )}
    >
      <PropertyMapContainer
        properties={properties}
        selectedPropertyId={selectedPropertyId || undefined}
        onPropertySelect={onPropertySelect}
        showClusters={properties.length > 10}
        className="h-full w-full"
      />
    </div>
  );
}
