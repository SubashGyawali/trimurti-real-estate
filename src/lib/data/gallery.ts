// src/lib/data/gallery.ts
// Server-side fetching for home page gallery images

import { createClient } from "@/lib/supabase/server";
import {
  DEFAULT_BUILDING_IMAGES,
  type BuildingImage,
} from "@/lib/data/building-images";

/**
 * Fetches active images for the public home page hero carousel and background banner.
 * Gracefully falls back to DEFAULT_BUILDING_IMAGES if the table is empty or doesn't exist yet.
 */
export async function getHomeGalleryImages(): Promise<BuildingImage[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("home_gallery_images")
      .select("id, src, alt, display_order, is_active")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) {
      console.warn("Could not fetch home_gallery_images, using fallback:", error.message);
      return DEFAULT_BUILDING_IMAGES;
    }

    if (!data || data.length === 0) {
      return DEFAULT_BUILDING_IMAGES;
    }

    return data as BuildingImage[];
  } catch (err) {
    console.warn("Unexpected error fetching home_gallery_images, using fallback:", err);
    return DEFAULT_BUILDING_IMAGES;
  }
}

/**
 * Fetches all gallery images (including inactive) for admin management.
 * Returns default images with mock IDs if the database table is empty or not yet created.
 */
export async function getAllAdminGalleryImages(): Promise<BuildingImage[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("home_gallery_images")
      .select("id, src, alt, display_order, is_active")
      .order("display_order", { ascending: true });

    if (error) {
      console.warn("Could not fetch admin home_gallery_images:", error.message);
      return DEFAULT_BUILDING_IMAGES.map((img, idx) => ({
        ...img,
        id: `default-${idx}`,
      }));
    }

    if (!data || data.length === 0) {
      return DEFAULT_BUILDING_IMAGES.map((img, idx) => ({
        ...img,
        id: `default-${idx}`,
      }));
    }

    return data as BuildingImage[];
  } catch (err) {
    console.warn("Error fetching admin home_gallery_images:", err);
    return DEFAULT_BUILDING_IMAGES.map((img, idx) => ({
      ...img,
      id: `default-${idx}`,
    }));
  }
}
