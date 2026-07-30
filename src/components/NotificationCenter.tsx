import { createBinding, For } from "ags";
import { Gtk } from "ags/gtk4";
import AstalNotifd from "gi://AstalNotifd?version=0.1";

export default function NotificationCenter() {
  const notifd = AstalNotifd.get_default();
  const notifications = createBinding(notifd, "notifications");
  const dontDisturb = createBinding(notifd, "dontDisturb");

  const clearAll = () => {
    const list = notifd.notifications;
    list.forEach((n) => n.dismiss());
  };

  const toggleDnd = () => {
    notifd.dontDisturb = !notifd.dontDisturb;
  };

  return (
    <menubutton class="notif-btn" tooltipText="Central de Notificações">
      <box spacing={4}>
        <image
          iconName={dontDisturb.as((d) =>
            d ? "notifications-disabled-symbolic" : "preferences-system-notifications-symbolic"
          )}
        />
        <label
          visible={notifications.as((l) => l.length > 0)}
          label={notifications.as((l) => l.length.toString())}
          css="color: #89b4fa; font-weight: bold;"
        />
      </box>
      <popover>
        <box spacing={8} orientation={Gtk.Orientation.VERTICAL} widthRequest={290}>
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
              visible={notifications.as((l) => l.length > 0)}
              tooltipText="Dispensar todas"
            >
              <label label="Limpar" />
            </button>
          </box>

          <box
            visible={notifications.as((l) => l.length === 0)}
            orientation={Gtk.Orientation.VERTICAL}
            spacing={6}
            css="padding: 20px 0;"
          >
            <image iconName="object-select-symbolic" pixelSize={32} css="color: #585b70;" />
            <label
              label="Nenhuma notificação no momento"
              css="color: #6c7086; font-size: 11px;"
            />
          </box>

          <box orientation={Gtk.Orientation.VERTICAL} spacing={6}>
            <For each={notifications}>
              {(notif) => {
                const summary = createBinding(notif, "summary");
                const body = createBinding(notif, "body");
                const appName = createBinding(notif, "appName");

                return (
                  <box
                    class="notif-card"
                    orientation={Gtk.Orientation.VERTICAL}
                    spacing={4}
                    css="background: rgba(33, 35, 46, 0.8); border-radius: 8px; padding: 8px 10px; border: 1px solid #313244;"
                  >
                    <box orientation={Gtk.Orientation.HORIZONTAL}>
                      <label
                        label={appName.as((a) => a || "Sistema")}
                        css="font-size: 10px; color: #a6adc8; font-weight: bold;"
                        hexpand
                        xalign={0}
                      />
                      <button
                        onClicked={() => notif.dismiss()}
                        tooltipText="Dispensar"
                        css="background: transparent; border: none; padding: 0;"
                      >
                        <image iconName="window-close-symbolic" />
                      </button>
                    </box>
                    <label
                      label={summary}
                      css="font-weight: bold; color: #cdd6f4;"
                      xalign={0}
                      wrap
                    />
                    <label
                      label={body}
                      css="font-size: 11px; color: #a6adc8;"
                      xalign={0}
                      wrap
                    />
                  </box>
                );
              }}
            </For>
          </box>
        </box>
      </popover>
    </menubutton>
  );
}
