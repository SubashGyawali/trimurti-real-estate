"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UserSidebar } from "./user-sidebar";
import { useAuthContext } from "@/components/auth/auth-provider";
import type { Profile } from "@/types/database";

interface UserDashboardWrapperProps {
  children: React.ReactNode;
  initialProfile?: Profile | null;
  initialEmail?: string;
  initialIsAdmin?: boolean;
}

export function UserDashboardWrapper({
  children,
  initialProfile,
  initialEmail,
  initialIsAdmin,
}: UserDashboardWrapperProps) {
  const router = useRouter();
  const { signOut, profile: contextProfile, isAdmin: contextIsAdmin } = useAuthContext();

  // Use context profile if available, fallback to initial
  const profile = contextProfile ?? initialProfile ?? null;
  // Use context isAdmin if available, fallback to initial (server-calculated)
  const isAdmin = contextIsAdmin ?? initialIsAdmin ?? false;

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Failed to sign out");
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-5rem)]">
      <UserSidebar
        profile={profile}
        email={initialEmail}
        isAdmin={isAdmin}
        onSignOut={handleSignOut}
      />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-6 md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
