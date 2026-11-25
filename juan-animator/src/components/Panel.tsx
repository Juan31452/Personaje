import { useState, type ChangeEvent, type FC } from "react";
import type { CameraViewName } from "./camera";
import ImageLoader from "./ImageLoader";
import type { HeadMovementName } from "../extras/headMovements";
import { HEAD_MOVEMENTS } from "../extras/headMovements";
import type { PoseName } from "../extras/poses";
import { useVoiceRecorder } from "../Hook/useVoiceRecorder";
import "../style/Panel.css"; // 👈 Importamos el CSS

const GESTURE_OPTIONS: { value: PoseName; label: string }[] = [
  { value: "idle", label: "Reposo" },
  { value: "thinking", label: "Pensando" },
  { value: "corazon", label: "Corazón (mano en el pecho)" },
  { value: "armsCrossed", label: "Manos cruzadas sobre el pecho" },
  { value: "raisedEyebrows", label: "Alzando las cejas" },
  { value: "pointing", label: "Señalando" },
  { value: "waving", label: "Saludando" },
  { value: "shrug", label: "Encogerse de hombros" },
  { value: "explaining", label: "Explicando" },
  { value: "stop", label: "Pedir que se detenga" },
  { value: "listening", label: "Escuchando" },
  { value: "presenting", label: "Presentando" },
];

const CAMERA_VIEW_OPTIONS: { value: CameraViewName; label: string }[] = [
  { value: "front", label: "Frontal" },
  { value: "profileLeft", label: "Perfil izquierdo" },
  { value: "profileRight", label: "Perfil derecho" },
  { value: "zoomIn", label: "Acercamiento" },
  { value: "closeUp", label: "Primer plano" },
  { value: "zoomOut", label: "Alejamiento" },
  { value: "dutch", label: "Ángulo inclinado" },
];

const HEAD_MOVEMENT_OPTIONS = Object.entries(HEAD_MOVEMENTS).map(
  ([value, movement]) => ({
    value: value as HeadMovementName,
    label: movement.label,
  }),
);

interface PanelProps {
  dialogo: string;
  selectedGestures: PoseName[];
  isPlayingGestures: boolean;
  gestureSequenceStep: number;
  gestureSequenceLength: number;
  cameraView: CameraViewName;
  headMovement: HeadMovementName;
  audioFileName: string;
  isExporting: boolean;
  exportProgress: number;
  canPlayAudio: boolean;
  onDialogChange: (value: string) => void;
  onToggleGesture: (value: PoseName) => void;
  onPlayGestureSequence: () => void;
  onStopGestureSequence: () => void;
  onCameraViewChange: (value: CameraViewName) => void;
  onHeadMovementChange: (value: HeadMovementName) => void;
  onImportAudio: (event: ChangeEvent<HTMLInputElement>) => void;
  onImportAudioFile?: (file: File) => void;
  onImageChange: (url: string) => void;
  onImageErrorChange: (error: string) => void;
  onTalk: () => void;
  onExport: () => void;
}

const Panel: FC<PanelProps> = ({
  dialogo,
  selectedGestures,
  isPlayingGestures,
  gestureSequenceStep,
  gestureSequenceLength,
  cameraView,
  headMovement,
  audioFileName,
  isExporting,
  exportProgress,
  canPlayAudio,
  onDialogChange,
  onToggleGesture,
  onPlayGestureSequence,
  onStopGestureSequence,
  onCameraViewChange,
  onHeadMovementChange,
  onImportAudio,
  onImportAudioFile,
  onImageChange,
  onImageErrorChange,
  onTalk,
  onExport,
}) => {
  const [audioTab, setAudioTab] = useState<"file" | "mic">("file");
  const recorder = useVoiceRecorder();

  const formatTime = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleUseRecording = () => {
    if (!recorder.audioBlob || !onImportAudioFile) return;
    const mime = recorder.audioBlob.type || "audio/webm";
    const ext = mime.includes("mp4") ? "m4a" : mime.includes("ogg") ? "ogg" : "webm";
    const file = new File([recorder.audioBlob], `grabacion_${Date.now()}.${ext}`, {
      type: mime,
    });
    onImportAudioFile(file);
  };

  const cambiarVistaCamara = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = CAMERA_VIEW_OPTIONS.find(
      (option) => option.value === event.currentTarget.value,
    );
    if (value) onCameraViewChange(value.value);
  };

  const cambiarMovimientoCabeza = (
    event: ChangeEvent<HTMLSelectElement>,
  ) => {
    const value = HEAD_MOVEMENT_OPTIONS.find(
      (option) => option.value === event.currentTarget.value,
    );
    if (value) onHeadMovementChange(value.value);
  };

  const hasText = Boolean(dialogo.trim());
  const canPerformAction = canPlayAudio && hasText && !isExporting;

  return (
    <aside className="editor-toolbar" aria-label="Controles del editor">
      <div className="audio-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={audioTab === "file"}
          className={`audio-tab-btn ${audioTab === "file" ? "audio-tab-btn--active" : ""}`}
          onClick={() => setAudioTab("file")}
          disabled={isExporting || recorder.isRecording}
        >
          📁 Subir archivo
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={audioTab === "mic"}
          className={`audio-tab-btn ${audioTab === "mic" ? "audio-tab-btn--active" : ""}`}
          onClick={() => setAudioTab("mic")}
          disabled={isExporting || recorder.isRecording}
        >
          🎙️ Grabar voz
        </button>
      </div>

      {audioTab === "file" ? (
        <label className="editor-field">
          <span>Importar archivo de audio</span>
          <input
            type="file"
            accept="audio/*,.mp3,.wav,.m4a,.ogg"
            onChange={onImportAudio}
            disabled={isExporting}
          />
        </label>
      ) : (
        <div className="voice-recorder-container">
          {!recorder.isRecording && !recorder.audioUrl && (
            <button
              type="button"
              className="recorder-btn-start"
              onClick={recorder.startRecording}
              disabled={isExporting}
            >
              🔴 Iniciar grabación
            </button>
          )}

          {recorder.isRecording && (
            <div className="recorder-active-box">
              <div className="recorder-status">
                <span className="recording-dot" />
                <span>{recorder.isPaused ? "Pausado" : "Grabando..."}</span>
                <span className="recorder-timer">{formatTime(recorder.duration)}</span>
              </div>
              <div className="recorder-controls">
                {recorder.isPaused ? (
                  <button type="button" onClick={recorder.resumeRecording}>
                    ▶️ Reanudar
                  </button>
                ) : (
                  <button type="button" onClick={recorder.pauseRecording}>
                    ⏸️ Pausar
                  </button>
                )}
                <button
                  type="button"
                  className="recorder-btn-stop"
                  onClick={recorder.stopRecording}
                >
                  ⏹️ Finalizar
                </button>
              </div>
            </div>
          )}

          {recorder.audioUrl && !recorder.isRecording && (
            <div className="recorder-finished-box">
              <div className="recorder-preview-info">
                <span>Audio grabado listo:</span>
                <span className="recorder-timer">{formatTime(recorder.duration)}</span>
              </div>
              <audio src={recorder.audioUrl} controls className="recorder-audio-preview" />
              <div className="recorder-controls">
                <button
                  type="button"
                  className="recorder-btn-use"
                  onClick={handleUseRecording}
                  disabled={isExporting}
                >
                  ✅ Usar en personaje
                </button>
                <button
                  type="button"
                  className="editor-button-secondary"
                  onClick={recorder.resetRecording}
                  disabled={isExporting}
                >
                  🔄 Grabar otro
                </button>
              </div>
            </div>
          )}

          {recorder.error && <p className="recorder-error">{recorder.error}</p>}
        </div>
      )}

      {audioFileName && (
        <span className="audio-file-name" title={audioFileName}>
          🔊 Audio activo: {audioFileName}
        </span>
      )}
      <ImageLoader
        disabled={isExporting}
        onImageChange={onImageChange}
        onErrorChange={onImageErrorChange}
      />
      <small className="editor-note">
        El audio, el texto y el fondo personalizado no se guardan en el
        proyecto.
      </small>
      <label className="editor-field">
        <span>Texto del diálogo</span>
        <textarea
          value={dialogo}
          onChange={(event) => onDialogChange(event.currentTarget.value)}
          placeholder="Escribe el texto para la burbuja..."
          disabled={isExporting}
        />
      </label>
      <fieldset
        className="editor-gesture-field"
        disabled={isExporting || isPlayingGestures}
      >
        <legend>Gestos del personaje</legend>
        <small className="editor-note">
          Selecciona varios; se reproducen en el orden en que los marques.
        </small>
        <div className="gesture-options">
          {GESTURE_OPTIONS.map(({ value, label }) => {
            const order = selectedGestures.indexOf(value);
            return (
              <label className="gesture-option" key={value}>
                <input
                  type="checkbox"
                  checked={order !== -1}
                  onChange={() => onToggleGesture(value)}
                />
                <span>{order === -1 ? label : `${order + 1}. ${label}`}</span>
              </label>
            );
          })}
        </div>
      </fieldset>
      <button
        onClick={onPlayGestureSequence}
        disabled={
          isExporting || isPlayingGestures || selectedGestures.length === 0
        }
      >
        Reproducir gestos
      </button>
      {isPlayingGestures && (
        <>
          <small className="editor-note" role="status">
            Reproduciendo paso {gestureSequenceStep} de {gestureSequenceLength}
          </small>
          <button onClick={onStopGestureSequence} disabled={isExporting}>
            Detener gestos
          </button>
        </>
      )}
      <div className="editor-row">
        <label className="editor-field">
          <span>Estilo de cámara</span>
          <select
            value={cameraView}
            onChange={cambiarVistaCamara}
            disabled={isExporting}
          >
            {CAMERA_VIEW_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="editor-field">
          <span>Movimiento de cabeza</span>
          <select
            value={headMovement}
            onChange={cambiarMovimientoCabeza}
            disabled={isExporting}
          >
            {HEAD_MOVEMENT_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="editor-actions-row">
        <button
          className="editor-button-talk"
          onClick={onTalk}
          disabled={!canPerformAction}
          title={
            !canPlayAudio && !hasText
              ? "Requiere importar o grabar audio y escribir un texto"
              : !canPlayAudio
                ? "Requiere importar o grabar un audio"
                : !hasText
                  ? "Escribe el texto del diálogo para poder hablar"
                  : "Hacer hablar al personaje"
          }
        >
          Hablar
        </button>
        <button
          className="editor-button-export"
          onClick={onExport}
          disabled={!canPerformAction}
          title={
            !canPlayAudio && !hasText
              ? "Requiere importar o grabar audio y escribir un texto"
              : !canPlayAudio
                ? "Requiere importar o grabar un audio"
                : !hasText
                  ? "Escribe el texto del diálogo para exportar"
                  : "Exportar animación a video MP4"
          }
        >
          {isExporting ? `Exportando ${exportProgress}%` : "Exportar MP4"}
        </button>
      </div>
    </aside>
  );
};

export default Panel;
