import { app } from "electron";
import * as fs from "fs";
import * as path from "path";

export type StoreShape = {
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

const DEFAULTS: StoreShape = {
  agentPath: "D:\\Projects\\instagram-ai-agent",
  websitePath: "E:\\Trimurti\\website",
  pythonPath: "python",
  ollamaUrl: "http://127.0.0.1:11434",
  ollamaModel: "gemma4:e2b",
  fastApiPort: 8001,
  websitePort: 3000,
  supabaseUrl: "",
  supabaseAnonKey: "",
  supabaseServiceRoleKey: "",
  pollIntervalSec: 60,
  autoLaunch: true,
  autoStartWebsite: false,
  localWebhookDebug: false,
  maxRepliesPerHour: 20,
  replyMinDelay: 180,
  replyMaxDelay: 600,
};

function readDotEnv(filePath: string): Record<string, string> {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const out: Record<string, string> = {};
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx === -1) continue;
      const k = trimmed.slice(0, idx).trim();
      let v = trimmed.slice(idx + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      out[k] = v;
    }
    return out;
  } catch {
    return {};
  }
}

function resolveDefaults(): StoreShape {
  const base = { ...DEFAULTS };
  // Try to seed Supabase keys from agent .env and website .env.local if empty
  const agentEnv = readDotEnv(path.join(DEFAULTS.agentPath, ".env"));
  const webEnv = readDotEnv(path.join(DEFAULTS.websitePath, ".env.local"));
  if (!base.supabaseUrl) base.supabaseUrl = agentEnv.SUPABASE_URL || webEnv.NEXT_PUBLIC_SUPABASE_URL || "";
  if (!base.supabaseAnonKey) base.supabaseAnonKey = webEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY || agentEnv.SUPABASE_ANON_KEY || "";
  if (!base.supabaseServiceRoleKey) base.supabaseServiceRoleKey = agentEnv.SUPABASE_SERVICE_ROLE_KEY || "";
  if (agentEnv.OLLAMA_URL) base.ollamaUrl = agentEnv.OLLAMA_URL;
  if (agentEnv.OLLAMA_MODEL) base.ollamaModel = agentEnv.OLLAMA_MODEL;
  return base;
}

export class Store {
  private filePath: string;
  private data: StoreShape;

  constructor() {
    const dir = app.getPath("userData");
    this.filePath = path.join(dir, "trimurti-settings.json");
    const defaults = resolveDefaults();
    try {
      const raw = fs.readFileSync(this.filePath, "utf-8");
      const parsed = JSON.parse(raw);
      this.data = { ...defaults, ...parsed };
    } catch {
      this.data = defaults;
      this.save();
    }
    // One-time migration: fill empty supabase keys from env if file existed before
    let dirty = false;
    if (!this.data.supabaseUrl) {
      const seeded = resolveDefaults();
      if (seeded.supabaseUrl) { this.data.supabaseUrl = seeded.supabaseUrl; dirty = true; }
      if (seeded.supabaseAnonKey) { this.data.supabaseAnonKey = seeded.supabaseAnonKey; dirty = true; }
      if (seeded.supabaseServiceRoleKey) { this.data.supabaseServiceRoleKey = seeded.supabaseServiceRoleKey; dirty = true; }
    }
    if (dirty) this.save();
  }

  get(): StoreShape {
    return { ...this.data };
  }

  set(patch: Partial<StoreShape>) {
    this.data = { ...this.data, ...patch };
    this.save();
  }

  private save() {
    try {
      fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (e) {
      console.error("[store] save failed", e);
    }
  }

  pathForDebug(): string {
    return this.filePath;
  }
}
