import GLib from "gi://GLib?version=2.0";
import { createState } from "ags";

const CONFIG_DIR = `${GLib.get_user_config_dir()}/salopbar`;
const DB_PATH = `${CONFIG_DIR}/preferences.db`;

export interface ToolMetadata {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export const AVAILABLE_TOOLS: Record<string, ToolMetadata> = {
  screenshot: {
    id: "screenshot",
    name: "Print de Tela",
    icon: "camera-photo-symbolic",
    description: "Captura e gravação de tela",
  },
  sysmonitor: {
    id: "sysmonitor",
    name: "Monitor do Sistema",
    icon: "utilities-system-monitor-symbolic",
    description: "CPU, RAM e Processos",
  },
  clipboard: {
    id: "clipboard",
    name: "Área de Transferência",
    icon: "edit-paste-symbolic",
    description: "Histórico do Cliphist",
  },
  nightlight: {
    id: "nightlight",
    name: "Luz Noturna",
    icon: "weather-clear-night-symbolic",
    description: "Filtro de luz azul e temperatura",
  },
  bluetooth: {
    id: "bluetooth",
    name: "Bluetooth",
    icon: "bluetooth-active-symbolic",
    description: "Dispositivos pareados",
  },
  battery: {
    id: "battery",
    name: "Bateria",
    icon: "battery-good-symbolic",
    description: "Nível e perfis de energia",
  },
};

const DEFAULT_PROMOTED: Record<string, boolean> = {
  screenshot: true,
  sysmonitor: false,
  clipboard: false,
  nightlight: false,
  bluetooth: false,
  battery: false,
};

function ensureSQLiteDB(): void {
  try {
    GLib.mkdir_with_parents(CONFIG_DIR, 0o755);
    const sql = `
      CREATE TABLE IF NOT EXISTS tool_preferences (
        id TEXT PRIMARY KEY,
        promoted INTEGER NOT NULL DEFAULT 0
      );
    `;
    GLib.spawn_command_line_sync(`sqlite3 "${DB_PATH}" "${sql}"`);
  } catch (err) {
    console.warn("Falha ao inicializar banco SQLite de preferências:", err);
  }
}

function loadPromotedFromSQLite(): Record<string, boolean> {
  ensureSQLiteDB();
  const result: Record<string, boolean> = { ...DEFAULT_PROMOTED };
  try {
    const sql = "SELECT id, promoted FROM tool_preferences;";
    const [ok, stdout] = GLib.spawn_command_line_sync(`sqlite3 "${DB_PATH}" "${sql}"`);
    if (ok && stdout) {
      const text = new TextDecoder().decode(stdout).trim();
      if (text) {
        const lines = text.split("\n");
        for (const line of lines) {
          const parts = line.split("|");
          if (parts.length === 2) {
            const id = parts[0].trim();
            const promoted = parts[1].trim() === "1";
            if (id in result) {
              result[id] = promoted;
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn("Falha ao carregar preferências do SQLite:", err);
  }
  return result;
}

function savePromotedToSQLite(id: string, promoted: boolean): void {
  try {
    ensureSQLiteDB();
    const val = promoted ? 1 : 0;
    const sql = `INSERT OR REPLACE INTO tool_preferences (id, promoted) VALUES ('${id}', ${val});`;
    GLib.spawn_command_line_sync(`sqlite3 "${DB_PATH}" "${sql}"`);
  } catch (err) {
    console.warn("Falha ao salvar preferência no SQLite:", err);
  }
}

const [promotedState, setPromotedState] = createState<Record<string, boolean>>(loadPromotedFromSQLite());

export { promotedState };

export function isToolPromoted(id: string): boolean {
  const current = promotedState.get();
  return current[id] ?? false;
}

export function toggleToolPromoted(id: string): void {
  const current = { ...promotedState.get() };
  const nextVal = !(current[id] ?? false);
  current[id] = nextVal;
  savePromotedToSQLite(id, nextVal);
  setPromotedState(current);
}
