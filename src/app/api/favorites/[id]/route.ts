import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { PostgrestError } from '@supabase/supabase-js';

type RouteParams = {
  params: Promise<{ id: string }>;
};

interface FavoriteOwnership {
  id: string;
  user_id: string;
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Favorite ID is required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the favorite belongs to the user
    const { data: favorite, error: fetchError } = (await supabase
      .from('user_favorites')
      .select('id, user_id')
      .eq('id', id)
      .single()) as { data: FavoriteOwnership | null; error: PostgrestError | null };

    if (fetchError || !favorite) {
      return NextResponse.json({ error: 'Favorite not found' }, { status: 404 });
    }

    if (favorite.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete the favorite
    const { error: deleteError } = await supabase
      .from('user_favorites')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error deleting favorite:', deleteError);
      return NextResponse.json({ error: 'Failed to remove favorite' }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
