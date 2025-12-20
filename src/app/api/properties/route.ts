import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { propertyFiltersSchema } from '@/lib/validations/filters';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse and validate query parameters
    const rawParams: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      if (value) rawParams[key] = value;
    });

    const parseResult = propertyFiltersSchema.safeParse(rawParams);

    if (!parseResult.success) {
      const firstIssue = parseResult.error.issues[0];
      return NextResponse.json(
        { error: firstIssue?.message || 'Invalid filters' },
        { status: 400 }
      );
    }

    const filters = parseResult.data;
    const supabase = await createClient();

    // Build query
    let query = supabase
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
      `,
        { count: 'exact' }
      )
      .eq('is_active', true);

    // Apply filters
    if (filters.listing_type) {
      query = query.eq('listing_type', filters.listing_type);
    }

    if (filters.property_type && filters.property_type.length > 0) {
      query = query.in('property_type', filters.property_type);
    }

    if (filters.building_id) {
      query = query.eq('building_id', filters.building_id);
    }

    if (filters.min_price) {
      query = query.gte('price', filters.min_price);
    }

    if (filters.max_price) {
      query = query.lte('price', filters.max_price);
    }

    if (filters.bedrooms !== undefined) {
      query = query.eq('bedrooms', filters.bedrooms);
    }

    if (filters.furnishing) {
      query = query.eq('furnishing', filters.furnishing);
    }

    // Apply sorting
    switch (filters.sort) {
      case 'price_asc':
        query = query.order('price', { ascending: true });
        break;
      case 'price_desc':
        query = query.order('price', { ascending: false });
        break;
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false });
    }

    // Apply pagination
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 12;
    const offset = (page - 1) * limit;

    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching properties:', error);
      return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 });
    }

    // Calculate pagination info
    const totalPages = count ? Math.ceil(count / limit) : 0;

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasMore: page < totalPages,
      },
    });
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
