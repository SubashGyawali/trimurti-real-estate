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

    // Fetch visits with property info
    const { data, error } = await supabase
        .from('property_visits')
        .select(`
            *,
            property:properties (
                id,
                title,
                slug
            )
        `)
        .order('preferred_date', { ascending: true })
        .order('created_at', { ascending: false }) as { data: any[] | null; error: any };

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}
