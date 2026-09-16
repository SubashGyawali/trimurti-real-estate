"use client";

import { useState, useRef, useTransition } from "react";
import Image from "next/image";
import {
  Upload,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Eye,
  RotateCcw,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Sparkles,
  Layers,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { uploadPropertyImage } from "@/lib/cloudinary/client";
import { cn } from "@/lib/utils";
import type { BuildingImage } from "@/lib/data/building-images";

interface HomeSettingsClientProps {
  initialImages: BuildingImage[];
}

export function HomeSettingsClient({ initialImages }: HomeSettingsClientProps) {
  const [images, setImages] = useState<BuildingImage[]>(initialImages);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Manual URL Add form state
  const [newUrl, setNewUrl] = useState("");
  const [newAlt, setNewAlt] = useState("");
  const [urlAddError, setUrlAddError] = useState("");

  // Preview index for mini hero preview
  const [previewIndex, setPreviewIndex] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeImages = images.filter((img) => img.is_active !== false);

  // Handle reordering: move up/left
  const handleMove = (index: number, direction: "prev" | "next") => {
    const targetIndex = direction === "prev" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const updated = [...images];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // Recalculate display_order
    const reordered = updated.map((img, idx) => ({
      ...img,
      display_order: idx,
    }));

    setImages(reordered);
    setHasChanges(true);
  };

  // Toggle image active/inactive
  const handleToggleActive = (index: number) => {
    const updated = [...images];
    const current = updated[index];
    updated[index] = {
      ...current,
      is_active: current.is_active === false ? true : false,
    };
    setImages(updated);
    setHasChanges(true);
  };

  // Update alt text
  const handleAltChange = (index: number, alt: string) => {
    const updated = [...images];
    updated[index] = {
      ...updated[index],
      alt,
    };
    setImages(updated);
    setHasChanges(true);
  };

  // Remove image
  const handleRemove = (index: number) => {
    const removedImage = images[index];
    const filtered = images.filter((_, idx) => idx !== index);
    const reordered = filtered.map((img, idx) => ({
      ...img,
      display_order: idx,
    }));
    setImages(reordered);
    setHasChanges(true);
    toast.info(`Removed "${removedImage.alt || "image"}" from gallery`);
  };

  // Handle file uploads (Cloudinary)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const uploadedImages: BuildingImage[] = [];
    let errors = 0;

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image file`);
        continue;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds maximum 5MB size`);
        continue;
      }

      try {
        const publicUrl = await uploadPropertyImage(file);
        if (publicUrl) {
          // Generate a user-friendly default alt text from filename
          const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
          uploadedImages.push({
            src: publicUrl,
            alt: `${cleanName} - Trimurti Real Estate`,
            display_order: images.length + uploadedImages.length,
            is_active: true,
          });
        }
      } catch (err: any) {
        console.error("Upload error:", err);
        errors++;
      }
    }

    if (uploadedImages.length > 0) {
      setImages((prev) => [...prev, ...uploadedImages]);
      setHasChanges(true);
      toast.success(`Successfully uploaded ${uploadedImages.length} image(s). Remember to save changes!`);
    }

    if (errors > 0) {
      toast.error(`Failed to upload ${errors} file(s).`);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setIsUploading(false);
  };

  // Add custom URL
  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    setUrlAddError("");

    const trimmedUrl = newUrl.trim();
    if (!trimmedUrl) {
      setUrlAddError("Please enter an image URL");
      return;
    }

    const newImage: BuildingImage = {
      src: trimmedUrl,
      alt: newAlt.trim() || "Trimurti Real Estate Property",
      display_order: images.length,
      is_active: true,
    };

    setImages((prev) => [...prev, newImage]);
    setNewUrl("");
    setNewAlt("");
    setHasChanges(true);
    toast.success("Image added to gallery. Remember to click Save Changes!");
  };

  // Save all changes to API
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/home-settings/gallery", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save changes");
      }

      const updated = await res.json();
      if (Array.isArray(updated)) {
        setImages(updated);
      }
      setHasChanges(false);
      toast.success("Gallery settings saved successfully! The homepage is now updated.");
    } catch (err: any) {
      toast.error(err.message || "Failed to save gallery changes");
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to default building images
  const handleResetToDefaults = async () => {
    setIsResetting(true);
    try {
      const res = await fetch("/api/admin/home-settings/gallery/reset", {
        method: "POST",
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to reset gallery");
      }

      const defaults = await res.json();
      if (Array.isArray(defaults)) {
        setImages(defaults);
      }
      setHasChanges(false);
      toast.success("Gallery reset to original building photos!");
    } catch (err: any) {
      toast.error(err.message || "Failed to reset gallery");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Home Page Settings
            </h1>
            <Badge variant="outline" className="text-xs">
              Hero Gallery
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage the rotating building photos shown on the homepage hero section and CTA banners.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Reset button with confirmation */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-muted-foreground hover:text-foreground"
                disabled={isResetting || isSaving}
              >
                {isResetting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RotateCcw className="h-4 w-4" />
                )}
                Reset to Defaults
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset to Default Building Photos?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will restore the original 20 local building photos (Avarai Abrol, Bhoomi Park, Royal Oasis, etc.) and overwrite your current gallery configuration.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleResetToDefaults}>
                  Yes, Reset Gallery
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Save changes button */}
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className={cn(
              "gap-2 font-medium shadow-sm transition-all",
              hasChanges
                ? "bg-[#1e3a5f] text-white hover:bg-[#1e3a5f]/90 ring-2 ring-[#1e3a5f]/20"
                : "bg-muted text-muted-foreground hover:bg-muted"
            )}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {hasChanges ? "Save Changes *" : "Saved"}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Overview Stats & Notice */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium uppercase tracking-wider">
              Total Images
            </CardDescription>
            <CardTitle className="text-3xl font-bold">{images.length}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Total photos configured in gallery
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium uppercase tracking-wider">
              Active in Rotation
            </CardDescription>
            <CardTitle className="text-3xl font-bold text-emerald-600">
              {activeImages.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Photos actively cycling in hero every 10s
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-medium uppercase tracking-wider">
              Status
            </CardDescription>
            <CardTitle className="flex items-center gap-2 text-xl font-semibold">
              {hasChanges ? (
                <span className="flex items-center gap-1.5 text-amber-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  Unsaved changes
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-emerald-600 text-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  Live &amp; Synced
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {hasChanges ? "Remember to click Save Changes" : "Homepage reflects these images"}
          </CardContent>
        </Card>
      </div>

      {/* Add Images Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Upload Card */}
        <Card className="border-dashed border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Upload className="h-4 w-4 text-[#1e3a5f]" />
              Upload Photos from Computer
            </CardTitle>
            <CardDescription>
              Upload high-quality property or building photos to Cloudinary.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center cursor-pointer transition-colors",
                "border-muted-foreground/25 hover:border-primary hover:bg-muted/40",
                isUploading && "opacity-60 pointer-events-none"
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
              {isUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm font-medium">Uploading to Cloudinary...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Click to choose image files</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      JPG, PNG, or WebP up to 5MB each. Multiple files supported.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Add by URL Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Plus className="h-4 w-4 text-[#1e3a5f]" />
              Add Image by URL or Path
            </CardTitle>
            <CardDescription>
              Reference an existing local path (e.g., <code className="text-xs bg-muted px-1 py-0.5 rounded">/Building Images/...</code>) or external image URL.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddUrl} className="space-y-3">
              <div>
                <Input
                  placeholder="/Building Images/MyBuilding.JPG or https://..."
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="font-mono text-xs"
                />
                {urlAddError && (
                  <p className="mt-1 text-xs text-destructive">{urlAddError}</p>
                )}
              </div>
              <div>
                <Input
                  placeholder="Alt / caption text (e.g., Royal Oasis Swimming Pool)"
                  value={newAlt}
                  onChange={(e) => setNewAlt(e.target.value)}
                  className="text-xs"
                />
              </div>
              <Button type="submit" size="sm" className="w-full gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                Add to Gallery
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Live Preview Box */}
      {activeImages.length > 0 && (
        <Card className="overflow-hidden bg-[#0a1628] text-white border-0 shadow-lg">
          <div className="p-4 flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-[#d4a853]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-white/80">
                Live Hero Carousel Preview ({activeImages.length} active images)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-white/70 hover:text-white hover:bg-white/10"
                onClick={() =>
                  setPreviewIndex((prev) => (prev - 1 + activeImages.length) % activeImages.length)
                }
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs text-white/60 min-w-[3rem] text-center">
                {previewIndex + 1} / {activeImages.length}
              </span>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-white/70 hover:text-white hover:bg-white/10"
                onClick={() =>
                  setPreviewIndex((prev) => (prev + 1) % activeImages.length)
                }
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="relative h-48 md:h-64 w-full bg-slate-900">
            {activeImages[previewIndex] && (
              <>
                <Image
                  src={activeImages[previewIndex].src}
                  alt={activeImages[previewIndex].alt}
                  fill
                  className="object-cover object-center transition-all duration-500"
                  unoptimized={activeImages[previewIndex].src.startsWith("http")}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628]/85 via-[#0a1628]/40 to-transparent" />
                <div className="absolute bottom-4 left-6 max-w-md">
                  <Badge className="bg-[#d4a853] text-black font-semibold text-[10px] mb-1 hover:bg-[#d4a853]">
                    Previewing Image #{previewIndex + 1}
                  </Badge>
                  <p className="text-sm font-semibold text-white drop-shadow">
                    {activeImages[previewIndex].alt}
                  </p>
                  <p className="text-[11px] text-white/60 truncate font-mono mt-0.5">
                    {activeImages[previewIndex].src}
                  </p>
                </div>
              </>
            )}
          </div>
        </Card>
      )}

      {/* Gallery Image List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-[#1e3a5f]" />
            <h2 className="text-lg font-semibold tracking-tight">
              Rotating Gallery Images ({images.length})
            </h2>
          </div>
          <p className="text-xs text-muted-foreground hidden sm:block">
            Use arrows to reorder. Toggle checkbox to include or exclude from rotation.
          </p>
        </div>

        {images.length === 0 ? (
          <Card className="p-12 text-center border-dashed">
            <ImageIcon className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
            <h3 className="text-sm font-medium">No images in gallery</h3>
            <p className="text-xs text-muted-foreground mt-1 mb-4">
              Add photos or click "Reset to Defaults" to restore original images.
            </p>
            <Button size="sm" onClick={handleResetToDefaults} variant="outline">
              Restore Default Images
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {images.map((image, index) => {
              const isActive = image.is_active !== false;
              const isFirst = index === 0;
              const isLast = index === images.length - 1;

              return (
                <div
                  key={image.id || `${image.src}-${index}`}
                  className={cn(
                    "group relative flex flex-col rounded-xl border bg-card transition-all overflow-hidden shadow-sm",
                    isActive ? "border-border" : "border-dashed opacity-60 bg-muted/20"
                  )}
                >
                  {/* Thumbnail Image Container */}
                  <div className="relative aspect-[16/10] w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <Image
                      src={image.src}
                      alt={image.alt || `Gallery image ${index + 1}`}
                      fill
                      className={cn(
                        "object-cover transition-transform duration-300 group-hover:scale-105",
                        !isActive && "grayscale"
                      )}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      unoptimized={image.src.startsWith("http")}
                    />

                    {/* Order Badge */}
                    <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black/75 text-[11px] font-bold text-white shadow">
                        {index + 1}
                      </span>
                      {isActive ? (
                        <Badge className="bg-emerald-500/90 text-[10px] text-white px-1.5 py-0 h-5">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                          Paused
                        </Badge>
                      )}
                    </div>

                    {/* Reorder / Action Overlay Buttons */}
                    <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
                      <Button
                        type="button"
                        size="icon"
                        variant="secondary"
                        className="h-7 w-7 bg-white/90 text-black hover:bg-white shadow"
                        disabled={isFirst}
                        onClick={() => handleMove(index, "prev")}
                        title="Move Earlier in Sequence"
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="secondary"
                        className="h-7 w-7 bg-white/90 text-black hover:bg-white shadow"
                        disabled={isLast}
                        onClick={() => handleMove(index, "next")}
                        title="Move Later in Sequence"
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    {/* Open full source link */}
                    <a
                      href={image.src}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute bottom-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors z-10"
                      title="Open image in new tab"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>

                  {/* Image Details & Controls */}
                  <div className="p-3 flex-1 flex flex-col justify-between gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-muted-foreground flex items-center justify-between">
                        <span>Alt Text / Caption</span>
                        <span className="text-[10px] text-muted-foreground/70">
                          {image.src.startsWith("http") ? "Cloudinary" : "Local"}
                        </span>
                      </label>
                      <Input
                        value={image.alt}
                        onChange={(e) => handleAltChange(index, e.target.value)}
                        placeholder="Describe building or feature..."
                        className="h-8 text-xs font-normal"
                      />
                      <p className="text-[10px] text-muted-foreground truncate font-mono" title={image.src}>
                        {image.src}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t text-xs">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isActive}
                          onChange={() => handleToggleActive(index)}
                          className="rounded border-gray-300 text-[#1e3a5f] focus:ring-[#1e3a5f] h-3.5 w-3.5"
                        />
                        <span className="text-xs font-medium">
                          {isActive ? "Active" : "Excluded"}
                        </span>
                      </label>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleRemove(index)}
                        title="Remove image from gallery"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Save Reminder Bar */}
      {hasChanges && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border bg-card p-3 shadow-xl animate-in slide-in-from-bottom-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-status-warning animate-pulse" />
            <span className="text-xs font-medium">You have unsaved changes</span>
          </div>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="gap-1.5 bg-brand-blue text-white hover:bg-brand-blue/90 text-xs"
          >
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Save Now
          </Button>
        </div>
      )}
    </div>
  );
}
