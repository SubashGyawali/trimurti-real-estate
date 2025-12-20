"use client";

import dynamic from "next/dynamic";
import { MapSkeleton } from "./map-skeleton";
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

// Dynamic import to avoid SSR issues with Leaflet
const PropertyMap = dynamic(
  () => import("./property-map").then((mod) => mod.PropertyMap),
  {
    ssr: false,
    loading: () => <MapSkeleton className="h-full w-full" />,
  }
);

/**
 * PropertyMapContainer - A wrapper component that handles SSR for Leaflet
 *
 * Use this component instead of PropertyMap directly to avoid
 * hydration errors and ensure proper loading states.
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
  return (
    <PropertyMap
      properties={properties}
      className={className}
      selectedPropertyId={selectedPropertyId}
      onPropertySelect={onPropertySelect}
      showClusters={showClusters}
      center={center}
      zoom={zoom}
    />
  );
}
