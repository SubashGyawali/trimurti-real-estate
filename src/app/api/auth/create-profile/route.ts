import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, full_name, phone } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing user id" }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { error } = await supabase
      .from("profiles")
      .upsert(
        { id, full_name: full_name ?? "", phone: phone ?? null } as any,
        { onConflict: "id" }
      );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
