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

      {/* Two column layout skeleton */}
      <div className="grid gap-6 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_450px]">
        {/* Property grid skeleton */}
        <div>
          <PropertyCardSkeletonGrid count={6} className="sm:grid-cols-2" />
        </div>

        {/* Map skeleton */}
        <div className="hidden lg:block">
          <Skeleton className="h-[calc(100vh-120px)] w-full rounded-lg" />
        </div>
      </div>
    </main>
  );
}
