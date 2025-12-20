import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { EditBuildingClient } from './client';

export default async function EditBuildingPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;
    const supabase = await createClient();

    // Fetch building
    const { data: building, error } = await supabase
        .from('buildings')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !building) {
        notFound();
    }

    // Get property count for this building
    const { count } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('building_id', id);

    return (
        <EditBuildingClient
            building={building}
            propertyCount={count ?? 0}
        />
    );
}
