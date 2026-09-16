# Trimurti Agent — Desktop App

Windows tray app that runs the Instagram AI stack locally and polls Supabase — no `trycloudflare` rotation.

## What it does (boot → tray)

1. `ollama serve` if `http://127.0.0.1:11434` is down → warms `gemma4:e2b` (`keep_alive 30m`).
2. `uvicorn app:app --host 127.0.0.1 --port 8001` from `D:\Projects\instagram-ai-agent` (path configurable).
3. Optionally `npm run dev -- -p 3000` from `E:\Trimurti\website` when **Settings → Auto-start website** is ON (leave OFF when you deploy to Vercel and only need the website locally for admin).
4. Health probe every 12s: Ollama `/api/tags`, FastAPI `:8001`, Website `:3000` (if enabled), Supabase REST (`instagram_agent_comments?limit=1`).
5. Logs ringbuffer (600 entries) streams from all child stdout/stderr → **Logs** tab + IPC to renderer.

Instagram delivery is **Vercel webhook** (`https://trimurtirealestate.com/api/instagram/webhook`) → Supabase `instagram_agent_comments` → desktop's `supabase_sync` polling consumes it. The desktop never needs a tunnel; `cloudflared` is not required.

## Quick start

```powershell
cd E:\Trimurti\website\desktop
npm install
npm run dev          # Vite on http://localhost:5173 (keep open)
npm run dev:electron # Electron window (separate terminal)
# or both at once:
npm run dev:all
```

Close window → minimizes to tray (not quit). **Double-click tray → show**. Tray menu: Show Dashboard / Restart Stack / Start Ollama/FastAPI/Website / Quit. `Restart Stack` kills FastAPI+Website (Ollama stays warm) and respawns.

## Installer

```powershell
npm run build        # tsc + vite build + electron-builder
# → release/Trimurti Agent Setup.exe  (NSIS, per-user, pick install dir)
```

Pre-req: building needs the `electron` binary already present (`npm install` runs `node node_modules/electron/install.js` — if you cleared `node_modules`, it will download ~200MB of Chromium).

## Settings

Stored in `%APPDATA%\Trimurti Agent\trimurti-settings.json` (`shell.showItemInFolder` → **Settings → Reveal settings file**).

Seeds on first launch from `D:\Projects\instagram-ai-agent\.env` + `E:\Trimurti\website\.env.local` if keys exist:

| Key | Default | Notes |
|-----|---------|-------|
| `agentPath` | `D:\Projects\instagram-ai-agent` | must contain `app.py` |
| `websitePath` | `E:\Trimurti\website` | must contain Next.js `package.json` |
| `pythonPath` | `python` | try `py`, `python3`, or full `C:\Python311\python.exe` |
| `ollamaUrl` | `http://127.0.0.1:11434` | |
| `ollamaModel` | `gemma4:e2b` | `ollama list` to verify |
| `fastApiPort` | `8001` | |
| `websitePort` | `3000` | |
| `supabaseUrl` / `supabaseAnonKey` | *(seeded)* | REST `Prefer: count=exact` for Queue counts |
| `supabaseServiceRoleKey` | *(seeded)* | only for local debug writes — prod writes go via Vercel `SUPABASE_SERVICE_ROLE_KEY` |
| `pollIntervalSec` | `60` | 30/60/120 |
| `autoLaunch` | `true` | `app.setLoginItemSettings({openAtLogin, openAsHidden:true})` → HKCU Run |
| `autoStartWebsite` | `false` | turn ON only when you want local `pnpm dev` on boot |
| `replyMinDelay` / `replyMaxDelay` | `180`/`600` | jitter for queued posts |
| `maxRepliesPerHour` | `20` | scheduler rate limit shared with agent |

Changing paths/ports restarts the affected child; toggling `autoLaunch` writes the registry immediately.

## Tabs

- **Overview** — 4 health cards (Ollama/FastAPI/Website/Supabase) + Webhook permanent URL + Queue summary + pipeline copy + tail logs (60 lines).
- **Logs** — full 400-line filter (`all`/`system`/`ollama`/`fastapi`/`website`) with Clear/Refresh, auto-scroll.
- **Queue** — Supabase live counts (`pending/queued/awaiting_approval/approved/sent/failed/ignored`) via anon key; **Open /admin/instagram** jumps to the website admin.
- **Settings** — all paths/ports/keys (password inputs for keys), poll/delay/rate controls, autostart toggles.

## Troubleshooting

- **Electron failed to install** → `node node_modules/electron/install.js` (or delete `node_modules/electron` and `npm install` again; needs internet).
- **FastAPI not ready / python not found** → set `pythonPath` to the venv's interpreter (`where python`), check `Logs` tab for `spawn:` line + `MODULE_NOT_FOUND`.
- **Ollama models empty** → `ollama list` and `ollama pull gemma4:e2b`; warm takes 10-15s on first cold start.
- **Supabase offline** → set `NEXT_PUBLIC_SUPABASE_URL` + `..._ANON_KEY` in Settings (or fix `agent/.env` and restart — Settings will re-seed on next launch if the file is deleted).
- **Autostart not sticking** → toggle OFF then ON in Settings; check Task Manager → Startup or `HKCU\Software\Microsoft\Windows\CurrentVersion\Run`.
- **`npm run typecheck` fails** → `tsc --noEmit` (renderer) is `src/**` only; `tsc -p tsconfig.electron.json` is `electron/**` — website's `tsconfig.json` excludes `desktop/`.

## Typecheck / build

```powershell
npm run typecheck       # both tsc passes
npm run build:renderer  # vite → dist/
npm run build:electron  # tsc → dist-electron/
npm run build           # installer → release/
```
