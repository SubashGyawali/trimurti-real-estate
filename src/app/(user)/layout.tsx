import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UserDashboardWrapper } from "@/components/layout/user-dashboard-wrapper";
import { env } from "@/lib/env";

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect to login if not authenticated
  if (!user) {
    redirect("/login");
  }

  // Fetch profile data
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single() as { data: any };

  // Calculate admin status: check profile.is_admin OR ADMIN_EMAIL match
  const isProfileAdmin = !!profile?.is_admin;
  const isAdminEmail = !!(env.NEXT_PUBLIC_ADMIN_EMAIL && user.email === env.NEXT_PUBLIC_ADMIN_EMAIL);
  const isAdmin = isProfileAdmin || isAdminEmail;

  return (
    <UserDashboardWrapper
      initialProfile={profile as any}
      initialEmail={user.email}
      initialIsAdmin={isAdmin}
    >
      {children}
    </UserDashboardWrapper>
  );
}
