import { createClient } from '@/lib/supabase/server';
import { CreatePropertyClient } from './client';

export default async function NewPropertyPage() {
    const supabase = await createClient();

    const { data: buildings } = await supabase
        .from('buildings')
        .select('*')
        .order('name');

    return <CreatePropertyClient buildings={buildings || []} />;
}
