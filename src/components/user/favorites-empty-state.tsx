import { Heart } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

interface FavoritesEmptyStateProps {
  className?: string;
}

export function FavoritesEmptyState({ className }: FavoritesEmptyStateProps) {
  return (
    <EmptyState
      icon={Heart}
      title="No saved properties"
      description="You haven't saved any properties yet. Browse our listings and click the heart icon to save properties you're interested in."
      actionLabel="Browse Properties"
      actionHref="/properties"
      className={className}
    />
  );
}
