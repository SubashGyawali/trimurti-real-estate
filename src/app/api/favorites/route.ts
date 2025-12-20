import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { favoriteSchema } from '@/lib/validations/filters';
import { z } from 'zod';
import type { UserFavorite, PropertyWithDetails } from '@/types';
import type { PostgrestError } from '@supabase/supabase-js';

interface FavoriteWithProperty extends Omit<UserFavorite, 'property_id'> {
  property: (PropertyWithDetails & { is_active: boolean }) | null;
}

export async function GET() {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user's favorites with property details
    const { data, error } = (await supabase
      .from('user_favorites')
      .select(
        `
        id,
        created_at,
        property:properties (
          id,
          title,
          slug,
          price,
          property_type,
          listing_type,
          bedrooms,
          bathrooms,
          carpet_area,
          is_active,
          building:buildings (
            id,
            name,
            type
          ),
          property_images (
            id,
            image_url,
            is_primary,
            display_order
          )
        )
      `
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })) as {
      data: FavoriteWithProperty[] | null;
      error: PostgrestError | null;
    };

    if (error) {
      console.error('Error fetching favorites:', error);
      return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 });
    }

    // Filter out favorites where property is no longer active
    const activeFavorites = data?.filter((fav) => fav.property?.is_active) || [];

    return NextResponse.json(activeFavorites);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate body
    const body = await request.json();
    const validated = favoriteSchema.parse(body);

    // Check if property exists and is active
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('id')
      .eq('id', validated.property_id)
      .eq('is_active', true)
      .single();

    if (propertyError || !property) {
      return NextResponse.json({ error: 'Property not found or inactive' }, { status: 404 });
    }

    // Check if already favorited
    const { data: existing } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('property_id', validated.property_id)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Property already in favorites' }, { status: 409 });
    }

    // Create favorite
    const { data, error } = (await supabase
      .from('user_favorites')
      .insert({
        user_id: user.id,
        property_id: validated.property_id,
      } as never)
      .select()
      .single()) as { data: UserFavorite | null; error: PostgrestError | null };

    if (error) {
      console.error('Error creating favorite:', error);
      return NextResponse.json({ error: 'Failed to add favorite' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstIssue = error.issues[0];
      return NextResponse.json(
        { error: firstIssue?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
