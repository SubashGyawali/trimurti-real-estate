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

    const { data: building, error } = await supabase
        .from('buildings')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return NextResponse.json({ error: 'Building not found' }, { status: 404 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(building);
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

    const { data: building, error } = await (supabase
        .from('buildings') as any)
        .update(body)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return NextResponse.json({ error: 'Building not found' }, { status: 404 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(building);
}

export async function DELETE(request: Request, { params }: RouteParams) {
    const supabase = await createClient();
    const { id } = await params;

    // Verify admin access
    const authCheck = await verifyAdmin(supabase);
    if ('error' in authCheck) {
        return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }

    // Check if building has associated properties
    const { count } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('building_id', id);

    const { error } = await supabase
        .from('buildings')
        .delete()
        .eq('id', id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
        message: 'Building deleted successfully',
        properties_affected: count ?? 0
    });
}
