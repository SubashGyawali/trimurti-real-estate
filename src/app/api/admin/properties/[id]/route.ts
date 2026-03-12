import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { deleteMultipleImages } from '@/lib/cloudinary/upload';
import { verifyAdmin } from '@/lib/supabase/verify-admin';
import { propertyUpdateSchema } from '@/lib/validations/admin';
import type { PropertyWithImages, PropertyImage } from '@/types';
import type { PostgrestError } from '@supabase/supabase-js';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const supabase = await createClient();

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
        .eq('id', id)
        .single() as { data: PropertyWithImages | null; error: PostgrestError | null };

    if (error || !data) {
        return NextResponse.json({ error: error?.message ?? 'Property not found' }, { status: 404 });
    }

    // Sort images (though DB doesn't guarantee order without order clause in subquery,
    // but Supabase JS sometimes handles it. Better to sort in JS to be safe)
    if (data.property_images) {
        data.property_images.sort((a: PropertyImage, b: PropertyImage) => a.display_order - b.display_order);
    }

    return NextResponse.json(data);
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const supabase = await createClient();

    const authCheck = await verifyAdmin(supabase);
    if ('error' in authCheck) {
        return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }

    const body = await request.json();

    // Validate request body
    const parsed = propertyUpdateSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
            { status: 400 }
        );
    }

    const { images, ...propertyData } = parsed.data;

    // 1. Update Property (cast validated data for Supabase compatibility)
    const { error: propertyError } = await supabase
        .from('properties')
        .update(propertyData as never)
        .eq('id', id);

    if (propertyError) {
        return NextResponse.json({ error: propertyError.message }, { status: 500 });
    }

    // 2. Handle Images
    if (images) {
        // Strategy: 
        // - Delete all existing images for this property (simplest to ensure order and content match)
        // - Re-insert all
        // Pros: Clean. Cons: New IDs for images.
        // If we want to keep IDs, we need complex diffing.
        // Given the component sends `PropertyImage[]` which might have IDs, we could try to respect them.
        // But checking `ImageUploader` implementation, it manages a list.
        // Let's go with "Delete All & Re-insert" for now to ensure consistency, 
        // UNLESS `user_favorites` or other tables reference `property_images.id`?
        // User favorites ref `property_id`, NOT image id. 
        // Schema check: property_images only referenced by itself (if recursive? no).
        // So safe to delete/re-insert.

        // First, delete existing
        const { error: deleteError } = await supabase
            .from('property_images')
            .delete()
            .eq('property_id', id);

        if (deleteError) {
            return NextResponse.json({ error: 'Failed to update images' }, { status: 500 });
        }

        // Then insert new
        if (images.length > 0) {
            const imagesToInsert = images.map((img: { image_url: string; is_primary: boolean; display_order?: number }, index: number) => ({
                property_id: id,
                image_url: img.image_url,
                is_primary: img.is_primary,
                display_order: index
            }));

            const { error: insertError } = await supabase
                .from('property_images')
                .insert(imagesToInsert as never);

            if (insertError) {
                return NextResponse.json({ error: 'Failed to insert new images' }, { status: 500 });
            }
        }
    }

    return NextResponse.json({ message: 'Property updated successfully' });
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const supabase = await createClient();

    const authCheck = await verifyAdmin(supabase);
    if ('error' in authCheck) {
        return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }

    // First, fetch the property images to get URLs for Cloudinary cleanup
    const { data: images, error: fetchError } = await supabase
        .from('property_images')
        .select('image_url')
        .eq('property_id', id) as { data: { image_url: string }[] | null; error: PostgrestError | null };

    if (fetchError) {
        console.error('Failed to fetch images for cleanup:', fetchError);
        // Continue with deletion even if we can't clean up storage
    }

    // Cascading delete in Supabase Schema (ON DELETE SET NULL/CASCADE) handles relations:
    // property_images -> ON DELETE CASCADE
    // inquiries -> ON DELETE SET NULL
    // property_visits -> ON DELETE CASCADE
    // user_favorites -> ON DELETE CASCADE
    const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Clean up Cloudinary storage (best effort, don't fail if this errors)
    if (images && images.length > 0) {
        const imageUrls = images.map(img => img.image_url);
        try {
            await deleteMultipleImages(imageUrls);
        } catch (cleanupError) {
            console.error('Failed to clean up Cloudinary images:', cleanupError);
            // Don't fail the request - property is already deleted
        }
    }

    return NextResponse.json({ message: 'Property deleted successfully' });
}
