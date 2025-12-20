// Map configuration for Trimurti Real Estate
// Centered on Kandivali West, Mumbai

export const MAP_CONFIG = {
  // Default center: Kandivali West, Mumbai
  center: { lat: 19.2094, lng: 72.8544 } as const,
  defaultZoom: 15,
  minZoom: 12,
  maxZoom: 18,
  // OpenStreetMap tile URL
  tileUrl: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
} as const;

// MHADA Complex approximate boundary (for optional area visualization)
export const MHADA_BOUNDS = {
  north: 19.215,
  south: 19.200,
  east: 72.862,
  west: 72.848,
} as const;

// Marker colors
export const MARKER_COLORS = {
  rent: "#3b82f6", // Blue
  sale: "#22c55e", // Green
  featured: "#d4a853", // Gold (for border)
  default: "#ffffff", // White (default border)
} as const;

// Cluster configuration
export const CLUSTER_CONFIG = {
  chunkedLoading: true,
  showCoverageOnHover: false,
  zoomToBoundsOnClick: true,
  spiderfyOnMaxZoom: true,
  maxClusterRadius: 50,
} as const;

export type MapCenter = typeof MAP_CONFIG.center;
