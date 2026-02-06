"use client";

import { APIProvider } from "@vis.gl/react-google-maps";
import { OfficeMapInner } from "./office-map-inner";

// Office location in Kandivali West, Mumbai
const OFFICE_LOCATION = {
  lat: 19.2094,
  lng: 72.8544,
};

export function OfficeMap() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

  return (
    <APIProvider apiKey={apiKey}>
      <OfficeMapInner location={OFFICE_LOCATION} />
    </APIProvider>
  );
}
