import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { EditPropertyClient } from './client';

export default async function EditPropertyPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;
    const supabase = await createClient();

    // Fetch property with images
    const { data: property, error } = await supabase
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

    if (error || !property) {
        notFound();
    }

    // Fetch buildings
    const { data: buildings } = await supabase
        .from('buildings')
        .select('*')
        .order('name');

    // Sort images for consistency
    if (property.property_images) {
        property.property_images.sort((a: any, b: any) => a.display_order - b.display_order);
    }

    return (
        <EditPropertyClient
            property={property}
            buildings={buildings || []}
        />
    );
}
