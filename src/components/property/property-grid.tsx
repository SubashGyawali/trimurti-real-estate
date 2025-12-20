"use client";

import { useCallback, useRef, useEffect, forwardRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { PropertyCard } from "./property-card";
import { usePropertyFilters } from "@/hooks/use-property-filters";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PropertyWithImages } from "@/types";

interface PropertyGridProps {
  properties: PropertyWithImages[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  selectedPropertyId?: string | null;
  hoveredPropertyId?: string | null;
  onPropertyHover?: (propertyId: string | null) => void;
  onPropertySelect?: (property: PropertyWithImages) => void;
  className?: string;
}

export function PropertyGrid({
  properties,
  totalCount,
  currentPage,
  pageSize,
  selectedPropertyId,
  hoveredPropertyId,
  onPropertyHover,
  onPropertySelect,
  className,
}: PropertyGridProps) {
  const { getFilterUrl } = usePropertyFilters();
  const totalPages = Math.ceil(totalCount / pageSize);

  // Ref map for scrolling to selected card
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Scroll selected card into view when selected from map
  useEffect(() => {
    if (selectedPropertyId && cardRefs.current.has(selectedPropertyId)) {
      const element = cardRefs.current.get(selectedPropertyId);
      element?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [selectedPropertyId]);

  return (
    <div className={className}>
      {/* Property Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2">
        {properties.map((property) => (
          <PropertyCardWrapper
            key={property.id}
            property={property}
            isSelected={selectedPropertyId === property.id}
            isHovered={hoveredPropertyId === property.id}
            onHover={(isHovering: boolean) =>
              onPropertyHover?.(isHovering ? property.id : null)
            }
            onClick={() => onPropertySelect?.(property)}
            ref={(el: HTMLDivElement | null) => {
              if (el) {
                cardRefs.current.set(property.id, el);
              } else {
                cardRefs.current.delete(property.id);
              }
            }}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          getPageUrl={(page) => getFilterUrl({ page })}
        />
      )}
    </div>
  );
}

// Wrapper for bidirectional highlighting
interface PropertyCardWrapperProps {
  property: PropertyWithImages;
  isSelected: boolean;
  isHovered: boolean;
  onHover: (isHovering: boolean) => void;
  onClick: () => void;
}

const PropertyCardWrapper = forwardRef<HTMLDivElement, PropertyCardWrapperProps>(
  function PropertyCardWrapper(
    { property, isSelected, isHovered, onHover, onClick },
    ref
  ) {
    const isHighlighted = isSelected || isHovered;

    return (
      <motion.div
        ref={ref}
        onHoverStart={() => onHover(true)}
        onHoverEnd={() => onHover(false)}
        animate={{
          scale: isHighlighted ? 1.01 : 1,
        }}
        transition={{ duration: 0.2 }}
        className={cn(
          "cursor-pointer rounded-lg transition-all duration-200",
          isHighlighted && "ring-2 ring-primary ring-offset-2"
        )}
        onClick={onClick}
      >
        <PropertyCard property={property} />
      </motion.div>
    );
  }
);

// SEO-friendly pagination with links
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  getPageUrl: (page: number) => string;
}

function Pagination({ currentPage, totalPages, getPageUrl }: PaginationProps) {
  // Generate page numbers to show
  const getVisiblePages = useCallback(() => {
    const pages: (number | "ellipsis-start" | "ellipsis-end")[] = [];

    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Always show first page
    pages.push(1);

    if (currentPage > 3) {
      pages.push("ellipsis-start");
    }

    // Pages around current
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push("ellipsis-end");
    }

    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  }, [currentPage, totalPages]);

  const visiblePages = getVisiblePages();

  return (
    <nav
      aria-label="Pagination"
      className="mt-8 flex items-center justify-center gap-1"
    >
      {/* Previous */}
      <Button
        variant="outline"
        size="icon"
        asChild={currentPage > 1}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        {currentPage > 1 ? (
          <Link href={getPageUrl(currentPage - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Link>
        ) : (
          <span>
            <ChevronLeft className="h-4 w-4" />
          </span>
        )}
      </Button>

      {/* Page Numbers */}
      {visiblePages.map((page, index) =>
        typeof page === "string" ? (
          <span
            key={page}
            className="flex h-10 w-10 items-center justify-center text-muted-foreground"
          >
            <MoreHorizontal className="h-4 w-4" />
          </span>
        ) : (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="icon"
            asChild={currentPage !== page}
            aria-current={currentPage === page ? "page" : undefined}
          >
            {currentPage === page ? (
              <span>{page}</span>
            ) : (
              <Link href={getPageUrl(page)}>{page}</Link>
            )}
          </Button>
        )
      )}

      {/* Next */}
      <Button
        variant="outline"
        size="icon"
        asChild={currentPage < totalPages}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        {currentPage < totalPages ? (
          <Link href={getPageUrl(currentPage + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <span>
            <ChevronRight className="h-4 w-4" />
          </span>
        )}
      </Button>
    </nav>
  );
}
