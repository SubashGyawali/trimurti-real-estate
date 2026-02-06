"use client";

import { MessageCircle, Calendar, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  PriceDisplay,
} from "@/components/property/price-display";
import {
  ListingBadge,
  FeaturedBadge,
  FurnishingBadge,
} from "@/components/property/property-badge";
import { VerifiedBadge } from "@/components/property/verified-badge";
import { FavoriteButton } from "@/components/property/favorite-button";
import type { PropertyWithDetails } from "@/types";

const WHATSAPP_NUMBER = "919819446163";

interface PropertyHeaderProps {
  property: PropertyWithDetails;
}

export function PropertyHeader({ property }: PropertyHeaderProps) {
  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: `Check out this property: ${property.title}`,
          url: window.location.href,
        });
      } catch {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Hello! I'm interested in the property: ${property.title}`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  const handleScheduleVisit = () => {
    window.location.href = `/contact?property=${property.slug}&action=visit`;
  };

  return (
    <div className="space-y-4">
      {/* Building name */}
      {property.building && (
        <p className="text-sm text-muted-foreground">
          {property.building.name}
        </p>
      )}

      {/* Title */}
      <h1 className="text-2xl font-bold md:text-3xl">{property.title}</h1>

      {/* Price */}
      <PriceDisplay
        price={property.price}
        listingType={property.listing_type}
        deposit={property.deposit}
        maintenance={property.maintenance}
        showDetails
        size="lg"
      />

      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        <ListingBadge listingType={property.listing_type} />
        {property.is_verified && <VerifiedBadge />}
        {property.is_featured && <FeaturedBadge />}
        <FurnishingBadge furnishing={property.furnishing} />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button
          className="bg-[#25D366] hover:bg-[#20BD5A]"
          onClick={handleWhatsApp}
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          WhatsApp
        </Button>
        <Button variant="outline" onClick={handleScheduleVisit}>
          <Calendar className="mr-2 h-4 w-4" />
          Schedule Visit
        </Button>
        <FavoriteButton propertyId={property.id} variant="button" />
        <Button variant="ghost" size="icon" onClick={handleShare}>
          <Share2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
