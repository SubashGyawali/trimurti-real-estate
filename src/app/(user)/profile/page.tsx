import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/user/profile-form";

// Force dynamic rendering for user-specific content
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Profile | Trimurti Real Estate",
  description: "Manage your profile settings",
};

export default async function ProfilePage() {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch profile data
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user?.id || "")
    .single();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold md:text-3xl">My Profile</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your account settings
        </p>
      </div>

      <div className="max-w-2xl">
        <ProfileForm profile={profile} email={user?.email} />
      </div>
    </div>
  );
}
