import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/";

  // Validate redirect path to prevent open redirects
  const safePath = next.startsWith("/") && !next.startsWith("//") ? next : "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Check if user is admin and redirect to admin dashboard
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let finalPath = safePath;
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .single() as { data: { is_admin: boolean | null } | null };

        const adminEmail = process.env.ADMIN_EMAIL;
        const isProfileAdmin = !!profile?.is_admin;
        const isEnvAdmin = !!(
          adminEmail && user.email?.toLowerCase() === adminEmail.toLowerCase()
        );

        if (isProfileAdmin || isEnvAdmin) {
          finalPath = "/admin";
        }
      }

      const redirectUrl = new URL(finalPath, requestUrl.origin);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Return the user to an error page with instructions
  const loginUrl = new URL("/login", requestUrl.origin);
  loginUrl.searchParams.set("error", "auth_callback_error");
  return NextResponse.redirect(loginUrl);
}
