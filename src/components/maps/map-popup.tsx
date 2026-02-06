"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/components/property/price-display";
import type { PropertyWithImages } from "@/types";
import { cn } from "@/lib/utils";

interface MapPopupProps {
  property: PropertyWithImages;
  className?: string;
  onClose?: () => void;
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
  semi_furnished: "Semi-Furnished",
  fully_furnished: "Furnished",
};

export function MapPopup({ property, className, onClose }: MapPopupProps) {
  const primaryImage = property.property_images?.find((img) => img.is_primary);
  const firstImage = property.property_images?.[0];
  const displayImage = primaryImage || firstImage;

  const propertyTypeLabel = propertyTypeLabels[property.property_type] || property.property_type;
  const furnishingLabel = furnishingLabels[property.furnishing] || property.furnishing;

  return (
    <div
      className={cn(
        "w-[240px] overflow-hidden rounded-xl bg-background shadow-xl border animate-in fade-in zoom-in-95 duration-200",
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          aria-label="Close"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      {/* Image */}
      <div className="relative h-[130px] w-full bg-muted">
        {displayImage ? (
          <Image
            src={displayImage.image_url}
            alt={property.title}
            fill
            className="object-cover"
            sizes="240px"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <MapPin className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
        {/* Listing type badge */}
        <Badge
          variant={property.listing_type === "rent" ? "default" : "secondary"}
          className={cn(
            "absolute left-2 top-2 text-xs",
            property.listing_type === "sale" && "bg-green-500 text-white hover:bg-green-600"
          )}
        >
          For {property.listing_type === "rent" ? "Rent" : "Sale"}
        </Badge>
        {/* Featured badge */}
        {property.is_featured && (
          <Badge
            className="absolute right-2 top-2 border-amber-500 bg-amber-500 text-xs text-white"
          >
            Featured
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Property type & price */}
        <div className="mb-2">
          <h3 className="text-sm font-semibold text-foreground">
            {propertyTypeLabel}
          </h3>
          <p className="text-base font-bold text-primary">
            {formatPrice(property.price, property.listing_type)}
          </p>
        </div>

        {/* Details */}
        <div className="mb-3 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
          {property.carpet_area && (
            <span>{property.carpet_area} sq ft</span>
          )}
          {property.carpet_area && (
            <span className="text-border">|</span>
          )}
          <span>{furnishingLabel}</span>
        </div>

        {/* View Details Button */}
        <Button asChild size="sm" className="w-full">
          <Link href={`/properties/${property.slug}`}>
            View Details
          </Link>
        </Button>
      </div>
    </div>
  );
}
