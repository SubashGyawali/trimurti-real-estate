import { PropertyCard } from "./property-card";
import { cn } from "@/lib/utils";
import type { PropertyWithImages } from "@/types";

interface SimilarPropertiesProps {
  properties: PropertyWithImages[];
  currentPropertyId: string;
  className?: string;
}

export function SimilarProperties({
  properties,
  currentPropertyId,
  className,
}: SimilarPropertiesProps) {
  // Filter out current property (in case it's included)
  const filteredProperties = properties.filter(
    (p) => p.id !== currentPropertyId
  );

  if (filteredProperties.length === 0) {
    return null;
  }

  return (
    <section className={cn("py-8", className)}>
      <h2 className="mb-6 text-2xl font-semibold">Similar Properties</h2>

      {/* Desktop: Grid layout */}
      <div className="hidden gap-6 md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredProperties.slice(0, 4).map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>

      {/* Mobile: Horizontal scroll */}
      <div className="flex gap-4 overflow-x-auto pb-4 md:hidden">
        {filteredProperties.slice(0, 4).map((property) => (
          <div key={property.id} className="w-[280px] shrink-0">
            <PropertyCard property={property} />
          </div>
        ))}
      </div>
    </section>
  );
}
