import { Skeleton } from "@/components/ui/skeleton";

export function PropertyCardSkeleton() {
    return (
        <div className="flex flex-col overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="relative aspect-[4/3] w-full overflow-hidden">
                <Skeleton className="h-full w-full" />
            </div>
            <div className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex items-center gap-2 pt-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex items-center justify-between pt-2">
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-9 w-24 rounded-md" />
                </div>
            </div>
        </div>
    );
}
