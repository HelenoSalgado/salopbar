import { createBinding, For } from "ags";
import { Gtk } from "ags/gtk4";
import AstalBluetooth from "gi://AstalBluetooth?version=0.1";
import { execAsync } from "ags/process";

export default function Bluetooth() {
  const bluetooth = AstalBluetooth.get_default();
  const isPowered = createBinding(bluetooth, "isPowered");
  const isConnected = createBinding(bluetooth, "isConnected");
  const devices = createBinding(bluetooth, "devices");

  const openManager = () => {
    execAsync("bash -c 'blueman-manager || kitty -e bluetoothctl'").catch(() => {});
  };

  return (
    <menubutton
      class="bluetooth-btn"
      tooltipText={isPowered.as((p) =>
        p ? "Bluetooth: Ativado" : "Bluetooth: Desativado"
      )}
    >
      <box spacing={4}>
        <image
          iconName={isConnected.as((c) =>
            c ? "bluetooth-active-symbolic" : "bluetooth-disabled-symbolic"
          )}
        />
      </box>
      <popover>
        <box spacing={8} orientation={Gtk.Orientation.VERTICAL} widthRequest={220}>
          <box orientation={Gtk.Orientation.HORIZONTAL}>
            <label label="Bluetooth" css="font-weight: bold;" hexpand xalign={0} />
            <button onClicked={() => bluetooth.toggle()}>
              <label label={isPowered.as((p) => (p ? "Desativar" : "Ativar"))} />
            </button>
          </box>

          <label label="Dispositivos Pareados" css="font-size: 11px; color: #a6adc8;" xalign={0} />

          <box orientation={Gtk.Orientation.VERTICAL} spacing={4}>
            <For each={devices}>
              {(device) => {
                const name = createBinding(device, "name");
                const connected = createBinding(device, "connected");
                const icon = createBinding(device, "icon");
                const battery = createBinding(device, "batteryPercentage");

                return (
                  <button
                    onClicked={() => {
                      if (device.connected) {
                        device.disconnect_device();
                      } else {
                        device.connect_device();
                      }
                    }}
                    tooltipText={connected.as((c) =>
                      c ? "Clique para Desconectar" : "Clique para Conectar"
                    )}
                  >
                    <box spacing={8}>
                      <image iconName={icon.as((i) => i || "bluetooth-symbolic")} />
                      <label label={name} hexpand xalign={0} />
                      <label
                        visible={battery.as((b) => b > 0)}
                        label={battery.as((b) => `${b}%`)}
                        css="color: #a6e3a1; font-size: 11px;"
                      />
                      <image
                        iconName={connected.as((c) =>
                          c ? "emblem-ok-symbolic" : "window-close-symbolic"
                        )}
                      />
                    </box>
                  </button>
                );
              }}
            </For>
          </box>

          <button onClicked={openManager} tooltipText="Abrir gerenciador de Bluetooth">
            <box spacing={8} halign={Gtk.Align.CENTER}>
              <image iconName="preferences-system-bluetooth-symbolic" />
              <label label="Gerenciar Bluetooth" />
            </box>
          </button>
        </box>
      </popover>
    </menubutton>
  );
}
