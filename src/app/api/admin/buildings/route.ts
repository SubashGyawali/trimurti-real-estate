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

    // Fetch buildings with property count
    const { data, error } = await supabase
        .from('buildings')
        .select(`
            *,
            properties:properties(count)
        `)
        .order('name');

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform the count from array to number
    const buildingsWithCount = (data || []).map((building: any) => ({
        ...building,
        property_count: building.properties?.[0]?.count ?? 0
    }));

    return NextResponse.json(buildingsWithCount);
}

export async function POST(request: Request) {
    const supabase = await createClient();

    // Verify admin access
    const authCheck = await verifyAdmin(supabase);
    if ('error' in authCheck) {
        return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }

    const body = await request.json();

    // Create building
    const { data: building, error } = await supabase
        .from('buildings')
        .insert(body)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(building, { status: 201 });
}
