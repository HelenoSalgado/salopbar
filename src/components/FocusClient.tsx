import { createBinding } from "ags";
import { Gtk } from "ags/gtk4";
import Hyprland from "gi://AstalHyprland?version=0.1";
import Pango from "gi://Pango";

export default function FocusedClient() {
  const hypr = Hyprland.get_default();
  const focused = createBinding(hypr, "focusedClient");
  const title = focused.as((client) => {
    return client ? client.title : "";
  });
  
  return <box
    visible
    cssClasses={["focused"]}
  >
    <label 
      label={title}
      maxWidthChars={50}
      ellipsize={Pango.EllipsizeMode.END}
      halign={Gtk.Align.CENTER}
    />
  </box>
}
