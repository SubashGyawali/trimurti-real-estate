import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { env } from '@/lib/env';
import type { Database, InstagramCommentCategory } from '@/types/database';

/**
 * DEPRECATED — keep for one release for backward compat.
 * The permanent webhook is POST/GET /api/instagram/webhook (Vercel).
 * This endpoint used x-instagram-webhook-secret + template drafts (no LLM).
 * New integrations should send Meta webhooks to /api/instagram/webhook.
 * See MASTER_PLAN.md Phase 2 + Phase 5.
 */

type InstagramCommentPayload = {
  comment_id: string;
  comment_text: string;
  username?: string | null;
  media_id?: string | null;
  media_url?: string | null;
  media_title?: string | null;
  property_id?: string | null;
};

const priceQuestion = /\b(price|cost|rate|budget|kitna|kitne|keemat|daam)\b/i;

function formatPrice(price: number, listingType: 'sale' | 'rent') {
  if (listingType === 'rent') return `₹${price.toLocaleString('en-IN')}/month`;
  if (price >= 10_000_000) return `₹${(price / 10_000_000).toFixed(2)} Cr`;
  return `₹${(price / 100_000).toFixed(2)} Lac`;
}

function buildDraft(comment: InstagramCommentPayload, property: { title: string; price: number; listing_type: 'sale' | 'rent' } | null) {
  if (priceQuestion.test(comment.comment_text)) {
    if (!property) {
      return 'Exact price confirm karne ke liye property details check kar rahe hain. WhatsApp par message kijiye, hum aapko jaldi exact amount share karenge 😊';
    }
    return `Ji, ${property.title} ka price ${formatPrice(property.price, property.listing_type)} hai. Aapko details ya visit schedule karna ho toh WhatsApp kar dijiye 😊`;
  }

  if (!property) {
    return 'Ji, details ke liye WhatsApp par message kijiye. Hum aapko property ki complete information share karenge 😊';
  }

  return `Ji, ${property.title} ki details available hain. Price ${formatPrice(property.price, property.listing_type) } hai. More details ke liye WhatsApp kar dijiye 😊`;
}

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export async function POST(request: Request) {
  console.warn('[DEPRECATED] POST /api/instagram/comments called — migrate to POST /api/instagram/webhook');

  const expectedSecret = env.INSTAGRAM_WEBHOOK_SECRET;
  const suppliedSecret = request.headers.get('x-instagram-webhook-secret');
  if (!expectedSecret || suppliedSecret !== expectedSecret) return unauthorized();

  let body: InstagramCommentPayload;
  try {
    body = await request.json() as InstagramCommentPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.comment_id || !body.comment_text) {
    return NextResponse.json({ error: 'comment_id and comment_text are required' }, { status: 400 });
  }

  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY is not configured' }, { status: 503 });
  }

  const supabase = createSupabaseClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  let property: { id: string; title: string; price: number; listing_type: 'sale' | 'rent' } | null = null;

  if (body.property_id) {
    const result = await supabase.from('properties').select('id, title, price, listing_type').eq('id', body.property_id).eq('is_active', true).maybeSingle() as {
      data: { id: string; title: string; price: number; listing_type: 'sale' | 'rent' } | null;
    };
    property = result.data;
  }

  const category: InstagramCommentCategory = priceQuestion.test(body.comment_text) ? 'contact' : 'simple';
  const mediaTitle = body.media_title?.trim() || null;
  const mediaUrl = body.media_url?.trim() || null;
  const proposedReply = buildDraft(body, property);
  const row = {
    comment_id: body.comment_id,
    comment_text: body.comment_text.trim(),
    username: body.username?.trim() || null,
    media_id: body.media_id?.trim() || null,
    media_url: mediaUrl,
    media_title: mediaTitle,
    property_id: property?.id || body.property_id || null,
    property_title: property?.title || null,
    property_price: property?.price || null,
    property_listing_type: property?.listing_type || null,
    response_language: 'hinglish',
    response_style: 'varied',
    category,
    proposed_reply: proposedReply,
    status: 'awaiting_approval' as const,
    reply_source: 'ai',
    confidence: property ? 0.95 : 0.7,
    decision_reason: priceQuestion.test(body.comment_text) ? 'Price question received; exact property context was used when available.' : 'Hinglish draft generated for admin approval.',
  };

  const { data, error } = await supabase.from('instagram_agent_comments').upsert(row as never, { onConflict: 'comment_id' }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(
    { comment: data, deprecated: true, migrate_to: '/api/instagram/webhook' },
    {
      status: 201,
      headers: { 'X-Deprecated': 'use /api/instagram/webhook' },
    },
  );
}
