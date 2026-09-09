import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyAdmin } from "@/lib/supabase/verify-admin";
import type { HomeGalleryImageUpdate } from "@/types/database";

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const { id } = params;

  const supabase = await createClient();

  const authCheck = await verifyAdmin(supabase);
  if ("error" in authCheck) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
  }

  // If synthetic default ID, nothing in DB to delete directly
  if (id.startsWith("default-")) {
    return NextResponse.json({ success: true });
  }

  const { error } = await supabase
    .from("home_gallery_images")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath("/");
  return NextResponse.json({ success: true });
}

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const { id } = params;

  const supabase = await createClient();

  const authCheck = await verifyAdmin(supabase);
  if ("error" in authCheck) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
  }

  try {
    const body = await request.json();
    const { alt, is_active, display_order } = body;

    const updates: HomeGalleryImageUpdate = {};
    if (alt !== undefined) updates.alt = alt;
    if (is_active !== undefined) updates.is_active = is_active;
    if (display_order !== undefined) updates.display_order = display_order;

    const { data, error } = await supabase
      .from("home_gallery_images")
      .update(updates as never)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidatePath("/");
    return NextResponse.json(data);
  } catch (err) {
    console.error("Error patching gallery image:", err);
    return NextResponse.json({ error: "Failed to patch image" }, { status: 500 });
  }
}
