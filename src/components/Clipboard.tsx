import { createPoll } from "ags/time";
import { Gtk } from "ags/gtk4";
import { execAsync } from "ags/process";
import { For } from "ags";
import GLib from "gi://GLib?version=2.0";

interface ClipEntry {
  id: string;
  preview: string;
  isText?: boolean;
}

const CONFIG_DIR = `${GLib.get_user_config_dir()}/salopbar`;
const HISTORY_FILE = `${CONFIG_DIR}/clip_history.json`;

function loadLocalHistory(): string[] {
  try {
    if (GLib.file_test(HISTORY_FILE, GLib.FileTest.EXISTS)) {
      const [ok, bytes] = GLib.file_get_contents(HISTORY_FILE);
      if (ok && bytes) {
        return JSON.parse(new TextDecoder().decode(bytes));
      }
    }
  } catch (_) {}
  return [];
}

function saveLocalHistory(list: string[]): void {
  try {
    GLib.mkdir_with_parents(CONFIG_DIR, 0o755);
    GLib.file_set_contents(HISTORY_FILE, JSON.stringify(list.slice(0, 15)));
  } catch (_) {}
}

function getClipHistory(): ClipEntry[] {
  try {
    let current = "";
    const [okPaste, outPaste] = GLib.spawn_command_line_sync("bash -c 'wl-paste --no-newline 2>/dev/null'");
    if (okPaste && outPaste) {
      current = new TextDecoder().decode(outPaste).trim();
    } else {
      const [okXclip, outXclip] = GLib.spawn_command_line_sync("bash -c 'xclip -o -selection clipboard 2>/dev/null'");
      if (okXclip && outXclip) {
        current = new TextDecoder().decode(outXclip).trim();
      }
    }

    const history = loadLocalHistory();
    if (current && current.length > 0 && history[0] !== current) {
      history.unshift(current);
      saveLocalHistory(history);
    }

    return history.slice(0, 10).map((txt, idx) => ({
      id: idx.toString(),
      preview: txt.length > 38 ? txt.substring(0, 38) + "…" : txt,
      isText: true,
    }));
  } catch (_) {}

  return [];
}

export default function Clipboard() {
  const clips = createPoll<ClipEntry[]>([], 2000, getClipHistory);

  const copyItem = (entry: ClipEntry) => {
    const history = loadLocalHistory();
    const idx = parseInt(entry.id, 10);
    const txt = history[idx];
    if (txt) {
      const escaped = txt.replace(/'/g, "'\\''");
      execAsync(`bash -c "printf %s '${escaped}' | wl-copy 2>/dev/null || printf %s '${escaped}' | xclip -selection clipboard 2>/dev/null"`).catch(() => {});
    }
  };

  const clearHistory = () => {
    saveLocalHistory([]);
  };

  return (
    <menubutton class="clipboard-btn" tooltipText="Área de Transferência (Histórico)">
      <box spacing={4}>
        <image iconName="edit-paste-symbolic" />
      </box>
      <popover>
        <box spacing={6} orientation={Gtk.Orientation.VERTICAL} widthRequest={260}>
          <box orientation={Gtk.Orientation.HORIZONTAL}>
            <label label="Área de Transferência" css="font-weight: bold; font-size: 13px;" hexpand xalign={0} />
            <button onClicked={clearHistory} tooltipText="Apagar todo o histórico de transferência">
              <image iconName="edit-delete-symbolic" />
            </button>
          </box>
          <label
            label="Histórico de textos copiados:"
            css="font-size: 11px; color: #a6adc8;"
            xalign={0}
          />

          <box visible={clips.as((l) => l.length === 0)} css="padding: 15px 0;">
            <label label="Nenhum texto copiado ainda" css="color: #6c7086; font-size: 11px;" />
          </box>

          <For each={clips}>
            {(entry) => (
              <button
                onClicked={() => copyItem(entry)}
                tooltipText={`Copiar para área de transferência: ${entry.preview}`}
              >
                <box spacing={8}>
                  <image iconName="edit-copy-symbolic" />
                  <label label={entry.preview} xalign={0} hexpand />
                </box>
              </button>
            )}
          </For>
        </box>
      </popover>
    </menubutton>
  );
}
