import { PropertyCardSkeletonGrid } from "@/components/property";
import { Skeleton } from "@/components/ui/skeleton";

export default function PropertiesLoading() {
  return (
    <main className="container mx-auto px-4 py-8">
      {/* Filter bar skeleton */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <Skeleton className="h-10 w-[180px]" />
        <Skeleton className="h-10 w-[160px]" />
        <Skeleton className="h-10 w-[180px]" />
        <Skeleton className="h-10 w-[180px]" />
        <div className="ml-auto">
          <Skeleton className="h-10 w-[180px]" />
        </div>
      </div>

      {/* Results count skeleton */}
      <div className="mb-6">
        <Skeleton className="h-5 w-32" />
      </div>

      {/* Three column layout skeleton */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Property grid skeleton - spans 2 columns */}
        <div className="lg:col-span-2">
          <PropertyCardSkeletonGrid count={6} />
        </div>

        {/* Map skeleton */}
        <div className="hidden lg:block">
          <Skeleton className="h-[calc(100vh-120px)] w-full rounded-lg" />
        </div>
      </div>
    </main>
  );
}
