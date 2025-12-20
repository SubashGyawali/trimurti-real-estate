import { Skeleton } from "@/components/ui/skeleton";

export default function PropertyDetailLoading() {
  return (
    <main className="container mx-auto px-4 py-6">
      {/* Breadcrumb skeleton */}
      <Skeleton className="mb-6 h-4 w-48" />

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Left Column */}
        <div className="space-y-8">
          {/* Gallery skeleton */}
          <div className="space-y-3">
            <Skeleton className="aspect-video w-full rounded-lg" />
            <div className="flex gap-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-24 shrink-0 rounded-md" />
              ))}
            </div>
          </div>

          {/* Header skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-10 w-40" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-28" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-10 w-10" />
            </div>
          </div>

          {/* Details grid skeleton */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(10)].map((_, i) => (
              <Skeleton key={i} className="h-[72px] rounded-lg" />
            ))}
          </div>

          {/* Description skeleton */}
          <div className="space-y-3">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>

          {/* Amenities skeleton */}
          <div className="space-y-3">
            <Skeleton className="h-6 w-24" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-10 rounded-md" />
              ))}
            </div>
          </div>

          {/* Map skeleton */}
          <div className="space-y-3">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-[300px] w-full rounded-lg" />
          </div>
        </div>

        {/* Right Column - Sidebar skeleton */}
        <div className="hidden lg:block">
          <div className="sticky top-24">
            <Skeleton className="h-[500px] w-full rounded-lg" />
          </div>
        </div>
      </div>

      {/* Similar properties skeleton */}
      <div className="mt-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="aspect-[4/5] rounded-lg" />
          ))}
        </div>
      </div>
    </main>
  );
}
