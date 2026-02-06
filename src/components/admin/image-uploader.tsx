'use client';

import { useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Upload, X, Star, Loader2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { uploadPropertyImage, deletePropertyImage } from '@/lib/cloudinary/client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PropertyImage {
    id?: string; // Optional for new creates
    image_url: string;
    is_primary: boolean;
    display_order: number;
}

interface ImageUploaderProps {
    value: PropertyImage[];
    onChange: (value: PropertyImage[]) => void;
    disabled?: boolean;
    maxImages?: number;
}

export function ImageUploader({
    value,
    onChange,
    disabled = false,
    maxImages = 10
}: ImageUploaderProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            await processFiles(Array.from(e.target.files));
        }
        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) {
            setIsDragOver(true);
        }
    }, [disabled]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        if (disabled) return;

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            await processFiles(Array.from(e.dataTransfer.files));
        }
    }, [disabled]);

    const processFiles = async (files: File[]) => {
        if (value.length + files.length > maxImages) {
            toast.error(`You can only upload up to ${maxImages} images`);
            return;
        }

        setIsUploading(true);
        const newImages: PropertyImage[] = [];
        let uploadErrors = 0;

        for (const file of files) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error(`${file.name} is not an image`);
                continue;
            }

            // Validate file size (e.g. 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error(`${file.name} is too large (max 5MB)`);
                continue;
            }

            try {
                const publicUrl = await uploadPropertyImage(file);
                if (publicUrl) {
                    newImages.push({
                        image_url: publicUrl,
                        is_primary: value.length === 0 && newImages.length === 0, // First image is primary if list was empty
                        display_order: value.length + newImages.length,
                    });
                }
            } catch (error) {
                console.error('Upload failed', error);
                uploadErrors++;
            }
        }

        if (newImages.length > 0) {
            onChange([...value, ...newImages]);
            toast.success(`Uploaded ${newImages.length} images`);
        }

        if (uploadErrors > 0) {
            toast.error(`Failed to upload ${uploadErrors} images`);
        }

        setIsUploading(false);
    };

    const handleRemove = async (index: number) => {
        if (disabled) return;

        const imageToRemove = value[index];

        // Optimistic update
        const newValue = value.filter((_, i) => i !== index);

        // If we removed the primary image, make the first one primary
        if (imageToRemove.is_primary && newValue.length > 0) {
            newValue[0].is_primary = true;
        }

        // Reorder
        const reordered = newValue.map((img, i) => ({
            ...img,
            display_order: i
        }));

        onChange(reordered);

        // If it's a freshly uploaded image (or even if existing), we might want to delete from storage
        // BUT be careful: if this is an Edit form, maybe we only delete the DB record?
        // If the user hasn't saved the form yet, we should probably delete from storage to avoid orphans.
        // For now, let's delete from storage immediately.
        // In a production app, we might soft-delete or use a cron job for cleanup.

        try {
            await deletePropertyImage(imageToRemove.image_url);
        } catch (error) {
            console.error('Failed to delete image from storage', error);
            toast.error('Failed to delete image file from storage, but removed from list');
        }
    };

    const handleSetPrimary = (index: number) => {
        if (disabled) return;

        const newValue = value.map((img, i) => ({
            ...img,
            is_primary: i === index
        }));

        onChange(newValue);
    };

    return (
        <div className="space-y-4">
            <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                    "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors relative",
                    isDragOver ? "border-primary bg-primary/10" : "border-muted-foreground/25 hover:border-primary",
                    disabled && "opacity-50 cursor-not-allowed",
                    isUploading && "pointer-events-none"
                )}
            >
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    ref={fileInputRef}
                    disabled={disabled || isUploading}
                    onChange={handleFileSelect}
                />

                <div className="flex flex-col items-center justify-center gap-2">
                    {isUploading ? (
                        <>
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Uploading...</p>
                        </>
                    ) : (
                        <>
                            <Upload className="h-8 w-8 text-muted-foreground" />
                            <p className="font-medium text-sm">Click to upload or drag & drop</p>
                            <p className="text-xs text-muted-foreground">
                                SVG, PNG, JPG or WEBP (max {maxImages} images)
                            </p>
                        </>
                    )}
                </div>
            </div>

            {value.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {value.map((image, index) => (
                        <div key={image.image_url} className="group relative aspect-square rounded-md overflow-hidden border bg-background">
                            <Image
                                src={image.image_url}
                                alt={`Property image ${index + 1}`}
                                fill
                                sizes="(max-width: 768px) 50vw, 25vw"
                                className="object-cover"
                            />

                            {/* Overlay Overlay */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <Button
                                    type="button"
                                    size="icon"
                                    variant={image.is_primary ? "default" : "secondary"}
                                    className="h-8 w-8"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleSetPrimary(index);
                                    }}
                                    title="Set as Primary"
                                >
                                    <Star className={cn("h-4 w-4", image.is_primary && "fill-current")} />
                                </Button>

                                <Button
                                    type="button"
                                    size="icon"
                                    variant="destructive"
                                    className="h-8 w-8"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemove(index);
                                    }}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            {image.is_primary && (
                                <div className="absolute top-2 left-2">
                                    <Badge variant="default" className="text-[10px] px-1.5 h-5">
                                        Primary
                                    </Badge>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
