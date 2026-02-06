import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { deletePropertyImage } from '@/lib/cloudinary/upload';

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

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();

    // Verify admin access
    const authCheck = await verifyAdmin(supabase);
    if ('error' in authCheck) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }

    const body = await request.json();
    const { imageUrl } = body;

    if (!imageUrl) {
      return NextResponse.json({ error: 'No image URL provided' }, { status: 400 });
    }

    // Delete from Cloudinary
    await deletePropertyImage(imageUrl);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
  }
}
