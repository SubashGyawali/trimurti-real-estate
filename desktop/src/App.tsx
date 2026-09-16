import { useEffect, useMemo, useRef, useState } from "react";

type HealthSnapshot = {
  ts: string;
  ollama: { ok: boolean; latencyMs?: number; models?: string[]; error?: string };
  fastapi: { ok: boolean; latencyMs?: number; error?: string };
  website: { ok: boolean; latencyMs?: number; error?: string };
  supabase: { ok: boolean; latencyMs?: number; counts?: Record<string, number>; error?: string };
};

type LogEntry = { ts: string; source: string; level: "info" | "warn" | "error"; msg: string };

type StoreShape = {
  agentPath: string;
  websitePath: string;
  pythonPath: string;
  ollamaUrl: string;
  ollamaModel: string;
  fastApiPort: number;
  websitePort: number;
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey: string;
  pollIntervalSec: number;
  autoLaunch: boolean;
  autoStartWebsite: boolean;
  localWebhookDebug: boolean;
  maxRepliesPerHour: number;
  replyMinDelay: number;
  replyMaxDelay: number;
};

declare global {
  interface Window {
    trimurti?: {
      getSettings: () => Promise<StoreShape>;
      setSettings: (p: Partial<StoreShape>) => Promise<StoreShape>;
      getHealth: () => Promise<HealthSnapshot>;
      getLogs: () => Promise<LogEntry[]>;
      clearLogs: () => Promise<void>;
      restartStack: () => Promise<void>;
      startService: (n: "ollama" | "fastapi" | "website") => Promise<void>;
      stopService: (n: "ollama" | "fastapi" | "website") => Promise<void>;
      openExternal: (url: string) => Promise<void>;
      revealSettingsFile: () => Promise<string>;
      onLogs: (cb: (e: LogEntry) => void) => () => void;
      onHealth: (cb: (h: HealthSnapshot) => void) => () => void;
    };
  }
}

const isElectron = typeof window !== "undefined" && !!window.trimurti;

function pillFor(ok: boolean, err?: string) {
  if (ok) return <span className="pill ok">● online</span>;
  return <span className="pill bad" title={err || ""}>● offline</span>;
}

function fmtLatency(ms?: number) {
  if (ms == null) return "";
  return `${ms}ms`;
}

export default function App() {
  const [tab, setTab] = useState<"overview" | "logs" | "queue" | "settings">("overview");
  const [settings, setSettings] = useState<StoreShape | null>(null);
  const [health, setHealth] = useState<HealthSnapshot | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [queueCounts, setQueueCounts] = useState<Record<string, number> | null>(null);
  const [queueLoading, setQueueLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [restarting, setRestarting] = useState(false);
  const logsRef = useRef<HTMLDivElement>(null);
  const [logFilter, setLogFilter] = useState<string>("all");

  // Load settings + health + logs
  useEffect(() => {
    if (!isElectron) return;
    window.trimurti!.getSettings().then(setSettings).catch(console.error);
    window.trimurti!.getHealth().then(setHealth).catch(console.error);
    window.trimurti!.getLogs().then(setLogs).catch(console.error);

    const off1 = window.trimurti!.onLogs((e) => setLogs((prev) => [...prev.slice(-550), e]));
    const off2 = window.trimurti!.onHealth((h) => setHealth(h));
    const t = setInterval(() => window.trimurti!.getHealth().then(setHealth).catch(() => {}), 12_000);
    return () => {
      off1();
      off2();
      clearInterval(t);
    };
  }, []);

  // Auto-scroll logs
  useEffect(() => {
    if (tab !== "logs") return;
    const el = logsRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [logs, tab, logFilter]);

  // Poll queue counts when on queue tab or overview
  const fetchQueue = async (s: StoreShape) => {
    if (!s.supabaseUrl || !s.supabaseAnonKey) {
      setQueueCounts(null);
      return;
    }
    setQueueLoading(true);
    try {
      const statuses = ["pending", "queued", "awaiting_approval", "approved", "sent", "failed", "ignored"] as const;
      const counts: Record<string, number> = {};
      for (const st of statuses) {
        const url = `${s.supabaseUrl.replace(/\/$/, "")}/rest/v1/instagram_agent_comments?select=id&status=eq.${st}&limit=1`;
        const res = await fetch(url, {
          headers: {
            apikey: s.supabaseAnonKey,
            Authorization: `Bearer ${s.supabaseAnonKey}`,
            Prefer: "count=exact",
          },
        });
        const range = res.headers.get("content-range"); // e.g. 0-0/42
        const total = range?.split("/")[1] ? parseInt(range.split("/")[1], 10) : 0;
        counts[st] = Number.isFinite(total) ? total : 0;
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      }
      setQueueCounts(counts);
    } catch (e) {
      console.warn("[queue] fetch failed", e);
      setQueueCounts(null);
    } finally {
      setQueueLoading(false);
    }
  };

  useEffect(() => {
    if (!settings) return;
    if (tab === "queue" || tab === "overview") void fetchQueue(settings);
    // poll queue every 30s when visible
    if (tab !== "queue" && tab !== "overview") return;
    const t = setInterval(() => void fetchQueue(settings), 30_000);
    return () => clearInterval(t);
  }, [settings, tab]);

  const filteredLogs = useMemo(() => {
    if (logFilter === "all") return logs.slice(-400);
    return logs.filter((l) => l.source === logFilter).slice(-400);
  }, [logs, logFilter]);

  const savePatch = async (patch: Partial<StoreShape>) => {
    if (!isElectron || !settings) return;
    setSaving(true);
    try {
      const next = await window.trimurti!.setSettings(patch);
      setSettings(next);
    } finally {
      setSaving(false);
    }
  };

  const handleRestart = async () => {
    if (!isElectron) return;
    setRestarting(true);
    try {
      await window.trimurti!.restartStack();
    } finally {
      setTimeout(() => setRestarting(false), 2500);
    }
  };

  if (!isElectron) {
    return (
      <div className="app">
        <div className="topbar">
          <div className="brand"><div className="brand-mark">◈</div> Trimurti Agent</div>
          <span className="muted">Renderer preview — run with Electron for full features</span>
        </div>
        <div className="main">
          <div className="card">
            <h3>How to run</h3>
            <p className="muted" style={{ lineHeight: 1.6 }}>
              This is the Vite preview (no Electron). To launch the desktop app:
              <br />1. <code>cd E:\Trimurti\website\desktop &amp;&amp; npm install</code>
              <br />2. <code>npm run dev</code> (Vite) in one terminal
              <br />3. <code>npm run dev:electron</code> in another — or <code>npm run dev:all</code> for both
              <br />Build installer: <code>npm run build</code> → <code>release/Trimurti Agent Setup.exe</code>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="topbar">
        <div className="brand">
          <div className="brand-mark">◈</div>
          <span>Trimurti Agent</span>
          <span className="muted" style={{ fontWeight: 400, fontSize: 11, marginLeft: 6, border: "1px solid var(--border)", padding: "2px 6px", borderRadius: 999 }}>
            {health ? new Date(health.ts).toLocaleTimeString() : "—"}
          </span>
        </div>
        <div className="tabs" role="tablist">
          {(["overview", "logs", "queue", "settings"] as const).map((t) => (
            <button key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
              {t === "overview" ? "Overview" : t === "logs" ? "Logs" : t === "queue" ? "Queue" : "Settings"}
            </button>
          ))}
        </div>
        <div className="topbar-actions">
          <button className="btn small ghost" onClick={() => window.trimurti!.getHealth().then(setHealth)} title="Refresh health">↻ Health</button>
          <button className="btn small primary" onClick={handleRestart} disabled={restarting}>{restarting ? "Restarting…" : "↻ Restart stack"}</button>
        </div>
      </div>

      <div className="main">
        {tab === "overview" && (
          <>
            <div className="grid4">
              <div className="card">
                <h3>Ollama — {settings?.ollamaModel}</h3>
                <div className="kv">
                  <span className={`dot ${health?.ollama.ok ? "ok" : "bad"}`} />
                  <span className="val" style={{ fontSize: 16 }}>{health?.ollama.ok ? "Online" : "Offline"}</span>
                  {pillFor(!!health?.ollama.ok, health?.ollama.error)}
                </div>
                <div className="muted" style={{ marginTop: 6 }}>{settings?.ollamaUrl} <span className="latency">{fmtLatency(health?.ollama.latencyMs)}</span></div>
                {health?.ollama.models && <div className="muted" style={{ marginTop: 4, wordBreak: "break-all" }}>{health.ollama.models.join(", ")}</div>}
                {health?.ollama.error && <div className="pill bad" style={{ marginTop: 8 }}>{health.ollama.error}</div>}
                <div className="row" style={{ marginTop: 10 }}>
                  <button className="btn small" onClick={() => window.trimurti!.startService("ollama")}>Start</button>
                  <button className="btn small ghost" onClick={() => window.trimurti!.stopService("ollama")}>Stop</button>
                </div>
              </div>

              <div className="card">
                <h3>FastAPI — Instagram Agent</h3>
                <div className="kv">
                  <span className={`dot ${health?.fastapi.ok ? "ok" : "bad"}`} />
                  <span className="val" style={{ fontSize: 16 }}>{health?.fastapi.ok ? "Online" : "Offline"}</span>
                  {pillFor(!!health?.fastapi.ok, health?.fastapi.error)}
                </div>
                <div className="muted" style={{ marginTop: 6 }}>127.0.0.1:{settings?.fastApiPort} <span className="latency">{fmtLatency(health?.fastapi.latencyMs)}</span></div>
                <div className="muted" style={{ marginTop: 4, wordBreak: "break-all" }}>{settings?.agentPath}</div>
                {health?.fastapi.error && <div className="pill bad" style={{ marginTop: 8 }}>{health.fastapi.error}</div>}
                <div className="row" style={{ marginTop: 10 }}>
                  <button className="btn small" onClick={() => window.trimurti!.startService("fastapi")}>Start</button>
                  <button className="btn small ghost" onClick={() => window.trimurti!.stopService("fastapi")}>Stop</button>
                  <button className="btn small ghost" onClick={() => window.trimurti!.openExternal(`http://127.0.0.1:${settings?.fastApiPort}/`)}>Open</button>
                </div>
              </div>

              <div className="card">
                <h3>Next.js — Website</h3>
                <div className="kv">
                  <span className={`dot ${health?.website.ok ? "ok" : health?.website.error ? "bad" : "warn"}`} />
                  <span className="val" style={{ fontSize: 16 }}>{settings?.autoStartWebsite ? (health?.website.ok ? "Online" : "Offline") : "Disabled"}</span>
                  {settings?.autoStartWebsite ? pillFor(!!health?.website.ok, health?.website.error) : <span className="pill">off</span>}
                </div>
                <div className="muted" style={{ marginTop: 6 }}>127.0.0.1:{settings?.websitePort} <span className="latency">{fmtLatency(health?.website.latencyMs)}</span></div>
                <div className="muted" style={{ marginTop: 4 }}>{settings?.autoStartWebsite ? settings.websitePath : "Enable in Settings → Auto-start website"}</div>
                <div className="row" style={{ marginTop: 10 }}>
                  <button className="btn small" onClick={() => window.trimurti!.startService("website")} disabled={!settings?.autoStartWebsite}>Start</button>
                  <button className="btn small ghost" onClick={() => window.trimurti!.stopService("website")}>Stop</button>
                  <button className="btn small ghost" onClick={() => window.trimurti!.openExternal(`http://127.0.0.1:${settings?.websitePort}/`)}>Open</button>
                </div>
              </div>

              <div className="card">
                <h3>Supabase — Sync Bus</h3>
                <div className="kv">
                  <span className={`dot ${health?.supabase.ok ? "ok" : "bad"}`} />
                  <span className="val" style={{ fontSize: 16 }}>{health?.supabase.ok ? "Online" : "Offline"}</span>
                  {pillFor(!!health?.supabase.ok, health?.supabase.error)}
                </div>
                <div className="muted" style={{ marginTop: 6, wordBreak: "break-all" }}>{settings?.supabaseUrl || "Not configured"}</div>
                {health?.supabase.error && <div className="pill bad" style={{ marginTop: 8 }}>{health.supabase.error}</div>}
                <div className="row" style={{ marginTop: 10 }}>
                  <button className="btn small ghost" onClick={() => settings?.supabaseUrl && window.trimurti!.openExternal(settings.supabaseUrl)}>Open</button>
                  <button className="btn small ghost" onClick={() => setTab("queue")}>Queue →</button>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="row" style={{ justifyContent: "space-between" }}>
                <h3 style={{ margin: 0 }}>Webhook</h3>
                <span className="pill ok">Permanent</span>
              </div>
              <div className="muted" style={{ marginTop: 8, lineHeight: 1.6 }}>
                Production URL (Vercel): <code style={{ color: "var(--text)" }}>https://trimurtirealestate.com/api/instagram/webhook</code> — set once in Meta Dashboard → Webhooks → Instagram.
                No <code>trycloudflare.com</code> rotation. Desktop polls Supabase, not a tunnel.
              </div>
              <div className="row" style={{ marginTop: 10 }}>
                <button className="btn small" onClick={() => window.trimurti!.openExternal("https://trimurtirealestate.com/api/instagram/webhook")}>Test webhook</button>
                <button className="btn small ghost" onClick={() => window.trimurti!.openExternal("https://developers.facebook.com/apps/")}>Meta Dashboard</button>
                <span className="muted">Verify token: <code>trimur…6nW3</code> from agent .env</span>
              </div>
            </div>

            <div className="queue-grid">
              <div className="card">
                <h3>Queue (live from Supabase)</h3>
                {queueLoading && <div className="muted">Loading…</div>}
                {!queueLoading && !queueCounts && <div className="muted">Configure Supabase in Settings to see counts. Table: <code>instagram_agent_comments</code>.</div>}
                {queueCounts && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "6px 12px", fontSize: 13, marginTop: 8 }}>
                    {Object.entries(queueCounts).map(([k, v]) => (
                      <div key={k} style={{ display: "contents" }}>
                        <span className="muted">{k}</span><strong>{v}</strong>
                      </div>
                    ))}
                  </div>
                )}
                <div className="row" style={{ marginTop: 10 }}>
                  <button className="btn small ghost" onClick={() => settings && void fetchQueue(settings)}>Refresh</button>
                  <button className="btn small ghost" onClick={() => window.trimurti!.openExternal(`https://supabase.com/dashboard/project/${settings?.supabaseUrl.split(".")[0]?.split("//")[1] || ""}`)}>Supabase</button>
                </div>
              </div>
              <div className="card">
                <h3>How it runs</h3>
                <div className="muted" style={{ lineHeight: 1.7, fontSize: 12 }}>
                  1. IG comment → Vercel webhook → Supabase <code>pending</code>
                  <br />2. Desktop FastAPI polls Supabase 60s → Ollama <code>gemma4:e2b</code> drafts reply
                  <br />3. Self-check ≥0.78 → <code>queued</code> (180-600s jitter) else <code>awaiting_approval</code>
                  <br />4. Scheduler posts (≤20/hr) → <code>sent</code> · Admin can Approve/Edit/Hide/Teach at <code>/admin/instagram</code>
                </div>
                <div className="row" style={{ marginTop: 10 }}>
                  <button className="btn small ghost" onClick={() => window.trimurti!.openExternal("http://127.0.0.1:3000/admin/instagram")}>Open /admin/instagram</button>
                </div>
              </div>
              <div className="card">
                <h3>Tray & Autostart</h3>
                <div className="muted" style={{ lineHeight: 1.6, fontSize: 12 }}>
                  • Close window → minimizes to tray (double-click tray to restore)
                  <br />• Autostart: <strong>{settings?.autoLaunch ? "ON" : "OFF"}</strong> (Windows login) — toggle in Settings
                  <br />• Logs: {logs.length} entries · Last health {health?.ts ? new Date(health.ts).toLocaleString() : "—"}
                </div>
                <div className="row" style={{ marginTop: 10 }}>
                  <button className="btn small ghost" onClick={() => window.trimurti!.revealSettingsFile()}>Reveal settings file</button>
                  <button className="btn small ghost" onClick={() => setTab("settings")}>Settings →</button>
                </div>
              </div>
            </div>

            <div className="logs">
              <div className="logs-head">
                <strong style={{ fontSize: 12 }}>Recent logs</strong>
                <span className="muted" style={{ fontSize: 11 }}>{logs.length} total</span>
                <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                  <button className="btn small ghost" onClick={() => setTab("logs")}>Open full logs</button>
                </div>
              </div>
              <div className="logs-body" style={{ maxHeight: 220 }}>
                {logs.slice(-60).map((l, i) => (
                  <div key={i} className="log-line">
                    <span className="log-ts">{new Date(l.ts).toLocaleTimeString()}</span>
                    <span className={`log-src ${l.source}`}>[{l.source}]</span>
                    <span className={`log-msg ${l.level}`}>{l.msg}</span>
                  </div>
                ))}
                {logs.length === 0 && <span className="muted">No logs yet — stack is starting…</span>}
              </div>
            </div>
          </>
        )}

        {tab === "logs" && (
          <div className="logs" style={{ flex: 1 }}>
            <div className="logs-head">
              <strong style={{ fontSize: 12 }}>Logs</strong>
              <select className="select" value={logFilter} onChange={(e) => setLogFilter(e.target.value)} style={{ padding: "4px 8px", fontSize: 12 }}>
                <option value="all">all sources</option>
                <option value="system">system</option>
                <option value="ollama">ollama</option>
                <option value="fastapi">fastapi</option>
                <option value="website">website</option>
              </select>
              <span className="muted" style={{ fontSize: 11 }}>{filteredLogs.length} shown / {logs.length} total</span>
              <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                <button className="btn small ghost" onClick={() => window.trimurti!.clearLogs().then(() => setLogs([]))}>Clear</button>
                <button className="btn small ghost" onClick={() => window.trimurti!.getLogs().then(setLogs)}>Refresh</button>
              </div>
            </div>
            <div ref={logsRef} className="logs-body" style={{ maxHeight: "calc(100vh - 220px)" }}>
              {filteredLogs.map((l, i) => (
                <div key={i} className="log-line">
                  <span className="log-ts">{new Date(l.ts).toLocaleTimeString()}</span>
                  <span className={`log-src ${l.source}`}>[{l.source}]</span>
                  <span className={`log-msg ${l.level}`}>{l.msg}</span>
                </div>
              ))}
              {filteredLogs.length === 0 && <span className="muted">No logs for this filter.</span>}
            </div>
          </div>
        )}

        {tab === "queue" && (
          <>
            <div className="card">
              <div className="row" style={{ justifyContent: "space-between" }}>
                <h3 style={{ margin: 0 }}>Supabase Queue</h3>
                <span className="muted" style={{ fontSize: 11 }}>table: instagram_agent_comments</span>
              </div>
              {!settings?.supabaseUrl || !settings?.supabaseAnonKey ? (
                <div className="pill bad" style={{ marginTop: 10 }}>Supabase URL / anon key missing — set in Settings (auto-seeded from .env if present).</div>
              ) : (
                <div className="muted" style={{ marginTop: 6, fontSize: 12, wordBreak: "break-all" }}>{settings.supabaseUrl}</div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginTop: 14 }}>
                {queueCounts ? (
                  Object.entries(queueCounts).map(([k, v]) => (
                    <div key={k} className="card" style={{ padding: 12, background: "var(--bg2)" }}>
                      <div className="muted" style={{ fontSize: 11, textTransform: "uppercase" }}>{k}</div>
                      <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>{v}</div>
                    </div>
                  ))
                ) : (
                  <div className="muted">{queueLoading ? "Loading…" : "No data — configure Supabase and click Refresh."}</div>
                )}
              </div>
              <div className="row" style={{ marginTop: 12 }}>
                <button className="btn small" onClick={() => settings && void fetchQueue(settings)} disabled={queueLoading || !settings?.supabaseUrl}>
                  {queueLoading ? "Loading…" : "↻ Refresh counts"}
                </button>
                <button className="btn small ghost" onClick={() => window.trimurti!.openExternal(`http://127.0.0.1:${settings?.websitePort}/admin/instagram`)}>Open /admin/instagram</button>
                <button className="btn small ghost" onClick={() => window.trimurti!.openExternal(`http://127.0.0.1:${settings?.fastApiPort}/`)}>Open FastAPI</button>
              </div>
              <div className="help" style={{ marginTop: 10 }}>Counts via Supabase REST with <code>Prefer: count=exact</code>. For full table use the website admin. Desktop also streams logs for every transition.</div>
            </div>
            <div className="card">
              <h3>Posting pipeline</h3>
              <div className="muted" style={{ lineHeight: 1.7, fontSize: 12 }}>
                Delayed posts: <code>queued → sent</code> after 180-600s + ≤20/hr. Admin approvals post sooner (same scheduler).
                <br />If you see <code>awaiting_approval</code> stuck, check Ollama confidence threshold and edit in <code>/admin/instagram</code> → Teach.
              </div>
            </div>
          </>
        )}

        {tab === "settings" && settings && (
          <>
            <div className="card">
              <h3>Paths & Ports</h3>
              <div className="settings-grid" style={{ marginTop: 8 }}>
                <div className="field">
                  <label>Agent path (FastAPI root, has app.py)</label>
                  <input className="input" value={settings.agentPath} onChange={(e) => setSettings({ ...settings, agentPath: e.target.value })} onBlur={() => void savePatch({ agentPath: settings.agentPath })} />
                  <span className="help">Default: D:\Projects\instagram-ai-agent</span>
                </div>
                <div className="field">
                  <label>Website path (Next.js root)</label>
                  <input className="input" value={settings.websitePath} onChange={(e) => setSettings({ ...settings, websitePath: e.target.value })} onBlur={() => void savePatch({ websitePath: settings.websitePath })} />
                  <span className="help">Needs package.json with next dev</span>
                </div>
                <div className="field">
                  <label>Python command</label>
                  <input className="input" value={settings.pythonPath} onChange={(e) => setSettings({ ...settings, pythonPath: e.target.value })} onBlur={() => void savePatch({ pythonPath: settings.pythonPath })} />
                  <span className="help">e.g. python, py -3.11, C:\Python311\python.exe</span>
                </div>
                <div className="field">
                  <label>FastAPI port</label>
                  <input className="input" type="number" value={settings.fastApiPort} onChange={(e) => setSettings({ ...settings, fastApiPort: parseInt(e.target.value || "8001", 10) })} onBlur={() => void savePatch({ fastApiPort: settings.fastApiPort })} />
                </div>
                <div className="field">
                  <label>Ollama URL</label>
                  <input className="input" value={settings.ollamaUrl} onChange={(e) => setSettings({ ...settings, ollamaUrl: e.target.value })} onBlur={() => void savePatch({ ollamaUrl: settings.ollamaUrl })} />
                </div>
                <div className="field">
                  <label>Ollama model</label>
                  <input className="input" value={settings.ollamaModel} onChange={(e) => setSettings({ ...settings, ollamaModel: e.target.value })} onBlur={() => void savePatch({ ollamaModel: settings.ollamaModel })} />
                  <span className="help">ollama list — try gemma4:e2b / qwen3-coder</span>
                </div>
                <div className="field">
                  <label>Website port</label>
                  <input className="input" type="number" value={settings.websitePort} onChange={(e) => setSettings({ ...settings, websitePort: parseInt(e.target.value || "3000", 10) })} onBlur={() => void savePatch({ websitePort: settings.websitePort })} />
                </div>
                <div className="field">
                  <label>Poll interval (seconds)</label>
                  <select className="select" value={settings.pollIntervalSec} onChange={(e) => { const v = parseInt(e.target.value, 10); setSettings({ ...settings, pollIntervalSec: v }); void savePatch({ pollIntervalSec: v }); }}>
                    <option value={30}>30s</option>
                    <option value={60}>60s</option>
                    <option value={120}>120s</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="card">
              <h3>Supabase (sync bus)</h3>
              <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>Auto-seeded from agent .env + website .env.local if present. Edit here to override. Stored locally in the Electron userData JSON — never committed.</div>
              <div className="settings-grid" style={{ marginTop: 10 }}>
                <div className="field">
                  <label>Supabase URL</label>
                  <input className="input" placeholder="https://xxx.supabase.co" value={settings.supabaseUrl} onChange={(e) => setSettings({ ...settings, supabaseUrl: e.target.value })} onBlur={() => void savePatch({ supabaseUrl: settings.supabaseUrl })} />
                </div>
                <div className="field">
                  <label>Supabase anon key</label>
                  <input className="input" type="password" placeholder="eyJ..." value={settings.supabaseAnonKey} onChange={(e) => setSettings({ ...settings, supabaseAnonKey: e.target.value })} onBlur={() => void savePatch({ supabaseAnonKey: settings.supabaseAnonKey })} />
                </div>
                <div className="field" style={{ gridColumn: "1 / -1" }}>
                  <label>Supabase service_role key (for local debug writes — keep private)</label>
                  <input className="input" type="password" placeholder="service_role …" value={settings.supabaseServiceRoleKey} onChange={(e) => setSettings({ ...settings, supabaseServiceRoleKey: e.target.value })} onBlur={() => void savePatch({ supabaseServiceRoleKey: settings.supabaseServiceRoleKey })} />
                  <span className="help">Only used if you enable local webhook writes; production writes go via Vercel env SUPABASE_SERVICE_ROLE_KEY.</span>
                </div>
              </div>
            </div>

            <div className="card">
              <h3>Behavior</h3>
              <div style={{ display: "grid", gap: 12, marginTop: 8 }}>
                <label className="checkbox-row">
                  <input type="checkbox" checked={settings.autoLaunch} onChange={(e) => { setSettings({ ...settings, autoLaunch: e.target.checked }); void savePatch({ autoLaunch: e.target.checked }); }} />
                  Start on Windows login (autostart → tray)
                </label>
                <label className="checkbox-row">
                  <input type="checkbox" checked={settings.autoStartWebsite} onChange={(e) => { setSettings({ ...settings, autoStartWebsite: e.target.checked }); void savePatch({ autoStartWebsite: e.target.checked }); }} />
                  Auto-start Next.js (pnpm dev) on boot — turn off when you use prod Vercel only
                </label>
                <div className="help">Changes apply immediately (autostart via registry, website spawns/stops).</div>
                <div className="settings-grid">
                  <div className="field">
                    <label>Max replies / hour</label>
                    <input className="input" type="number" value={settings.maxRepliesPerHour} onChange={(e) => setSettings({ ...settings, maxRepliesPerHour: parseInt(e.target.value || "20", 10) })} onBlur={() => void savePatch({ maxRepliesPerHour: settings.maxRepliesPerHour })} />
                  </div>
                  <div className="field">
                    <label>Reply delay min (s)</label>
                    <input className="input" type="number" value={settings.replyMinDelay} onChange={(e) => setSettings({ ...settings, replyMinDelay: parseInt(e.target.value || "180", 10) })} onBlur={() => void savePatch({ replyMinDelay: settings.replyMinDelay })} />
                  </div>
                  <div className="field">
                    <label>Reply delay max (s)</label>
                    <input className="input" type="number" value={settings.replyMaxDelay} onChange={(e) => setSettings({ ...settings, replyMaxDelay: parseInt(e.target.value || "600", 10) })} onBlur={() => void savePatch({ replyMaxDelay: settings.replyMaxDelay })} />
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <button className="btn primary" disabled={saving} onClick={() => void savePatch({})}>{saving ? "Saving…" : "Save (auto on blur too)"}</button>
              <button className="btn ghost" onClick={() => window.trimurti!.revealSettingsFile()}>Reveal settings file</button>
              <span className="muted">File: %APPDATA%\Trimurti Agent\trimurti-settings.json</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
