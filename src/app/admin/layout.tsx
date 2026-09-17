import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminLayoutClient from "@/components/layout/admin-layout-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin - Trimurti Real Estate",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/admin");

  const { data: profile } = (await (supabase.from("profiles") as unknown as ReturnType<typeof supabase.from>)
    .select("is_admin")
    .eq("id", user.id)
    .single()) as unknown as { data: { is_admin: boolean | null } | null };

  const adminEmail = process.env.ADMIN_EMAIL;
  const isProfileAdmin = !!profile?.is_admin;
  const isEnvAdmin = !!(adminEmail && user.email?.toLowerCase() === adminEmail.toLowerCase());

  if (!isProfileAdmin && !isEnvAdmin) redirect("/");

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
