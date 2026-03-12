import type { SupabaseClient } from "@supabase/supabase-js";

export type AdminAuthResult =
  | { error: string; status: number }
  | { user: { id: string; email?: string }; profile: { is_admin: boolean } };

export async function verifyAdmin(
  supabase: SupabaseClient
): Promise<AdminAuthResult> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized", status: 401 };

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) return { error: "Forbidden", status: 403 };
  return { user, profile };
}
