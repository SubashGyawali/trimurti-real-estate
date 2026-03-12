import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, full_name, phone } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing user id" }, { status: 400 });
    }

    // Verify the caller is authenticated and matches the requested profile ID
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.id !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Use admin client only after verifying the caller owns this ID
    const adminSupabase = createAdminClient();

    const { error } = await adminSupabase
      .from("profiles")
      .upsert(
        { id, full_name: full_name ?? "", phone: phone ?? null } as never,
        { onConflict: "id" }
      );

    if (error) {
      console.error("Profile creation failed:", error);
      return NextResponse.json({ error: "Failed to create profile" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
