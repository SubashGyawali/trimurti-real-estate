import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const supabase = await createClient();

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
        .single() as { data: any; error: any };

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 404 });
    }

    // Sort images (though DB doesn't guarantee order without order clause in subquery, 
    // but Supabase JS sometimes handles it. Better to sort in JS to be safe)
    if (data.property_images) {
        data.property_images.sort((a: any, b: any) => a.display_order - b.display_order);
    }

    return NextResponse.json(data);
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const supabase = await createClient();
    const body = await request.json();

    const { images, ...propertyData } = body;

    // 1. Update Property
    const { error: propertyError } = await (supabase
        .from('properties') as any)
        .update(propertyData)
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
            const imagesToInsert = images.map((img: any, index: number) => ({
                property_id: id,
                image_url: img.image_url,
                is_primary: img.is_primary,
                display_order: index
            }));

            const { error: insertError } = await supabase
                .from('property_images')
                .insert(imagesToInsert);

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

    // Cascading delete in Supabase Schema (ON DELETE SET NULL/CASCADE) handles relations?
    // Schema: 
    // property_images -> ON DELETE CASCADE.
    // inquiries -> ON DELETE SET NULL.
    // property_visits -> ON DELETE CASCADE.
    // user_favorites -> ON DELETE CASCADE.
    // So simple delete on properties is sufficient!

    const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Property deleted successfully' });
}
