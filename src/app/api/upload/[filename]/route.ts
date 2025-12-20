import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';

const BUCKET_NAME = 'property-images';

type AuthResult =
  | { error: string; status: number }
  | { user: { id: string; email?: string }; profile: { is_admin: boolean } };

async function verifyAdmin(supabase: SupabaseClient): Promise<AuthResult> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Unauthorized', status: 401 };

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) return { error: 'Forbidden', status: 403 };
  return { user, profile };
}

type RouteParams = {
  params: Promise<{ filename: string }>;
};

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { filename } = await params;

    if (!filename) {
      return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Verify admin access
    const authCheck = await verifyAdmin(supabase);
    if ('error' in authCheck) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }

    // Delete from storage
    const { error } = await supabase.storage.from(BUCKET_NAME).remove([filename]);

    if (error) {
      console.error('Delete error:', error);
      return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
