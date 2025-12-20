import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { profileSchema } from "@/lib/validations/profile";
import type { ProfileUpdate } from "@/types";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Validate request body
    const validated = profileSchema.parse(body);

    // Prepare update data
    const updateData: ProfileUpdate = {
      full_name: validated.full_name,
      phone: validated.phone || null,
    };

    // Update profile
    const { data: profile, error } = await supabase
      .from("profiles")
      .update(updateData as never)
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      throw new Error("Failed to update profile");
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      profile,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstIssue = error.issues?.[0];
      return NextResponse.json(
        { success: false, error: firstIssue?.message || "Validation failed" },
        { status: 400 }
      );
    }

    console.error("API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update profile. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch profile
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Supabase error:", error);
      throw new Error("Failed to fetch profile");
    }

    return NextResponse.json({
      success: true,
      profile,
      email: user.email,
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
