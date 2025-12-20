import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('properties')
      .select(
        `
        *,
        building:buildings (
          id,
          name,
          type,
          address
        ),
        property_images (
          id,
          image_url,
          is_primary,
          display_order
        )
      `
      )
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(6);

    if (error) {
      console.error('Error fetching featured properties:', error);
      return NextResponse.json({ error: 'Failed to fetch featured properties' }, { status: 500 });
    }

    // Cache for 1 hour, stale-while-revalidate for 24 hours
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
