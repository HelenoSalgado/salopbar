import { createBinding, For, createState } from "ags";
import { Gtk } from "ags/gtk4";
import AstalNotifd from "gi://AstalNotifd?version=0.1";
import GLib from "gi://GLib?version=2.0";

interface NotifItem {
  id: string;
  appName: string;
  summary: string;
  body: string;
  time: string;
}

const CONFIG_DIR = `${GLib.get_user_config_dir()}/salopbar`;
const NOTIF_FILE = `${CONFIG_DIR}/notif_history.json`;

function loadNotifHistory(): NotifItem[] {
  try {
    if (GLib.file_test(NOTIF_FILE, GLib.FileTest.EXISTS)) {
      const [ok, bytes] = GLib.file_get_contents(NOTIF_FILE);
      if (ok && bytes) {
        return JSON.parse(new TextDecoder().decode(bytes));
      }
    }
  } catch (_) {}
  return [];
}

function saveNotifHistory(list: NotifItem[]): void {
  try {
    GLib.mkdir_with_parents(CONFIG_DIR, 0o755);
    GLib.file_set_contents(NOTIF_FILE, JSON.stringify(list.slice(0, 30)));
  } catch (_) {}
}

const [history, setHistory] = createState<NotifItem[]>(loadNotifHistory());

// Conecta aos sinais globais do notifd para guardar o histórico persistente
try {
  const notifd = AstalNotifd.get_default();
  notifd.connect("notified", (self, id) => {
    try {
      const n = self.get_notification(id);
      if (!n) return;
      const item: NotifItem = {
        id: `${id}_${Date.now()}`,
        appName: n.appName || "Sistema",
        summary: n.summary || "Notificação",
        body: n.body || "",
        time: GLib.DateTime.new_now_local().format("%H:%M") || "",
      };
      const cur = history.get();
      const updated = [item, ...cur].slice(0, 30);
      setHistory(updated);
      saveNotifHistory(updated);
    } catch (_) {}
  });
} catch (_) {}

export default function NotificationCenter() {
  const notifd = AstalNotifd.get_default();
  const dontDisturb = createBinding(notifd, "dontDisturb");

  const clearAll = () => {
    try {
      notifd.notifications.forEach((n) => n.dismiss());
    } catch (_) {}
    setHistory([]);
    saveNotifHistory([]);
  };

  const removeItem = (id: string) => {
    const updated = history.get().filter((item) => item.id !== id);
    setHistory(updated);
    saveNotifHistory(updated);
  };

  const toggleDnd = () => {
    notifd.dontDisturb = !notifd.dontDisturb;
  };

  return (
    <menubutton class="notif-btn" tooltipText="Central de Notificações (Histórico)">
      <box spacing={4}>
        <image
          iconName={dontDisturb.as((d) =>
            d ? "notifications-disabled-symbolic" : "preferences-system-notifications-symbolic"
          )}
        />
        <label
          visible={history.as((l) => l.length > 0)}
          label={history.as((l) => l.length.toString())}
          css="color: #89b4fa; font-weight: bold;"
        />
      </box>
      <popover>
        <box spacing={8} orientation={Gtk.Orientation.VERTICAL} widthRequest={300}>
          <box orientation={Gtk.Orientation.HORIZONTAL}>
            <label
              label="Notificações"
              css="font-weight: bold; font-size: 13px;"
              hexpand
              xalign={0}
            />
            <button onClicked={toggleDnd} tooltipText="Modo Não Perturbe">
              <box spacing={4}>
                <image
                  iconName={dontDisturb.as((d) =>
                    d ? "notifications-disabled-symbolic" : "preferences-system-notifications-symbolic"
                  )}
                />
                <label label={dontDisturb.as((d) => (d ? "Silencioso" : "Som"))} />
              </box>
            </button>
            <button
              onClicked={clearAll}
              visible={history.as((l) => l.length > 0)}
              tooltipText="Dispensar todas"
            >
              <label label="Limpar" />
            </button>
          </box>

          <box
            visible={history.as((l) => l.length === 0)}
            orientation={Gtk.Orientation.VERTICAL}
            spacing={6}
            css="padding: 20px 0;"
          >
            <image iconName="object-select-symbolic" pixelSize={32} css="color: #585b70;" />
            <label
              label="Nenhuma notificação no histórico"
              css="color: #6c7086; font-size: 11px;"
            />
          </box>

          <Gtk.ScrolledWindow heightRequest={280} visible={history.as((l) => l.length > 0)}>
            <box orientation={Gtk.Orientation.VERTICAL} spacing={6}>
              <For each={history}>
                {(item) => (
                  <box
                    class="notif-card"
                    orientation={Gtk.Orientation.VERTICAL}
                    spacing={4}
                    css="background: rgba(33, 35, 46, 0.8); border-radius: 8px; padding: 8px 10px; border: 1px solid #313244;"
                  >
                    <box orientation={Gtk.Orientation.HORIZONTAL}>
                      <label
                        label={`${item.appName || "Sistema"} • ${item.time || ""}`}
                        css="font-size: 10px; color: #a6adc8; font-weight: bold;"
                        hexpand
                        xalign={0}
                      />
                      <button
                        onClicked={() => removeItem(item.id)}
                        tooltipText="Remover"
                        css="background: transparent; border: none; padding: 0;"
                      >
                        <image iconName="window-close-symbolic" />
                      </button>
                    </box>
                    <label
                      label={item.summary || "Sem título"}
                      css="font-weight: bold; color: #cdd6f4;"
                      xalign={0}
                      wrap
                    />
                    <label
                      visible={Boolean(item.body)}
                      label={item.body || ""}
                      css="font-size: 11px; color: #a6adc8;"
                      xalign={0}
                      wrap
                    />
                  </box>
                )}
              </For>
            </box>
          </Gtk.ScrolledWindow>
        </box>
      </popover>
    </menubutton>
  );
}
