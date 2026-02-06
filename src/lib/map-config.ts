// Map configuration for Trimurti Real Estate
// Centered on Kandivali West, Mumbai — Google Maps

export const MAP_CONFIG = {
  // Default center: Kandivali West, Mumbai
  center: { lat: 19.2094, lng: 72.8544 } as const,
  defaultZoom: 15,
  minZoom: 12,
  maxZoom: 18,
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
  // Background tints for visual differentiation
  rentBg: "#eff6ff", // Blue-50
  saleBg: "#f0fdf4", // Green-50
  // Border colors
  rentBorder: "#3b82f6", // Blue-500
  saleBorder: "#16a34a", // Green-600 (darker for contrast)
} as const;

export type MapCenter = typeof MAP_CONFIG.center;
