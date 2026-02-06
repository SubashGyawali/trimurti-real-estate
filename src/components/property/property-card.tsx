"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MessageCircle,
  Calendar,
  Maximize,
  Building2,
  Layers,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ListingBadge, FeaturedBadge, FurnishingBadge, propertyTypeLabels } from "./property-badge";
import { VerifiedBadge } from "./verified-badge";
import { CompactPrice } from "./price-display";
import { FavoriteButton } from "./favorite-button";
import { cn } from "@/lib/utils";
import type { PropertyWithImages } from "@/types";

const WHATSAPP_NUMBER = "919876543210";
const PLACEHOLDER_IMAGE = "/images/property-placeholder.jpg";

interface PropertyCardProps {
  property: PropertyWithImages;
  isFavorited?: boolean;
  showActions?: boolean;
  className?: string;
}

export function PropertyCard({
  property,
  isFavorited = false,
  showActions = true,
  className,
}: PropertyCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Sort images by display_order, primary first
  const sortedImages = useMemo(() => {
    if (!property.property_images || property.property_images.length === 0) {
      return [];
    }
    return [...property.property_images].sort((a, b) => {
      if (a.is_primary && !b.is_primary) return -1;
      if (!a.is_primary && b.is_primary) return 1;
      return a.display_order - b.display_order;
    });
  }, [property.property_images]);

  const hasMultipleImages = sortedImages.length > 1;
  const primaryImage = sortedImages[0]?.image_url || PLACEHOLDER_IMAGE;

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const message = encodeURIComponent(
      `Hello! I'm interested in the property: ${property.title}`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  const handleScheduleVisit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Navigate to contact page with property info
    window.location.href = `/contact?property=${property.slug}&action=visit`;
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card
        className={cn(
          "group overflow-hidden rounded-xl border border-gray-100",
          "shadow-sm transition-all duration-300",
          "hover:border-primary/20 hover:shadow-lg",
          className
        )}
      >
        <Link href={`/properties/${property.slug}`} className="block">
          {/* Image Section */}
          <div className="relative aspect-[4/3] overflow-hidden">
            {/* Always show primary image */}
            <Image
              src={primaryImage}
              alt={property.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              loading="lazy"
            />

            {/* Image count indicator */}
            {hasMultipleImages && (
              <div className="absolute bottom-2 right-2 rounded-md bg-black/60 px-2 py-1 text-xs text-white">
                {sortedImages.length} photos
              </div>
            )}

            {/* Badges - Top Left */}
            <div className="absolute left-3 top-3 flex flex-col gap-2">
              <ListingBadge listingType={property.listing_type} />
              {property.is_verified && <VerifiedBadge />}
              {property.is_featured && <FeaturedBadge />}
            </div>

            {/* Quick Actions - Top Right */}
            {showActions && (
              <div
                className={cn(
                  "absolute right-3 top-3 flex flex-col gap-2",
                  "md:opacity-0 md:transition-opacity md:duration-200",
                  "md:group-hover:opacity-100"
                )}
              >
                <FavoriteButton
                  propertyId={property.id}
                  isFavorited={isFavorited}
                />
                <button
                  onClick={handleWhatsAppClick}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full",
                    "bg-[#25D366] text-white shadow-md",
                    "transition-all duration-200",
                    "hover:scale-110 hover:bg-[#20BD5A]"
                  )}
                  aria-label="Contact via WhatsApp"
                >
                  <MessageCircle className="h-5 w-5" />
                </button>
                <button
                  onClick={handleScheduleVisit}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full",
                    "bg-white/90 text-gray-700 shadow-md backdrop-blur-sm",
                    "transition-all duration-200",
                    "hover:scale-110 hover:bg-white"
                  )}
                  aria-label="Schedule a visit"
                >
                  <Calendar className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {/* Content Section */}
          <CardContent className="p-4">
            {/* Building name - if available */}
            {property.building_id && (
              <p className="mb-1 text-xs text-muted-foreground">
                {/* Building name would come from join - showing placeholder */}
                MHADA Complex
              </p>
            )}

            {/* Title */}
            <h3 className="mb-2 line-clamp-1 text-base font-semibold text-foreground">
              {property.title}
            </h3>

            {/* Price */}
            <CompactPrice
              price={property.price}
              listingType={property.listing_type}
              className="mb-3"
            />

            {/* Property Details */}
            <motion.div
              initial={false}
              animate={{
                opacity: isHovered ? 1 : 0.8,
                height: "auto",
              }}
              className={cn(
                "flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground",
                "md:opacity-0 md:group-hover:opacity-100 md:transition-opacity"
              )}
            >
              {/* Property Type & Area */}
              <div className="flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                <span>{propertyTypeLabels[property.property_type]}</span>
                {property.carpet_area && (
                  <>
                    <span className="text-muted-foreground/50">|</span>
                    <Maximize className="h-4 w-4" />
                    <span>{property.carpet_area} sq.ft</span>
                  </>
                )}
              </div>

              {/* Floor */}
              {property.floor_number !== null && (
                <div className="flex items-center gap-1">
                  <Layers className="h-4 w-4" />
                  <span>
                    Floor {property.floor_number}
                    {property.total_floors && ` of ${property.total_floors}`}
                  </span>
                </div>
              )}
            </motion.div>

            {/* Furnishing Badge */}
            <div className="mt-3">
              <FurnishingBadge furnishing={property.furnishing} />
            </div>
          </CardContent>
        </Link>
      </Card>
    </motion.div>
  );
}

// Grid layout for property cards
interface PropertyCardGridProps {
  properties: PropertyWithImages[];
  favoriteIds?: string[];
  className?: string;
}

export function PropertyCardGrid({
  properties,
  favoriteIds = [],
  className,
}: PropertyCardGridProps) {
  return (
    <div
      className={cn(
        "grid gap-6 sm:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {properties.map((property) => (
        <PropertyCard
          key={property.id}
          property={property}
          isFavorited={favoriteIds.includes(property.id)}
        />
      ))}
    </div>
  );
}
