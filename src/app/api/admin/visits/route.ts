import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';

type AuthResult =
    | { error: string; status: number }
    | { user: { id: string; email?: string }; profile: { is_admin: boolean } };

async function verifyAdmin(supabase: SupabaseClient): Promise<AuthResult> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized', status: 401 };

    const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

    if (!profile?.is_admin) return { error: 'Forbidden', status: 403 };
    return { user, profile };
}

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
