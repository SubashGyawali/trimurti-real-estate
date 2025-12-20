"use client";

import { useMemo, useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import type { MarkerCluster } from "leaflet";
import { MAP_CONFIG, CLUSTER_CONFIG } from "@/lib/map-config";
import { createPropertyMarkerIcon, createClusterIcon } from "./property-marker";
import { MapPopup } from "./map-popup";
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

// Component to handle map resize
function MapResizeHandler() {
  const map = useMap();

  useEffect(() => {
    const handleResize = () => {
      map.invalidateSize();
    };

    window.addEventListener("resize", handleResize);
    // Initial resize after mount
    setTimeout(handleResize, 100);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [map]);

  return null;
}

// Component to fit bounds to markers
function FitBounds({ properties }: { properties: PropertyWithImages[] }) {
  const map = useMap();

  useEffect(() => {
    if (properties.length === 0) return;

    const validProperties = properties.filter(
      (p) => p.location_lat !== null && p.location_lng !== null
    );

    if (validProperties.length === 0) return;

    const bounds = L.latLngBounds(
      validProperties.map((p) => [p.location_lat!, p.location_lng!])
    );

    // Only fit bounds if we have multiple properties
    if (validProperties.length > 1) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    } else if (validProperties.length === 1) {
      map.setView(
        [validProperties[0].location_lat!, validProperties[0].location_lng!],
        MAP_CONFIG.defaultZoom
      );
    }
  }, [properties, map]);

  return null;
}

export function PropertyMap({
  properties,
  className,
  selectedPropertyId,
  onPropertySelect,
  showClusters = true,
  center,
  zoom,
}: PropertyMapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const markerRefs = useRef<Map<string, L.Marker>>(new Map());

  // Filter properties with valid coordinates
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

  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Open popup for selected property
  useEffect(() => {
    if (selectedPropertyId && markerRefs.current.has(selectedPropertyId)) {
      const marker = markerRefs.current.get(selectedPropertyId);
      marker?.openPopup();
    }
  }, [selectedPropertyId]);

  if (!isMounted) {
    return null;
  }

  const mapCenter = center || MAP_CONFIG.center;
  const mapZoom = zoom || MAP_CONFIG.defaultZoom;

  const renderMarkers = () => {
    return mappableProperties.map((property) => (
      <Marker
        key={property.id}
        position={[property.location_lat!, property.location_lng!]}
        icon={createPropertyMarkerIcon(property.listing_type, property.is_featured)}
        ref={(ref) => {
          if (ref) {
            markerRefs.current.set(property.id, ref);
          }
        }}
        eventHandlers={{
          click: () => {
            onPropertySelect?.(property);
          },
        }}
      >
        <Popup>
          <MapPopup property={property} />
        </Popup>
      </Marker>
    ));
  };

  return (
    <div className={cn("h-full w-full", className)}>
      <MapContainer
        center={[mapCenter.lat, mapCenter.lng]}
        zoom={mapZoom}
        minZoom={MAP_CONFIG.minZoom}
        maxZoom={MAP_CONFIG.maxZoom}
        scrollWheelZoom={true}
        className="h-full w-full rounded-lg"
        style={{ minHeight: "400px" }}
      >
        <TileLayer
          attribution={MAP_CONFIG.attribution}
          url={MAP_CONFIG.tileUrl}
        />

        <MapResizeHandler />
        <FitBounds properties={mappableProperties} />

        {showClusters && mappableProperties.length > 1 ? (
          <MarkerClusterGroup
            chunkedLoading={CLUSTER_CONFIG.chunkedLoading}
            showCoverageOnHover={CLUSTER_CONFIG.showCoverageOnHover}
            zoomToBoundsOnClick={CLUSTER_CONFIG.zoomToBoundsOnClick}
            spiderfyOnMaxZoom={CLUSTER_CONFIG.spiderfyOnMaxZoom}
            maxClusterRadius={CLUSTER_CONFIG.maxClusterRadius}
            iconCreateFunction={(cluster: MarkerCluster) => createClusterIcon(cluster.getChildCount())}
          >
            {renderMarkers()}
          </MarkerClusterGroup>
        ) : (
          renderMarkers()
        )}
      </MapContainer>
    </div>
  );
}
