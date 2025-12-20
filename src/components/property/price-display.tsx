import { cn } from "@/lib/utils";
import type { ListingType } from "@/types";

/**
 * Formats price based on listing type
 * - Rent: ₹XX,XXX/mo
 * - Sale < 1 Crore: ₹XX.XX Lac
 * - Sale >= 1 Crore: ₹X.XX Cr
 */
export function formatPrice(price: number, listingType: ListingType): string {
  if (listingType === "rent") {
    return `₹${price.toLocaleString("en-IN")}/mo`;
  }

  // Sale price formatting
  if (price >= 10000000) {
    // 1 Crore = 10,000,000
    const crores = price / 10000000;
    return `₹${crores.toFixed(2)} Cr`;
  }

  // Less than 1 Crore, show in Lac
  const lacs = price / 100000;
  return `₹${lacs.toFixed(2)} Lac`;
}

/**
 * Formats price with full details for property pages
 */
export function formatPriceFull(
  price: number,
  listingType: ListingType,
  deposit?: number | null,
  maintenance?: number | null
): {
  main: string;
  deposit?: string;
  maintenance?: string;
} {
  const main = formatPrice(price, listingType);

  if (listingType === "rent") {
    return {
      main,
      deposit: deposit ? `₹${deposit.toLocaleString("en-IN")} deposit` : undefined,
      maintenance: maintenance
        ? `₹${maintenance.toLocaleString("en-IN")}/mo maintenance`
        : undefined,
    };
  }

  return { main };
}

interface PriceDisplayProps {
  price: number;
  listingType: ListingType;
  deposit?: number | null;
  maintenance?: number | null;
  showDetails?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PriceDisplay({
  price,
  listingType,
  deposit,
  maintenance,
  showDetails = false,
  size = "md",
  className,
}: PriceDisplayProps) {
  const formattedPrice = formatPrice(price, listingType);

  const sizeClasses = {
    sm: "text-lg font-semibold",
    md: "text-xl font-bold",
    lg: "text-2xl font-bold",
  };

  return (
    <div className={cn("flex flex-col", className)}>
      <span className={cn(sizeClasses[size], "text-primary")}>
        {formattedPrice}
      </span>
      {showDetails && listingType === "rent" && (deposit || maintenance) && (
        <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
          {deposit && (
            <span>+ ₹{deposit.toLocaleString("en-IN")} deposit</span>
          )}
          {maintenance && (
            <span>+ ₹{maintenance.toLocaleString("en-IN")}/mo maint.</span>
          )}
        </div>
      )}
    </div>
  );
}

// Compact price for cards
interface CompactPriceProps {
  price: number;
  listingType: ListingType;
  className?: string;
}

export function CompactPrice({ price, listingType, className }: CompactPriceProps) {
  return (
    <span className={cn("text-lg font-bold text-primary", className)}>
      {formatPrice(price, listingType)}
    </span>
  );
}
