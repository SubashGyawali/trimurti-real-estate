import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/supabase/verify-admin';

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
        .order('created_at', { ascending: false }) as { data: any[] | null; error: any };

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Optimize: Maybe filter images to only primary for list view? 
    // But for now, returning all is fine, client can pick primary.
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
    const { images, ...propertyData } = body;

    // 1. Create Property
    const { data: property, error: propertyError } = await supabase
        .from('properties')
        .insert(propertyData)
        .select()
        .single() as { data: any; error: any };

    if (propertyError) {
        return NextResponse.json({ error: propertyError.message }, { status: 500 });
    }

    // 2. Create Images if any
    if (images && images.length > 0) {
        const imagesToInsert = images.map((img: any, index: number) => ({
            property_id: property.id,
            image_url: img.image_url,
            is_primary: img.is_primary,
            display_order: index, // Ensure order matches array order
        }));

        const { error: imagesError } = await supabase
            .from('property_images')
            .insert(imagesToInsert);

        if (imagesError) {
            // In a real app, we might want to rollback the property creation here
            // But Supabase doesn't support easy multi-table transactions via JS client yet
            // We'll return error but the property exists without images.
            return NextResponse.json({
                property,
                warning: 'Property created but images failed',
                error: imagesError.message
            }, { status: 201 }); // 201 because property WAS created
        }
    }

    return NextResponse.json(property, { status: 201 });
}
