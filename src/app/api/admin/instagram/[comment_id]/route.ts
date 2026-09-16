import { createClient } from '@/lib/supabase/server';
import { verifyAdmin } from '@/lib/supabase/verify-admin';
import { NextRequest, NextResponse } from 'next/server';
import type { InstagramAgentComment } from '@/types/database';
import type { PostgrestError } from '@supabase/supabase-js';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ comment_id: string }> }
) {
  const supabase = await createClient();
  const { comment_id } = await params;

  // Verify admin
  const authCheck = await verifyAdmin(supabase);
  if ('error' in authCheck) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
  }

  try {
    const body = await request.json();
    const { status, reply, action } = body;

    // Validate status
    const validStatuses = ['approved', 'ignored'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Fetch the comment first
    const { data: comment, error: fetchError } = await supabase
      .from('instagram_agent_comments')
      .select('*')
      .eq('comment_id', comment_id)
      .single() as { data: InstagramAgentComment | null; error: PostgrestError | null };

    if (fetchError || !comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    const now = new Date().toISOString();
    const { data: userData } = await supabase.auth.getUser();
    const updateData: Record<string, unknown> = {
      updated_at: now,
    };

    if (action === 'hide') {
      updateData.hidden_at = now;
      updateData.hidden_by = userData.user?.id ?? null;
      updateData.admin_action = 'hidden';
    }

    if (action === 'teach') {
      if (typeof reply !== 'string' || !reply.trim()) {
        return NextResponse.json({ error: 'A non-empty edited reply is required for training' }, { status: 400 });
      }
      updateData.reply = reply.trim();
      updateData.proposed_reply = reply.trim();
      updateData.reply_source = 'admin';
      updateData.admin_action = 'taught';
    }

    if (status === 'approved') {
      updateData.status = 'approved';
      updateData.admin_action = 'approved';
      updateData.admin_reviewed_at = now;
      // If admin provided an edited reply, use it; otherwise use proposed_reply
      if (reply && typeof reply === 'string') {
        updateData.reply = reply;
        updateData.reply_source = 'admin';
        // If edited, it's a learned example
        if (reply !== comment.proposed_reply) {
          updateData.admin_action = 'edited';
        }
      } else if (comment.proposed_reply) {
        updateData.reply = comment.proposed_reply;
        updateData.reply_source = 'admin';
      }
    } else if (status === 'ignored') {
      updateData.status = 'ignored';
      updateData.admin_action = 'ignored';
      updateData.admin_reviewed_at = now;
    }

    if (typeof reply === 'string' && reply.trim() && reply !== comment.proposed_reply) {
      updateData.reply = reply.trim();
      updateData.reply_source = 'admin';
      updateData.admin_action = 'edited';
    }

    const { data, error } = await supabase
      .from('instagram_agent_comments')
      .update(updateData as never)
      .eq('comment_id', comment_id)
      .select()
      .single() as { data: InstagramAgentComment | null; error: PostgrestError | null };

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, comment: data });
  } catch (error) {
    console.error('Error updating comment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}