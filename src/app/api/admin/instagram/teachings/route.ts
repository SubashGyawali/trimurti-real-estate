import { createClient } from '@/lib/supabase/server';
import { verifyAdmin } from '@/lib/supabase/verify-admin';
import { NextRequest, NextResponse } from 'next/server';
import type { InstagramAgentTeaching } from '@/types/database';
import type { PostgrestError } from '@supabase/supabase-js';

export async function GET() {
  const supabase = await createClient();

  const authCheck = await verifyAdmin(supabase);
  if ('error' in authCheck) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
  }

  const { data, error } = await supabase
    .from('instagram_agent_teachings')
    .select('*')
    .order('created_at', { ascending: false }) as { data: InstagramAgentTeaching[] | null; error: PostgrestError | null };

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ teachings: data });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const authCheck = await verifyAdmin(supabase);
  if ('error' in authCheck) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
  }

  try {
    const body = await request.json();
    const { rule } = body;

    if (!rule || typeof rule !== 'string' || !rule.trim()) {
      return NextResponse.json({ error: 'Rule is required' }, { status: 400 });
    }

    const { data: userData } = await supabase.auth.getUser();

    const insertData = {
      rule: rule.trim(),
      is_active: true,
      created_by: userData.user?.id ?? null,
    };

    const { data, error } = await supabase
      .from('instagram_agent_teachings')
      .insert(insertData as never)
      .select()
      .single() as { data: InstagramAgentTeaching | null; error: PostgrestError | null };

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, teaching: data });
  } catch (error) {
    console.error('Error creating teaching:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}