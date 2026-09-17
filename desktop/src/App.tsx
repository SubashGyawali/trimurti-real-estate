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

// human labels
function humanStatus(s: string): { label: string; cls: string } {
  switch (s) {
    case "awaiting_approval":
      return { label: "Needs you", cls: "needs" };
    case "pending":
      return { label: "New", cls: "scheduled" };
    case "queued":
      return { label: "Will reply soon", cls: "scheduled" };
    case "sent":
      return { label: "Replied", cls: "sent" };
    case "ignored":
      return { label: "Skipped", cls: "skipped" };
    case "failed":
      return { label: "Failed", cls: "failed" };
    case "approved":
      return { label: "Approved", cls: "scheduled" };
    default:
      return { label: s, cls: "skipped" };
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
  const totalWindowMs = 10 * 60 * 1000; // visual bar over ~10m; caps at 100%
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
    // fallback formatting
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

export default function App() {
  const [tab, setTab] = useState<"overview" | "activity" | "settings">("overview");
  const [settings, setSettings] = useState<StoreShape | null>(null);
  const [health, setHealth] = useState<HealthSnapshot | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [queueCounts, setQueueCounts] = useState<Record<string, number> | null>(null);
  const [recent, setRecent] = useState<CommentRow[] | null>(null);
  const [queueLoading, setQueueLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [restarting, setRestarting] = useState(false);
  const [activityFilter, setActivityFilter] = useState<string>("all");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const logsRef = useRef<HTMLDivElement>(null);
  const [logFilter, setLogFilter] = useState<string>("all");
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

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

  useEffect(() => {
    if (tab !== "settings") return;
    const el = logsRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [logs, tab, logFilter, showAdvanced]);

  const fetchQueue = async (s: StoreShape) => {
    if (!s.supabaseUrl) {
      setQueueCounts(null);
      setRecent(null);
      return;
    }
    const urlBase = s.supabaseUrl.replace(/\/$/, "");
    const key = s.supabaseServiceRoleKey || s.supabaseAnonKey;
    if (!key) {
      setQueueCounts(null);
      setRecent(null);
      return;
    }
    setQueueLoading(true);
    try {
      const statuses = ["pending", "queued", "awaiting_approval", "approved", "sent", "failed", "ignored"] as const;
      const counts: Record<string, number> = {};
      await Promise.all(
        statuses.map(async (st) => {
          const u = `${urlBase}/rest/v1/instagram_agent_comments?select=id&status=eq.${st}&limit=1`;
          const res = await fetch(u, {
            headers: { apikey: key, Authorization: `Bearer ${key}`, Prefer: "count=exact" },
          });
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
      if (r.ok) {
        const j = (await r.json()) as CommentRow[];
        setRecent(j);
      }
    } catch (e) {
      console.warn("[queue] fetch failed", e);
    } finally {
      setQueueLoading(false);
    }
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

  const needsYou = queueCounts?.awaiting_approval ?? 0;
  const waiting = (queueCounts?.pending ?? 0) + (queueCounts?.queued ?? 0) + (queueCounts?.approved ?? 0);
  const replied = queueCounts?.sent ?? 0;
  const filtered = (queueCounts?.ignored ?? 0) + (queueCounts?.failed ?? 0);
  const total = queueCounts ? Object.values(queueCounts).reduce((a, b) => a + b, 0) : 0;

  const systemOk = !!health?.ollama.ok && !!health?.fastapi.ok && !!health?.supabase.ok;
  const hasSupabase = !!(settings?.supabaseUrl && (settings?.supabaseServiceRoleKey || settings?.supabaseAnonKey));

  const activityList = useMemo(() => {
    if (!recent) return [];
    if (activityFilter === "all") return recent;
    if (activityFilter === "waiting") return recent.filter((r) => r.status === "pending" || r.status === "queued" || r.status === "approved");
    if (activityFilter === "skipped") return recent.filter((r) => r.status === "ignored" || r.status === "failed");
    return recent.filter((r) => r.status === activityFilter);
  }, [recent, activityFilter]);

  const renderRow = (r: CommentRow) => {
    const hs = humanStatus(r.status);
    const cd = countdownText(r.scheduled_for, nowMs);
    const displayReply = r.reply || r.proposed_reply || null;
    const price = priceLabel(r);
    const isQueued = r.status === "queued" || r.status === "pending" || r.status === "approved";
    return (
      <div key={r.comment_id} className="activity-item">
        <div className="avatar">{initialOf(r.username)}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <strong style={{ fontSize: 13 }}>{r.username || "unknown"}</strong>
            <span className="muted2" style={{ fontSize: 11 }}>
              · {timeAgo(r.created_at)}
            </span>
            {price && (
              <span className="pill" style={{ fontSize: 11, padding: "2px 7px", borderColor: "rgba(94,106,210,0.25)", color: "#a5b4fc", background: "rgba(94,106,210,0.12)" }}>
                {price}
              </span>
            )}
            <span className={`badge ${hs.cls}`} style={{ marginLeft: "auto" }}>
              {hs.label}
            </span>
          </div>
          <div style={{ fontSize: 13, marginTop: 4, color: "var(--text2)", lineHeight: 1.4, overflowWrap: "anywhere" }}>{r.comment_text}</div>
          {displayReply && (
            <div
              style={{
                fontSize: 12,
                marginTop: 6,
                padding: "7px 10px",
                borderRadius: 8,
                background: r.status === "awaiting_approval" ? "rgba(245,158,11,0.08)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${r.status === "awaiting_approval" ? "rgba(245,158,11,0.2)" : "var(--border-subtle)"}`,
                color: "var(--muted)",
                lineHeight: 1.4,
                overflowWrap: "anywhere",
              }}
            >
              ↳ {displayReply}
            </div>
          )}
          {(r.media_url || r.media_title) && (
            <div className="muted2" style={{ fontSize: 11, marginTop: 6, display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
              {r.media_title && <span style={{ color: "var(--muted)" }}>↗ {r.media_title}</span>}
              {r.media_url && (
                <button
                  className="btn small ghost"
                  style={{ padding: "2px 7px", fontSize: 11, borderRadius: 999 }}
                  onClick={() => window.trimurti!.openExternal(r.media_url!)}
                >
                  View post ↗
                </button>
              )}
              {!r.media_url && r.status === "pending" && <span>· link enriching…</span>}
            </div>
          )}
          {/* Countdown / waiting meta — manual approval: awaiting needs you, approved posts shortly */}
          {r.status === "approved" ? (
            <div className="countdown-row">
              <span className="countdown-pill" style={{ background: "rgba(16,185,129,0.12)", borderColor: "rgba(16,185,129,0.25)", color: "#86efac" }}>✓ Approved — posting shortly</span>
              <span className="muted2" style={{ fontSize: 11 }}>
                Approved {timeAgo(r.created_at)} • posts in next ~15s
              </span>
              {r.scheduled_for && cd && !cd.overdue && (
                <span className="countdown-bar" aria-hidden>
                  <span className="countdown-fill" style={{ width: `${cd.pct}%` }} />
                </span>
              )}
            </div>
          ) : isQueued && r.scheduled_for ? (
            <div className="countdown-row">
              <span className={`countdown-pill ${cd?.overdue ? "overdue" : ""}`}>◷ {cd ? cd.label : "scheduled"}</span>
              <span className="muted2" style={{ fontSize: 11 }}>
                {new Date(r.scheduled_for).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} • waiting to post
              </span>
              {cd && !cd.overdue && (
                <span className="countdown-bar" aria-hidden>
                  <span className="countdown-fill" style={{ width: `${cd.pct}%` }} />
                </span>
              )}
            </div>
          ) : r.status === "pending" ? (
            <div className="countdown-row">
              <span className="countdown-pill">◷ New — processing soon</span>
              <span className="muted2" style={{ fontSize: 11 }}>
                {timeAgo(r.created_at)} · AI is drafting a reply (next cycle ~15s)
              </span>
            </div>
          ) : r.status === "queued" && !r.scheduled_for ? (
            <div className="countdown-row">
              <span className="countdown-pill">◷ Queued</span>
              <span className="muted2" style={{ fontSize: 11 }}>
                Queued • will post after approval flow
              </span>
            </div>
          ) : r.status === "awaiting_approval" ? (
            <div className="countdown-row">
              <span className="countdown-pill warn">✋ Waiting for you</span>
              <span className="muted2" style={{ fontSize: 11 }}>
                Draft ready • {timeAgo(r.created_at)} • Approve in Admin to post
              </span>
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  if (!isElectron) {
    return (
      <div className="app">
        <div className="topbar">
          <div className="brand">
            <div className="brand-mark">◈</div> Trimurti Agent
          </div>
          <span className="muted">Renderer preview — run with Electron for full features</span>
        </div>
        <div className="main">
          <div className="card">
            <h3>How to run</h3>
            <p className="muted" style={{ lineHeight: 1.6 }}>
              This is the Vite preview (no Electron).
              <br />
              1. <code>cd E:\Trimurti\website\desktop &amp;&amp; npm install</code>
              <br />
              2. <code>npm run dev</code> (Vite) in one terminal
              <br />
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
          <span
            style={{
              fontWeight: 400,
              fontSize: 11,
              marginLeft: 6,
              border: "1px solid var(--border)",
              padding: "2px 7px",
              borderRadius: 999,
              color: "var(--muted)",
              background: "rgba(255,255,255,0.03)",
            }}
          >
            {health ? new Date(health.ts).toLocaleTimeString() : "—"}
          </span>
        </div>
        <div className="tabs" role="tablist">
          <button className={`tab ${tab === "overview" ? "active" : ""}`} onClick={() => setTab("overview")}>
            Home
          </button>
          <button className={`tab ${tab === "activity" ? "active" : ""}`} onClick={() => setTab("activity")}>
            Comments
          </button>
          <button className={`tab ${tab === "settings" ? "active" : ""}`} onClick={() => setTab("settings")}>
            Settings
          </button>
        </div>
        <div className="topbar-actions">
          <button className="btn small ghost" onClick={() => settings && void fetchQueue(settings)} title="Refresh">
            ↻ Refresh
          </button>
          <button className="btn small primary" onClick={handleRestart} disabled={restarting}>
            {restarting ? "Restarting…" : "↻ Restart"}
          </button>
        </div>
      </div>

      <div className="main">
        {tab === "overview" && (
          <>
            {!hasSupabase ? (
              <div className="banner warn">
                <div className="banner-dot warn" />
                <div>
                  <div className="banner-title">Connect Supabase</div>
                  <div className="banner-desc">Add your keys in Settings to see comments. Auto-filled from .env if present.</div>
                </div>
                <button className="btn small" style={{ marginLeft: "auto" }} onClick={() => setTab("settings")}>
                  Open Settings
                </button>
              </div>
            ) : needsYou > 0 ? (
              <div className="banner warn">
                <div className="banner-dot warn" />
                <div>
                  <div className="banner-title">
                    {needsYou} {needsYou === 1 ? "comment needs" : "comments need"} your review
                  </div>
                  <div className="banner-desc">AI wasn't sure — approve or edit in one click. The rest is handled automatically.</div>
                </div>
                <button
                  className="btn small"
                  style={{ marginLeft: "auto", background: "#f59e0b", borderColor: "#f59e0b", color: "#111" }}
                  onClick={() => window.trimurti!.openExternal("http://127.0.0.1:3000/admin/instagram")}
                >
                  Review → Admin
                </button>
              </div>
            ) : !systemOk ? (
              <div className="banner warn">
                <div className="banner-dot warn" />
                <div>
                  <div className="banner-title">Heads up — something needs attention</div>
                  <div className="banner-desc">
                    {!health?.ollama.ok ? "AI is offline. " : ""}
                    {!health?.fastapi.ok ? "Agent is offline. " : ""}
                    {!health?.supabase.ok ? "Database is offline. " : ""}Check Settings or hit Restart.
                  </div>
                </div>
                <button className="btn small" style={{ marginLeft: "auto" }} onClick={handleRestart}>
                  Restart
                </button>
              </div>
            ) : (
              <div className="banner ok">
                <div className="banner-dot ok" />
                <div>
                  <div className="banner-title">All good — AI is handling your Instagram</div>
                  <div className="banner-desc">
                    {total > 0 ? `${replied} replied · ${waiting} in queue · ${needsYou} need you` : "No comments yet. When someone comments, it appears here."}
                  </div>
                </div>
                {total > 0 && (
                  <span className="pill ok" style={{ marginLeft: "auto" }}>
                    {total} total
                  </span>
                )}
              </div>
            )}

            <div className="stat-grid">
              <div className={`stat-card ${needsYou > 0 ? "highlight-warn" : ""}`}>
                <div className="stat-top">
                  <div className={`stat-icon ${needsYou > 0 ? "warn" : "muted"}`}>✋</div>
                  {needsYou > 0 && <span className="badge needs">action</span>}
                </div>
                <div className={`stat-num ${needsYou > 0 ? "warn" : ""}`}>{queueCounts ? needsYou : "—"}</div>
                <div className="stat-label">Needs your review</div>
                <div className="stat-desc">AI drafted a reply but wants your OK before posting.</div>
              </div>

              <div className="stat-card highlight-ok">
                <div className="stat-top">
                  <div className="stat-icon ok">✓</div>
                  <span className="badge sent">done</span>
                </div>
                <div className="stat-num ok">{queueCounts ? replied : "—"}</div>
                <div className="stat-label">Replied</div>
                <div className="stat-desc">Comments the AI has already answered.</div>
              </div>

              <div className="stat-card">
                <div className="stat-top">
                  <div className="stat-icon info">◷</div>
                  {waiting > 0 && <span className="badge scheduled">{waiting} waiting</span>}
                </div>
                <div className="stat-num">{queueCounts ? waiting : "—"}</div>
                <div className="stat-label">Waiting to reply</div>
                <div className="stat-desc">New comments — will be answered in a few minutes.</div>
              </div>

              <div className="stat-card">
                <div className="stat-top">
                  <div className="stat-icon muted">⊘</div>
                  <span className="muted2" style={{ fontSize: 11 }}>
                    {queueCounts ? filtered : "—"} total
                  </span>
                </div>
                <div className="stat-num">{queueCounts ? filtered : "—"}</div>
                <div className="stat-label">Filtered out</div>
                <div className="stat-desc">Spam or ignored — you don't need to do anything.</div>
              </div>
            </div>

            <div className="system-row">
              <span className="muted2" style={{ fontSize: 11, marginRight: 4 }}>
                System:
              </span>
              <span className="system-pill">
                <span className={`dot ${health?.ollama.ok ? "ok" : "bad"}`} /> AI <span className="muted2">{health?.ollama.ok ? "ready" : "offline"}</span>
              </span>
              <span className="system-pill">
                <span className={`dot ${health?.fastapi.ok ? "ok" : "bad"}`} /> Agent <span className="muted2">{health?.fastapi.ok ? "running" : "offline"}</span>
              </span>
              <span className="system-pill">
                <span className={`dot ${health?.supabase.ok ? "ok" : "bad"}`} /> Database <span className="muted2">{health?.supabase.ok ? "connected" : "offline"}</span>
              </span>
              {health?.ollama.models && health.ollama.models.length > 0 && (
                <span className="muted2" style={{ fontSize: 11 }}>
                  · {health.ollama.models.join(", ")}
                </span>
              )}
              <button className="btn small ghost" style={{ marginLeft: "auto" }} onClick={() => setTab("settings")}>
                Details in Settings →
              </button>
            </div>

            <div className="card">
              <div className="row" style={{ justifyContent: "space-between", marginBottom: 4 }}>
                <h3 style={{ margin: 0 }}>Recent comments</h3>
                <button className="btn small ghost" onClick={() => setTab("activity")}>
                  See all →
                </button>
              </div>
              {!hasSupabase ? (
                <div className="muted" style={{ padding: "18px 0", textAlign: "center" }}>
                  Connect Supabase in Settings to see comments here.
                </div>
              ) : queueLoading && !recent ? (
                <div className="muted" style={{ padding: "18px 0" }}>
                  Loading…
                </div>
              ) : !recent || recent.length === 0 ? (
                <div className="muted" style={{ padding: "18px 0", textAlign: "center" }}>
                  No comments yet — when someone comments on your Instagram, it'll show up here.
                </div>
              ) : (
                <div className="activity-list">{recent.slice(0, 8).map((r) => renderRow(r))}</div>
              )}
              <div className="row" style={{ marginTop: 12 }}>
                <button className="btn small" onClick={() => window.trimurti!.openExternal("http://127.0.0.1:3000/admin/instagram")}>
                  Open Admin to review
                </button>
                <span className="muted2" style={{ fontSize: 11 }}>
                  Tip: Approve or Edit in the website admin — the AI learns from it.
                </span>
              </div>
            </div>
          </>
        )}

        {tab === "activity" && (
          <>
            <div className="card">
              <div className="row" style={{ justifyContent: "space-between" }}>
                <h3 style={{ margin: 0 }}>Comments</h3>
                <span className="muted2" style={{ fontSize: 11 }}>
                  {total} total · updates every 30s
                </span>
              </div>
              {!hasSupabase ? (
                <div className="pill bad" style={{ marginTop: 10 }}>
                  Supabase not connected — set URL and key in Settings.
                </div>
              ) : (
                <div className="muted2" style={{ marginTop: 6, fontSize: 11, wordBreak: "break-all" }}>
                  Sorted by newest · live countdown for queued replies
                </div>
              )}

              {queueCounts && (
                <div className="row" style={{ marginTop: 12, gap: 6 }}>
                  {(
                    [
                      ["all", "All", total],
                      ["awaiting_approval", "Needs you", needsYou],
                      ["waiting", "Waiting", waiting],
                      ["sent", "Replied", replied],
                      ["skipped", "Skipped", filtered],
                    ] as const as unknown as Array<[string, string, number]>
                  ).map(([val, label, count]) => (
                    <button
                      key={val}
                      className={`btn small ${activityFilter === val ? "primary" : "ghost"}`}
                      style={{ borderRadius: 999 }}
                      onClick={() => setActivityFilter(val as string)}
                    >
                      {label} · {count as number}
                    </button>
                  ))}
                </div>
              )}

              <div style={{ marginTop: 14 }}>
                {!recent ? (
                  <div className="muted" style={{ padding: 20, textAlign: "center" }}>
                    {queueLoading ? "Loading…" : "No data — check Supabase in Settings and hit Refresh."}
                  </div>
                ) : activityList.length === 0 ? (
                  <div className="muted" style={{ padding: 20, textAlign: "center" }}>
                    Nothing in this filter.
                  </div>
                ) : (
                  <div className="activity-list">{activityList.map((r) => renderRow(r))}</div>
                )}
              </div>

              <div className="row" style={{ marginTop: 14 }}>
                <button className="btn small" onClick={() => settings && void fetchQueue(settings)} disabled={queueLoading || !hasSupabase}>
                  {queueLoading ? "Loading…" : "↻ Refresh"}
                </button>
                <button className="btn small ghost" onClick={() => window.trimurti!.openExternal("http://127.0.0.1:3000/admin/instagram")}>
                  Open /admin/instagram
                </button>
                <button
                  className="btn small ghost"
                  onClick={() => window.trimurti!.openExternal(`http://127.0.0.1:${settings?.websitePort || 3000}/admin/instagram`)}
                >
                  Open website
                </button>
              </div>
              <div className="help" style={{ marginTop: 10 }}>
                Queued replies show a live countdown (in 3m 12s). Awaiting replies show “Waiting for you” — approve to post. To act, use the website admin.
              </div>
            </div>
          </>
        )}

        {tab === "settings" && settings && (
          <>
            <div className="card">
              <h3>System</h3>
              <div className="muted2" style={{ fontSize: 11, marginTop: 4 }}>
                What's running on your PC. Green = good. If something is offline, try Restart.
              </div>
              <div className="system-row" style={{ marginTop: 12 }}>
                <span className="system-pill">
                  <span className={`dot ${health?.ollama.ok ? "ok" : "bad"}`} /> AI — {health?.ollama.ok ? "ready" : "offline"}
                  {health?.ollama.latencyMs ? <span className="latency"> {health.ollama.latencyMs}ms</span> : null}
                </span>
                <span className="system-pill">
                  <span className={`dot ${health?.fastapi.ok ? "ok" : "bad"}`} /> Agent — {health?.fastapi.ok ? "running" : "offline"}
                  {health?.fastapi.latencyMs ? <span className="latency"> {health.fastapi.latencyMs}ms</span> : null}
                </span>
                <span className="system-pill">
                  <span className={`dot ${health?.supabase.ok ? "ok" : "bad"}`} /> Database — {health?.supabase.ok ? "connected" : "offline"}
                </span>
                <span className="system-pill">
                  <span className={`dot ${health?.website.ok ? "ok" : health?.website.error ? "bad" : "off"}`} /> Website{" "}
                  {settings.autoStartWebsite ? (health?.website.ok ? "running" : "offline") : "off"}
                </span>
              </div>
              {health?.ollama.models && (
                <div className="muted2" style={{ marginTop: 8, fontSize: 11, wordBreak: "break-all" }}>
                  Models: {health.ollama.models.join(", ")}
                </div>
              )}
              {(health?.ollama.error || health?.fastapi.error || health?.supabase.error) && (
                <div className="pill bad" style={{ marginTop: 8, display: "inline-block" }}>
                  {health?.ollama.error || health?.fastapi.error || health?.supabase.error}
                </div>
              )}
              <div className="row" style={{ marginTop: 12 }}>
                <button className="btn small" onClick={() => window.trimurti!.startService("ollama")}>
                  Start AI
                </button>
                <button className="btn small ghost" onClick={() => window.trimurti!.stopService("ollama")}>
                  Stop AI
                </button>
                <button className="btn small" onClick={() => window.trimurti!.startService("fastapi")}>
                  Start Agent
                </button>
                <button className="btn small ghost" onClick={() => window.trimurti!.stopService("fastapi")}>
                  Stop Agent
                </button>
                <button className="btn small" onClick={handleRestart} disabled={restarting}>
                  {restarting ? "Restarting…" : "Restart all"}
                </button>
              </div>
              <div className="card" style={{ marginTop: 14, background: "rgba(255,255,255,0.02)" }}>
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <strong style={{ fontSize: 12 }}>Webhook</strong>
                  <span className="pill ok">Permanent</span>
                </div>
                <div className="muted" style={{ marginTop: 6, fontSize: 12, lineHeight: 1.6 }}>
                  <code style={{ color: "var(--text)" }}>https://trimurtirealestate.com/api/instagram/webhook</code> — set once in Meta Dashboard.
                </div>
                <div className="row" style={{ marginTop: 8 }}>
                  <button className="btn small ghost" onClick={() => window.trimurti!.openExternal("https://trimurtirealestate.com/api/instagram/webhook")}>
                    Test link
                  </button>
                  <button className="btn small ghost" onClick={() => window.trimurti!.openExternal("https://developers.facebook.com/apps/")}>
                    Meta Dashboard
                  </button>
                </div>
              </div>
            </div>

            <div className="card">
              <button
                className="btn small ghost"
                style={{ width: "100%", justifyContent: "space-between", display: "flex" }}
                onClick={() => setShowAdvanced((v) => !v)}
              >
                <span>{showAdvanced ? "▾ Hide technical settings" : "▸ Show technical settings"}</span>
                <span className="muted2" style={{ fontSize: 11 }}>
                  ports, paths, keys, logs
                </span>
              </button>

              {showAdvanced && (
                <>
                  <div style={{ height: 1, background: "var(--border-subtle)", margin: "14px 0" }} />
                  <p className="section-title">Paths & Ports</p>
                  <div className="settings-grid" style={{ marginTop: 8 }}>
                    <div className="field">
                      <label>Agent path (has app.py)</label>
                      <input
                        className="input"
                        value={settings.agentPath}
                        onChange={(e) => setSettings({ ...settings, agentPath: e.target.value })}
                        onBlur={() => void savePatch({ agentPath: settings.agentPath })}
                      />
                      <span className="help">Default: D:\Projects\instagram-ai-agent</span>
                    </div>
                    <div className="field">
                      <label>Website path</label>
                      <input
                        className="input"
                        value={settings.websitePath}
                        onChange={(e) => setSettings({ ...settings, websitePath: e.target.value })}
                        onBlur={() => void savePatch({ websitePath: settings.websitePath })}
                      />
                      <span className="help">Needs package.json with next dev</span>
                    </div>
                    <div className="field">
                      <label>Python command</label>
                      <input
                        className="input"
                        value={settings.pythonPath}
                        onChange={(e) => setSettings({ ...settings, pythonPath: e.target.value })}
                        onBlur={() => void savePatch({ pythonPath: settings.pythonPath })}
                      />
                      <span className="help">e.g. py, py -3.11, C:\Python314\python.exe</span>
                    </div>
                    <div className="field">
                      <label>FastAPI port</label>
                      <input
                        className="input"
                        type="number"
                        value={settings.fastApiPort}
                        onChange={(e) => setSettings({ ...settings, fastApiPort: parseInt(e.target.value || "8001", 10) })}
                        onBlur={() => void savePatch({ fastApiPort: settings.fastApiPort })}
                      />
                    </div>
                    <div className="field">
                      <label>Ollama URL</label>
                      <input
                        className="input"
                        value={settings.ollamaUrl}
                        onChange={(e) => setSettings({ ...settings, ollamaUrl: e.target.value })}
                        onBlur={() => void savePatch({ ollamaUrl: settings.ollamaUrl })}
                      />
                    </div>
                    <div className="field">
                      <label>Ollama model</label>
                      <input
                        className="input"
                        value={settings.ollamaModel}
                        onChange={(e) => setSettings({ ...settings, ollamaModel: e.target.value })}
                        onBlur={() => void savePatch({ ollamaModel: settings.ollamaModel })}
                      />
                      <span className="help">ollama list — e.g. gemma4:e2b</span>
                    </div>
                    <div className="field">
                      <label>Website port</label>
                      <input
                        className="input"
                        type="number"
                        value={settings.websitePort}
                        onChange={(e) => setSettings({ ...settings, websitePort: parseInt(e.target.value || "3000", 10) })}
                        onBlur={() => void savePatch({ websitePort: settings.websitePort })}
                      />
                    </div>
                    <div className="field">
                      <label>Poll interval</label>
                      <select
                        className="select"
                        value={settings.pollIntervalSec}
                        onChange={(e) => {
                          const v = parseInt(e.target.value, 10);
                          setSettings({ ...settings, pollIntervalSec: v });
                          void savePatch({ pollIntervalSec: v });
                        }}
                      >
                        <option value={30}>30s</option>
                        <option value={60}>60s</option>
                        <option value={120}>120s</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ height: 1, background: "var(--border-subtle)", margin: "16px 0" }} />
                  <p className="section-title">Supabase (sync)</p>
                  <div className="muted" style={{ fontSize: 11, marginTop: 4 }}>
                    Auto-filled from agent .env + website .env.local. Stored only on this PC — never uploaded.
                  </div>
                  <div className="settings-grid" style={{ marginTop: 10 }}>
                    <div className="field">
                      <label>Supabase URL</label>
                      <input
                        className="input"
                        placeholder="https://xxx.supabase.co"
                        value={settings.supabaseUrl}
                        onChange={(e) => setSettings({ ...settings, supabaseUrl: e.target.value })}
                        onBlur={() => void savePatch({ supabaseUrl: settings.supabaseUrl })}
                      />
                    </div>
                    <div className="field">
                      <label>Supabase anon key</label>
                      <input
                        className="input"
                        type="password"
                        placeholder="eyJ..."
                        value={settings.supabaseAnonKey}
                        onChange={(e) => setSettings({ ...settings, supabaseAnonKey: e.target.value })}
                        onBlur={() => void savePatch({ supabaseAnonKey: settings.supabaseAnonKey })}
                      />
                    </div>
                    <div className="field" style={{ gridColumn: "1 / -1" }}>
                      <label>Service role key (lets this app count rows)</label>
                      <input
                        className="input"
                        type="password"
                        placeholder="service_role …"
                        value={settings.supabaseServiceRoleKey}
                        onChange={(e) => setSettings({ ...settings, supabaseServiceRoleKey: e.target.value })}
                        onBlur={() => void savePatch({ supabaseServiceRoleKey: settings.supabaseServiceRoleKey })}
                      />
                      <span className="help">Desktop uses this to read counts — your website uses anon (RLS). Keep private.</span>
                    </div>
                  </div>

                  <div style={{ height: 1, background: "var(--border-subtle)", margin: "16px 0" }} />
                  <p className="section-title">Behavior</p>
                  <div style={{ display: "grid", gap: 10, marginTop: 8 }}>
                    <label className="checkbox-row">
                      <input
                        type="checkbox"
                        checked={settings.autoLaunch}
                        onChange={(e) => {
                          setSettings({ ...settings, autoLaunch: e.target.checked });
                          void savePatch({ autoLaunch: e.target.checked });
                        }}
                      />
                      Start on Windows login (minimizes to tray)
                    </label>
                    <label className="checkbox-row">
                      <input
                        type="checkbox"
                        checked={settings.autoStartWebsite}
                        onChange={(e) => {
                          setSettings({ ...settings, autoStartWebsite: e.target.checked });
                          void savePatch({ autoStartWebsite: e.target.checked });
                        }}
                      />
                      Auto-start website (pnpm dev) on boot — leave OFF if you use Vercel
                    </label>
                    <div className="settings-grid">
                      <div className="field">
                        <label>Max replies / hour</label>
                        <input
                          className="input"
                          type="number"
                          value={settings.maxRepliesPerHour}
                          onChange={(e) => setSettings({ ...settings, maxRepliesPerHour: parseInt(e.target.value || "20", 10) })}
                          onBlur={() => void savePatch({ maxRepliesPerHour: settings.maxRepliesPerHour })}
                        />
                      </div>
                      <div className="field">
                        <label>Delay min (s)</label>
                        <input
                          className="input"
                          type="number"
                          value={settings.replyMinDelay}
                          onChange={(e) => setSettings({ ...settings, replyMinDelay: parseInt(e.target.value || "180", 10) })}
                          onBlur={() => void savePatch({ replyMinDelay: settings.replyMinDelay })}
                        />
                      </div>
                      <div className="field">
                        <label>Delay max (s)</label>
                        <input
                          className="input"
                          type="number"
                          value={settings.replyMaxDelay}
                          onChange={(e) => setSettings({ ...settings, replyMaxDelay: parseInt(e.target.value || "600", 10) })}
                          onBlur={() => void savePatch({ replyMaxDelay: settings.replyMaxDelay })}
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ height: 1, background: "var(--border-subtle)", margin: "16px 0" }} />
                  <p className="section-title">Logs</p>
                  <div className="logs" style={{ marginTop: 8 }}>
                    <div className="logs-head">
                      <strong style={{ fontSize: 12 }}>Logs</strong>
                      <select
                        className="select"
                        value={logFilter}
                        onChange={(e) => setLogFilter(e.target.value)}
                        style={{ padding: "4px 8px", fontSize: 12 }}
                      >
                        <option value="all">all</option>
                        <option value="system">system</option>
                        <option value="ollama">ollama</option>
                        <option value="fastapi">fastapi</option>
                        <option value="website">website</option>
                      </select>
                      <span className="muted" style={{ fontSize: 11 }}>
                        {filteredLogs.length} shown / {logs.length} total
                      </span>
                      <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                        <button className="btn small ghost" onClick={() => window.trimurti!.clearLogs().then(() => setLogs([]))}>
                          Clear
                        </button>
                        <button className="btn small ghost" onClick={() => window.trimurti!.getLogs().then(setLogs)}>
                          Refresh
                        </button>
                      </div>
                    </div>
                    <div ref={logsRef} className="logs-body" style={{ maxHeight: 300 }}>
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

                  <div className="row" style={{ marginTop: 14 }}>
                    <button className="btn primary" disabled={saving} onClick={() => void savePatch({})}>
                      {saving ? "Saving…" : "Save"}
                    </button>
                    <button className="btn ghost" onClick={() => window.trimurti!.revealSettingsFile()}>
                      Reveal settings file
                    </button>
                    <span className="muted2" style={{ fontSize: 11 }}>
                      %APPDATA%\trimurti-desktop\trimurti-settings.json
                    </span>
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
