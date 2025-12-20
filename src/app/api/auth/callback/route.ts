import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/';
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  // Handle auth errors from Supabase
  if (error) {
    console.error('Auth callback error:', error, errorDescription);
    const redirectUrl = new URL('/login', requestUrl.origin);
    redirectUrl.searchParams.set('error', errorDescription || error);
    return NextResponse.redirect(redirectUrl);
  }

  if (code) {
    const supabase = await createClient();

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('Session exchange error:', exchangeError);
      const redirectUrl = new URL('/login', requestUrl.origin);
      redirectUrl.searchParams.set('error', 'Failed to authenticate. Please try again.');
      return NextResponse.redirect(redirectUrl);
    }

    // Determine where to redirect based on the 'next' parameter
    let redirectPath = next;

    // If the next parameter includes password reset, redirect appropriately
    if (next.includes('reset-password') || requestUrl.searchParams.get('type') === 'recovery') {
      redirectPath = '/reset-password';
    }

    // Create redirect URL
    const redirectUrl = new URL(redirectPath, requestUrl.origin);
    return NextResponse.redirect(redirectUrl);
  }

  // No code provided, redirect to home
  return NextResponse.redirect(new URL('/', requestUrl.origin));
}
