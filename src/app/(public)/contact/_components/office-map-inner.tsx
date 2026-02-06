"use client";

import { Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import { OfficeMarkerPin } from "@/components/maps/property-marker";

interface OfficeMapInnerProps {
  location: {
    lat: number;
    lng: number;
  };
}

export function OfficeMapInner({ location }: OfficeMapInnerProps) {
  return (
    <Map
      defaultCenter={location}
      defaultZoom={16}
      gestureHandling="cooperative"
      disableDefaultUI={true}
      zoomControl={true}
      mapId="trimurti-office-map"
      style={{ height: "300px", width: "100%" }}
      className="z-0 rounded-2xl"
    >
      <AdvancedMarker position={location}>
        <OfficeMarkerPin />
      </AdvancedMarker>
    </Map>
  );
}
