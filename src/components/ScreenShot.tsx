import { Gtk } from "ags/gtk4";
import { createState, createComputed } from "ags";
import { execAsync } from "ags/process";
import GLib from "gi://GLib?version=2.0";

const [recording, setRecording] = createState(false);
const [feedback, setFeedback] = createState("");

function getPicturesDir(): string {
  try {
    let dir = GLib.get_user_special_dir(GLib.UserDirectory.DIRECTORY_PICTURES);
    if (!dir) {
      const home = GLib.get_home_dir();
      dir = `${home}/Imagens`;
    }
    GLib.mkdir_with_parents(dir, 0o755);
    return dir;
  } catch (_) {
    const fallback = `${GLib.get_home_dir()}/Imagens`;
    try { GLib.mkdir_with_parents(fallback, 0o755); } catch (_) {}
    return fallback;
  }
}

function getVideosDir(): string {
  try {
    let dir = GLib.get_user_special_dir(GLib.UserDirectory.DIRECTORY_VIDEOS);
    if (!dir) {
      const home = GLib.get_home_dir();
      dir = `${home}/Vídeos`;
    }
    GLib.mkdir_with_parents(dir, 0o755);
    return dir;
  } catch (_) {
    const fallback = `${GLib.get_home_dir()}/Vídeos`;
    try { GLib.mkdir_with_parents(fallback, 0o755); } catch (_) {}
    return fallback;
  }
}

function getTimestamp(): string {
  const dt = GLib.DateTime.new_now_local();
  return dt.format("%Y%m%d_%H%M%S") || "data";
}

function showFeedback(msg: string) {
  setFeedback(msg);
  execAsync(["bash", "-c", `notify-send -i camera-photo-symbolic "Print de Tela" "${msg.replace(/"/g, '\\"')}"`]).catch(() => {});
}

export default function ScreenShot() {
  let popoverRef: Gtk.Popover | null = null;
  let btnRef: Gtk.MenuButton | null = null;

  const closePopover = () => {
    try {
      if (popoverRef) popoverRef.popdown();
      if (btnRef) btnRef.active = false;
    } catch (_) {}
  };

  const tooltipText = createComputed(
    [recording, feedback],
    (r, fb) => (r ? "Gravando Tela (Clique para opções)" : fb || "Print de Tela")
  );

  const toggleRecording = () => {
    closePopover();
    const isRec = recording.get();
    const dir = getVideosDir();
    if (isRec) {
      execAsync(["bash", "-c", "pkill -INT wf-recorder"]).catch(() => {});
      setRecording(false);
      showFeedback(`Gravação concluída! Vídeo salvo em ${dir}`);
    } else {
      const filepath = `${dir}/Gravacao_${getTimestamp()}.mp4`;
      const cmd = `sleep 0.4; wf-recorder -f "${filepath}" 2>/dev/null &`;
      execAsync(["bash", "-c", cmd])
        .then(() => {
          setRecording(true);
          showFeedback(`Gravação iniciada em ${dir}`);
        })
        .catch(() => {});
      setRecording(true);
      showFeedback(`Gravação iniciada em ${dir}`);
    }
  };

  const captureRegion = () => {
    closePopover();
    const dir = getPicturesDir();
    const filepath = `${dir}/Captura_Regiao_${getTimestamp()}.png`;
    showFeedback("Arraste para selecionar a região (Segure ESPAÇO para mover a caixa)...");
    const slurpArgs = "-d -b 1e1e2e66 -c 89b4faff -s 89b4fa33 -w 2";
    const cmd = `sleep 0.4; REGION=$(slurp ${slurpArgs}); if [ -n "$REGION" ]; then grim -g "$REGION" "${filepath}" && wl-copy < "${filepath}"; fi`;
    execAsync(["bash", "-c", cmd])
      .then(() => showFeedback(`Região capturada e salva em ${dir} (e copiada!)`))
      .catch(() => {});
  };

  const captureWindow = () => {
    closePopover();
    showFeedback("Capturando janela ativa...");
    const cmd = `sleep 0.4; hyprshot -m window --clipboard-only 2>/dev/null || grim -g "$(slurp)" - | wl-copy 2>/dev/null`;
    execAsync(["bash", "-c", cmd])
      .then(() => showFeedback("Janela capturada e copiada para a Área de Transferência!"))
      .catch(() => {});
  };

  const captureFullScreen = () => {
    closePopover();
    const dir = getPicturesDir();
    const filepath = `${dir}/Captura_${getTimestamp()}.png`;
    showFeedback("Capturando tela inteira...");
    const cmd = `sleep 0.5; grim "${filepath}" 2>/dev/null || hyprshot -m output -o "${dir}" 2>/dev/null || gnome-screenshot -f "${filepath}" 2>/dev/null`;
    execAsync(["bash", "-c", cmd])
      .then(() => showFeedback(`Tela inteira salva com sucesso em ${dir}`))
      .catch(() => {});
  };

  return (
    <menubutton
      $={(self) => {
        btnRef = self;
      }}
      class="screenshot-btn"
      tooltipText={tooltipText}
    >
      <box spacing={4}>
        <image
          iconName={recording.as((r) =>
            r ? "media-record-symbolic" : "camera-photo-symbolic"
          )}
        />
        <label
          visible={recording}
          label="REC"
          css="color: #f38ba8; font-weight: bold;"
        />
      </box>
      <popover
        $={(self) => {
          popoverRef = self;
        }}
      >
        <box spacing={6} orientation={Gtk.Orientation.VERTICAL} widthRequest={250}>
          <label label="Print de Tela" css="font-weight: bold; margin-bottom: 2px;" />
          
          <box
            visible={feedback.as((f) => f !== "")}
            css="background: rgba(166, 227, 161, 0.2); border: 1px solid #a6e3a1; border-radius: 6px; padding: 6px 8px; margin-bottom: 4px;"
            orientation={Gtk.Orientation.HORIZONTAL}
            spacing={6}
          >
            <image iconName="object-select-symbolic" css="color: #a6e3a1;" />
            <label
              label={feedback}
              css="color: #a6e3a1; font-size: 11px; font-weight: bold;"
              wrap
              xalign={0}
            />
          </box>

          <button onClicked={captureRegion} tooltipText="Selecionar com o mouse (Segure ESPAÇO para mover)">
            <box spacing={8}>
              <image iconName="edit-select-all-symbolic" />
              <label label="Capturar Região (Ajustável)" />
            </box>
          </button>
          <button onClicked={captureWindow} tooltipText="Capturar janela ativa">
            <box spacing={8}>
              <image iconName="window-new-symbolic" />
              <label label="Capturar Janela (Copiar)" />
            </box>
          </button>
          <button onClicked={captureFullScreen} tooltipText="Salvar tela inteira na pasta Imagens">
            <box spacing={8}>
              <image iconName="view-fullscreen-symbolic" />
              <label label="Tela Inteira (Imagens)" />
            </box>
          </button>
          <button onClicked={toggleRecording} tooltipText="Iniciar ou Parar gravação de vídeo em Vídeos">
            <box spacing={8}>
              <image
                iconName={recording.as((r) =>
                  r ? "media-playback-stop-symbolic" : "media-record-symbolic"
                )}
              />
              <label label={recording.as((r) => (r ? "Parar Gravação" : "Gravar Tela (MP4)"))} />
            </box>
          </button>
        </box>
      </popover>
    </menubutton>
  );
}
