import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('buildings')
      .select('id, name, type, address')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching buildings:', error);
      return NextResponse.json({ error: 'Failed to fetch buildings' }, { status: 500 });
    }

    // Cache for 24 hours, stale-while-revalidate for 7 days
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
      },
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
