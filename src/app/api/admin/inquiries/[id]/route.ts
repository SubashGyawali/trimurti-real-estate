import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/supabase/verify-admin';
import { inquiryUpdateSchema } from '@/lib/validations/admin';
import type { InquiryWithProperty } from '@/types';
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

    const { data: inquiry, error } = await supabase
        .from('inquiries')
        .select(`
            *,
            property:properties (
                id,
                title,
                slug
            )
        `)
        .eq('id', id)
        .single() as { data: InquiryWithProperty | null; error: PostgrestError | null };

    if (error) {
        if (error.code === 'PGRST116') {
            return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(inquiry);
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
    const parsed = inquiryUpdateSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
            { status: 400 }
        );
    }

    const { data: inquiry, error } = await supabase
        .from('inquiries')
        .update(parsed.data as never)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(inquiry);
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
        .from('inquiries')
        .delete()
        .eq('id', id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Inquiry deleted successfully' });
}
