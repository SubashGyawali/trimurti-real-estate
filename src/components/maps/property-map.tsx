"use client";

import { useMemo, useEffect, useCallback, useState } from "react";
import {
  Map,
  AdvancedMarker,
  useMap,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import { MAP_CONFIG } from "@/lib/map-config";
import {
  prepareMapMarkers,
  findPropertyInGroups,
  type PropertyGroup,
  type MarkerTier,
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
  const [activeGroupKey, setActiveGroupKey] = useState<string | null>(null);
  const [activeIndexInGroup, setActiveIndexInGroup] = useState<number>(0);
  const [hoveredGroupKey, setHoveredGroupKey] = useState<string | null>(null);
  const [currentZoom, setCurrentZoom] = useState<number>(
    zoom || MAP_CONFIG.defaultZoom
  );

  const mappableProperties = useMemo(
    () =>
      properties.filter(
        (p) =>
          p.location_lat !== null && p.location_lng !== null && p.is_active
      ),
    [properties]
  );

  // Full pipeline: group → merge overlapping → assign tiers
  const { groups: propertyGroups, tiers: markerTiers } = useMemo(
    () => prepareMapMarkers(mappableProperties, currentZoom),
    [mappableProperties, currentZoom]
  );

  // Reset active group if it disappeared after zoom-triggered re-grouping
  useEffect(() => {
    if (
      activeGroupKey &&
      !propertyGroups.some((g) => g.key === activeGroupKey)
    ) {
      setActiveGroupKey(null);
      setActiveIndexInGroup(0);
    }
  }, [propertyGroups, activeGroupKey]);

  // Sync external selection
  useEffect(() => {
    if (!selectedPropertyId) return;
    const found = findPropertyInGroups(propertyGroups, selectedPropertyId);
    if (found) {
      setActiveGroupKey(found.groupKey);
      setActiveIndexInGroup(found.index);
    }
  }, [selectedPropertyId, propertyGroups]);

  const handleMarkerClick = useCallback(
    (group: PropertyGroup) => {
      setActiveGroupKey(group.key);
      setActiveIndexInGroup(0);
      if (group.properties[0]) onPropertySelect?.(group.properties[0]);
    },
    [onPropertySelect]
  );

  const handleNavigate = useCallback(
    (group: PropertyGroup, direction: "prev" | "next") => {
      const currentIndex = activeIndexInGroup;
      const newIndex =
        direction === "next"
          ? Math.min(currentIndex + 1, group.properties.length - 1)
          : Math.max(currentIndex - 1, 0);
      setActiveIndexInGroup(newIndex);
      if (group.properties[newIndex]) onPropertySelect?.(group.properties[newIndex]);
    },
    [activeIndexInGroup, onPropertySelect]
  );

  const handleClose = useCallback(() => {
    setActiveGroupKey(null);
    setActiveIndexInGroup(0);
  }, []);

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
        mapId="b75c140913050da255ae925f"
        className="h-full w-full rounded-lg"
        style={{ minHeight: "400px" }}
        onClick={handleMapClick}
        onCameraChanged={(ev) => {
          const z = Math.round(ev.detail.zoom);
          if (z !== currentZoom) setCurrentZoom(z);
        }}
      >
        <FitBounds properties={mappableProperties} />

        {propertyGroups.map((group) => {
          const isActive = group.key === activeGroupKey;
          const isHovered =
            group.key === hoveredGroupKey && !isActive;
          const tier: MarkerTier = markerTiers.get(group.key) || "dot";

          // z-index: dot=1, pill=2, rich=3, hovered=50, active=100
          let zIndex = tier === "rich" ? 3 : tier === "pill" ? 2 : 1;
          if (isHovered) zIndex = 50;
          if (isActive) zIndex = 100;

          return (
            <AdvancedMarker
              key={group.key}
              position={{ lat: group.lat, lng: group.lng }}
              zIndex={zIndex}
            >
              <TransformableMarker
                properties={group.properties}
                activeIndex={isActive ? activeIndexInGroup : 0}
                tier={tier}
                isActive={isActive}
                isHovered={isHovered}
                onClick={() => handleMarkerClick(group)}
                onClose={handleClose}
                onNavigate={(dir) => handleNavigate(group, dir)}
                onHoverStart={() => setHoveredGroupKey(group.key)}
                onHoverEnd={() => setHoveredGroupKey(null)}
              />
            </AdvancedMarker>
          );
        })}
      </Map>
    </div>
  );
}
