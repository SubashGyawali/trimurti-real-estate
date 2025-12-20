"use client";

import { useState, useEffect, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";

export interface UseAuthReturn {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  // Fetch user profile from profiles table
  const fetchProfile = useCallback(
    async (userId: string) => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return null;
      }

      return data as Profile;
    },
    [supabase]
  );

  // Refresh profile data
  const refreshProfile = useCallback(async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  }, [user, fetchProfile]);

  // Sign out handler
  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  }, [supabase]);

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();

        setSession(initialSession);
        setUser(initialSession?.user ?? null);

        if (initialSession?.user) {
          const profileData = await fetchProfile(initialSession.user.id);
          setProfile(profileData);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        // Fetch profile when user signs in
        const profileData = await fetchProfile(currentSession.user.id);
        setProfile(profileData);
      } else {
        // Clear profile when user signs out
        setProfile(null);
      }

      // Handle specific auth events
      if (event === "SIGNED_OUT") {
        setProfile(null);
      }
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  // Debug logging
  console.log("Auth Debug:", {
    userEmail: user?.email,
    isAdminProfile: profile?.is_admin,
    envAdmin: process.env.NEXT_PUBLIC_ADMIN_EMAIL,
    isHardcoded: user?.email?.toLowerCase() === "saurau.gyawali.sg@gmail.com"
  });

  return {
    user,
    profile,
    session,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: profile?.is_admin ?? ((user?.email?.toLowerCase() === "saurau.gyawali.sg@gmail.com") || (user?.email?.toLowerCase() === process.env.NEXT_PUBLIC_ADMIN_EMAIL?.toLowerCase())) ?? false,
    signOut: handleSignOut,
    refreshProfile,
  };
}
