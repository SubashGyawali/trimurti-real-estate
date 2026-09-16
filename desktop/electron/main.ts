import { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain, shell, dialog } from "electron";
import * as path from "path";
import * as fs from "fs";
import { spawn, ChildProcess } from "child_process";
import * as http from "http";
import * as https from "https";
import { Store, StoreShape } from "./store";

// Single instance
if (!app.requestSingleInstanceLock()) app.quit();

type LogEntry = { ts: string; source: string; level: "info" | "warn" | "error"; msg: string };
type HealthSnapshot = {
  ts: string;
  ollama: { ok: boolean; latencyMs?: number; models?: string[]; error?: string };
  fastapi: { ok: boolean; latencyMs?: number; error?: string };
  website: { ok: boolean; latencyMs?: number; error?: string };
  supabase: { ok: boolean; latencyMs?: number; counts?: Record<string, number>; error?: string };
};

let store: Store;
let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;

const procs: Record<string, ChildProcess | null> = { ollama: null, fastapi: null, website: null, cloudflared: null };
const shouldRestart: Record<string, boolean> = { ollama: true, fastapi: true, website: true };
const logs: LogEntry[] = [];
const MAX_LOGS = 600;
let healthTimer: NodeJS.Timeout | null = null;
let lastHealth: HealthSnapshot | null = null;

function pushLog(source: string, level: LogEntry["level"], msg: string) {
  const entry: LogEntry = { ts: new Date().toISOString(), source, level, msg: msg.slice(0, 4000) };
  logs.push(entry);
  if (logs.length > MAX_LOGS) logs.splice(0, logs.length - MAX_LOGS);
  mainWindow?.webContents.send("log", entry);
  console.log(`[${source}] ${msg}`);
}

function getIconPath(): string {
  const candidates = [
    path.join(__dirname, "../resources/icon.png"),
    path.join(__dirname, "../../resources/icon.png"),
    path.join(app.getAppPath(), "resources/icon.png"),
    path.join(process.resourcesPath, "resources/icon.png"),
  ];
  for (const p of candidates) if (fs.existsSync(p)) return p;
  return candidates[0];
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1120,
    height: 760,
    minWidth: 980,
    minHeight: 620,
    show: false,
    backgroundColor: "#0a1628",
    title: "Trimurti Agent",
    icon: fs.existsSync(getIconPath()) ? getIconPath() : undefined,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  const devUrl = "http://localhost:5173";
  const prodHtml = path.join(__dirname, "../dist/index.html");

  // In dev, vite serves; in prod, load dist
  if (!app.isPackaged && fs.existsSync(path.join(__dirname, "../index.html"))) {
    // dev is started externally; try vite first, fallback to dist
    mainWindow.loadURL(devUrl).catch(() => {
      if (fs.existsSync(prodHtml)) mainWindow!.loadFile(prodHtml);
    });
  } else if (fs.existsSync(prodHtml)) {
    mainWindow.loadFile(prodHtml);
  } else {
    // dev fallback
    mainWindow.loadURL(devUrl).catch(() => {
      mainWindow!.loadURL("data:text/html,<h1 style='color:white;background:#0a1628;padding:40px'>Run: npm run dev in desktop/ (Vite) then restart</h1>");
    });
  }

  mainWindow.once("ready-to-show", () => mainWindow?.show());
  mainWindow.on("close", (e) => {
    if (!isQuitting) {
      e.preventDefault();
      mainWindow?.hide();
    }
  });
}

function createTray() {
  try {
    const iconPath = getIconPath();
    let img: Electron.NativeImage;
    if (fs.existsSync(iconPath)) {
      img = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });
    } else {
      img = nativeImage.createEmpty();
    }
    tray = new Tray(img.isEmpty() ? nativeImage.createEmpty() : img);
    const menu = Menu.buildFromTemplate([
      { label: "Show Dashboard", click: () => { mainWindow?.show(); mainWindow?.focus(); } },
      { label: "Restart Stack", click: () => void restartStack() },
      { type: "separator" },
      { label: "Start Ollama", click: () => void startOllama() },
      { label: "Start FastAPI", click: () => void startFastApi() },
      { label: "Start Website", click: () => void startWebsite() },
      { type: "separator" },
      { label: "Quit", click: () => { isQuitting = true; app.quit(); } },
    ]);
    tray.setToolTip("Trimurti Agent — running");
    tray.setContextMenu(menu);
    tray.on("double-click", () => { mainWindow?.show(); mainWindow?.focus(); });
  } catch (e) {
    pushLog("tray", "warn", `Tray init failed: ${(e as Error).message}`);
  }
}

function setupAutostart(enabled: boolean) {
  try {
    app.setLoginItemSettings({ openAtLogin: enabled, openAsHidden: true, args: [] });
    pushLog("system", "info", `Autostart ${enabled ? "enabled" : "disabled"}`);
  } catch (e) {
    pushLog("system", "warn", `Autostart toggle failed: ${(e as Error).message}`);
  }
}

// --- HTTP helper with timeout ---
function httpGet(urlStr: string, timeoutMs = 3000): Promise<{ ok: boolean; ms: number; body?: string; status?: number }> {
  return new Promise((resolve) => {
    const url = new URL(urlStr);
    const lib = url.protocol === "https:" ? https : http;
    const started = Date.now();
    const req = lib.get(urlStr, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => resolve({ ok: (res.statusCode || 0) < 400, ms: Date.now() - started, body: data, status: res.statusCode }));
    });
    req.on("error", () => resolve({ ok: false, ms: Date.now() - started }));
    req.setTimeout(timeoutMs, () => {
      req.destroy();
      resolve({ ok: false, ms: Date.now() - started });
    });
  });
}

async function probeHealth(): Promise<HealthSnapshot> {
  const s = store.get();
  const ts = new Date().toISOString();

  const [ollamaRes, fastapiRes, websiteRes] = await Promise.all([
    httpGet(`${s.ollamaUrl.replace(/\/$/, "")}/api/tags`, 3000),
    httpGet(`http://127.0.0.1:${s.fastApiPort}/`, 2500),
    s.autoStartWebsite ? httpGet(`http://127.0.0.1:${s.websitePort}/`, 2500) : Promise.resolve({ ok: true, ms: 0, status: 200 } as const),
  ]);

  let ollama: HealthSnapshot["ollama"] = { ok: ollamaRes.ok, latencyMs: ollamaRes.ms };
  if (ollamaRes.ok && ollamaRes.body) {
    try {
      const j = JSON.parse(ollamaRes.body);
      ollama.models = (j.models || []).map((m: { name: string }) => m.name);
    } catch { /* ignore */ }
  } else if (!ollamaRes.ok) ollama.error = `HTTP ${ollamaRes.status ?? "timeout"}`;

  const fastapi: HealthSnapshot["fastapi"] = fastapiRes.ok ? { ok: true, latencyMs: fastapiRes.ms } : { ok: false, latencyMs: fastapiRes.ms, error: `HTTP ${fastapiRes.status ?? "timeout"}` };
  const website: HealthSnapshot["website"] = s.autoStartWebsite
    ? websiteRes.ok
      ? { ok: true, latencyMs: (websiteRes as { ms: number }).ms }
      : { ok: false, latencyMs: (websiteRes as { ms: number }).ms, error: `HTTP ${(websiteRes as { status?: number }).status ?? "timeout"}` }
    : { ok: true };

  // Supabase: try anon key count if configured
  let supabase: HealthSnapshot["supabase"] = { ok: true };
  if (s.supabaseUrl && s.supabaseAnonKey) {
    const supaUrl = `${s.supabaseUrl.replace(/\/$/, "")}/rest/v1/instagram_agent_comments?select=id&limit=1`;
    const started = Date.now();
    try {
      const r = await fetch(supaUrl, {
        headers: { apikey: s.supabaseAnonKey, Authorization: `Bearer ${s.supabaseAnonKey}` },
        signal: AbortSignal.timeout(4000),
      } as RequestInit);
      supabase = r.ok ? { ok: true, latencyMs: Date.now() - started } : { ok: false, latencyMs: Date.now() - started, error: `HTTP ${r.status}` };
      if (r.ok) {
        // best effort: get counts via separate call is heavy; we skip for health
        supabase.counts = {};
      }
    } catch (e) {
      supabase = { ok: false, latencyMs: Date.now() - started, error: (e as Error).message.slice(0, 120) };
    }
  } else {
    supabase = { ok: false, error: "Supabase URL/key not set (set in Settings or .env)" };
  }

  const snap: HealthSnapshot = { ts, ollama, fastapi, website, supabase };
  lastHealth = snap;
  mainWindow?.webContents.send("health", snap);
  return snap;
}

function spawnLogged(name: string, cmd: string, args: string[], opts: { cwd?: string; env?: NodeJS.ProcessEnv } = {}): ChildProcess {
  const child = spawn(cmd, args, {
    cwd: opts.cwd,
    env: { ...process.env, ...opts.env },
    shell: process.platform === "win32",
    windowsHide: true,
  });
  child.stdout?.on("data", (d: Buffer) => {
    const lines = d.toString().split(/\r?\n/).filter(Boolean);
    for (const l of lines) pushLog(name, "info", l);
  });
  child.stderr?.on("data", (d: Buffer) => {
    const lines = d.toString().split(/\r?\n/).filter(Boolean);
    for (const l of lines) pushLog(name, l.toLowerCase().includes("error") ? "error" : "warn", l);
  });
  child.on("close", (code, signal) => {
    pushLog(name, code === 0 ? "info" : "warn", `exited code=${code} signal=${signal ?? "-"}`);
    procs[name] = null;
    if (shouldRestart[name] && !isQuitting) {
      const delay = name === "ollama" ? 5000 : 3000;
      pushLog(name, "info", `restarting in ${delay / 1000}s…`);
      setTimeout(() => {
        if (name === "fastapi") void startFastApi();
        else if (name === "website") void startWebsite();
        else if (name === "ollama") void startOllama();
      }, delay);
    }
  });
  child.on("error", (e) => pushLog(name, "error", `spawn error: ${e.message}`));
  procs[name] = child;
  pushLog(name, "info", `spawned: ${cmd} ${args.join(" ")} (pid ${child.pid})`);
  return child;
}

async function startOllama() {
  const s = store.get();
  const health = await httpGet(`${s.ollamaUrl.replace(/\/$/, "")}/api/tags`, 2000);
  if (health.ok) {
    pushLog("ollama", "info", `already running (${s.ollamaUrl}) models: ${health.body?.slice(0, 200) ?? ""}`);
    // warm model
    warmOllamaModel().catch((e) => pushLog("ollama", "warn", `warm failed: ${(e as Error).message}`));
    return;
  }
  // try to launch ollama serve from common locations
  const candidates = [
    "ollama",
    path.join(process.env.LOCALAPPDATA || "", "Programs/Ollama/ollama.exe"),
    "C:\\Program Files\\Ollama\\ollama.exe",
  ].filter(Boolean);
  let launched = false;
  for (const bin of candidates) {
    try {
      if (bin.includes("\\") && !fs.existsSync(bin)) continue;
      spawnLogged("ollama", bin, ["serve"], {});
      launched = true;
      break;
    } catch { /* try next */ }
  }
  if (!launched) {
    pushLog("ollama", "warn", "Could not spawn ollama serve — is Ollama installed? Check https://ollama.com");
    return;
  }
  // wait for ready then warm
  for (let i = 0; i < 15; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    const h = await httpGet(`${s.ollamaUrl.replace(/\/$/, "")}/api/tags`, 1500);
    if (h.ok) {
      pushLog("ollama", "info", "ollama serve ready");
      warmOllamaModel().catch(() => {});
      return;
    }
  }
  pushLog("ollama", "warn", "ollama serve did not become ready in 15s");
}

async function warmOllamaModel() {
  const s = store.get();
  const url = `${s.ollamaUrl.replace(/\/$/, "")}/api/generate`;
  const body = JSON.stringify({ model: s.ollamaModel, prompt: "hi", stream: false, keep_alive: "30m", options: { num_predict: 4 } });
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 15000);
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body, signal: controller.signal } as RequestInit);
    clearTimeout(t);
    if (res.ok) pushLog("ollama", "info", `model warm ok: ${s.ollamaModel}`);
    else pushLog("ollama", "warn", `model warm HTTP ${res.status}`);
  } catch (e) {
    pushLog("ollama", "warn", `model warm error: ${(e as Error).message.slice(0, 180)}`);
  }
}

async function startFastApi() {
  const s = store.get();
  if (procs.fastapi) {
    pushLog("fastapi", "info", "already running");
    return;
  }
  const agentPath = s.agentPath;
  if (!fs.existsSync(agentPath)) {
    pushLog("fastapi", "error", `agentPath not found: ${agentPath} (fix in Settings)`);
    return;
  }
  if (!fs.existsSync(path.join(agentPath, "app.py"))) {
    pushLog("fastapi", "error", `app.py not found in ${agentPath}`);
    return;
  }
  // prefer configured pythonPath, else try python, py, python3
  const pyCandidates = [s.pythonPath, "python", "py", "python3"].filter(Boolean) as string[];
  // On Windows, also try explicit Python installs if default fails — we just attempt in order via shell
  shouldRestart.fastapi = true;
  const port = s.fastApiPort;
  // Use first candidate; spawn will fallback via shouldRestart log if fails
  const py = pyCandidates[0] || "python";
  spawnLogged("fastapi", py, ["-m", "uvicorn", "app:app", "--host", "127.0.0.1", "--port", String(port)], { cwd: agentPath });
  // wait for health
  for (let i = 0; i < 12; i++) {
    await new Promise((r) => setTimeout(r, 800));
    const h = await httpGet(`http://127.0.0.1:${port}/`, 1200);
    if (h.ok) {
      pushLog("fastapi", "info", `FastAPI ready on :${port}`);
      return;
    }
  }
  pushLog("fastapi", "warn", `FastAPI not ready after ~10s — check logs (python path: ${py}, cwd: ${agentPath})`);
}

function stopFastApi() {
  shouldRestart.fastapi = false;
  const p = procs.fastapi;
  if (p) {
    try { p.kill(); } catch {}
    procs.fastapi = null;
    pushLog("fastapi", "info", "stopped");
  }
}

async function startWebsite() {
  const s = store.get();
  if (!s.autoStartWebsite) {
    pushLog("website", "info", "autoStartWebsite OFF — skipping (toggle in Settings)");
    return;
  }
  if (procs.website) {
    pushLog("website", "info", "already running");
    return;
  }
  const websitePath = s.websitePath;
  if (!fs.existsSync(websitePath)) {
    pushLog("website", "error", `websitePath not found: ${websitePath}`);
    return;
  }
  shouldRestart.website = true;
  // Use npm.cmd on Windows to run next dev
  const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
  // Prefer npm run dev -- -p PORT to respect next.config
  spawnLogged("website", npmCmd, ["run", "dev", "--", "-p", String(s.websitePort)], { cwd: websitePath });
  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    const h = await httpGet(`http://127.0.0.1:${s.websitePort}/`, 1200);
    if (h.ok) {
      pushLog("website", "info", `Next.js ready on :${s.websitePort}`);
      return;
    }
  }
  pushLog("website", "warn", `Next.js not ready after 20s — check logs`);
}

function stopWebsite() {
  shouldRestart.website = false;
  const p = procs.website;
  if (p) {
    try { p.kill(); } catch {}
    procs.website = null;
    pushLog("website", "info", "stopped");
  }
}

async function restartStack() {
  pushLog("system", "info", "Restarting stack…");
  stopWebsite();
  stopFastApi();
  // ollama stays running
  await new Promise((r) => setTimeout(r, 1200));
  await startOllama();
  await new Promise((r) => setTimeout(r, 800));
  await startFastApi();
  await startWebsite();
  void probeHealth();
}

function setupIpc() {
  ipcMain.handle("get-settings", () => store.get());
  ipcMain.handle("set-settings", (_e, patch: Partial<StoreShape>) => {
    const prev = store.get();
    store.set(patch);
    const next = store.get();
    if (patch.autoLaunch !== undefined && patch.autoLaunch !== prev.autoLaunch) setupAutostart(!!patch.autoLaunch);
    if (patch.autoStartWebsite !== undefined && !patch.autoStartWebsite) stopWebsite();
    if (patch.autoStartWebsite && !prev.autoStartWebsite) void startWebsite();
    // if paths changed, restart affected
    if (patch.agentPath || patch.fastApiPort || patch.pythonPath) {
      stopFastApi();
      setTimeout(() => void startFastApi(), 600);
    }
    if (patch.websitePath || patch.websitePort) {
      stopWebsite();
      if (next.autoStartWebsite) setTimeout(() => void startWebsite(), 600);
    }
    if (patch.ollamaUrl || patch.ollamaModel) {
      void startOllama();
    }
    return next;
  });
  ipcMain.handle("get-health", async () => (lastHealth ? lastHealth : await probeHealth()));
  ipcMain.handle("get-logs", () => [...logs].slice(-400));
  ipcMain.handle("clear-logs", () => { logs.length = 0; });
  ipcMain.handle("restart-stack", async () => { await restartStack(); });
  ipcMain.handle("start-service", async (_e, name: string) => {
    if (name === "ollama") await startOllama();
    else if (name === "fastapi") await startFastApi();
    else if (name === "website") await startWebsite();
  });
  ipcMain.handle("stop-service", async (_e, name: string) => {
    if (name === "ollama") { shouldRestart.ollama = false; try { procs.ollama?.kill(); } catch {} procs.ollama = null; }
    else if (name === "fastapi") stopFastApi();
    else if (name === "website") stopWebsite();
  });
  ipcMain.handle("open-external", async (_e, url: string) => { await shell.openExternal(url); });
  ipcMain.handle("reveal-settings-file", async () => {
    const p = store.pathForDebug();
    shell.showItemInFolder(p);
    return p;
  });
}

app.whenReady().then(async () => {
  store = new Store();
  setupIpc();
  createWindow();
  createTray();
  setupAutostart(store.get().autoLaunch);

  pushLog("system", "info", `Trimurti Agent starting — agentPath=${store.get().agentPath} websitePath=${store.get().websitePath}`);
  pushLog("system", "info", `Settings file: ${store.pathForDebug()}`);

  // Boot sequence: Ollama -> FastAPI -> Website (if enabled)
  await startOllama();
  await new Promise((r) => setTimeout(r, 800));
  await startFastApi();
  await startWebsite();

  // Health polling
  await probeHealth();
  healthTimer = setInterval(() => void probeHealth(), 12_000);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
    else mainWindow?.show();
  });
});

app.on("second-instance", () => {
  mainWindow?.show();
  mainWindow?.focus();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    // keep tray alive
  }
});

app.on("before-quit", () => {
  isQuitting = true;
  if (healthTimer) clearInterval(healthTimer);
  shouldRestart.ollama = false;
  shouldRestart.fastapi = false;
  shouldRestart.website = false;
  for (const k of Object.keys(procs)) {
    try { procs[k]?.kill(); } catch {}
  }
});
