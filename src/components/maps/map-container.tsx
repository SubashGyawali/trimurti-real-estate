"use client";

import { APIProvider } from "@vis.gl/react-google-maps";
import { PropertyMap } from "./property-map";
import type { PropertyWithImages } from "@/types";

interface PropertyMapContainerProps {
  properties: PropertyWithImages[];
  className?: string;
  selectedPropertyId?: string;
  onPropertySelect?: (property: PropertyWithImages) => void;
  showClusters?: boolean;
  center?: { lat: number; lng: number };
  zoom?: number;
}

/**
 * PropertyMapContainer — wraps PropertyMap in Google Maps APIProvider.
 *
 * @example
 * ```tsx
 * <PropertyMapContainer
 *   properties={properties}
 *   className="h-[500px]"
 *   showClusters={true}
 * />
 * ```
 */
export function PropertyMapContainer({
  properties,
  className,
  selectedPropertyId,
  onPropertySelect,
  showClusters = true,
  center,
  zoom,
}: PropertyMapContainerProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

  return (
    <APIProvider apiKey={apiKey}>
      <PropertyMap
        properties={properties}
        className={className}
        selectedPropertyId={selectedPropertyId}
        onPropertySelect={onPropertySelect}
        showClusters={showClusters}
        center={center}
        zoom={zoom}
      />
    </APIProvider>
  );
}
