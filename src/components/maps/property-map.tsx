"use client";

import { useMemo, useEffect, useCallback, useState } from "react";
import { Map, AdvancedMarker, useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { MAP_CONFIG } from "@/lib/map-config";
import {
  groupPropertiesByLocation,
  findPropertyInGroups,
  type PropertyGroup,
} from "@/lib/map-utils";
import { TransformableMarker } from "./transformable-marker";
import type { PropertyWithImages } from "@/types";
import { cn } from "@/lib/utils";

interface PropertyMapProps {
  properties: PropertyWithImages[];
  className?: string;
  selectedPropertyId?: string;
  onPropertySelect?: (property: PropertyWithImages) => void;
  showClusters?: boolean;
  center?: { lat: number; lng: number };
  zoom?: number;
}

/**
 * Fits the map bounds to show all given properties.
 */
function FitBounds({ properties }: { properties: PropertyWithImages[] }) {
  const map = useMap();
  const coreLibrary = useMapsLibrary("core");

  useEffect(() => {
    if (!map || !coreLibrary || properties.length === 0) return;

    const validProperties = properties.filter(
      (p) => p.location_lat !== null && p.location_lng !== null
    );

    if (validProperties.length === 0) return;

    if (validProperties.length === 1) {
      map.panTo({
        lat: validProperties[0].location_lat!,
        lng: validProperties[0].location_lng!,
      });
      map.setZoom(MAP_CONFIG.defaultZoom);
      return;
    }

    const bounds = new coreLibrary.LatLngBounds();
    validProperties.forEach((p) => {
      bounds.extend({ lat: p.location_lat!, lng: p.location_lng! });
    });
    map.fitBounds(bounds, { top: 50, bottom: 50, left: 50, right: 50 });
  }, [properties, map, coreLibrary]);

  return null;
}

export function PropertyMap({
  properties,
  className,
  selectedPropertyId,
  onPropertySelect,
  center,
  zoom,
}: PropertyMapProps) {
  // State for tracking active group and index within the group
  const [activeGroupKey, setActiveGroupKey] = useState<string | null>(null);
  const [activeIndexInGroup, setActiveIndexInGroup] = useState<number>(0);

  // Filter properties with valid coordinates and active status
  const mappableProperties = useMemo(
    () =>
      properties.filter(
        (p) =>
          p.location_lat !== null &&
          p.location_lng !== null &&
          p.is_active
      ),
    [properties]
  );

  // Group properties by location
  const propertyGroups = useMemo(
    () => groupPropertiesByLocation(mappableProperties),
    [mappableProperties]
  );

  // Sync external selection (e.g., when clicking from property list)
  useEffect(() => {
    if (!selectedPropertyId) {
      return;
    }

    const found = findPropertyInGroups(propertyGroups, selectedPropertyId);
    if (found) {
      setActiveGroupKey(found.groupKey);
      setActiveIndexInGroup(found.index);
    }
  }, [selectedPropertyId, propertyGroups]);

  // Handle marker click - opens the group
  const handleMarkerClick = useCallback(
    (group: PropertyGroup) => {
      setActiveGroupKey(group.key);
      setActiveIndexInGroup(0);
      // Notify parent of selection (first property in group)
      if (group.properties[0]) {
        onPropertySelect?.(group.properties[0]);
      }
    },
    [onPropertySelect]
  );

  // Handle navigation within a stacked group
  const handleNavigate = useCallback(
    (group: PropertyGroup, direction: "prev" | "next") => {
      // Calculate new index outside of setState to avoid calling onPropertySelect during render
      const currentIndex = activeIndexInGroup;
      const newIndex =
        direction === "next"
          ? Math.min(currentIndex + 1, group.properties.length - 1)
          : Math.max(currentIndex - 1, 0);

      // Update state
      setActiveIndexInGroup(newIndex);

      // Notify parent of the new selection (after state update)
      if (group.properties[newIndex]) {
        onPropertySelect?.(group.properties[newIndex]);
      }
    },
    [activeIndexInGroup, onPropertySelect]
  );

  // Handle close - deactivates the marker
  const handleClose = useCallback(() => {
    setActiveGroupKey(null);
    setActiveIndexInGroup(0);
  }, []);

  // Handle map click - closes any open marker
  const handleMapClick = useCallback(() => {
    setActiveGroupKey(null);
    setActiveIndexInGroup(0);
  }, []);

  const mapCenter = center || MAP_CONFIG.center;
  const mapZoom = zoom || MAP_CONFIG.defaultZoom;

  return (
    <div className={cn("h-full w-full", className)}>
      <Map
        defaultCenter={mapCenter}
        defaultZoom={mapZoom}
        minZoom={MAP_CONFIG.minZoom}
        maxZoom={MAP_CONFIG.maxZoom}
        gestureHandling="greedy"
        disableDefaultUI={true}
        zoomControl={true}
        mapId="trimurti-property-map"
        className="h-full w-full rounded-lg"
        style={{ minHeight: "400px" }}
        onClick={handleMapClick}
      >
        <FitBounds properties={mappableProperties} />

        {propertyGroups.map((group) => {
          const isActive = group.key === activeGroupKey;

          return (
            <AdvancedMarker
              key={group.key}
              position={{
                lat: group.lat,
                lng: group.lng,
              }}
              zIndex={isActive ? 100 : 1}
            >
              <TransformableMarker
                properties={group.properties}
                activeIndex={isActive ? activeIndexInGroup : 0}
                isActive={isActive}
                onClick={() => handleMarkerClick(group)}
                onClose={handleClose}
                onNavigate={(dir) => handleNavigate(group, dir)}
              />
            </AdvancedMarker>
          );
        })}
      </Map>
    </div>
  );
}
