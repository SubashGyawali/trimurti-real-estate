import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyAdmin } from "@/lib/supabase/verify-admin";
import { DEFAULT_BUILDING_IMAGES } from "@/lib/data/building-images";
import type { HomeGalleryImageInsert } from "@/types/database";

export async function POST() {
  const supabase = await createClient();

  const authCheck = await verifyAdmin(supabase);
  if ("error" in authCheck) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
  }

  try {
    // Delete all current records
    await supabase
      .from("home_gallery_images")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    // Re-seed default images
    const insertRows: HomeGalleryImageInsert[] = DEFAULT_BUILDING_IMAGES.map((img, index) => ({
      src: img.src,
      alt: img.alt,
      display_order: index,
      is_active: true,
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
  } catch (err) {
    console.error("Error resetting gallery images:", err);
    return NextResponse.json({ error: "Failed to reset images" }, { status: 500 });
  }
}
