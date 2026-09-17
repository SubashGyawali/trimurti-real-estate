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

type CommentRow = {
  comment_id: string;
  username: string | null;
  comment_text: string;
  reply: string | null;
  proposed_reply?: string | null;
  status: string;
  category: string | null;
  created_at: string;
  scheduled_for: string | null;
  property_price: number | null;
  property_price_text: string | null;
  property_title: string | null;
  media_url?: string | null;
  media_title?: string | null;
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

function humanStatus(s: string): { label: string; cls: string; icon: string } {
  switch (s) {
    case "awaiting_approval": return { label: "Waiting for you", cls: "needs", icon: "⏳" };
    case "pending": return { label: "New", cls: "new", icon: "✨" };
    case "queued": return { label: "Will reply soon", cls: "queued", icon: "⏰" };
    case "sent": return { label: "Replied", cls: "done", icon: "✅" };
    case "ignored": return { label: "Skipped", cls: "skipped", icon: "⏭️" };
    case "failed": return { label: "Failed", cls: "failed", icon: "❌" };
    case "approved": return { label: "Approved", cls: "approved", icon: "✅" };
    default: return { label: s, cls: "skipped", icon: "❓" };
  }
}

function timeAgo(iso: string): string {
  const d = new Date(iso).getTime();
  const diff = Date.now() - d;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days === 1) return "yesterday";
  return `${days}d ago`;
}

function countdownText(scheduledIso: string | null, nowMs: number): { label: string; overdue: boolean; pct: number } | null {
  if (!scheduledIso) return null;
  const target = new Date(scheduledIso).getTime();
  const diff = target - nowMs;
  if (diff <= 0) return { label: "Posting now…", overdue: true, pct: 100 };
  const totalWindowMs = 10 * 60 * 1000;
  const pct = Math.min(100, Math.max(6, 100 - (diff / totalWindowMs) * 100));
  if (diff < 60_000) return { label: `in ${Math.ceil(diff / 1000)}s`, overdue: false, pct };
  if (diff < 3600_000) {
    const m = Math.floor(diff / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return { label: `in ${m}m ${s}s`, overdue: false, pct };
  }
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return { label: `in ${h}h ${m}m`, overdue: false, pct };
}

function priceLabel(row: CommentRow): string | null {
  if (row.property_price_text) return row.property_price_text;
  if (row.property_price && row.property_price > 0) {
    if (row.property_price >= 10000000) return `₹${(row.property_price / 10000000).toFixed(2).replace(/\.00$/, "")} Cr`;
    if (row.property_price >= 100000) return `₹${(row.property_price / 100000).toFixed(1).replace(/\.0$/, "")} Lakh`;
    return `₹${row.property_price.toLocaleString("en-IN")}`;
  }
  return null;
}

function initialOf(name: string | null): string {
  if (!name) return "?";
  return name.trim().charAt(0).toUpperCase();
}

function systemStatus(health: HealthSnapshot | null): { label: string; cls: string; details: string } {
  if (!health) return { label: "Starting…", cls: "starting", details: "" };
  const ollama = health.ollama.ok;
  const fastapi = health.fastapi.ok;
  const supabase = health.supabase.ok;
  if (ollama && fastapi && supabase) {
    return { label: "Everything working", cls: "ok", details: "AI is handling your Instagram comments automatically" };
  }
  const issues: string[] = [];
  if (!ollama) issues.push("AI is offline");
  if (!fastapi) issues.push("Agent is offline");
  if (!supabase) issues.push("Database disconnected");
  return { label: "Needs attention", cls: "warn", details: issues.join(" · ") };
}

export default function App() {
  const [tab, setTab] = useState<"home" | "comments" | "settings">("home");
  const [settings, setSettings] = useState<StoreShape | null>(null);
  const [health, setHealth] = useState<HealthSnapshot | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [queueCounts, setQueueCounts] = useState<Record<string, number> | null>(null);
  const [recent, setRecent] = useState<CommentRow[] | null>(null);
  const [queueLoading, setQueueLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [restarting, setRestarting] = useState(false);
  const [activityFilter, setActivityFilter] = useState<string>("needs-you");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const logsRef = useRef<HTMLDivElement>(null);
  const [logFilter, setLogFilter] = useState<string>("all");
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!isElectron) return;
    window.trimurti!.getSettings().then(setSettings).catch(console.error);
    window.trimurti!.getHealth().then(setHealth).catch(console.error);
    window.trimurti!.getLogs().then(setLogs).catch(console.error);
    const off1 = window.trimurti!.onLogs((e) => setLogs((prev) => [...prev.slice(-550), e]));
    const off2 = window.trimurti!.onHealth((h) => setHealth(h));
    const t = setInterval(() => window.trimurti!.getHealth().then(setHealth).catch(() => {}), 12_000);
    return () => { off1(); off2(); clearInterval(t); };
  }, []);

  useEffect(() => {
    if (tab !== "settings") return;
    const el = logsRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [logs, tab, logFilter, showAdvanced]);

  const fetchQueue = async (s: StoreShape) => {
    if (!s.supabaseUrl) { setQueueCounts(null); setRecent(null); return; }
    const urlBase = s.supabaseUrl.replace(/\/$/, "");
    const key = s.supabaseServiceRoleKey || s.supabaseAnonKey;
    if (!key) { setQueueCounts(null); setRecent(null); return; }
    setQueueLoading(true);
    try {
      const statuses = ["pending", "queued", "awaiting_approval", "approved", "sent", "failed", "ignored"] as const;
      const counts: Record<string, number> = {};
      await Promise.all(
        statuses.map(async (st) => {
          const u = `${urlBase}/rest/v1/instagram_agent_comments?select=id&status=eq.${st}&limit=1`;
          const res = await fetch(u, { headers: { apikey: key, Authorization: `Bearer ${key}`, Prefer: "count=exact" } });
          const range = res.headers.get("content-range");
          const total = range?.split("/")[1] ? parseInt(range.split("/")[1], 10) : 0;
          counts[st] = Number.isFinite(total) ? total : 0;
        })
      );
      setQueueCounts(counts);

      const r = await fetch(
        `${urlBase}/rest/v1/instagram_agent_comments?select=comment_id,username,comment_text,reply,proposed_reply,status,category,created_at,scheduled_for,property_price,property_price_text,property_title,media_url,media_title&order=created_at.desc&limit=30`,
        { headers: { apikey: key, Authorization: `Bearer ${key}` } }
      );
      if (r.ok) { const j = (await r.json()) as CommentRow[]; setRecent(j); }
    } catch (e) { console.warn("[queue] fetch failed", e); }
    finally { setQueueLoading(false); }
  };

  useEffect(() => {
    if (!settings) return;
    void fetchQueue(settings);
    const t = setInterval(() => void fetchQueue(settings), 30_000);
    return () => clearInterval(t);
  }, [settings]);

  const filteredLogs = useMemo(() => {
    if (logFilter === "all") return logs.slice(-400);
    return logs.filter((l) => l.source === logFilter).slice(-400);
  }, [logs, logFilter]);

  const savePatch = async (patch: Partial<StoreShape>) => {
    if (!isElectron || !settings) return;
    setSaving(true);
    try { const next = await window.trimurti!.setSettings(patch); setSettings(next); }
    finally { setSaving(false); }
  };

  const handleRestart = async () => {
    if (!isElectron) return;
    setRestarting(true);
    try { await window.trimurti!.restartStack(); }
    finally { setTimeout(() => setRestarting(false), 2500); }
  };

  const needsYou = queueCounts?.awaiting_approval ?? 0;
  const waiting = (queueCounts?.pending ?? 0) + (queueCounts?.queued ?? 0) + (queueCounts?.approved ?? 0);
  const replied = queueCounts?.sent ?? 0;
  const filtered = (queueCounts?.ignored ?? 0) + (queueCounts?.failed ?? 0);
  const total = queueCounts ? Object.values(queueCounts).reduce((a, b) => a + b, 0) : 0;

  const hasSupabase = !!(settings?.supabaseUrl && (settings?.supabaseServiceRoleKey || settings?.supabaseAnonKey));
  const sys = systemStatus(health);

  const activityList = useMemo(() => {
    if (!recent) return [];
    if (activityFilter === "all") return recent;
    if (activityFilter === "needs-you") return recent.filter((r) => r.status === "awaiting_approval");
    if (activityFilter === "waiting") return recent.filter((r) => r.status === "pending" || r.status === "queued" || r.status === "approved");
    if (activityFilter === "replied") return recent.filter((r) => r.status === "sent");
    if (activityFilter === "skipped") return recent.filter((r) => r.status === "ignored" || r.status === "failed");
    return recent.filter((r) => r.status === activityFilter);
  }, [recent, activityFilter]);

  const renderRow = (r: CommentRow) => {
    const hs = humanStatus(r.status);
    const cd = countdownText(r.scheduled_for, nowMs);
    const displayReply = r.reply || r.proposed_reply || null;
    const price = priceLabel(r);
    return (
      <div key={r.comment_id} className="activity-item">
        <div className="avatar">{initialOf(r.username)}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <strong style={{ fontSize: 14 }}>{r.username || "unknown"}</strong>
            <span className="muted2" style={{ fontSize: 12 }}>{timeAgo(r.created_at)}</span>
            {price && <span className="pill price">{price}</span>}
            <span className={`badge ${hs.cls}`} style={{ marginLeft: "auto" }}>{hs.icon} {hs.label}</span>
          </div>
          <div style={{ fontSize: 13, marginTop: 4, color: "var(--text2)", lineHeight: 1.4, overflowWrap: "anywhere" }}>{r.comment_text}</div>
          {displayReply && (
            <div
              style={{
                fontSize: 12, marginTop: 6, padding: "8px 12px", borderRadius: 8,
                background: r.status === "awaiting_approval" ? "rgba(245,158,11,0.1)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${r.status === "awaiting_approval" ? "rgba(245,158,11,0.25)" : "var(--border-subtle)"}`,
                color: "var(--muted)", lineHeight: 1.4, overflowWrap: "anywhere",
              }}
            >
              ↳ {displayReply}
            </div>
          )}
          {(r.media_url || r.media_title) && (
            <div className="muted2" style={{ fontSize: 11, marginTop: 6, display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
              {r.media_title && <span style={{ color: "var(--muted)" }}>🔗 {r.media_title}</span>}
              {r.media_url && (
                <button className="btn small ghost" style={{ padding: "2px 8px", fontSize: 11, borderRadius: 999 }} onClick={() => window.trimurti!.openExternal(r.media_url!)}>Open post ↗</button>
              )}
              {!r.media_url && r.status === "pending" && <span>· getting link…</span>}
            </div>
          )}
          {r.status === "awaiting_approval" && (
            <div className="meta-row">
              <span className="pill warn">⏳ Waiting for your approval</span>
              <span className="muted2" style={{ fontSize: 11 }}>Draft ready · {timeAgo(r.created_at)} · Click "Review" to approve or edit</span>
            </div>
          )}
          {r.status === "approved" && (
            <div className="meta-row">
              <span className="pill approved">✅ Approved — posting shortly</span>
              <span className="muted2" style={{ fontSize: 11 }}>Will post in the next few seconds</span>
            </div>
          )}
          {(r.status === "pending" || r.status === "queued") && r.scheduled_for && cd && (
            <div className="meta-row">
              <span className={`pill ${cd.overdue ? "overdue" : ""}`}>⏰ {cd.label}</span>
              <span className="muted2" style={{ fontSize: 11 }}>{new Date(r.scheduled_for).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · waiting to post</span>
              {!cd.overdue && <span className="progress-bar" aria-hidden><span className="progress-fill" style={{ width: `${cd.pct}%` }} /></span>}
            </div>
          )}
          {r.status === "pending" && !r.scheduled_for && (
            <div className="meta-row">
              <span className="pill new">✨ New — AI is drafting a reply</span>
              <span className="muted2" style={{ fontSize: 11 }}>{timeAgo(r.created_at)} · Will appear here shortly</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!isElectron) {
    return (
      <div className="app">
        <div className="topbar">
          <div className="brand"><div className="brand-mark">◈</div> Trimurti Agent</div>
          <span className="muted">Preview mode — run with Electron for full features</span>
        </div>
        <div className="main">
          <div className="card" style={{ maxWidth: 500, margin: "0 auto" }}>
            <h3>How to run</h3>
            <p className="muted" style={{ lineHeight: 1.6 }}>
              This is the Vite preview (no Electron).<br />
              1. <code>cd E:\Trimurti\website\desktop && npm install</code><br />
              2. <code>npm run dev</code> (Vite) in one terminal<br />
              3. <code>npm run dev:electron</code> in another — or <code>npm run dev:all</code> for both
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
          <span className="time-badge">{health ? new Date(health.ts).toLocaleTimeString() : "—"}</span>
        </div>
        <div className="tabs" role="tablist">
          <button className={`tab ${tab === "home" ? "active" : ""}`} onClick={() => setTab("home")}>Home</button>
          <button className={`tab ${tab === "comments" ? "active" : ""}`} onClick={() => setTab("comments")}>Comments</button>
          <button className={`tab ${tab === "settings" ? "active" : ""}`} onClick={() => setTab("settings")}>Settings</button>
        </div>
        <div className="topbar-actions">
          <button className="btn small ghost" onClick={() => settings && void fetchQueue(settings)} title="Refresh">↻</button>
          <button className="btn small primary" onClick={handleRestart} disabled={restarting}>{restarting ? "Restarting…" : "Restart"}</button>
        </div>
      </div>

      <div className="main">
        {tab === "home" && (
          <>
            {!hasSupabase ? (
              <div className="banner warn">
                <div className="banner-dot warn" />
                <div>
                  <div className="banner-title">Connect to your database</div>
                  <div className="banner-desc">Add your Supabase keys in Settings to see comments. We'll try to auto-fill from your .env files.</div>
                </div>
                <button className="btn small" onClick={() => setTab("settings")}>Open Settings</button>
              </div>
            ) : needsYou > 0 ? (
              <div className="banner warn">
                <div className="banner-dot warn" />
                <div>
                  <div className="banner-title">{needsYou} comment{needsYou === 1 ? "" : "s"} need your review</div>
                  <div className="banner-desc">AI drafted replies but wants your OK before posting. One click to approve or edit.</div>
                </div>
                <button className="btn primary" onClick={() => window.trimurti!.openExternal("http://127.0.0.1:3000/admin/instagram")}>Review Now →</button>
              </div>
            ) : sys.cls === "warn" ? (
              <div className="banner warn">
                <div className="banner-dot warn" />
                <div>
                  <div className="banner-title">Something needs attention</div>
                  <div className="banner-desc">{sys.details}</div>
                </div>
                <button className="btn small" onClick={handleRestart}>Restart</button>
              </div>
            ) : (
              <div className="banner ok">
                <div className="banner-dot ok" />
                <div>
                  <div className="banner-title">All good — AI is handling your Instagram</div>
                  <div className="banner-desc">{total > 0 ? `${replied} replied · ${waiting} waiting · ${needsYou} need you` : "No comments yet. When someone comments, it appears here."}</div>
                </div>
                {total > 0 && <span className="pill ok" style={{ marginLeft: "auto" }}>{total} total</span>}
              </div>
            )}

            <div className="stats-row">
              <div className={`stat-card ${needsYou > 0 ? "highlight" : ""}`}>
                <div className="stat-icon">{needsYou > 0 ? "⏳" : "⏳"}</div>
                <div className={`stat-number ${needsYou > 0 ? "warn" : ""}`}>{queueCounts ? needsYou : "—"}</div>
                <div className="stat-label">Need your review</div>
                <div className="stat-desc">AI drafted a reply, waiting for your OK</div>
              </div>

              <div className="stat-card">
                <div className="stat-icon done">✅</div>
                <div className="stat-number done">{queueCounts ? replied : "—"}</div>
                <div className="stat-label">Replied</div>
                <div className="stat-desc">Comments already answered</div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">⏰</div>
                <div className="stat-number">{queueCounts ? waiting : "—"}</div>
                <div className="stat-label">Waiting to reply</div>
                <div className="stat-desc">New comments — AI will answer in a few minutes</div>
              </div>

              <div className="stat-card">
                <div className="stat-icon muted">⏭️</div>
                <div className="stat-number muted">{queueCounts ? filtered : "—"}</div>
                <div className="stat-label">Filtered out</div>
                <div className="stat-desc">Spam or ignored — no action needed</div>
              </div>
            </div>

            <div className={`system-status ${sys.cls}`}>
              <span className="status-dot" />
              <span className="status-text">{sys.label}</span>
              <span className="status-details">{sys.details}</span>
            </div>

            <div className="card">
              <div className="card-header">
                <h3>Recent comments</h3>
                <button className="btn small ghost" onClick={() => setTab("comments")}>See all →</button>
              </div>
              {!hasSupabase ? (
                <div className="empty">Connect Supabase in Settings to see comments here.</div>
              ) : queueLoading && !recent ? (
                <div className="empty">Loading…</div>
              ) : !recent || recent.length === 0 ? (
                <div className="empty">No comments yet — when someone comments on your Instagram, it'll show up here.</div>
              ) : (
                <div className="activity-list">{recent.slice(0, 6).map((r) => renderRow(r))}</div>
              )}
              <div className="card-footer">
                <button className="btn primary" onClick={() => window.trimurti!.openExternal("http://127.0.0.1:3000/admin/instagram")}>Review Comments</button>
                <span className="hint">Approve or edit in the web admin — the AI learns from your changes.</span>
              </div>
            </div>
          </>
        )}

        {tab === "comments" && (
          <>
            <div className="card">
              <div className="card-header">
                <h3>All Comments</h3>
                <span className="muted2" style={{ fontSize: 11 }}>{total} total · updates every 30s</span>
              </div>
              {!hasSupabase ? (
                <div className="pill bad" style={{ marginTop: 10 }}>Not connected — set up Supabase in Settings.</div>
              ) : (
                <div className="muted2" style={{ marginTop: 6, fontSize: 11 }}>Sorted by newest · live countdown for pending replies</div>
              )}

              {queueCounts && (
                <div className="filter-pills" style={{ marginTop: 12 }}>
                  <button className={`pill-filter ${activityFilter === "needs-you" ? "active" : ""}`} onClick={() => setActivityFilter("needs-you")}>⏳ Needs you ({needsYou})</button>
                  <button className={`pill-filter ${activityFilter === "waiting" ? "active" : ""}`} onClick={() => setActivityFilter("waiting")}>⏰ Waiting ({waiting})</button>
                  <button className={`pill-filter ${activityFilter === "replied" ? "active" : ""}`} onClick={() => setActivityFilter("replied")}>✅ Replied ({replied})</button>
                  <button className={`pill-filter ${activityFilter === "skipped" ? "active" : ""}`} onClick={() => setActivityFilter("skipped")}>⏭️ Skipped ({filtered})</button>
                  <button className={`pill-filter ${activityFilter === "all" ? "active" : ""}`} onClick={() => setActivityFilter("all")}>All ({total})</button>
                </div>
              )}

              <div style={{ marginTop: 14 }}>
                {!recent ? (
                  <div className="empty" style={{ padding: 20, textAlign: "center" }}>{queueLoading ? "Loading…" : "No data — check Settings and hit Refresh."}</div>
                ) : activityList.length === 0 ? (
                  <div className="empty" style={{ padding: 20, textAlign: "center" }}>Nothing in this filter.</div>
                ) : (
                  <div className="activity-list">{activityList.map((r) => renderRow(r))}</div>
                )}
              </div>

              <div className="card-footer">
                <button className="btn small" onClick={() => settings && void fetchQueue(settings)} disabled={queueLoading || !hasSupabase}>{queueLoading ? "Loading…" : "↻ Refresh"}</button>
                <button className="btn small ghost" onClick={() => window.trimurti!.openExternal("http://127.0.0.1:3000/admin/instagram")}>Open Web Admin</button>
              </div>
            </div>
          </>
        )}

        {tab === "settings" && settings && (
          <>
            <div className="card">
              <h3>System Health</h3>
              <p className="muted" style={{ marginTop: 4, fontSize: 13 }}>Green = working. If something shows red, click Restart.</p>
              <div className="system-grid" style={{ marginTop: 12 }}>
                <div className={`system-item ${health?.ollama.ok ? "ok" : "bad"}`}>
                  <span className="sys-icon">🤖</span>
                  <div>
                    <strong>AI Model</strong>
                    <span className="sys-detail">{health?.ollama.ok ? "Ready" : "Offline"}</span>
                    {health?.ollama.models && <span className="sys-model">{health.ollama.models.join(", ")}</span>}
                  </div>
                </div>
                <div className={`system-item ${health?.fastapi.ok ? "ok" : "bad"}`}>
                  <span className="sys-icon">⚙️</span>
                  <div>
                    <strong>Agent</strong>
                    <span className="sys-detail">{health?.fastapi.ok ? "Running" : "Offline"}</span>
                  </div>
                </div>
                <div className={`system-item ${health?.supabase.ok ? "ok" : "bad"}`}>
                  <span className="sys-icon">🗄️</span>
                  <div>
                    <strong>Database</strong>
                    <span className="sys-detail">{health?.supabase.ok ? "Connected" : "Disconnected"}</span>
                  </div>
                </div>
              </div>
              {(health?.ollama.error || health?.fastapi.error || health?.supabase.error) && (
                <div className="pill bad" style={{ marginTop: 8, display: "inline-block" }}>
                  {health?.ollama.error || health?.fastapi.error || health?.supabase.error}
                </div>
              )}
              <div className="card-actions" style={{ marginTop: 12 }}>
                <button className="btn small" onClick={() => window.trimurti!.startService("ollama")}>Start AI</button>
                <button className="btn small ghost" onClick={() => window.trimurti!.stopService("ollama")}>Stop AI</button>
                <button className="btn small" onClick={() => window.trimurti!.startService("fastapi")}>Start Agent</button>
                <button className="btn small ghost" onClick={() => window.trimurti!.stopService("fastapi")}>Stop Agent</button>
                <button className="btn primary" onClick={handleRestart} disabled={restarting}>{restarting ? "Restarting…" : "Restart All"}</button>
              </div>
            </div>

            <div className="card" style={{ marginTop: 14 }}>
              <div className="card-header">
                <strong>Webhook</strong>
                <span className="pill ok">Active</span>
              </div>
              <p className="muted" style={{ marginTop: 6, fontSize: 13 }}>
                <code style={{ color: "var(--text)" }}>https://trimurtirealestate.com/api/instagram/webhook</code> — Already set in Meta Dashboard. No changes needed.
              </p>
              <div className="card-actions" style={{ marginTop: 8 }}>
                <button className="btn small ghost" onClick={() => window.trimurti!.openExternal("https://trimurtirealestate.com/api/instagram/webhook")}>Test Link</button>
                <button className="btn small ghost" onClick={() => window.trimurti!.openExternal("https://developers.facebook.com/apps/")}>Meta Dashboard</button>
              </div>
            </div>

            <div className="card" style={{ marginTop: 14 }}>
              <button className="btn small ghost" style={{ width: "100%", justifyContent: "space-between", display: "flex" }} onClick={() => setShowAdvanced((v) => !v)}>
                <span>{showAdvanced ? "▾ Hide advanced settings" : "▸ Show advanced settings"}</span>
                <span className="muted2" style={{ fontSize: 11 }}>Ports, paths, keys, logs</span>
              </button>

              {showAdvanced && (
                <>
                  <div className="divider" />
                  <h4 style={{ margin: "14px 0 8px", fontSize: 12, color: "var(--muted)" }}>Paths & Ports</h4>
                  <div className="settings-grid">
                    <div className="field">
                      <label>Agent folder (contains app.py)</label>
                      <input className="input" value={settings.agentPath} onChange={(e) => setSettings({ ...settings, agentPath: e.target.value })} onBlur={() => void savePatch({ agentPath: settings.agentPath })} />
                      <span className="help">Default: D:\Projects\instagram-ai-agent</span>
                    </div>
                    <div className="field">
                      <label>Website folder</label>
                      <input className="input" value={settings.websitePath} onChange={(e) => setSettings({ ...settings, websitePath: e.target.value })} onBlur={() => void savePatch({ websitePath: settings.websitePath })} />
                      <span className="help">Needs package.json with next dev</span>
                    </div>
                    <div className="field">
                      <label>Python command</label>
                      <input className="input" value={settings.pythonPath} onChange={(e) => setSettings({ ...settings, pythonPath: e.target.value })} onBlur={() => void savePatch({ pythonPath: settings.pythonPath })} />
                      <span className="help">e.g. py, py -3.11, C:\Python314\python.exe</span>
                    </div>
                    <div className="field"><label>Agent port</label><input className="input" type="number" value={settings.fastApiPort} onChange={(e) => setSettings({ ...settings, fastApiPort: parseInt(e.target.value || "8001", 10) })} onBlur={() => void savePatch({ fastApiPort: settings.fastApiPort })} /></div>
                    <div className="field"><label>AI URL</label><input className="input" value={settings.ollamaUrl} onChange={(e) => setSettings({ ...settings, ollamaUrl: e.target.value })} onBlur={() => void savePatch({ ollamaUrl: settings.ollamaUrl })} /></div>
                    <div className="field"><label>AI Model</label><input className="input" value={settings.ollamaModel} onChange={(e) => setSettings({ ...settings, ollamaModel: e.target.value })} onBlur={() => void savePatch({ ollamaModel: settings.ollamaModel })} /><span className="help">Run <code>ollama list</code> — e.g. gemma4:e2b</span></div>
                    <div className="field"><label>Website port</label><input className="input" type="number" value={settings.websitePort} onChange={(e) => setSettings({ ...settings, websitePort: parseInt(e.target.value || "3000", 10) })} onBlur={() => void savePatch({ websitePort: settings.websitePort })} /></div>
                    <div className="field">
                      <label>Check for new comments every</label>
                      <select className="select" value={settings.pollIntervalSec} onChange={(e) => { const v = parseInt(e.target.value, 10); setSettings({ ...settings, pollIntervalSec: v }); void savePatch({ pollIntervalSec: v }); }}>
                        <option value={30}>30 seconds</option>
                        <option value={60}>1 minute</option>
                        <option value={120}>2 minutes</option>
                      </select>
                    </div>
                  </div>

                  <div className="divider" />
                  <h4 style={{ margin: "14px 0 8px", fontSize: 12, color: "var(--muted)" }}>Database (Supabase)</h4>
                  <p className="muted" style={{ fontSize: 11, marginBottom: 8 }}>Auto-filled from your .env files. Stored only on this PC — never uploaded.</p>
                  <div className="settings-grid">
                    <div className="field"><label>Supabase URL</label><input className="input" placeholder="https://xxx.supabase.co" value={settings.supabaseUrl} onChange={(e) => setSettings({ ...settings, supabaseUrl: e.target.value })} onBlur={() => void savePatch({ supabaseUrl: settings.supabaseUrl })} /></div>
                    <div className="field"><label>Anon key</label><input className="input" type="password" placeholder="eyJ..." value={settings.supabaseAnonKey} onChange={(e) => setSettings({ ...settings, supabaseAnonKey: e.target.value })} onBlur={() => void savePatch({ supabaseAnonKey: settings.supabaseAnonKey })} /></div>
                    <div className="field" style={{ gridColumn: "1 / -1" }}>
                      <label>Service role key (for counting rows)</label>
                      <input className="input" type="password" placeholder="service_role …" value={settings.supabaseServiceRoleKey} onChange={(e) => setSettings({ ...settings, supabaseServiceRoleKey: e.target.value })} onBlur={() => void savePatch({ supabaseServiceRoleKey: settings.supabaseServiceRoleKey })} />
                      <span className="help">This app uses it to read counts. Your website uses anon key (RLS). Keep private.</span>
                    </div>
                  </div>

                  <div className="divider" />
                  <h4 style={{ margin: "14px 0 8px", fontSize: 12, color: "var(--muted)" }}>Reply Behavior</h4>
                  <div className="checkbox-row">
                    <input type="checkbox" checked={settings.autoLaunch} onChange={(e) => { setSettings({ ...settings, autoLaunch: e.target.checked }); void savePatch({ autoLaunch: e.target.checked }); }} />
                    <span>Start on Windows login (runs in background)</span>
                  </div>
                  <div className="checkbox-row">
                    <input type="checkbox" checked={settings.autoStartWebsite} onChange={(e) => { setSettings({ ...settings, autoStartWebsite: e.target.checked }); void savePatch({ autoStartWebsite: e.target.checked }); }} />
                    <span>Auto-start website on boot — leave OFF if you use Vercel</span>
                  </div>
                  <div className="settings-grid">
                    <div className="field"><label>Max replies per hour</label><input className="input" type="number" value={settings.maxRepliesPerHour} onChange={(e) => setSettings({ ...settings, maxRepliesPerHour: parseInt(e.target.value || "20", 10) })} onBlur={() => void savePatch({ maxRepliesPerHour: settings.maxRepliesPerHour })} /></div>
                    <div className="field"><label>Minimum delay (seconds)</label><input className="input" type="number" value={settings.replyMinDelay} onChange={(e) => setSettings({ ...settings, replyMinDelay: parseInt(e.target.value || "180", 10) })} onBlur={() => void savePatch({ replyMinDelay: settings.replyMinDelay })} /></div>
                    <div className="field"><label>Maximum delay (seconds)</label><input className="input" type="number" value={settings.replyMaxDelay} onChange={(e) => setSettings({ ...settings, replyMaxDelay: parseInt(e.target.value || "600", 10) })} onBlur={() => void savePatch({ replyMaxDelay: settings.replyMaxDelay })} /></div>
                  </div>

                  <div className="divider" />
                  <h4 style={{ margin: "14px 0 8px", fontSize: 12, color: "var(--muted)" }}>Logs</h4>
                  <div className="logs">
                    <div className="logs-head">
                      <strong style={{ fontSize: 12 }}>Activity Log</strong>
                      <select className="select" value={logFilter} onChange={(e) => setLogFilter(e.target.value)} style={{ padding: "4px 8px", fontSize: 12 }}>
                        <option value="all">All</option>
                        <option value="system">System</option>
                        <option value="ollama">AI</option>
                        <option value="fastapi">Agent</option>
                        <option value="website">Website</option>
                      </select>
                      <span className="muted" style={{ fontSize: 11 }}>{filteredLogs.length} shown / {logs.length} total</span>
                      <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                        <button className="btn small ghost" onClick={() => window.trimurti!.clearLogs().then(() => setLogs([]))}>Clear</button>
                        <button className="btn small ghost" onClick={() => window.trimurti!.getLogs().then(setLogs)}>Refresh</button>
                      </div>
                    </div>
                    <div ref={logsRef} className="logs-body" style={{ maxHeight: 280 }}>
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

                  <div className="card-actions" style={{ marginTop: 14 }}>
                    <button className="btn primary" disabled={saving} onClick={() => void savePatch({})}>{saving ? "Saving…" : "Save Changes"}</button>
                    <button className="btn ghost" onClick={() => window.trimurti!.revealSettingsFile()}>Open Settings Folder</button>
                    <span className="muted2" style={{ fontSize: 11 }}>%APPDATA%\trimurti-desktop\trimurti-settings.json</span>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}