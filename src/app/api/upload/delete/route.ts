import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { deletePropertyImage } from '@/lib/cloudinary/upload';
import { verifyAdmin } from '@/lib/supabase/verify-admin';

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
