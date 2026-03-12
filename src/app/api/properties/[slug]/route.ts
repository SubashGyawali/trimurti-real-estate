import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { PropertyWithDetails } from '@/types';
import type { PostgrestError } from '@supabase/supabase-js';

type RouteParams = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Fetch property by slug with relations
    const { data, error } = (await supabase
      .from('properties')
      .select(
        `
        *,
        building:buildings (
          id,
          name,
          type,
          address,
          total_floors,
          year_built,
          location_lat,
          location_lng
        ),
        property_images (
          id,
          image_url,
          is_primary,
          display_order
        )
      `
      )
      .eq('slug', slug)
      .eq('is_active', true)
      .single()) as { data: PropertyWithDetails | null; error: PostgrestError | null };

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Property not found' }, { status: 404 });
      }
      console.error('Error fetching property:', error);
      return NextResponse.json({ error: 'Failed to fetch property' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Increment views count (non-blocking, fire-and-forget)
    // Note: uses read-then-write which can lose increments under concurrency.
    // For exact counts, use a Supabase RPC with SQL: views_count = views_count + 1
    void supabase
      .from('properties')
      .update({ views_count: (data.views_count || 0) + 1 } as never)
      .eq('id', data.id);

    // Sort images by display_order
    if (data.property_images) {
      data.property_images.sort((a, b) => a.display_order - b.display_order);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
