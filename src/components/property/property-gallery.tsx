"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Expand } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PropertyImage } from "@/types";

const PLACEHOLDER_IMAGE = "/images/property-placeholder.jpg";

interface PropertyGalleryProps {
  images: PropertyImage[];
  propertyTitle: string;
  className?: string;
}

export function PropertyGallery({
  images,
  propertyTitle,
  className,
}: PropertyGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sort images by primary first, then display_order
  const sortedImages = useMemo(() => {
    if (!images || images.length === 0) {
      return [];
    }
    return [...images].sort((a, b) => {
      if (a.is_primary && !b.is_primary) return -1;
      if (!a.is_primary && b.is_primary) return 1;
      return a.display_order - b.display_order;
    });
  }, [images]);

  const hasImages = sortedImages.length > 0;
  const currentImage = hasImages
    ? sortedImages[selectedIndex]?.image_url
    : PLACEHOLDER_IMAGE;

  // Keyboard navigation for modal
  useEffect(() => {
    if (!isModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        goToPrevious();
      } else if (e.key === "ArrowRight") {
        goToNext();
      } else if (e.key === "Escape") {
        setIsModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, selectedIndex, sortedImages.length]);

  const goToPrevious = useCallback(() => {
    setSelectedIndex((prev) =>
      prev === 0 ? sortedImages.length - 1 : prev - 1
    );
  }, [sortedImages.length]);

  const goToNext = useCallback(() => {
    setSelectedIndex((prev) =>
      prev === sortedImages.length - 1 ? 0 : prev + 1
    );
  }, [sortedImages.length]);

  return (
    <div className={cn("space-y-3", className)}>
      {/* Main Image */}
      <div className="relative overflow-hidden rounded-lg">
        <AspectRatio ratio={16 / 9}>
          <Image
            src={currentImage}
            alt={`${propertyTitle} - Image ${selectedIndex + 1}`}
            fill
            className="cursor-pointer object-cover transition-transform duration-300 hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 800px"
            priority
            onClick={() => hasImages && setIsModalOpen(true)}
          />
        </AspectRatio>

        {/* Expand button */}
        {hasImages && (
          <Button
            variant="secondary"
            size="icon"
            className="absolute bottom-3 right-3 h-9 w-9 bg-black/60 text-white hover:bg-black/80"
            onClick={() => setIsModalOpen(true)}
            aria-label="View fullscreen"
          >
            <Expand className="h-4 w-4" />
          </Button>
        )}

        {/* Image counter */}
        {sortedImages.length > 1 && (
          <div className="absolute bottom-3 left-3 rounded-md bg-black/60 px-2 py-1 text-sm text-white">
            {selectedIndex + 1} / {sortedImages.length}
          </div>
        )}

        {/* Navigation arrows on main image */}
        {sortedImages.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-3 top-1/2 h-9 w-9 -translate-y-1/2 bg-black/60 text-white hover:bg-black/80"
              onClick={goToPrevious}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-3 top-1/2 h-9 w-9 -translate-y-1/2 bg-black/60 text-white hover:bg-black/80"
              onClick={goToNext}
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}
      </div>

      {/* Thumbnail Strip */}
      {sortedImages.length > 1 && (
        <div className="flex w-full gap-2 overflow-x-auto pb-2">
          {sortedImages.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "relative h-16 w-24 shrink-0 overflow-hidden rounded-md transition-all",
                selectedIndex === index
                  ? "ring-2 ring-primary ring-offset-2"
                  : "opacity-70 hover:opacity-100"
              )}
              aria-label={`View image ${index + 1}`}
              aria-current={selectedIndex === index}
            >
              <Image
                src={image.image_url}
                alt={`${propertyTitle} - Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="96px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-h-[95vh] max-w-[95vw] border-none bg-black/95 p-0 sm:max-w-[95vw]">
          <DialogTitle className="sr-only">
            {propertyTitle} - Image Gallery
          </DialogTitle>

          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 z-50 h-10 w-10 rounded-full bg-black/50 text-white hover:bg-black/70"
            onClick={() => setIsModalOpen(false)}
            aria-label="Close gallery"
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Main image in modal */}
          <div className="relative flex h-[80vh] items-center justify-center">
            <Image
              src={currentImage}
              alt={`${propertyTitle} - Image ${selectedIndex + 1}`}
              fill
              className="object-contain"
              sizes="95vw"
              priority
            />

            {/* Navigation in modal */}
            {sortedImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 h-12 w-12 rounded-full bg-black/50 text-white hover:bg-black/70"
                  onClick={goToPrevious}
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 h-12 w-12 rounded-full bg-black/50 text-white hover:bg-black/70"
                  onClick={goToNext}
                  aria-label="Next image"
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              </>
            )}
          </div>

          {/* Image counter in modal */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-2 text-white">
            {selectedIndex + 1} / {sortedImages.length}
          </div>

          {/* Thumbnail strip in modal */}
          {sortedImages.length > 1 && (
            <div className="absolute bottom-16 left-1/2 flex max-w-[90vw] -translate-x-1/2 gap-2 overflow-x-auto rounded-lg bg-black/60 p-2">
              {sortedImages.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedIndex(index)}
                  className={cn(
                    "relative h-12 w-16 shrink-0 overflow-hidden rounded transition-all",
                    selectedIndex === index
                      ? "ring-2 ring-white"
                      : "opacity-50 hover:opacity-100"
                  )}
                  aria-label={`View image ${index + 1}`}
                >
                  <Image
                    src={image.image_url}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
