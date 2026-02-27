"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  useMap,
  type MapMouseEvent,
} from "@vis.gl/react-google-maps";
import { MAP_CONFIG } from "@/lib/map-config";
import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";

export interface LatLng {
  lat: number;
  lng: number;
}

export interface LocationPickerProps {
  /** Current pin position. If null/undefined, pin starts at defaultCenter. */
  value?: LatLng | null;
  /** Called when user moves the pin (click or drag). */
  onChange: (position: LatLng) => void;
  /** Override the default map center (Kandivali West). */
  defaultCenter?: LatLng;
  /** Override the default zoom (15). */
  defaultZoom?: number;
  /** Map container height. Default: "320px" */
  height?: string;
  /** Additional CSS class for outer wrapper. */
  className?: string;
}

function LocationPickerInner({
  value,
  onChange,
  defaultCenter,
  defaultZoom,
  height = "320px",
}: Omit<LocationPickerProps, "className">) {
  const map = useMap();
  const center = defaultCenter ?? MAP_CONFIG.center;
  const zoom = defaultZoom ?? MAP_CONFIG.defaultZoom;

  const [markerPosition, setMarkerPosition] = useState<LatLng>(
    value && value.lat && value.lng ? value : center
  );
  const [hasPin, setHasPin] = useState(
    !!(value && value.lat && value.lng)
  );

  // Track whether the last update came from inside (drag/click) to avoid
  // re-panning on our own changes.
  const isInternalUpdate = useRef(false);

  // Sync when external value changes (e.g. building auto-fill)
  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    if (value && value.lat && value.lng) {
      setMarkerPosition({ lat: value.lat, lng: value.lng });
      setHasPin(true);
      map?.panTo({ lat: value.lat, lng: value.lng });
    }
  }, [value?.lat, value?.lng, map]);

  const handleMapClick = useCallback(
    (event: MapMouseEvent) => {
      const latLng = event.detail.latLng;
      if (latLng) {
        const position = { lat: latLng.lat, lng: latLng.lng };
        isInternalUpdate.current = true;
        setMarkerPosition(position);
        setHasPin(true);
        onChange(position);
      }
    },
    [onChange]
  );

  const handleDragEnd = useCallback(
    (e: { latLng: { lat: () => number; lng: () => number } | null }) => {
      const latLng = e.latLng;
      if (latLng) {
        const position = { lat: latLng.lat(), lng: latLng.lng() };
        isInternalUpdate.current = true;
        setMarkerPosition(position);
        onChange(position);
      }
    },
    [onChange]
  );

  return (
    <div>
      <div
        className="w-full overflow-hidden rounded-lg border"
        style={{ height }}
      >
        <Map
          defaultCenter={center}
          defaultZoom={zoom}
          gestureHandling="cooperative"
          disableDefaultUI={true}
          zoomControl={true}
          mapId="b75c140913050da255ae925f"
          className="h-full w-full"
          onClick={handleMapClick}
        >
          {hasPin && (
            <AdvancedMarker
              position={markerPosition}
              draggable={true}
              onDragEnd={handleDragEnd}
            >
              <Pin
                background="#1e3a5f"
                borderColor="#d4a853"
                glyphColor="#ffffff"
                scale={1.2}
              />
            </AdvancedMarker>
          )}
        </Map>
      </div>

      <div className="mt-2 flex items-center gap-2 text-[0.8rem] text-muted-foreground">
        <MapPin className="h-4 w-4 shrink-0" />
        {hasPin ? (
          <span>
            {markerPosition.lat.toFixed(6)}, {markerPosition.lng.toFixed(6)}
          </span>
        ) : (
          <span>No location set</span>
        )}
        <span className="text-muted-foreground/60">
          — Click map or drag pin to set location
        </span>
      </div>
    </div>
  );
}

export function LocationPicker({ className, ...props }: LocationPickerProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

  if (!apiKey) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-lg border bg-muted",
          className
        )}
        style={{ height: props.height ?? "320px" }}
      >
        <p className="text-sm text-muted-foreground">
          Google Maps API key not configured.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <APIProvider apiKey={apiKey}>
        <LocationPickerInner {...props} />
      </APIProvider>
    </div>
  );
}
