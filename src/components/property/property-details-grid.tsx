import {
  Building2,
  Maximize,
  Layers,
  Sofa,
  BedDouble,
  Bath,
  Square,
  Car,
  Compass,
  Calendar,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { propertyTypeLabels, furnishingLabels } from "./property-badge";
import type { PropertyWithDetails } from "@/types";

interface PropertyDetailsGridProps {
  property: PropertyWithDetails;
  className?: string;
}

interface DetailItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number | null | undefined;
  show?: boolean;
}

function DetailItem({ icon, label, value, show = true }: DetailItemProps) {
  if (!show || value === null || value === undefined) return null;

  return (
    <Card className="border-muted">
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="truncate font-medium">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function PropertyDetailsGrid({
  property,
  className,
}: PropertyDetailsGridProps) {
  // Format floor display
  const floorDisplay =
    property.floor_number !== null
      ? property.total_floors
        ? `${getOrdinal(property.floor_number)} of ${property.total_floors}`
        : `${getOrdinal(property.floor_number)} Floor`
      : null;

  // Format availability
  const availabilityDisplay = property.availability_date
    ? formatAvailability(property.availability_date)
    : "Immediate";

  return (
    <div className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-3", className)}>
      <DetailItem
        icon={<Building2 className="h-5 w-5" />}
        label="Property Type"
        value={propertyTypeLabels[property.property_type]}
      />

      <DetailItem
        icon={<Maximize className="h-5 w-5" />}
        label="Carpet Area"
        value={property.carpet_area ? `${property.carpet_area} sq.ft` : null}
        show={property.carpet_area !== null}
      />

      <DetailItem
        icon={<Layers className="h-5 w-5" />}
        label="Floor"
        value={floorDisplay}
        show={property.floor_number !== null}
      />

      <DetailItem
        icon={<Sofa className="h-5 w-5" />}
        label="Furnishing"
        value={furnishingLabels[property.furnishing]}
      />

      <DetailItem
        icon={<BedDouble className="h-5 w-5" />}
        label="Bedrooms"
        value={property.bedrooms}
        show={property.bedrooms !== null && property.bedrooms > 0}
      />

      <DetailItem
        icon={<Bath className="h-5 w-5" />}
        label="Bathrooms"
        value={property.bathrooms}
        show={property.bathrooms !== null && property.bathrooms > 0}
      />

      <DetailItem
        icon={<Square className="h-5 w-5" />}
        label="Balconies"
        value={property.balconies}
        show={property.balconies > 0}
      />

      <DetailItem
        icon={<Car className="h-5 w-5" />}
        label="Parking"
        value={property.parking ? "Available" : "Not Available"}
      />

      <DetailItem
        icon={<Compass className="h-5 w-5" />}
        label="Facing"
        value={property.facing ? capitalizeFirst(property.facing) : null}
        show={!!property.facing}
      />

      <DetailItem
        icon={<Calendar className="h-5 w-5" />}
        label="Available"
        value={availabilityDisplay}
      />
    </div>
  );
}

// Helper functions
function getOrdinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function formatAvailability(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();

  // If date is in the past or today, show "Immediate"
  if (date <= now) {
    return "Immediate";
  }

  // Format as "15 Jan 2025"
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
