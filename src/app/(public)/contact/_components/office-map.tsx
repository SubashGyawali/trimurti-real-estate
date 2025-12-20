"use client";

import dynamic from "next/dynamic";
import { MapPin } from "lucide-react";

// Office location in Kandivali West, Mumbai
const OFFICE_LOCATION = {
  lat: 19.2094,
  lng: 72.8544,
};

function MapSkeleton() {
  return (
    <div className="flex h-[300px] w-full items-center justify-center bg-muted">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <MapPin className="h-6 w-6 text-primary/40" />
        </div>
        <p className="mt-2 text-sm text-muted-foreground">Loading map...</p>
      </div>
    </div>
  );
}

// Dynamically import the map component to avoid SSR issues with Leaflet
const OfficeMapInner = dynamic(
  () =>
    import("./office-map-inner").then((mod) => mod.OfficeMapInner),
  {
    ssr: false,
    loading: () => <MapSkeleton />,
  }
);

export function OfficeMap() {
  return <OfficeMapInner location={OFFICE_LOCATION} />;
}
