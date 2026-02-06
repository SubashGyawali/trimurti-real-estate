"use client";

import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  X,
  Key,
  Home,
  Maximize2,
  Sofa,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/components/property/price-display";
import { MARKER_COLORS } from "@/lib/map-config";
import type { PropertyWithImages } from "@/types";
import { cn } from "@/lib/utils";

interface TransformableMarkerProps {
  properties: PropertyWithImages[];
  activeIndex: number;
  isActive: boolean;
  onClick: () => void;
  onClose: () => void;
  onNavigate: (direction: "prev" | "next") => void;
}

const propertyTypeLabels: Record<string, string> = {
  "1rk": "1 RK",
  "1bhk": "1 BHK",
  "2bhk": "2 BHK",
  "3bhk": "3 BHK",
  shop: "Shop",
  office: "Office",
};

const furnishingLabels: Record<string, string> = {
  unfurnished: "Unfurnished",
  semi_furnished: "Semi-Furn.",
  fully_furnished: "Furnished",
};

export function TransformableMarker({
  properties,
  activeIndex,
  isActive,
  onClick,
  onClose,
  onNavigate,
}: TransformableMarkerProps) {
  // Use the first property for collapsed state display
  const displayProperty = properties[activeIndex] || properties[0];
  const price = formatPrice(displayProperty.price, displayProperty.listing_type);
  const isFeatured = displayProperty.is_featured;
  const isRent = displayProperty.listing_type === "rent";
  const hasMultiple = properties.length > 1;

  // Collapsed state: render price pill
  if (!isActive) {
    return (
      <div
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        className={cn(
          "relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold",
          "shadow-md transition-all duration-150 cursor-pointer select-none whitespace-nowrap",
          "hover:scale-105 hover:shadow-lg",
          "border-2",
          // Rent vs Sale visual differentiation
          isRent
            ? "bg-blue-50 border-blue-500 text-blue-900"
            : "bg-green-50 border-green-600 text-green-900",
          // Featured override (gold border)
          isFeatured && "border-[#d4a853]"
        )}
      >
        {/* Icon indicator */}
        {isRent ? (
          <Key className="h-3 w-3 shrink-0" />
        ) : (
          <Home className="h-3 w-3 shrink-0" />
        )}
        <span>{price}</span>

        {/* Stacked properties count badge */}
        {hasMultiple && (
          <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm">
            {properties.length}
          </span>
        )}
      </div>
    );
  }

  // Expanded state: render card with pointer
  const property = properties[activeIndex] || properties[0];
  const primaryImage = property.property_images?.find((img) => img.is_primary);
  const firstImage = property.property_images?.[0];
  const displayImage = primaryImage || firstImage;
  const propertyTypeLabel =
    propertyTypeLabels[property.property_type] || property.property_type;
  const furnishingLabel =
    furnishingLabels[property.furnishing] || property.furnishing;
  const expandedPrice = formatPrice(property.price, property.listing_type);
  const expandedIsRent = property.listing_type === "rent";

  return (
    <div
      className="flex flex-col items-center animate-marker-expand"
      style={{ transform: "translateY(-100%)" }}
    >
      {/* Card */}
      <div
        className="relative w-[260px] overflow-hidden rounded-xl bg-background shadow-xl border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          aria-label="Close"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        {/* Image */}
        <div className="relative h-[130px] w-full bg-muted">
          {displayImage ? (
            <Image
              src={displayImage.image_url}
              alt={property.title}
              fill
              className="object-cover"
              sizes="260px"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <MapPin className="h-8 w-8 text-muted-foreground" />
            </div>
          )}

          {/* Listing type badge */}
          <Badge
            className={cn(
              "absolute left-2 top-2 text-xs font-semibold",
              expandedIsRent
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-green-600 text-white hover:bg-green-700"
            )}
          >
            {expandedIsRent ? (
              <>
                <Key className="mr-1 h-3 w-3" />
                For Rent
              </>
            ) : (
              <>
                <Home className="mr-1 h-3 w-3" />
                For Sale
              </>
            )}
          </Badge>

          {/* Featured badge */}
          {property.is_featured && (
            <Badge className="absolute right-8 top-2 border-amber-500 bg-amber-500 text-xs text-white">
              Featured
            </Badge>
          )}

          {/* Navigation for stacked properties */}
          {hasMultiple && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/60 rounded-full px-2 py-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate("prev");
                }}
                disabled={activeIndex === 0}
                className="text-white disabled:opacity-40 hover:text-white/80 transition-colors"
                aria-label="Previous property"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs text-white font-medium min-w-[32px] text-center">
                {activeIndex + 1} / {properties.length}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate("next");
                }}
                disabled={activeIndex === properties.length - 1}
                className="text-white disabled:opacity-40 hover:text-white/80 transition-colors"
                aria-label="Next property"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3.5">
          {/* Property type + Price */}
          <div className="mb-2.5">
            <h3 className="text-sm font-semibold text-foreground leading-tight">
              {propertyTypeLabel}
            </h3>
            <p className="text-lg font-bold text-primary leading-tight mt-0.5">
              {expandedPrice}
            </p>
          </div>

          {/* Details with icons */}
          <div className="mb-3 flex items-center gap-3 text-xs text-muted-foreground">
            {property.carpet_area && (
              <span className="flex items-center gap-1">
                <Maximize2 className="h-3 w-3 text-muted-foreground/70" />
                {property.carpet_area} sqft
              </span>
            )}
            <span className="flex items-center gap-1">
              <Sofa className="h-3 w-3 text-muted-foreground/70" />
              {furnishingLabel}
            </span>
          </div>

          <Button asChild size="sm" className="w-full h-8 text-xs">
            <Link href={`/properties/${property.slug}`}>View Details</Link>
          </Button>
        </div>
      </div>

      {/* Bottom pointer/pin triangle */}
      <div
        className={cn(
          "w-0 h-0 -mt-[1px]",
          "border-l-[12px] border-l-transparent",
          "border-r-[12px] border-r-transparent",
          "border-t-[12px] border-t-background"
        )}
        style={{
          filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.1))",
        }}
      />
    </div>
  );
}
