import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/supabase/verify-admin';
import { propertyCreateSchema } from '@/lib/validations/admin';
import type { PropertyWithImages, Property } from '@/types';
import type { PostgrestError } from '@supabase/supabase-js';

export async function GET() {
    const supabase = await createClient();

    // Verify admin access
    const authCheck = await verifyAdmin(supabase);
    if ('error' in authCheck) {
        return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }

    const { data, error } = await supabase
        .from('properties')
        .select(`
      *,
      property_images (
        id,
        image_url,
        is_primary,
        display_order
      )
    `)
        .order('created_at', { ascending: false }) as {
        data: PropertyWithImages[] | null;
        error: PostgrestError | null;
    };

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

export async function POST(request: Request) {
    const supabase = await createClient();

    // Verify admin access
    const authCheck = await verifyAdmin(supabase);
    if ('error' in authCheck) {
        return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }

    const body = await request.json();

    // Validate request body
    const parsed = propertyCreateSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
            { status: 400 }
        );
    }

    const { images, ...propertyData } = parsed.data;

    // 1. Create Property
    const { data: property, error: propertyError } = await supabase
        .from('properties')
        .insert(propertyData as never)
        .select()
        .single() as { data: Property | null; error: PostgrestError | null };

    if (propertyError || !property) {
        return NextResponse.json({ error: propertyError?.message ?? 'Failed to create property' }, { status: 500 });
    }

    // 2. Create Images if any
    if (images && images.length > 0) {
        const imagesToInsert = images.map((img, index) => ({
            property_id: property.id,
            image_url: img.image_url,
            is_primary: img.is_primary,
            display_order: index,
        }));

        const { error: imagesError } = await supabase
            .from('property_images')
            .insert(imagesToInsert as never);

        if (imagesError) {
            return NextResponse.json({
                property,
                warning: 'Property created but images failed',
                error: imagesError.message
            }, { status: 201 });
        }
    }

    return NextResponse.json(property, { status: 201 });
}
