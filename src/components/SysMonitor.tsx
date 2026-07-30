import { createPoll } from "ags/time";
import GLib from "gi://GLib?version=2.0";
import { Gtk } from "ags/gtk4";
import { execAsync } from "ags/process";

let lastCpuTotal = 0;
let lastCpuIdle = 0;

function getSystemMetrics() {
  let cpu = 0;
  let ram = 0;
  let memUsedGB = "0.0GB";

  try {
    const [okMem, memBytes] = GLib.file_get_contents("/proc/meminfo");
    if (okMem && memBytes) {
      const txt = new TextDecoder().decode(memBytes);
      const totalMatch = txt.match(/MemTotal:\s+(\d+)/);
      const availMatch = txt.match(/MemAvailable:\s+(\d+)/);
      if (totalMatch && availMatch) {
        const total = parseInt(totalMatch[1], 10);
        const avail = parseInt(availMatch[1], 10);
        const used = total - avail;
        ram = Math.round((used / total) * 100);
        memUsedGB = (used / 1048576).toFixed(1) + " GB";
      }
    }

    const [okStat, statBytes] = GLib.file_get_contents("/proc/stat");
    if (okStat && statBytes) {
      const txt = new TextDecoder().decode(statBytes);
      const firstLine = txt.split("\n")[0];
      const parts = firstLine.trim().split(/\s+/).slice(1).map((n) => parseInt(n, 10));
      const idle = parts[3] + (parts[4] || 0);
      const total = parts.reduce((a, b) => a + (isNaN(b) ? 0 : b), 0);
      if (lastCpuTotal > 0 && total > lastCpuTotal) {
        const dTotal = total - lastCpuTotal;
        const dIdle = idle - lastCpuIdle;
        cpu = Math.max(0, Math.min(100, Math.round(((dTotal - dIdle) / dTotal) * 100)));
      }
      lastCpuTotal = total;
      lastCpuIdle = idle;
    }
  } catch (_) {}

  return { cpu, ram, memUsedGB };
}

export default function SysMonitor() {
  const stats = createPoll({ cpu: 0, ram: 0, memUsedGB: "0.0 GB" }, 3000, getSystemMetrics);

  const openBtop = () => {
    execAsync("bash -c 'kitty -e btop || kitty -e htop || gnome-system-monitor'").catch(() => {});
  };

  return (
    <menubutton class="sysmonitor-btn" tooltipText="Monitor de Recursos">
      <box spacing={4}>
        <image iconName="utilities-system-monitor-symbolic" />
        <label label={stats.as((s) => `CPU ${s.cpu}% | RAM ${s.ram}%`)} />
      </box>
      <popover>
        <box spacing={8} orientation={Gtk.Orientation.VERTICAL} widthRequest={220}>
          <label label="Recursos do Sistema" css="font-weight: bold; margin-bottom: 4px;" />
          <box orientation={Gtk.Orientation.HORIZONTAL}>
            <label label="Processador (CPU):" hexpand xalign={0} />
            <label label={stats.as((s) => `${s.cpu}%`)} css="font-weight: bold; color: #89b4fa;" />
          </box>
          <box orientation={Gtk.Orientation.HORIZONTAL}>
            <label label="Memória RAM:" hexpand xalign={0} />
            <label label={stats.as((s) => `${s.ram}% (${s.memUsedGB})`)} css="font-weight: bold; color: #a6e3a1;" />
          </box>
          <button onClicked={openBtop} tooltipText="Abrir monitor de processos no terminal">
            <box spacing={8} halign={Gtk.Align.CENTER}>
              <image iconName="utilities-terminal-symbolic" />
              <label label="Abrir btop no Terminal" />
            </box>
          </button>
        </box>
      </popover>
    </menubutton>
  );
}
