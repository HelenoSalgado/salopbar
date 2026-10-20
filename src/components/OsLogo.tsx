import GLib from "gi://GLib?version=2.0";

export default function OsLogo(){
  const logo = GLib.get_os_info("LOGO")?.toString() || "start-here-symbolic";
  return <image class="logo-system" tooltipText="Logo" iconName={logo} />
}