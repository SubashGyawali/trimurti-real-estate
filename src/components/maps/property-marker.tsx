"use client";

import { MARKER_COLORS } from "@/lib/map-config";
import { formatPrice } from "@/components/property/price-display";
import type { PropertyWithImages } from "@/types";
import { cn } from "@/lib/utils";

interface PriceMarkerProps {
  property: PropertyWithImages;
  isActive?: boolean;
}

/**
 * Airbnb-style price pill marker rendered inside AdvancedMarker.
 * Shows formatted price; inverts colors when active/selected.
 */
export function PriceMarker({ property, isActive }: PriceMarkerProps) {
  const price = formatPrice(property.price, property.listing_type);
  const isFeatured = property.is_featured;
  const isRent = property.listing_type === "rent";

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold shadow-md transition-all duration-150 cursor-pointer select-none whitespace-nowrap",
        "border-2",
        isActive
          ? "bg-foreground text-background border-foreground scale-110 z-10"
          : "bg-background text-foreground border-border hover:scale-105 hover:shadow-lg",
        isFeatured && !isActive && "border-[#d4a853]"
      )}
    >
      {!isActive && (
        <span
          className="inline-block h-2 w-2 rounded-full shrink-0"
          style={{
            backgroundColor: isRent ? MARKER_COLORS.rent : MARKER_COLORS.sale,
          }}
        />
      )}
      <span>{price}</span>
    </div>
  );
}

interface OfficeMarkerPinProps {
  className?: string;
}

/**
 * Custom office location marker (brand-colored pin).
 */
export function OfficeMarkerPin({ className }: OfficeMarkerPinProps) {
  return (
    <div
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full bg-[#1e3a5f] border-[3px] border-[#d4a853] shadow-lg",
        className
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="white"
      >
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
      </svg>
    </div>
  );
}
