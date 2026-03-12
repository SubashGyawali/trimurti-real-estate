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

  const isProfileAdmin = !!profile?.is_admin;
  const adminEmail = process.env.ADMIN_EMAIL;
  const isEnvAdmin =
    !!adminEmail && user.email?.toLowerCase() === adminEmail.toLowerCase();

  if (!isProfileAdmin && !isEnvAdmin) return { error: "Forbidden", status: 403 };
  return { user, profile: { is_admin: true } };
}
