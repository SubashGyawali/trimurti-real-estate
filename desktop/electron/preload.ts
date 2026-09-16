import { contextBridge, ipcRenderer } from "electron";

export type HealthSnapshot = {
  ts: string;
  ollama: { ok: boolean; latencyMs?: number; models?: string[]; error?: string };
  fastapi: { ok: boolean; latencyMs?: number; error?: string };
  website: { ok: boolean; latencyMs?: number; error?: string };
  supabase: { ok: boolean; latencyMs?: number; counts?: Record<string, number>; error?: string };
};

export type LogEntry = { ts: string; source: string; level: "info" | "warn" | "error"; msg: string };

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

const api = {
  getSettings: (): Promise<StoreShape> => ipcRenderer.invoke("get-settings"),
  setSettings: (patch: Partial<StoreShape>): Promise<StoreShape> => ipcRenderer.invoke("set-settings", patch),
  getHealth: (): Promise<HealthSnapshot> => ipcRenderer.invoke("get-health"),
  getLogs: (): Promise<LogEntry[]> => ipcRenderer.invoke("get-logs"),
  clearLogs: (): Promise<void> => ipcRenderer.invoke("clear-logs"),
  restartStack: (): Promise<void> => ipcRenderer.invoke("restart-stack"),
  startService: (name: "ollama" | "fastapi" | "website"): Promise<void> => ipcRenderer.invoke("start-service", name),
  stopService: (name: "ollama" | "fastapi" | "website"): Promise<void> => ipcRenderer.invoke("stop-service", name),
  openExternal: (url: string) => ipcRenderer.invoke("open-external", url),
  revealSettingsFile: (): Promise<string> => ipcRenderer.invoke("reveal-settings-file"),
  onLogs: (cb: (entry: LogEntry) => void) => {
    const handler = (_: unknown, entry: LogEntry) => cb(entry);
    ipcRenderer.on("log", handler as never);
    return () => ipcRenderer.off("log", handler as never);
  },
  onHealth: (cb: (h: HealthSnapshot) => void) => {
    const handler = (_: unknown, h: HealthSnapshot) => cb(h);
    ipcRenderer.on("health", handler as never);
    return () => ipcRenderer.off("health", handler as never);
  },
};

contextBridge.exposeInMainWorld("trimurti", api);
declare global {
  interface Window {
    trimurti: typeof api;
  }
}
