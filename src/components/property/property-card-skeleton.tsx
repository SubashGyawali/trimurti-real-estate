import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { cn } from "@/lib/utils";

interface PropertyCardSkeletonProps {
  className?: string;
}

export function PropertyCardSkeleton({ className }: PropertyCardSkeletonProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      {/* Image skeleton */}
      <AspectRatio ratio={4 / 3}>
        <Skeleton className="h-full w-full" />
      </AspectRatio>

      {/* Content skeleton */}
      <CardContent className="p-4">
        {/* Building name */}
        <Skeleton className="mb-2 h-3 w-24" />

        {/* Title */}
        <Skeleton className="mb-3 h-5 w-full" />

        {/* Price */}
        <Skeleton className="mb-4 h-6 w-32" />

        {/* Details */}
        <div className="flex gap-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
      </CardContent>
    </Card>
  );
}

// Grid of skeleton cards
interface PropertyCardSkeletonGridProps {
  count?: number;
  className?: string;
}

export function PropertyCardSkeletonGrid({
  count = 6,
  className,
}: PropertyCardSkeletonGridProps) {
  return (
    <div
      className={cn(
        "grid gap-6 sm:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  );
}
