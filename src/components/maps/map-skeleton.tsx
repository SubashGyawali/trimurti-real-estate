import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface MapSkeletonProps {
  className?: string;
}

export function MapSkeleton({ className }: MapSkeletonProps) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-lg bg-muted",
        className
      )}
      style={{ minHeight: "400px" }}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
        {/* Map icon placeholder */}
        <div className="relative">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="h-8 w-8 text-muted-foreground/50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
        </div>
        <Skeleton className="h-4 w-32" />
        <p className="text-sm text-muted-foreground">Loading map...</p>
      </div>

      {/* Fake map grid lines */}
      <div className="absolute inset-4 grid grid-cols-4 grid-rows-4 gap-2 opacity-20">
        {Array.from({ length: 16 }).map((_, i) => (
          <Skeleton key={i} className="h-full w-full" />
        ))}
      </div>
    </div>
  );
}
