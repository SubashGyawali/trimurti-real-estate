import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/supabase/verify-admin';
import { buildingCreateSchema } from '@/lib/validations/admin';
import type { Building } from '@/types';

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
    // Cast includes the `properties` relation field added by the select query
    const buildingsWithCount = ((data || []) as (Building & { properties: { count: number }[] })[]).map((building) => ({
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

    // Validate request body
    const parsed = buildingCreateSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
            { status: 400 }
        );
    }

    // Create building
    const { data: building, error } = await supabase
        .from('buildings')
        .insert(parsed.data as never)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(building, { status: 201 });
}
