import { createBinding, For } from "ags"
import { Gtk } from "ags/gtk4"
import AstalApps from "gi://AstalApps?version=0.1"
import AstalMpris from "gi://AstalMpris?version=0.1"
import GLib from "gi://GLib?version=2.0"
import Gio from "gi://Gio?version=2.0"

const pendingSeeks = new Map<AstalMpris.Player, { pos: number; source: GLib.Source }>()

function seekCumulative(player: AstalMpris.Player, offsetSeconds: number) {
  const currentEntry = pendingSeeks.get(player)
  const basePos = currentEntry ? currentEntry.pos : Math.max(0, player.position)
  const maxLen = player.length > 0 ? player.length : Infinity
  const newPos = Math.max(0, Math.min(maxLen, basePos + offsetSeconds))
  const actualOffset = newPos - basePos

  if (actualOffset === 0) return

  if (currentEntry) {
    GLib.source_remove(currentEntry.source)
  }

  const source = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 600, () => {
    pendingSeeks.delete(player)
    return GLib.SOURCE_REMOVE
  })

  pendingSeeks.set(player, { pos: newPos, source })

  // Tenta usar o método nativo Seek do D-Bus (relativo em microssegundos, não precisa de trackid)
  try {
    Gio.DBus.session.call(
      player.busName,
      "/org/mpris/MediaPlayer2",
      "org.mpris.MediaPlayer2.Player",
      "Seek",
      new GLib.Variant("(x)", [Math.floor(actualOffset * 1000000)]),
      null,
      Gio.DBusCallFlags.NONE,
      -1,
      null,
      (connection, res) => {
        try {
          connection.call_finish(res)
        } catch (_) {
          // Se o player não suportar Seek via D-Bus e tiver trackid válido, usa set_position
          if (player.trackid && player.trackid !== "") {
            player.set_position(newPos)
          } else {
            // Em players como g4music com trackid vazio, tenta SetPosition via D-Bus com path padrão
            try {
              Gio.DBus.session.call(
                player.busName,
                "/org/mpris/MediaPlayer2",
                "org.mpris.MediaPlayer2.Player",
                "SetPosition",
                new GLib.Variant("(ox)", ["/org/mpris/MediaPlayer2/Track/0", Math.floor(newPos * 1000000)]),
                null,
                Gio.DBusCallFlags.NONE,
                -1,
                null,
                null
              )
            } catch (e) {}
          }
        }
      }
    )
  } catch (_) {
    if (player.trackid && player.trackid !== "") {
      player.set_position(newPos)
    }
  }
}



export default function Mpris() {
  const mpris = AstalMpris.get_default()
  const apps = new AstalApps.Apps()
  const players = createBinding(mpris, "players")

  return (
    <menubutton class="mpris">
      <box>
        <For each={players}>
          {(player) => {
            const [app] = apps.exact_query(player.entry)
            const icon = app?.iconName || "audio-x-generic-symbolic"
            return <image iconName={icon} />
          }}
        </For>
      </box>
      <popover>
        <box spacing={4} orientation={Gtk.Orientation.VERTICAL}>
          <For each={players}>
            {(player) => (
              <box spacing={4} widthRequest={200}>
                <box overflow={Gtk.Overflow.HIDDEN} css="border-radius: 8px;">
                  <image
                    pixelSize={64}
                    file={createBinding(player, "coverArt")}
                  />
                </box>
                <box
                  valign={Gtk.Align.CENTER}
                  orientation={Gtk.Orientation.VERTICAL}
                >
                  <label xalign={0} label={createBinding(player, "title")} />
                  <label xalign={0} label={createBinding(player, "artist")} />
                </box>
                <box hexpand halign={Gtk.Align.END} spacing={6}>
                  <button
                    onClicked={() => player.previous()}
                    visible={createBinding(player, "canGoPrevious")}
                    tooltipText="Faixa anterior"
                  >
                    <image iconName="media-skip-backward-symbolic" />
                  </button>
                  <button
                    onClicked={() => seekCumulative(player, -5)}
                    visible={createBinding(player, "canSeek")}
                    tooltipText="-5s"
                  >
                    <image iconName="media-seek-backward-symbolic" />
                  </button>
                  <button
                    onClicked={() => player.play_pause()}
                    visible={createBinding(player, "canControl")}
                    tooltipText="Reproduzir/Pausar"
                  >
                    <box>
                      <image
                        iconName="media-playback-start-symbolic"
                        visible={createBinding(
                          player,
                          "playbackStatus",
                        )((s) => s === AstalMpris.PlaybackStatus.PLAYING)}
                      />
                      <image
                        iconName="media-playback-pause-symbolic"
                        visible={createBinding(
                          player,
                          "playbackStatus",
                        )((s) => s !== AstalMpris.PlaybackStatus.PLAYING)}
                      />
                    </box>
                  </button>
                  <button
                    onClicked={() => seekCumulative(player, 5)}
                    visible={createBinding(player, "canSeek")}
                    tooltipText="+5s"
                  >
                    <image iconName="media-seek-forward-symbolic" />
                  </button>
                  <button
                    onClicked={() => player.next()}
                    visible={createBinding(player, "canGoNext")}
                    tooltipText="Próxima faixa"
                  >
                    <image iconName="media-skip-forward-symbolic" />
                  </button>
                </box>
              </box>
            )}
          </For>
        </box>
      </popover>
    </menubutton>
  )
}
