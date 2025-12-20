import { PropertyCardSkeleton } from "@/components/loading/property-card-skeleton";

export default function PropertiesLoading() {
    return (
        <div className="container py-8 space-y-8">
            <div className="space-y-4">
                <div className="h-10 w-48 bg-muted animate-pulse rounded-md" />
                <div className="h-4 w-full max-w-2xl bg-muted animate-pulse rounded-md" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <PropertyCardSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}
