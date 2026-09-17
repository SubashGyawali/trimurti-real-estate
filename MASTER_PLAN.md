# Trimurti Instagram AI — Master Cleanup & Automation Plan

**Date:** 2026-09-16
**Author:** Hermes (professional audit, read-only inspection of both repos)
**Repos:**
- `D:\Projects\instagram-ai-agent` — FastAPI + Ollama gemma4:e2b + SQLite + Supabase mirror
- `E:\Trimurti\website` — Next.js 16 + Supabase + `/admin/instagram` control center
**Live:** `trimurtirealestate.com` on Vercel, local `pnpm dev` for dev
**Constraint:** Local LLM only (Ollama `127.0.0.1:11434`, `gemma4:e2b` 5.1B). No cloud AI budget.
**Verified now:** `gemma4:e2b` healthy, 40/41 tests pass (1 pre-existing failure), `cloudflared` not installed, `E:\Trimurti\website\desktop` does not exist.

> Single source of truth for next ~6 sessions. No secrets in repo. Every phase ends with `pytest -q` / `pnpm build` green.

---

## 1. Main Objectives

| # | Objective | Done means |
|---|-----------|------------|
| O1 | **Self-approval actually works** | 70-80% simple comments auto-approved, only leads / low-confidence go to `awaiting_approval`. No repeated template replies. Duplicate <5% |
| O2 | **Human-like replies** | Price query → `16k rent hai` (1 line, not paragraph). Other: 1-2 lines, 1 emoji max, vocab varied. Spam/emoji-only → `ignored` |
| O3 | **Desktop tray app** | Boot → tray in <10s, Ollama warm, FastAPI up, scheduler ticking, logs streaming. One settings panel |
| O4 | **Zero manual terminal** | No `uvicorn`/`pnpm dev`/`ollama serve` typing. Auto-restart on crash. One Restart-stack button |
| O5 | **Permanent webhook URL** | Meta points to `https://trimurtirealestate.com/api/instagram/webhook` forever. No `trycloudflare.com` edits |
| O6 | **Dark mode admin-only, correct** | Public always light. `/admin/*` respects light/dark/system. No global `* transition` jank. Pills visible in dark |
| O7 | **Professional polish** | `pnpm lint` 0, `pytest -q` green, `pnpm build` passes, schema in sync, no secrets committed |

---

## 2. Current State — Evidence

### 2.1 Python agent `D:\Projects\instagram-ai-agent`

| Area | File | Finding |
|------|------|---------|
| Intake | `app.py:397 POST /webhook` | Correct: verify_token check, `claim_comment` dedup, skip own username, BackgroundTasks. Works offline when Supabase absent |
| Price | `app.py:91-140 extract_price_details` | Good: `Rent: ₹37k`, `Price: ₹65-70 Lac`, `₹16,000/month`, Devanagari. Returns text/amount/listing_type |
| Title | `app.py:79 _derive_video_title` | OK: first caption line minus `Location:/Rent:/Price:` |
| Triage | `ai.py:56 triage_comment` | **Bottleneck.** JSON-mode temp 0.3, fallback `should_reply=False, confidence=0` on any Ollama error → silently ignored. No self-check |
| Generation | `ai.py:111 generate_comment_reply` | Uses PERSONA + caption/permalink/title/extracted_price + teachings + few-shot (5). Temp 0.85 num_predict 120 — good variation. `sanitize_contact_number` enforces `+91 98194 46163`. But `ensure_price_in_reply` fallback produces generic `Post ke hisaab se price …` hiding prompt failure |
| Decision | `app.py:260 decide_and_prepare` | **Bugs:** (a) `scheduled_for = now.isoformat()` not `now+delay` → scheduler fires instantly, ignoring 180-600s. (b) `get_active_teachings()` reads local SQLite, not Supabase `instagram_agent_teachings` (`supabase_sync.fetch_teachings` exists but unused). (c) `get_learned_examples()+fetch_learned_examples()` may duplicate. (d) auto path at `app.py:356` calls `generate_comment_reply` without `comment` arg (signature requires it) |
| Router | `router.py` | `prefilter_comment` blocks empty/emoji/praise/links/promo/spam — OK. `classify_comment` → `contact` if any `DETAILED_TERMS`. Too greedy: `where` triggers on `where are you from` → false contact |
| Scheduler | `scheduler.py` | 15s tick, 20/hr rate limit, 2-8s jitter. Processes both `queued due` and `approved` from Supabase. Correct pattern |
| Sync | `supabase_sync.py` | PostgREST `resolution=merge-duplicates` + retry once, `COALESCE` guards null overwrite. `fetch_teachings`/`fetch_learned_examples` available but not used in decision path |
| DB | `database.py` | `processed_comments` migrates 15 cols idempotently, indexes on (status,scheduled_for), `claim_comment` INSERT OR IGNORE. `COALESCE` on media fields |
| Config | `config.py` | `MODEL gemma4:e2b`, threshold 0.6, delays 180-600, 20/hr, contact number hard-coded (good), ASK_ADMIN_CATEGORIES={contact} |
| Tests | `tests/` | 40 pass, 1 fail. `test_contact_category_awaits_approval` expects `contact/awaiting_approval` but gets `ignore` for `What's your price?` — failure is pipeline ordering (prefilter/triage interaction under mock). Missing: scheduler delay, price guard, self-check |
| Secrets | `.env` | META/SUPABASE tokens present, `.gitignore` has `.env` |

Live repro confirmed: `router.prefilter("What's your price?")=None, classify=contact` — router is correct in isolation; failure is in webhook pipeline mocking (triage fallback returns ignore → `update_comment_result` writes `ignore`).

### 2.2 Website `E:\Trimurti\website`

| Area | File | Finding |
|------|------|---------|
| Legacy webhook | `src/app/api/instagram/comments/route.ts` | Stub — `buildDraft()` regex template, no LLM, always `awaiting_approval`, hard-coded confidence. Conflicts with agent's `/webhook` — two ingest paths |
| Admin | `src/app/admin/instagram/page.tsx` + `instagram-dashboard.tsx` + `instagram-comments-table.tsx` + `instagram-teach-panel.tsx` | Correct structure: server component fetches comments+teachings, tabs (all/needs-approval/queued/rules), card list with media link, price pill, status badge, Sheet detail, Approve/Edit/Teach/Hide. Dark bug: `bg-violet-50/border-violet-200` invisible on dark `--background 222 84% 4.9%` |
| Theme | `src/app/layout.tsx` + `globals.css` + `theme-toggle.tsx` | `ThemeProvider attribute=class enableSystem` wraps entire site — should be admin-only. `globals.css:109-115 * { transition: background-color,border-color,color … 200ms }` causes site-wide flash/jank. `header-grid-glass` always `rgba(4,40,74)` breaks on dark. Public should be forced light |
| DB types | `src/types/database.ts` | `InstagramAgentComment` + `InstagramAgentTeaching` typed, matches `supabase/schema.sql` + 3 migrations |
| Env | `src/lib/env.ts` | Has supabase anon key + ADMIN_EMAIL. Missing service_role (by design — only desktop needs it) |
| Infra | — | `cloudflared` not installed, `website/desktop` missing, `.vercel/project.json` absent (dashboard-linked) |

### 2.3 Infra

- Ollama: `gemma4:e2b 5.1B Q4_K_M ctx 131k` + `qwen3.6:27b` + `qwen3-coder:30b` present. Tag API responds.
- Agent DB: `agent.db` 73kB present.
- Website: `E:\Trimurti\website` is git repo with many unstaged changes (instagram tables, theme-toggle, globals.css, migrations). Will branch work cleanly.

---

## 3. Target Architecture

```
Instagram (trimurti.real.estate)
     │
     │ comments
     ▼
Meta Webhooks ──► https://trimurtirealestate.com/api/instagram/webhook  (Vercel, Next.js)
                      │ verify X-Hub-Signature-256 + hub.challenge, dedup comment_id
                      ▼
                 Supabase instagram_agent_comments  (RLS: admin SELECT, service_role write)
                      ▲
                      │ poll 60s + fetch teachings/examples
                      │
             Desktop App (Electron, Windows autostart → tray)
             ┌──────────────────────────────────────┐
             │ Ollama gemma4:e2b  127.0.0.1:11434    │
             │ FastAPI D:\Projects\instagram-ai-agent│
             │   scheduler 15s tick, ≤20/hr, jitter │
             │   SQLite agent.db (dedup + cache)    │
             └──────────────────────────────────────┘
                      │ decide + generate + queue
                      ▼
                 Supabase status: queued / awaiting_approval / ignored
                      │ scheduler posts POST /{comment_id}/replies
                      ▼
                 /admin/instagram — Approve / Edit / Hide / Teach
```

Invariant: Supabase is the sync bus. Website never stores `SERVICE_ROLE_KEY`. Desktop is the only writer with it + Meta token. Webhook is serverless — no tunnel for prod.

---

## 4. Cloudflare URL — Permanent Solution

**Decision (your choice 1 = yes): Option A.**

| Option | URL | Work | Verdict |
|--------|-----|------|---------|
| **A. Vercel webhook (ship)** | `https://trimurtirealestate.com/api/instagram/webhook` | Create Next.js route on Vercel, one-time Meta webhook edit, add Vercel env vars, redeploy. Desktop polls Supabase. | **Lifetime stable, no tunnel, no cost** — chosen |
| B. Named Tunnel | `https://insta-hook.trimurtirealestate.com` → local FastAPI | `cloudflared tunnel create + route dns + config.yml` as service | Only for **local webhook debug** toggle in desktop, alongside A |
| C. Quick tunnel auto-update | `https://<random>.trycloudflare.com/webhook` | Script updates `POST /{app-id}/subscriptions` | **Skip** — brittle |

We ship **A for prod + B as optional debug mode** in desktop (`Settings → Local webhook debug`). Quick tunnel retired.

---

## 5. Phased Plan (6 sessions, professional, no slop)

### Phase 0 — Groundwork [DONE]

- [x] Audit both repos, redact secrets, verify Ollama/models/tests/cloudflared/desktop state
- [x] Write this file to both repos
- [ ] Create tracking list (below) — single writer per repo per session

### Phase 1 — Agent Brain Polish: self-approval + human-like [Sessions 1-2, highest ROI]

**Goal:** Replies stop being templates; most non-lead comments auto-queue.

**Tasks — in order, each commit is independently `pytest -q` green:**

1. **Fix scheduler timing** `app.py:369-370` — `scheduled_for = (now + delay).isoformat()` with `REPLY_MIN_DELAY_SECONDS / REPLY_MAX_DELAY_SECONDS`. Add `datetime, timedelta` import. Fix same in `app.py:382-384` queue path.
2. **Fix teachings source** `app.py:319,352` — introduce `get_teachings()` helper: `try supabase_sync.fetch_teachings() (map rule strings) except → fallback get_active_teachings()`. Dedup.
3. **Fix generate call** `app.py:356` — pass `comment=comment_text` (currently missing) so Hinglish matching has context.
4. **Add self-check second pass** `ai.py` new `self_check_reply(comment, reply, extracted_price, teachings) -> {ok: bool, confidence: float, reason}` — calls gemma4:e2b temp 0.2: `Is price present when needed? Hinglish length ok?` Adjust confidence, reject if digits mismatch.
5. **Length controller** — price-only comment (`price?`, `kitna hai` class) → prompt instructs `≤18 words, must include price digits`. Enforce post-filter by re-prompt once (never slice digits). Non-price → 10-28 words.
6. **Variation hardening** — keep temp 0.85 + random seed, add anti-repeat: keep last 20 replies in `agent.db` new table `recent_replies`, reject if Levenshtein <0.35, retry once with temp+0.1.
7. **Router hardening** `router.py` — curate `DETAILED_TERMS`: remove ambiguous `where`, `how much` loose triggers; keep `price|rent|bhk|sq ft|deposit|emi|visit|booking|availability|location|address|carpet area|configuration` with word-boundary checks.
8. **Prefilter vs classify ordering** — ensure `classify_comment` is consulted before triage fallback `ignore` overwrites `contact` (fix failing test `test_contact_category_awaits_approval`).
9. **Tests** — add `tests/test_self_check.py`, `tests/test_price_guard.py`, `tests/test_scheduler_delay.py`. Ensure `pytest -q` 100% green (the 1 existing failure must pass).

**Files:** `D:\Projects\instagram-ai-agent\ai.py`, `app.py`, `router.py`, `config.py`, `database.py`, `scheduler.py`, `supabase_sync.py`, `tests/*`
**Acceptance:**
- `curl /test-comment {"comment":"price?"} + caption Rent: ₹16,000` → reply contains `16k` or `16000`, ≤18 words
- 10 calls to `generate_comment_reply("Nice property! 🔥", same caption)` → ≥7 distinct strings
- `confidence<0.6 or category==contact` → `awaiting_approval`; else `queued` with `scheduled_for = now+delay`
- `python -m pytest tests/ -q` — 0 failures
**Effort:** 1.5 sessions. Do not start Phase 2 edits until this is green.

### Phase 2 — Website Cleanup & Vercel Webhook [Session 2, parallel with tail of Phase 1]

**Goal:** Single ingest path via Vercel, legacy stub retired, types clean.

**Tasks:**
1. Create `src/app/api/instagram/webhook/route.ts` — `GET` verifies `hub.challenge` (`META_VERIFY_TOKEN`) + optional `X-Hub-Signature-256` via `META_APP_SECRET`; `POST` parses `entry[].changes[].value {id,text,from,media_id}`, dedups via `comment_id UNIQUE` (Supabase `on_conflict=comment_id`), inserts `pending`. Uses Vercel env `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (server-only). Minimal enrichment — desktop enriches title/price.
2. Deprecate `src/app/api/instagram/comments/route.ts` — add `console.warn deprecated` + return `410` or proxy to new webhook with comment. Keep file for one release.
3. `src/lib/env.ts` — add optional `META_APP_SECRET`, `META_VERIFY_TOKEN` (webhook only), no `SERVICE_ROLE_KEY` on client.
4. `pnpm lint` — fix only trivial `any` in instagram components; no broad refactors.
5. Docs — decommission quick-tunnel notes in repo.

**Files:** `E:\Trimurti\website\src\app\api\instagram\webhook\route.ts`, `.../comments/route.ts`, `src/lib/env.ts`
**Acceptance:** `pnpm build` compiles new route; `curl` with fake `hub.challenge` returns challenge text; no `/admin/instagram` regression.
**Effort:** 0.5 session. Can overlap with Phase 1 tail — different repo.

### Phase 3 — Dark Mode Fix (admin-only) [Session 3, isolated]

**Goal:** Public always light; admin respects theme; no flash; pills visible.

**Spec (research: `next-themes` admin-only pattern):**
- Root `ThemeProvider` uses `forcedTheme="light"` or admin subtree provides its own provider. Minimal change: `src/app/layout.tsx` root provider `forcedTheme="light"`, `src/app/admin/layout.tsx` wraps with `ThemeProvider enableSystem defaultTheme="system"` (admin subtree overrides).
- Remove global `* { transition: … 200ms }` (`globals.css:109-115`) — scope to `.admin *` or limit to `background-color, color, border-color` on `.admin [class*="bg-"], .admin [class*="text-"]`. Keep `prefers-reduced-motion` guard.
- Fix header: `header-grid-glass` currently `rgba(4,40,74,0.7)` — add `.dark .header-grid-glass { background: hsl(var(--card)) overlay + reduced dot opacity }`. Same for `-scrolled`.
- Pills: add `dark:` companions — `dark:border-violet-800 dark:bg-violet-950 dark:text-violet-200`, `dark:border-teal-800 dark:bg-teal-950 dark:text-teal-200`, and `dark:` for `status-*` tokens used in `instagram-comments-table.tsx`.
- `ThemeToggle` only in admin header (verify not rendered in public `header.tsx`).

**Tasks:**
1. `src/app/globals.css` — scope transitions, add dark header + pill overrides.
2. `src/app/layout.tsx` — root forced light.
3. `src/app/admin/layout.tsx` — admin provider with system support.
4. `src/components/admin/*` — add `dark:` pill classes (`violet-50`, `teal-50` search).
5. Manual verify: `/` stays light even with OS dark; `/admin` toggles without flash.

**Acceptance:** Lighthouse no CLS regression; admin cards visible in dark; `pnpm build` green.
**Effort:** 0.5 session. Parallel with Phase 4 scaffold start.

### Phase 4 — Desktop App: Electron autostart/tray/monitor [Sessions 3-4, largest scope]

**User choice 2:** "you choose easier to build/debug" → **Electron** (Node exists, `electron-builder` + `auto-launch` trivial; Tauri needs Rust toolchain — heavier for you).

**Location:** `E:\Trimurti\website\desktop\` (keeps website + desktop in one repo for shared Supabase types). Alternative `D:\…\instagram-ai-agent\desktop\` is fine — will confirm at scaffold.

```
desktop/
  package.json            (electron, electron-builder, auto-launch, electron-store)
  electron/main.ts        (autostart, tray, window, child processes)
  electron/preload.ts     (safe IPC)
  electron/tray.ts
  renderer/               (Vite + React: health, logs, queue, tunnel status)
  resources/icon.ico
```

**Main process (boot → autostart):**
1. `autoLaunch.enable()` on first run (registry `HKCU\...Run` or `app.setLoginItemSettings`). Toggle in Settings.
2. Probe `127.0.0.1:11434`; spawn `ollama serve` if absent, warm `gemma4:e2b` with keepAlive.
3. Spawn `uvicorn app:app --port 8001` from `D:\Projects\instagram-ai-agent` (path configurable).
4. Optionally spawn `pnpm dev --port 3000` from `E:\Trimurti\website` when `autoStartWebsite=ON` (you are on `pnpm dev` now; later you flip off for prod).
5. Poll `instagram_agent_comments?status=eq.pending&order=created_at.desc` every 60s (or Supabase realtime if enabled).
6. If `localWebhookDebug=ON`, run `cloudflared tunnel run --url http://localhost:8001` (Named Tunnel — needs `cloudflared` installed, we guide you once; else show "install cloudflared" banner).
7. Tray: `Show dashboard | Start/Stop stack | Logs | Quit`. Close → minimize to tray.
8. Renderer: Ollama/FastAPI/Next.js/Supabase health, tunnel URL + copy, last 50 logs (tail agent.db + stdout), queue depth, Retry for failed.

**Settings (electron-store):** poll interval (30/60/120), REPLY_MIN/MAX_DELAY, TRIAGE_THRESHOLD, MAX_REPLIES_PER_HOUR, autoLaunch, autoStartWebsite, localWebhookDebug, agent path, website path.

**Build:** `electron-builder --win nsis` → `TrimurtiAgent Setup.exe`.

**Acceptance:**
- Reboot → tray in <15s, logs show `ollama warm ✓, fastapi ✓`.
- Settings change applies without restart (IPC to agent or restart agent process).
- `pnpm --filter desktop build` produces installer.

**Effort:** 1.5 sessions. **Blocked by:** `cloudflared` Named Tunnel creation — one-time step with you; otherwise desktop works without tunnel (Vercel path).

### Phase 5 — Wire Vercel Webhook Live [Session 4-5, pair with you]

**Goal:** Real IG comment → Supabase without local tunnel.

**Tasks (your choice 4 = you can add Vercel env):**
1. You add in Vercel dashboard → Settings → Environment Variables: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `META_VERIFY_TOKEN` (trimur…6nW3), optional `META_APP_SECRET` → Redeploy.
2. Deploy `src/app/api/instagram/webhook/route.ts` (Phase 2).
3. Meta Dashboard: App → Webhooks → Instagram → Edit subscription → Callback URL `https://trimurtirealestate.com/api/instagram/webhook`, Verify Token same as .env. Then `POST /{instagram_user_id}/subscribed_apps?subscribed_fields=comments` via `subscribe_webhooks.py`.
4. Verify: post test comment on any Reel → row appears in Supabase `pending` in <3s (Vercel log).
5. If your domain is on Cloudflare: create Named Tunnel `insta-hook` and save `tunnelId + credentials.json` for desktop debug mode.
6. Retire quick-tunnel docs: remove `trycloudflare` instructions, add `docs/WEBHOOK.md`.

**Acceptance:** Comment → Webhook 200 → Supabase row in <3s. No manual URL edit after reboot.
**Effort:** 0.5 session. Requires one pairing window with you.

### Phase 6 — Polish, Tests & Handover [Session 5-6]

**Tasks:**
1. `D:\Projects\instagram-ai-agent\python -m pytest tests/ -q` → 100% green, coverage for new modules ≥80%.
2. `E:\Trimurti\website\pnpm lint && pnpm build` → 0 errors.
3. Learned-examples loop: Edit in `/admin/instagram` with `admin_action=edited` → row appears in `learned_examples` and `supabase_sync.fetch_learned_examples()` pool grows.
4. Observability: `/admin/instagram` shows `confidence`, `decision_reason`, `scheduled_for` countdown, media title link — add if missing.
5. Docs: rename `implimentation_plan.md` typo → `IMPLEMENTATION_PLAN.md`, add `desktop/README.md`, `supabase/migrations` README.
6. Secrets sweep: verify no `.env` committed; add missing keys to `.env.example` only.

**Acceptance:** Full loop: real IG comment → Supabase pending → desktop gemma reply (human-like, short if price) → queued → scheduler posts → `sent` in `/admin/instagram`. Admin Edit → next similar comment uses edited phrasing.

---

## 6. Human-like Reply — Concrete Rules (from your brief + research)

These ship as **prompt constraints** in `ai.py`, not prose:

1. **Selective reply:** `prefilter=ignore` for emoji-only / `nice/wow…` / links / `giveaway/crypto`. No reply = correct behavior.
2. **Length budget:** price-only prompt → `≤18 words, must include price digits`. Measured after `sanitize_contact_number`, truncated only via re-prompt (never slice digits).
3. **Varied phrasing:** seed random + temp 0.85, anti-repeat Levenshtein <0.35 retry. No forced `Ji,` prefix.
4. **Lazy timing:** random 180-600s queue delay (scheduler), not instant. Contact `awaiting_approval→approved→sent` is naturally longer.
5. **Hinglish default**, but follow commenter's language — English comment → English reply. Hinglish roman, not Devanagari-heavy.
6. **No invention:** if caption has price, repeat verbatim; else `exact price WhatsApp par share karenge` (never `depends on property`). Guarded by `extract_price_details` + `ensure_price_in_reply` + `self_check`.
7. **One emoji max**, optional, not every reply.
8. **Learning:** edited replies become `learned_examples` → future LoRA fine-tune needs 200+ clean pairs (future, not now).

---

## 7. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Gemma hallucinates price | extract + ensure + self_check reject on digit mismatch |
| Ollama cold start / timeout | keepAlive 30m, health probe + auto-restart in desktop; triage fallback safe (ignore not approve) |
| Supabase offline | sync never raises; queue in agent.db, retry next tick |
| Graph rate limit 200/hr | Keep 20/hr + poll Supabase not Graph |
| Dark regression on public | Root forced light — tested in Phase 3 |
| Vercel webhook auth bypass | Verify X-Hub-Signature-256 when META_APP_SECRET set |
| Installer bloat | Electron 150MB accepted; code-split renderer |

---

## 8. Session Roadmap (realistic)

| Session | Focus | Exit artifact |
|---------|-------|---------------|
| 0 (today) | This plan + sign-off | `MASTER_PLAN.md` in both repos |
| 1 | Phase 1 brain (timing, teachings, self-check, length, router) | `ai.py` v2 + `pytest -q` green |
| 2 | Phase 1 finish + Phase 2 webhook stub | `pnpm build` green |
| 3 | Phase 3 dark mode + Phase 4 scaffold | Admin dark screenshot + `electron --dev` window |
| 4 | Phase 4 full (spawns, health, logs) | `TrimurtiAgent Setup.exe` |
| 5 | Phase 5 Vercel wiring (pair with you) | Live comment → Supabase without tunnel |
| 6 | Phase 6 polish + handover | Final checkmarks, secrets sweep green |

Parallel rule: one writer per repo per session; tests between edits.

---

## 9. What You Confirmed

1. Vercel webhook permanent — **yes**
2. Electron vs Tauri — **Electron** (easier for me to debug for you)
3. Manual commands — **unknown** — desktop will auto-detect `uvicorn app:app` and `pnpm dev` defaults
4. Vercel env — **you can add**
5. Dark mode — **admin-only**

Reply `approve` → I start Phase 1 (`fix/agent-brain`). Reply with changes → I patch this file in place.

---

## 10. Immediate Next Actions (after approve)

- [ ] Session 1: branch `fix/agent-brain` in `D:\Projects\instagram-ai-agent`, apply Phase 1 patches, `pytest -q` + smoke `python -m py_compile`
- [ ] Session 2: branch `fix/webhook-and-cleanup` in `E:\Trimurti\website`, add `src/app/api/instagram/webhook/route.ts`, deprecate old route, `pnpm lint && pnpm build`
- [ ] Keep both `.env` out of git — only `.env.example` gets new keys

