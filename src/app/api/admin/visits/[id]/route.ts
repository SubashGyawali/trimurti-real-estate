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

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
    const supabase = await createClient();
    const { id } = await params;

    // Verify admin access
    const authCheck = await verifyAdmin(supabase);
    if ('error' in authCheck) {
        return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }

    const { data: visit, error } = await supabase
        .from('property_visits')
        .select(`
            *,
            property:properties (
                id,
                title,
                slug
            )
        `)
        .eq('id', id)
        .single() as { data: any; error: any };

    if (error) {
        if (error.code === 'PGRST116') {
            return NextResponse.json({ error: 'Visit not found' }, { status: 404 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(visit);
}

export async function PUT(request: Request, { params }: RouteParams) {
    const supabase = await createClient();
    const { id } = await params;

    // Verify admin access
    const authCheck = await verifyAdmin(supabase);
    if ('error' in authCheck) {
        return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }

    const body = await request.json();
    const { status, preferred_date, preferred_time } = body;

    // Validate status if provided
    if (status && !['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Build update object
    const updateData: Record<string, any> = {};
    if (status) updateData.status = status;
    if (preferred_date !== undefined) updateData.preferred_date = preferred_date;
    if (preferred_time !== undefined) updateData.preferred_time = preferred_time;

    const { data: visit, error } = await (supabase
        .from('property_visits') as any)
        .update(updateData)
        .eq('id', id)
        .select(`
            *,
            property:properties (
                id,
                title,
                slug
            )
        `)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return NextResponse.json({ error: 'Visit not found' }, { status: 404 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(visit);
}

export async function DELETE(request: Request, { params }: RouteParams) {
    const supabase = await createClient();
    const { id } = await params;

    // Verify admin access
    const authCheck = await verifyAdmin(supabase);
    if ('error' in authCheck) {
        return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }

    const { error } = await supabase
        .from('property_visits')
        .delete()
        .eq('id', id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Visit deleted successfully' });
}
