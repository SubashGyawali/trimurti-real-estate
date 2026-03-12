import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/supabase/verify-admin';
import { visitUpdateSchema } from '@/lib/validations/admin';
import type { PropertyVisitWithProperty } from '@/types';
import type { PostgrestError } from '@supabase/supabase-js';

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
        .single() as { data: PropertyVisitWithProperty | null; error: PostgrestError | null };

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

    // Validate request body
    const parsed = visitUpdateSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
            { status: 400 }
        );
    }

    // Build update object from validated data
    const updateData: { status?: string; preferred_date?: string | null; preferred_time?: string | null } = {};
    if (parsed.data.status) updateData.status = parsed.data.status;
    if (parsed.data.preferred_date !== undefined) updateData.preferred_date = parsed.data.preferred_date;
    if (parsed.data.preferred_time !== undefined) updateData.preferred_time = parsed.data.preferred_time;

    const { data: visit, error } = await supabase
        .from('property_visits')
        .update(updateData as never)
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
