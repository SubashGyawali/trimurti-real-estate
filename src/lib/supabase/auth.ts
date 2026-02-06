import { createClient } from "./client";
import type { RegisterFormData } from "@/lib/validations/auth";

export interface AuthResult {
  success: boolean;
  error?: string;
}

export interface SignInResult extends AuthResult {
  user?: {
    id: string;
    email: string;
  };
}

export interface SignUpResult extends AuthResult {
  user?: {
    id: string;
    email: string;
  };
  needsEmailConfirmation?: boolean;
}

/**
 * Sign in with email and password
 */
export async function signIn(
  email: string,
  password: string
): Promise<SignInResult> {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Map common errors to user-friendly messages
    let message = error.message;
    if (error.message.includes("Invalid login credentials")) {
      message = "Invalid email or password. Please try again.";
    } else if (error.message.includes("Email not confirmed")) {
      message = "Please verify your email before signing in.";
    }
    return { success: false, error: message };
  }

  return {
    success: true,
    user: data.user
      ? {
          id: data.user.id,
          email: data.user.email!,
        }
      : undefined,
  };
}

/**
 * Sign up with email, password, and user metadata
 */
export async function signUp(
  data: Omit<RegisterFormData, "confirm_password" | "acceptTerms">
): Promise<SignUpResult> {
  const supabase = createClient();

  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        full_name: data.full_name,
        phone: data.phone || null,
      },
      emailRedirectTo: `${window.location.origin}/login?verified=true`,
    },
  });

  if (error) {
    let message = error.message;
    if (error.message.includes("User already registered")) {
      message = "An account with this email already exists.";
    }
    return { success: false, error: message };
  }

  // Check if email confirmation is required
  const needsEmailConfirmation =
    authData.user?.identities?.length === 0 ||
    authData.user?.confirmed_at === null;

  return {
    success: true,
    user: authData.user
      ? {
          id: authData.user.id,
          email: authData.user.email!,
        }
      : undefined,
    needsEmailConfirmation,
  };
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<AuthResult> {
  const supabase = createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<AuthResult> {
  const supabase = createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Update password (used after clicking magic link)
 */
export async function updatePassword(password: string): Promise<AuthResult> {
  const supabase = createClient();

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    let message = error.message;
    if (error.message.includes("same as the old password")) {
      message = "New password must be different from your current password.";
    }
    return { success: false, error: message };
  }

  return { success: true };
}

/**
 * Get current session
 */
export async function getSession() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    return { session: null, error: error.message };
  }

  return { session: data.session, error: null };
}

/**
 * Get current user
 */
export async function getUser() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    return { user: null, error: error.message };
  }

  return { user: data.user, error: null };
}

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle(): Promise<AuthResult> {
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
