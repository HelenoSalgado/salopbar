import { createBinding } from "ags";
import { Gtk } from "ags/gtk4";
import AstalBattery from "gi://AstalBattery?version=0.1";
import { execAsync } from "ags/process";

export default function Battery() {
  const bat = AstalBattery.get_default();
  const isPresent = createBinding(bat, "isPresent");
  const percentage = createBinding(bat, "percentage");
  const charging = createBinding(bat, "charging");
  const iconName = createBinding(bat, "batteryIconName");

  const setProfile = (profile: string) => {
    execAsync(`powerprofilesctl set ${profile}`).catch(() => {});
  };

  return (
    <menubutton
      class="battery-btn"
      visible={isPresent}
      tooltipText={percentage.as((p) =>
        `Bateria: ${Math.round(p * 100)}%`
      )}
    >
      <box spacing={4}>
        <image iconName={iconName.as((i) => i || "battery-good-symbolic")} />
        <label
          label={percentage.as((p) => `${Math.round(p * 100)}%`)}
          css={percentage.as((p) =>
            p < 0.2 ? "color: #f38ba8; font-weight: bold;" : ""
          )}
        />
      </box>
      <popover>
        <box spacing={8} orientation={Gtk.Orientation.VERTICAL} widthRequest={220}>
          <box orientation={Gtk.Orientation.HORIZONTAL}>
            <label label="Energia & Bateria" css="font-weight: bold;" hexpand xalign={0} />
            <label
              label={charging.as((c) => (c ? "Carregando ⚡" : "Descarregando"))}
              css="font-size: 11px; color: #a6adc8;"
            />
          </box>

          <box orientation={Gtk.Orientation.HORIZONTAL} spacing={6}>
            <image iconName={iconName.as((i) => i || "battery-good-symbolic")} pixelSize={32} />
            <label
              label={percentage.as((p) => `${Math.round(p * 100)}%`)}
              css="font-size: 18px; font-weight: bold; color: #89b4fa;"
            />
          </box>

          <label label="Perfis de Energia (powerprofilesctl)" css="font-size: 11px; color: #a6adc8;" xalign={0} />

          <box orientation={Gtk.Orientation.HORIZONTAL} spacing={4}>
            <button onClicked={() => setProfile("power-saver")} tooltipText="Economia de Energia" hexpand>
              <box spacing={4} halign={Gtk.Align.CENTER}>
                <image iconName="power-profile-power-saver-symbolic" />
                <label label="Eco" />
              </box>
            </button>
            <button onClicked={() => setProfile("balanced")} tooltipText="Balanceado" hexpand>
              <box spacing={4} halign={Gtk.Align.CENTER}>
                <image iconName="power-profile-balanced-symbolic" />
                <label label="Normal" />
              </box>
            </button>
            <button onClicked={() => setProfile("performance")} tooltipText="Desempenho Máximo" hexpand>
              <box spacing={4} halign={Gtk.Align.CENTER}>
                <image iconName="power-profile-performance-symbolic" />
                <label label="Turbo" />
              </box>
            </button>
          </box>
        </box>
      </popover>
    </menubutton>
  );
}
