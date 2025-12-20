import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { PropertyType, ListingType, FurnishingType } from "@/types";

const propertyBadgeVariants = cva(
  "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium",
  {
    variants: {
      variant: {
        sale: "bg-emerald-500/90 text-white",
        rent: "bg-blue-500/90 text-white",
        featured: "bg-[hsl(var(--brand-gold))] text-white",
        type: "bg-white/90 text-gray-800 border border-gray-200",
        furnished: "bg-purple-100 text-purple-800",
        semiFurnished: "bg-orange-100 text-orange-800",
        unfurnished: "bg-gray-100 text-gray-800",
      },
    },
    defaultVariants: {
      variant: "type",
    },
  }
);

interface PropertyBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof propertyBadgeVariants> {
  children: React.ReactNode;
}

export function PropertyBadge({
  className,
  variant,
  children,
  ...props
}: PropertyBadgeProps) {
  return (
    <span
      className={cn(propertyBadgeVariants({ variant }), className)}
      {...props}
    >
      {children}
    </span>
  );
}

// Helper components for specific badge types

interface ListingBadgeProps {
  listingType: ListingType;
  className?: string;
}

export function ListingBadge({ listingType, className }: ListingBadgeProps) {
  return (
    <PropertyBadge variant={listingType} className={className}>
      {listingType === "sale" ? "For Sale" : "For Rent"}
    </PropertyBadge>
  );
}

interface FeaturedBadgeProps {
  className?: string;
}

export function FeaturedBadge({ className }: FeaturedBadgeProps) {
  return (
    <PropertyBadge variant="featured" className={className}>
      Featured
    </PropertyBadge>
  );
}

// Property type labels
const propertyTypeLabels: Record<PropertyType, string> = {
  "1rk": "1 RK",
  "1bhk": "1 BHK",
  "2bhk": "2 BHK",
  "3bhk": "3 BHK",
  shop: "Shop",
  office: "Office",
};

interface PropertyTypeBadgeProps {
  propertyType: PropertyType;
  className?: string;
}

export function PropertyTypeBadge({
  propertyType,
  className,
}: PropertyTypeBadgeProps) {
  return (
    <PropertyBadge variant="type" className={className}>
      {propertyTypeLabels[propertyType]}
    </PropertyBadge>
  );
}

// Furnishing labels
const furnishingLabels: Record<FurnishingType, string> = {
  unfurnished: "Unfurnished",
  semi_furnished: "Semi-Furnished",
  fully_furnished: "Fully Furnished",
};

const furnishingVariants: Record<
  FurnishingType,
  "furnished" | "semiFurnished" | "unfurnished"
> = {
  fully_furnished: "furnished",
  semi_furnished: "semiFurnished",
  unfurnished: "unfurnished",
};

interface FurnishingBadgeProps {
  furnishing: FurnishingType;
  className?: string;
}

export function FurnishingBadge({ furnishing, className }: FurnishingBadgeProps) {
  return (
    <PropertyBadge variant={furnishingVariants[furnishing]} className={className}>
      {furnishingLabels[furnishing]}
    </PropertyBadge>
  );
}

// Export labels for use elsewhere
export { propertyTypeLabels, furnishingLabels };
