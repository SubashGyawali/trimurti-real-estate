"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AuthPrompt } from "@/components/auth/auth-prompt";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { UserFavoriteInsert } from "@/types";

interface FavoriteButtonProps {
  propertyId: string;
  isFavorited?: boolean;
  variant?: "icon" | "button";
  className?: string;
}

export function FavoriteButton({
  propertyId,
  isFavorited = false,
  variant = "icon",
  className,
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(isFavorited);
  const [isPending, startTransition] = useTransition();
  const [isAuthPromptOpen, setIsAuthPromptOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const search = searchParams.toString();
  const returnPath = `${pathname}${search ? `?${search}` : ""}`;

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if user is logged in
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setIsAuthPromptOpen(true);
      return;
    }

    // Optimistic update
    const wasIsFavorite = isFavorite;
    setIsFavorite(!isFavorite);

    startTransition(async () => {
      try {
        if (wasIsFavorite) {
          // Remove from favorites
          const { error } = await supabase
            .from("user_favorites")
            .delete()
            .eq("user_id", user.id)
            .eq("property_id", propertyId);

          if (error) throw error;
          toast.success("Removed from favorites");
        } else {
          // Add to favorites
          const insertData: UserFavoriteInsert = {
            user_id: user.id,
            property_id: propertyId,
          };
          const { error } = await supabase
            .from("user_favorites")
            .insert(insertData as never);

          if (error) throw error;
          toast.success("Added to favorites");
        }

        router.refresh();
      } catch {
        // Revert optimistic update on error
        setIsFavorite(wasIsFavorite);
        toast.error("Something went wrong. Please try again.");
      }
    });
  };

  if (variant === "button") {
    return (
      <>
        <Button
          variant={isFavorite ? "default" : "outline"}
          size="sm"
          onClick={handleToggleFavorite}
          disabled={isPending}
          className={cn(
            isFavorite && "bg-red-500 hover:bg-red-600",
            className
          )}
        >
          <Heart
            className={cn(
              "mr-2 h-4 w-4",
              isFavorite && "fill-current"
            )}
          />
          {isFavorite ? "Saved" : "Save"}
        </Button>
        <AuthPrompt
          open={isAuthPromptOpen}
          onOpenChange={setIsAuthPromptOpen}
          returnPath={returnPath}
        />
      </>
    );
  }

  return (
    <>
      <button
        onClick={handleToggleFavorite}
        disabled={isPending}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full",
          "bg-white/90 shadow-md backdrop-blur-sm",
          "transition-all duration-200",
          "hover:scale-110 hover:bg-white",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        <Heart
          className={cn(
            "h-5 w-5 transition-colors",
            isFavorite
              ? "fill-red-500 text-red-500"
              : "text-gray-600 hover:text-red-500"
          )}
        />
      </button>
      <AuthPrompt
        open={isAuthPromptOpen}
        onOpenChange={setIsAuthPromptOpen}
        returnPath={returnPath}
      />
    </>
  );
}
