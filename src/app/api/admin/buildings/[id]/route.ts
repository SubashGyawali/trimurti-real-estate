import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/supabase/verify-admin';
import { buildingUpdateSchema } from '@/lib/validations/admin';

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

    // Validate request body
    const parsed = buildingUpdateSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
            { status: 400 }
        );
    }

    const { data: building, error } = await supabase
        .from('buildings')
        .update(parsed.data as never)
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
