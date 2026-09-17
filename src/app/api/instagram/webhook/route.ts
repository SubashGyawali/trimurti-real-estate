import crypto from "crypto";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import type { Database } from "@/types/database";

// This is the permanent Vercel webhook — see MASTER_PLAN.md Phase 2 + Phase 5.
// Meta Dashboard → Webhooks → Instagram → Callback URL:
//   https://trimurtirealestate.com/api/instagram/webhook
// Verify token = META_VERIFY_TOKEN (same as D:\Projects\instagram-ai-agent\.env)
// Local python worker (FastAPI /webhook) stays for local debug only.
// Desktop polls Supabase; it no longer needs a cloudflared tunnel for prod.

// Agent's own Instagram username — must match INSTAGRAM_USERNAME in D:\Projects\instagram-ai-agent\.env
const AGENT_USERNAME = "trimurti.real.estate";

function getSupabaseAdmin() {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
  }
  return createSupabaseClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

function envVerifyToken(): string {
  return env.META_VERIFY_TOKEN || process.env.META_VERIFY_TOKEN || "";
}

function envAppSecret(): string {
  return env.META_APP_SECRET || process.env.META_APP_SECRET || "";
}

function verifySignature(raw: string, signature: string | null, appSecret: string): boolean {
  if (!appSecret) return true; // no secret configured → skip
  if (!signature) return false;
  // Meta sends: sha256=<hex>
  const expected = `sha256=${crypto.createHmac("sha256", appSecret).update(raw).digest("hex")}`;
  try {
    const a = Buffer.from(expected);
    const b = Buffer.from(signature);
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

// GET — Meta verification handshake
export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  const expected = envVerifyToken();
  if (mode === "subscribe" && expected && token === expected && challenge) {
    return new Response(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }
  if (mode === "subscribe") {
    // In dev without token, echo for local testing is not allowed — require token
    console.warn("[instagram/webhook] GET verify failed: mode=%s token=%s", mode, token ? "***" : "missing");
    return new Response("Forbidden", { status: 403 });
  }
  // Health check
  return NextResponse.json({ ok: true, webhook: "instagram", mode: "vercel-permanent" });
}

// POST — comment notifications from Meta (field=comments)
export async function POST(request: Request) {
  const raw = await request.text();
  const sig = request.headers.get("x-hub-signature-256") || request.headers.get("X-Hub-Signature-256");
  const appSecret = envAppSecret();
  if (!verifySignature(raw, sig, appSecret)) {
    console.warn("[instagram/webhook] POST signature mismatch");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let data: Record<string, unknown>;
  try {
    data = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
  } catch {
    console.warn("[instagram/webhook] malformed JSON");
    return NextResponse.json({ status: "ok" });
  }

  const entries = (data.entry as Array<Record<string, unknown>> | undefined) ?? [];
  const rows: Array<Record<string, unknown>> = [];
  let seen = 0;

  for (const entry of entries) {
    const changes = (entry.changes as Array<Record<string, unknown>> | undefined) ?? [];
    for (const change of changes) {
      if (change.field !== "comments") continue;
      const value = (change.value ?? {}) as Record<string, unknown>;
      const comment_id = value.id as string | undefined;
      const comment_text = value.text as string | undefined;
      if (!comment_id || typeof comment_text !== "string" || !comment_text.trim()) continue;

      const from = (value.from ?? {}) as Record<string, unknown>;
      const username = (from.username as string | undefined) ?? null;
      const media_id =
        (value.media_id as string | undefined) ??
        ((value.media as Record<string, unknown> | undefined)?.id as string | undefined) ??
        null;

      // Skip our own comments — prevent the agent from replying to itself
      if (username && username.toLowerCase() === AGENT_USERNAME.toLowerCase()) {
        console.log(`[instagram/webhook] Skipping own comment ${comment_id} from @${username}`);
        continue;
      }

      rows.push({
        comment_id: String(comment_id),
        comment_text: String(comment_text).trim(),
        username,
        media_id,
        status: "pending",
        // Leave enrichment (media_url, price, title) to the desktop agent
        // so we never block the webhook on a Graph fetch.
      });
      seen += 1;
    }
  }

  if (rows.length === 0) {
    // Meta also sends other fields — just ack
    return NextResponse.json({ status: "ok", processed: 0 });
  }

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch (e) {
    console.error("[instagram/webhook] supabase admin not configured", e);
    // Return 200 so Meta doesn't retry in loop; operator must add Vercel env SUPABASE_SERVICE_ROLE_KEY
    return NextResponse.json({ status: "ok", processed: 0, warning: "SUPABASE_SERVICE_ROLE_KEY not configured" });
  }

  // Upsert — comment_id is UNIQUE, pending rows are picked up by desktop poll
  const { error } = await (supabase
    .from("instagram_agent_comments") as unknown as { upsert: (rows: unknown, opts: unknown) => Promise<{ error: { message: string } | null }> })
    .upsert(rows as never, { onConflict: "comment_id", ignoreDuplicates: false });

  if (error) {
    console.error("[instagram/webhook] upsert failed", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ status: "ok", processed: seen });
}
