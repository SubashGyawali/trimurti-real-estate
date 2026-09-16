import { createClient } from '@/lib/supabase/server';
import { verifyAdmin } from '@/lib/supabase/verify-admin';
import { NextRequest, NextResponse } from 'next/server';
import type { InstagramAgentTeaching } from '@/types/database';
import type { PostgrestError } from '@supabase/supabase-js';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;

  const authCheck = await verifyAdmin(supabase);
  if ('error' in authCheck) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
  }

  try {
    const body = await request.json();
    const { is_active, rule } = body;

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (typeof is_active === 'boolean') {
      updateData.is_active = is_active;
    }

    if (typeof rule === 'string' && rule.trim()) {
      updateData.rule = rule.trim();
    }

    const { data, error } = await supabase
      .from('instagram_agent_teachings')
      .update(updateData as never)
      .eq('id', id)
      .select()
      .single() as { data: InstagramAgentTeaching | null; error: PostgrestError | null };

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, teaching: data });
  } catch (error) {
    console.error('Error updating teaching:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;

  const authCheck = await verifyAdmin(supabase);
  if ('error' in authCheck) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
  }

  const { error } = await supabase
    .from('instagram_agent_teachings')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}