// Map Components
export { PropertyMapContainer } from "./map-container";
export { MapSkeleton } from "./map-skeleton";
export { MapPopup } from "./map-popup";
// Note: property-marker exports (createPropertyMarkerIcon, createClusterIcon, defaultMarkerIcon)
// are internal-only, used by property-map.tsx which is dynamically imported with ssr: false.
// They cannot be exported here as they contain Leaflet code that requires window.

// Map Configuration
export {
  MAP_CONFIG,
  MHADA_BOUNDS,
  MARKER_COLORS,
  CLUSTER_CONFIG,
} from "@/lib/map-config";
export type { MapCenter } from "@/lib/map-config";
