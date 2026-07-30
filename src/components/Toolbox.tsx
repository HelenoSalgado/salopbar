import { Gtk } from "ags/gtk4";
import { AVAILABLE_TOOLS, promotedState, toggleToolPromoted } from "../utils/preferences.js";
import ScreenShot from "./ScreenShot.js";
import SysMonitor from "./SysMonitor.js";
import Clipboard from "./Clipboard.js";
import NightLight from "./NightLight.js";
import Bluetooth from "./Bluetooth.js";
import Battery from "./Battery.js";

export function PromotedTools() {
  return (
    <box class="promoted-tools" spacing={6} orientation={Gtk.Orientation.HORIZONTAL}>
      <box visible={promotedState.as((p) => !!p["screenshot"])}>
        <ScreenShot />
      </box>
      <box visible={promotedState.as((p) => !!p["sysmonitor"])}>
        <SysMonitor />
      </box>
      <box visible={promotedState.as((p) => !!p["clipboard"])}>
        <Clipboard />
      </box>
      <box visible={promotedState.as((p) => !!p["nightlight"])}>
        <NightLight />
      </box>
      <box visible={promotedState.as((p) => !!p["bluetooth"])}>
        <Bluetooth />
      </box>
      <box visible={promotedState.as((p) => !!p["battery"])}>
        <Battery />
      </box>
    </box>
  );
}

export default function Toolbox() {
  const toolsList = Object.values(AVAILABLE_TOOLS);

  return (
    <menubutton class="toolbox-btn" tooltipText="Central de Utilitários (Clique no ícone ⭐ para fixar na barra)">
      <box spacing={4}>
        <image iconName="view-app-grid-symbolic" />
      </box>
      <popover>
        <box spacing={10} orientation={Gtk.Orientation.VERTICAL} widthRequest={280}>
          <box orientation={Gtk.Orientation.HORIZONTAL}>
            <label label="Central de Utilitários" css="font-weight: bold; font-size: 13px;" hexpand xalign={0} />
            <label label="⭐ Fixar" css="font-size: 11px; color: #a6adc8;" />
          </box>

          <box orientation={Gtk.Orientation.VERTICAL} spacing={6}>
            <box class="toolbox-item" orientation={Gtk.Orientation.HORIZONTAL} spacing={8}>
              <ScreenShot />
              <box orientation={Gtk.Orientation.VERTICAL} hexpand>
                <label label="Print de Tela" css="font-weight: bold;" xalign={0} />
                <label label="Captura e Gravação" css="font-size: 11px; color: #a6adc8;" xalign={0} />
              </box>
              <button
                class="pin-btn"
                onClicked={() => toggleToolPromoted("screenshot")}
                tooltipText={promotedState.as((p) =>
                  p["screenshot"] ? "Remover da Barra Principal" : "Fixar na Barra Principal"
                )}
              >
                <image
                  iconName="starred-symbolic"
                  css={promotedState.as((p) =>
                    p["screenshot"] ? "color: #f9e2af;" : "color: #585b70;"
                  )}
                />
              </button>
            </box>

            <box class="toolbox-item" orientation={Gtk.Orientation.HORIZONTAL} spacing={8}>
              <SysMonitor />
              <box orientation={Gtk.Orientation.VERTICAL} hexpand>
                <label label="Monitor do Sistema" css="font-weight: bold;" xalign={0} />
                <label label="CPU, RAM e Processos" css="font-size: 11px; color: #a6adc8;" xalign={0} />
              </box>
              <button
                class="pin-btn"
                onClicked={() => toggleToolPromoted("sysmonitor")}
                tooltipText={promotedState.as((p) =>
                  p["sysmonitor"] ? "Remover da Barra Principal" : "Fixar na Barra Principal"
                )}
              >
                <image
                  iconName="starred-symbolic"
                  css={promotedState.as((p) =>
                    p["sysmonitor"] ? "color: #f9e2af;" : "color: #585b70;"
                  )}
                />
              </button>
            </box>

            <box class="toolbox-item" orientation={Gtk.Orientation.HORIZONTAL} spacing={8}>
              <Clipboard />
              <box orientation={Gtk.Orientation.VERTICAL} hexpand>
                <label label="Área de Transferência" css="font-weight: bold;" xalign={0} />
                <label label="Histórico do Cliphist" css="font-size: 11px; color: #a6adc8;" xalign={0} />
              </box>
              <button
                class="pin-btn"
                onClicked={() => toggleToolPromoted("clipboard")}
                tooltipText={promotedState.as((p) =>
                  p["clipboard"] ? "Remover da Barra Principal" : "Fixar na Barra Principal"
                )}
              >
                <image
                  iconName="starred-symbolic"
                  css={promotedState.as((p) =>
                    p["clipboard"] ? "color: #f9e2af;" : "color: #585b70;"
                  )}
                />
              </button>
            </box>

            <box class="toolbox-item" orientation={Gtk.Orientation.HORIZONTAL} spacing={8}>
              <NightLight />
              <box orientation={Gtk.Orientation.VERTICAL} hexpand>
                <label label="Luz Noturna" css="font-weight: bold;" xalign={0} />
                <label label="Filtro de luz azul" css="font-size: 11px; color: #a6adc8;" xalign={0} />
              </box>
              <button
                class="pin-btn"
                onClicked={() => toggleToolPromoted("nightlight")}
                tooltipText={promotedState.as((p) =>
                  p["nightlight"] ? "Remover da Barra Principal" : "Fixar na Barra Principal"
                )}
              >
                <image
                  iconName="starred-symbolic"
                  css={promotedState.as((p) =>
                    p["nightlight"] ? "color: #f9e2af;" : "color: #585b70;"
                  )}
                />
              </button>
            </box>

            <box class="toolbox-item" orientation={Gtk.Orientation.HORIZONTAL} spacing={8}>
              <Bluetooth />
              <box orientation={Gtk.Orientation.VERTICAL} hexpand>
                <label label="Bluetooth" css="font-weight: bold;" xalign={0} />
                <label label="Dispositivos pareados" css="font-size: 11px; color: #a6adc8;" xalign={0} />
              </box>
              <button
                class="pin-btn"
                onClicked={() => toggleToolPromoted("bluetooth")}
                tooltipText={promotedState.as((p) =>
                  p["bluetooth"] ? "Remover da Barra Principal" : "Fixar na Barra Principal"
                )}
              >
                <image
                  iconName="starred-symbolic"
                  css={promotedState.as((p) =>
                    p["bluetooth"] ? "color: #f9e2af;" : "color: #585b70;"
                  )}
                />
              </button>
            </box>

            <box class="toolbox-item" orientation={Gtk.Orientation.HORIZONTAL} spacing={8}>
              <Battery />
              <box orientation={Gtk.Orientation.VERTICAL} hexpand>
                <label label="Bateria" css="font-weight: bold;" xalign={0} />
                <label label="Energia & Perfis" css="font-size: 11px; color: #a6adc8;" xalign={0} />
              </box>
              <button
                class="pin-btn"
                onClicked={() => toggleToolPromoted("battery")}
                tooltipText={promotedState.as((p) =>
                  p["battery"] ? "Remover da Barra Principal" : "Fixar na Barra Principal"
                )}
              >
                <image
                  iconName="starred-symbolic"
                  css={promotedState.as((p) =>
                    p["battery"] ? "color: #f9e2af;" : "color: #585b70;"
                  )}
                />
              </button>
            </box>
          </box>
        </box>
      </popover>
    </menubutton>
  );
}
