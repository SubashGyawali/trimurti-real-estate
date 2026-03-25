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
  ArrowRight,
  Star,
} from "lucide-react";
import { formatPrice } from "@/components/property/price-display";
import type { PropertyWithImages } from "@/types";
import type { MarkerTier } from "@/lib/map-utils";
import { cn } from "@/lib/utils";

interface TransformableMarkerProps {
  properties: PropertyWithImages[];
  activeIndex: number;
  tier: MarkerTier;
  isActive: boolean;
  isHovered: boolean;
  onClick: () => void;
  onClose: () => void;
  onNavigate: (direction: "prev" | "next") => void;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}

const typeLabels: Record<string, string> = {
  "1rk": "1 RK",
  "1bhk": "1 BHK",
  "2bhk": "2 BHK",
  "3bhk": "3 BHK",
  shop: "Shop",
  office: "Office",
};

const furnLabels: Record<string, string> = {
  unfurnished: "Unfurnished",
  semi_furnished: "Semi-Furn.",
  fully_furnished: "Furnished",
};

function getImage(property: PropertyWithImages) {
  const primary = property.property_images?.find((img) => img.is_primary);
  return primary || property.property_images?.[0];
}

// ─── Collapsed Tiers ────────────────────────────────────────────────────────

function DotMarker({
  property,
  count,
}: {
  property: PropertyWithImages;
  count: number;
}) {
  const isRent = property.listing_type === "rent";
  const isFeatured = property.is_featured;

  return (
    <div className="relative">
      <div
        className={cn(
          "h-[18px] w-[18px] rounded-full shadow-md transition-transform duration-150",
          "hover:scale-125",
          "border-2",
          isRent
            ? "bg-blue-500 border-blue-300"
            : "bg-green-500 border-green-300",
          isFeatured && "border-[#d4a853] ring-2 ring-[#d4a853]/30"
        )}
      />
      {count > 1 && (
        <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#1e3a5f] text-[9px] font-bold text-white shadow-sm">
          {count}
        </span>
      )}
    </div>
  );
}

function PillMarker({
  property,
  count,
}: {
  property: PropertyWithImages;
  count: number;
}) {
  const isRent = property.listing_type === "rent";
  const isFeatured = property.is_featured;
  const price = formatPrice(property.price, property.listing_type);

  return (
    <div className="relative">
      <div
        className={cn(
          "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold",
          "shadow-md transition-all duration-150 select-none whitespace-nowrap",
          "hover:scale-105 hover:shadow-lg",
          "border-2",
          isRent
            ? "bg-blue-50 border-blue-500 text-blue-900"
            : "bg-green-50 border-green-600 text-green-900",
          isFeatured && "border-[#d4a853]"
        )}
      >
        {isRent ? (
          <Key className="h-3 w-3 shrink-0" />
        ) : (
          <Home className="h-3 w-3 shrink-0" />
        )}
        <span>{price}</span>
      </div>
      {count > 1 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#1e3a5f] text-[9px] font-bold text-white shadow-sm">
          {count}
        </span>
      )}
    </div>
  );
}

function RichMarker({
  property,
  count,
}: {
  property: PropertyWithImages;
  count: number;
}) {
  const isRent = property.listing_type === "rent";
  const isFeatured = property.is_featured;
  const price = formatPrice(property.price, property.listing_type);
  const typeLabel = typeLabels[property.property_type] || property.property_type;
  const displayImage = getImage(property);

  return (
    <div className="relative">
      <div
        className={cn(
          "flex items-stretch rounded-lg bg-background shadow-md overflow-hidden",
          "border transition-shadow duration-150",
          "hover:shadow-lg",
          isRent
            ? "border-l-[3px] border-l-blue-500"
            : "border-l-[3px] border-l-green-500",
          isFeatured && "ring-1 ring-[#d4a853]"
        )}
      >
        {/* Thumbnail */}
        <div className="relative h-11 w-11 shrink-0 bg-muted">
          {displayImage ? (
            <Image
              src={displayImage.image_url}
              alt=""
              fill
              className="object-cover"
              sizes="44px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
        </div>
        {/* Info */}
        <div className="flex flex-col justify-center px-2 py-1 min-w-0">
          <span className="text-[11px] font-bold text-primary leading-tight truncate">
            {price}
          </span>
          <span className="text-[10px] text-muted-foreground leading-tight truncate">
            {typeLabel}
          </span>
        </div>
      </div>
      {count > 1 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#1e3a5f] text-[9px] font-bold text-white shadow-sm">
          {count}
        </span>
      )}
    </div>
  );
}

// ─── Hover Preview ──────────────────────────────────────────────────────────

function HoverCard({
  property,
  count,
}: {
  property: PropertyWithImages;
  count: number;
}) {
  const isRent = property.listing_type === "rent";
  const price = formatPrice(property.price, property.listing_type);
  const typeLabel = typeLabels[property.property_type] || property.property_type;
  const furnLabel = furnLabels[property.furnishing] || property.furnishing;
  const displayImage = getImage(property);

  return (
    <div className="flex flex-col items-center animate-marker-hover">
      <div
        className={cn(
          "flex items-stretch rounded-lg bg-background shadow-lg overflow-hidden border",
          isRent
            ? "border-l-[3px] border-l-blue-500"
            : "border-l-[3px] border-l-green-500"
        )}
      >
        {/* Image */}
        <div className="relative h-16 w-16 shrink-0 bg-muted">
          {displayImage ? (
            <Image
              src={displayImage.image_url}
              alt=""
              fill
              className="object-cover"
              sizes="64px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <MapPin className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
        </div>
        {/* Info */}
        <div className="flex flex-col justify-center px-2.5 py-1.5 min-w-0">
          <span className="text-xs font-bold text-primary leading-tight">
            {price}
          </span>
          <span className="text-[11px] text-foreground leading-tight">
            {typeLabel}
            {property.carpet_area && (
              <span className="text-muted-foreground">
                {" "}
                · {property.carpet_area} sqft
              </span>
            )}
          </span>
          <span className="text-[10px] text-muted-foreground leading-tight">
            {furnLabel}
          </span>
        </div>
        {/* Count indicator */}
        {count > 1 && (
          <div className="flex items-center pr-2.5 pl-0.5">
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              +{count - 1}
            </span>
          </div>
        )}
      </div>
      {/* Pointer triangle */}
      <div
        className="w-0 h-0 -mt-px border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-background"
        style={{ filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.08))" }}
      />
    </div>
  );
}

// ─── Expanded Card (click state) ────────────────────────────────────────────

function ExpandedCard({
  properties,
  activeIndex,
  onClose,
  onNavigate,
}: {
  properties: PropertyWithImages[];
  activeIndex: number;
  onClose: () => void;
  onNavigate: (dir: "prev" | "next") => void;
}) {
  const property = properties[activeIndex] || properties[0];
  const isRent = property.listing_type === "rent";
  const isFeatured = property.is_featured;
  const price = formatPrice(property.price, property.listing_type);
  const typeLabel = typeLabels[property.property_type] || property.property_type;
  const furnLabel = furnLabels[property.furnishing] || property.furnishing;
  const displayImage = getImage(property);
  const hasMultiple = properties.length > 1;

  return (
    <div className="flex flex-col items-center animate-marker-expand">
      <div
        className={cn(
          "flex items-stretch rounded-xl bg-background shadow-xl overflow-hidden border",
          isRent
            ? "border-l-[4px] border-l-blue-500"
            : "border-l-[4px] border-l-green-500"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        <div className="relative w-[88px] shrink-0 bg-muted">
          {displayImage ? (
            <Image
              src={displayImage.image_url}
              alt={property.title}
              fill
              className="object-cover"
              sizes="88px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <MapPin className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col justify-between p-2.5 min-w-0 w-[162px]">
          {/* Header: listing type + property type + featured + close */}
          <div className="flex items-center gap-1">
            <span
              className={cn(
                "text-[11px] font-semibold shrink-0",
                isRent ? "text-blue-600" : "text-green-600"
              )}
            >
              {isRent ? "Rent" : "Sale"}
            </span>
            <span className="text-[11px] text-foreground font-medium truncate">
              · {typeLabel}
            </span>
            {isFeatured && (
              <Star className="h-3 w-3 shrink-0 text-[#d4a853] fill-[#d4a853]" />
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Close"
            >
              <X className="h-3 w-3" />
            </button>
          </div>

          {/* Price */}
          <span className="text-sm font-bold text-primary leading-tight">
            {price}
          </span>

          {/* Details */}
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            {property.carpet_area && (
              <span className="flex items-center gap-0.5">
                <Maximize2 className="h-2.5 w-2.5" />
                {property.carpet_area} sqft
              </span>
            )}
            <span className="flex items-center gap-0.5">
              <Sofa className="h-2.5 w-2.5" />
              {furnLabel}
            </span>
          </div>

          {/* Footer: link + navigation */}
          <div className="flex items-center justify-between">
            <Link
              href={`/properties/${property.slug}`}
              className="inline-flex items-center gap-0.5 text-[11px] font-medium text-primary hover:underline"
            >
              View Details
              <ArrowRight className="h-3 w-3" />
            </Link>
            {hasMultiple && (
              <div className="flex items-center gap-0.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate("prev");
                  }}
                  disabled={activeIndex === 0}
                  className="text-muted-foreground disabled:opacity-30 hover:text-foreground transition-colors"
                  aria-label="Previous property"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <span className="text-[10px] text-muted-foreground font-medium tabular-nums">
                  {activeIndex + 1}/{properties.length}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate("next");
                  }}
                  disabled={activeIndex === properties.length - 1}
                  className="text-muted-foreground disabled:opacity-30 hover:text-foreground transition-colors"
                  aria-label="Next property"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Pointer triangle */}
      <div
        className="w-0 h-0 -mt-px border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-background"
        style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.1))" }}
      />
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function TransformableMarker({
  properties,
  activeIndex,
  tier,
  isActive,
  isHovered,
  onClick,
  onClose,
  onNavigate,
  onHoverStart,
  onHoverEnd,
}: TransformableMarkerProps) {
  const displayProperty = properties[0];
  const count = properties.length;

  return (
    <div
      className="relative"
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
    >
      {/* Floating card (hover preview or expanded) — positioned above the marker */}
      {(isActive || isHovered) && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 pointer-events-auto">
          {isActive ? (
            <ExpandedCard
              properties={properties}
              activeIndex={activeIndex}
              onClose={onClose}
              onNavigate={onNavigate}
            />
          ) : (
            <HoverCard property={displayProperty} count={count} />
          )}
        </div>
      )}

      {/* Collapsed marker — always visible, tier-adaptive */}
      <div
        className="cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        {tier === "dot" && (
          <DotMarker property={displayProperty} count={count} />
        )}
        {tier === "pill" && (
          <PillMarker property={displayProperty} count={count} />
        )}
        {tier === "rich" && (
          <RichMarker property={displayProperty} count={count} />
        )}
      </div>
    </div>
  );
}
