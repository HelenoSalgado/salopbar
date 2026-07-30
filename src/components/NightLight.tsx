import { Gtk } from "ags/gtk4";
import { createState } from "ags";
import { execAsync } from "ags/process";

const [enabled, setEnabled] = createState(false);
const [temp, setTemp] = createState(4500);

function updateNightLight(on: boolean, t: number) {
  if (on) {
    execAsync(`bash -c "pkill hyprsunset || pkill gammastep; hyprsunset -t ${t} &"`).catch(() => {
      execAsync(`bash -c "gammastep -O ${t} &"`).catch(() => {});
    });
  } else {
    execAsync('bash -c "pkill -9 hyprsunset || pkill -9 gammastep"').catch(() => {});
  }
}

export default function NightLight() {
  const toggle = () => {
    const nextVal = !enabled.get();
    setEnabled(nextVal);
    updateNightLight(nextVal, temp.get());
  };

  const onTempChange = (val: number) => {
    const clamped = Math.round(Math.max(3000, Math.min(6500, val)));
    setTemp(clamped);
    if (enabled.get()) {
      updateNightLight(true, clamped);
    }
  };

  return (
    <menubutton
      class="nightlight-btn"
      tooltipText={enabled.as((e) => (e ? `Luz Noturna Ativa (${temp.get()}K)` : "Luz Noturna (Desativada)"))}
    >
      <box spacing={4}>
        <image
          iconName={enabled.as((e) =>
            e ? "weather-clear-night-symbolic" : "display-projector-symbolic"
          )}
        />
        <label
          visible={enabled}
          label={temp.as((t) => `${t}K`)}
          css="color: #f9e2af;"
        />
      </box>
      <popover>
        <box spacing={8} orientation={Gtk.Orientation.VERTICAL} widthRequest={220}>
          <box orientation={Gtk.Orientation.HORIZONTAL}>
            <label label="Filtro de Luz Azul" css="font-weight: bold;" hexpand xalign={0} />
            <button onClicked={toggle}>
              <label label={enabled.as((e) => (e ? "Desativar" : "Ativar"))} />
            </button>
          </box>
          <label label={temp.as((t) => `Temperatura: ${t} Kelvin`)} xalign={0} />
          <slider
            widthRequest={220}
            min={3000}
            max={6500}
            value={temp.get()}
            onValueChanged={({ value }: { value: number }) => onTempChange(value)}
          />
          <box orientation={Gtk.Orientation.HORIZONTAL}>
            <label label="3000K (Quente)" css="font-size: 10px; color: #f9e2af;" hexpand xalign={0} />
            <label label="6500K (Fria)" css="font-size: 10px; color: #89dceb;" />
          </box>
        </box>
      </popover>
    </menubutton>
  );
}
