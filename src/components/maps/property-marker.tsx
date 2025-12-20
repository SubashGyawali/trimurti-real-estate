"use client";

import L from "leaflet";
import { MARKER_COLORS } from "@/lib/map-config";
import type { ListingType } from "@/types";

/**
 * Creates a custom Leaflet DivIcon for property markers
 *
 * @param listingType - "rent" or "sale" - determines marker color
 * @param isFeatured - if true, adds gold border
 * @returns Leaflet DivIcon
 */
export function createPropertyMarkerIcon(
  listingType: ListingType,
  isFeatured: boolean = false
): L.DivIcon {
  const bgColor = listingType === "rent" ? MARKER_COLORS.rent : MARKER_COLORS.sale;
  const borderColor = isFeatured ? MARKER_COLORS.featured : MARKER_COLORS.default;
  const borderWidth = isFeatured ? "3px" : "2px";
  const indicator = listingType === "rent" ? "R" : "S";

  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        position: relative;
        width: 32px;
        height: 32px;
      ">
        <div style="
          position: absolute;
          background: ${bgColor};
          border: ${borderWidth} solid ${borderColor};
          width: 32px;
          height: 32px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        ">
          <span style="
            transform: rotate(45deg);
            display: block;
            text-align: center;
            line-height: 28px;
            color: white;
            font-weight: bold;
            font-size: 14px;
            font-family: system-ui, sans-serif;
          ">${indicator}</span>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
}

/**
 * Creates a cluster icon for grouped markers
 * @param count - number of markers in cluster
 * @returns Leaflet DivIcon
 */
export function createClusterIcon(count: number): L.DivIcon {
  const size = count < 10 ? "small" : count < 100 ? "medium" : "large";
  const sizeMap = {
    small: 40,
    medium: 50,
    large: 60,
  };
  const dimension = sizeMap[size];

  return L.divIcon({
    html: `
      <div style="
        width: ${dimension}px;
        height: ${dimension}px;
        background: rgba(30, 58, 95, 0.7);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">
        <div style="
          width: ${dimension - 10}px;
          height: ${dimension - 10}px;
          background: #1e3a5f;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: ${size === "large" ? "16px" : size === "medium" ? "14px" : "12px"};
          font-family: system-ui, sans-serif;
        ">${count}</div>
      </div>
    `,
    className: `marker-cluster marker-cluster-${size}`,
    iconSize: L.point(dimension, dimension),
  });
}

/**
 * Default marker icon fallback
 */
export const defaultMarkerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
