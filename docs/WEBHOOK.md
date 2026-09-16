# Instagram Webhook — Permanent (Vercel) Setup

No Cloudflare tunnel, no `trycloudflare.com` rotation. Production callback is fixed at:

```
https://trimurtirealestate.com/api/instagram/webhook
```

Implementation: `E:\Trimurti\website\src\app\api\instagram\webhook\route.ts`.

- `GET` → Meta verification: `?hub.mode=subscribe&hub.verify_token=<META_VERIFY_TOKEN>&hub.challenge=<random>` → returns `hub.challenge` if tokens match, else 403.
- `POST` → optional `X-Hub-Signature-256: sha256=<hmac>` checked against `META_APP_SECRET` (timing-safe, skipped if `META_APP_SECRET` not set). Parses `entry[].changes[]` → each `value` with `{id, text, from, media_id}`, dedups via `comment_id UNIQUE`, inserts `status='pending'` into `instagram_agent_comments` via service_role `on_conflict=comment_id`.

Enrichment (permalink, caption, title, price) is done by the desktop's Python agent from `media_id` — the webhook stays fast.

## Required env vars (Vercel)

Set in **Vercel Dashboard → Project → Settings → Environment Variables**, then **Redeploy**:

| Var | Value | Where from |
|-----|-------|------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<ref>.supabase.co` | Supabase Project Settings |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key | same |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key | **never** expose to browser; used only by `/api/instagram/webhook` |
| `META_VERIFY_TOKEN` | same as `D:\Projects\instagram-ai-agent\.env: META_VERIFY_TOKEN` | e.g. `trimur...6nW3` |
| `META_APP_SECRET` | Meta App → Settings → Basic → App Secret | optional but recommended for HMAC |

See `E:\Trimurti\website\.env.example`. The Next.js side exposes only `NEXT_PUBLIC_*` to the browser.

## Legacy route

`POST /api/instagram/comments` is deprecated — it returns `200 {deprecated:true, migrate_to:"/api/instagram/webhook"}` with `X-Deprecated` header. The agent's `D:\Projects\instagram-ai-agent` no longer posts there; keep the file one release then delete.

## Meta Dashboard (one-time)

1. https://developers.facebook.com → your App → **Webhooks** → **Instagram** → **Edit subscription**
2. **Callback URL**: `https://trimurtirealestate.com/api/instagram/webhook`
3. **Verify Token**: exact `META_VERIFY_TOKEN`
4. **Subscribe** → Meta will `GET` the URL with `hub.challenge`; Vercel logs should show `200`.
5. Check **comments** field.
6. Subscribe the IG user via script:

```powershell
cd D:\Projects\instagram-ai-agent
python subscribe_webhooks.py
# or: python check_subscription.py to verify subscribed_fields=comments
```

This calls `POST /{instagram_user_id}/subscribed_apps?subscribed_fields=comments`.

## Verify end-to-end

- **Webhook reachable**: `curl "https://trimurtirealestate.com/api/instagram/webhook?hub.mode=subscribe&hub.verify_token=<TOKEN>&hub.challenge=hello"` → body `hello`.
- **DB insert**: post a test comment on any Reel → in Supabase **Table Editor → instagram_agent_comments** a row with that `comment_id` appears within ~3s (Vercel Functions log: `200 processed=1`). Status starts `pending`.
- **Agent → Supabase** → desktop poll → Ollama draft → `queued` (with `scheduled_for = now + 180-600s`) or `awaiting_approval` if low confidence. Admin approves at `/admin/instagram` → scheduler posts via Graph within the next tick (≤15s + rate-limit jitter).

## Desktop debug (local)

The desktop app **does not** run a tunnel. It just polls Supabase:

- Open **Desktop → Settings** to confirm `supabaseUrl`/`anonKey` match Vercel.
- **Logs** tab shows `[fastapi]` / `[ollama]` / `[supabase]` health; **Queue** tab uses `Prefer: count=exact` via anon key.
- If you really need a local webhook for development, set `localWebhookDebug=ON` in Settings and run `cloudflared tunnel run --url http://localhost:8001` separately — but for production you don't need it.

## Troubleshooting

- **Meta verification fails (403)** → `META_VERIFY_TOKEN` mismatch between `.env`, `agent/.env`, and Vercel; redeploy after changing Vercel env.
- **HMAC 401 on POST** → `META_APP_SECRET` mismatch; leaving it unset disables the check (not recommended).
- **Row not in Supabase** → check Vercel → Deployments → Latest → Functions → `/api/instagram/webhook` logs; verify `SUPABASE_SERVICE_ROLE_KEY` is the **service_role** (not anon) and table has `comment_id UNIQUE`.
- **Comment stays pending** → desktop/FastAPI not polling; check **Desktop → Overview** health (FastAPI `:8001`, Supabase online) and `D:\Projects\instagram-ai-agent\agent.db` `processed_comments` via `sqlite3 agent.db "select status, scheduled_for from processed_comments order by created_at desc limit 5;"`.
