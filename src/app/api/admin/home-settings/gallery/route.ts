import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyAdmin } from "@/lib/supabase/verify-admin";
import { DEFAULT_BUILDING_IMAGES, type BuildingImage } from "@/lib/data/building-images";
import type { HomeGalleryImageInsert } from "@/types/database";

export async function GET() {
  const supabase = await createClient();

  // Verify admin access
  const authCheck = await verifyAdmin(supabase);
  if ("error" in authCheck) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
  }

  const { data, error } = await supabase
    .from("home_gallery_images")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) {
    // If the table doesn't exist yet or has error, return default images with fallback IDs
    return NextResponse.json(
      DEFAULT_BUILDING_IMAGES.map((img, idx) => ({
        ...img,
        id: `default-${idx}`,
      }))
    );
  }

  // If table is empty, return default images
  if (!data || data.length === 0) {
    return NextResponse.json(
      DEFAULT_BUILDING_IMAGES.map((img, idx) => ({
        ...img,
        id: `default-${idx}`,
      }))
    );
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();

  // Verify admin access
  const authCheck = await verifyAdmin(supabase);
  if ("error" in authCheck) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
  }

  try {
    const body = await request.json();

    // Check if table is currently empty; if so, populate defaults first so adding one image doesn't erase existing ones
    const { count } = await supabase
      .from("home_gallery_images")
      .select("id", { count: "exact", head: true });

    if (count === 0) {
      // Seed default images first
      const defaultInserts: HomeGalleryImageInsert[] = DEFAULT_BUILDING_IMAGES.map((img, i) => ({
        src: img.src,
        alt: img.alt,
        display_order: i,
        is_active: true,
      }));
      await supabase.from("home_gallery_images").insert(defaultInserts as never);
    }

    // Support single object or array of objects
    const itemsToAdd = Array.isArray(body) ? body : [body];

    // Find the current highest display_order
    const { data: maxOrderData } = await supabase
      .from("home_gallery_images")
      .select("display_order")
      .order("display_order", { ascending: false })
      .limit(1);

    const firstItem = maxOrderData?.[0] as { display_order: number } | undefined;
    const startOrder = (firstItem?.display_order ?? -1) + 1;

    const newRecords: HomeGalleryImageInsert[] = itemsToAdd.map((item, index) => ({
      src: item.src,
      alt: item.alt || "Trimurti Real Estate Property",
      display_order: item.display_order !== undefined ? item.display_order : startOrder + index,
      is_active: item.is_active !== undefined ? item.is_active : true,
    }));

    const { data: inserted, error } = await supabase
      .from("home_gallery_images")
      .insert(newRecords as never)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidatePath("/");
    return NextResponse.json(inserted, { status: 201 });
  } catch (err) {
    console.error("Error adding gallery image:", err);
    return NextResponse.json({ error: "Failed to add image" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const supabase = await createClient();

  // Verify admin access
  const authCheck = await verifyAdmin(supabase);
  if ("error" in authCheck) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
  }

  try {
    const body = await request.json();
    const images: BuildingImage[] = Array.isArray(body) ? body : body.images;

    if (!Array.isArray(images)) {
      return NextResponse.json({ error: "Invalid images array" }, { status: 400 });
    }

    // If existing rows have synthetic default IDs (e.g. default-0), we perform a full sync/replace
    const hasDefaultIds = images.some((img) => !img.id || img.id.startsWith("default-"));

    if (hasDefaultIds) {
      // Clear existing records and re-insert all
      await supabase.from("home_gallery_images").delete().neq("id", "00000000-0000-0000-0000-000000000000");

      const insertRows: HomeGalleryImageInsert[] = images.map((img, index) => ({
        src: img.src,
        alt: img.alt || "",
        display_order: index,
        is_active: img.is_active !== undefined ? img.is_active : true,
      }));

      const { data, error } = await supabase
        .from("home_gallery_images")
        .insert(insertRows as never)
        .select();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      revalidatePath("/");
      return NextResponse.json(data);
    }

    // Otherwise, update the images that remain and delete rows that were
    // removed in the admin UI. Previously this only updated submitted rows,
    // so omitted rows were returned by the final select and appeared again.
    const { data: existingImages, error: existingImagesError } = await supabase
      .from("home_gallery_images")
      .select("id");

    if (existingImagesError) {
      return NextResponse.json({ error: existingImagesError.message }, { status: 500 });
    }

    const submittedIds = new Set(
      images.map((image) => image.id).filter((id): id is string => Boolean(id))
    );
    const removedIds = ((existingImages ?? []) as { id: string }[])
      .map((image) => image.id)
      .filter((id) => !submittedIds.has(id));

    if (removedIds.length > 0) {
      const { error: deleteError } = await supabase
        .from("home_gallery_images")
        .delete()
        .in("id", removedIds);

      if (deleteError) {
        return NextResponse.json({ error: deleteError.message }, { status: 500 });
      }
    }

    // Update all remaining images and preserve their new order.
    for (let index = 0; index < images.length; index++) {
      const img = images[index];
      if (img.id) {
        const { error: updateError } = await supabase
          .from("home_gallery_images")
          .update({
            alt: img.alt,
            display_order: index,
            is_active: img.is_active,
          } as never)
          .eq("id", img.id);

        if (updateError) {
          return NextResponse.json({ error: updateError.message }, { status: 500 });
        }
      }
    }

    // Fetch refreshed list
    const { data: updated, error } = await supabase
      .from("home_gallery_images")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidatePath("/");
    return NextResponse.json(updated);
  } catch (err) {
    console.error("Error updating gallery images:", err);
    return NextResponse.json({ error: "Failed to update images" }, { status: 500 });
  }
}
