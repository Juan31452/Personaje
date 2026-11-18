import type { ChangeEvent, FC } from "react";
import type { CameraViewName } from "./camera";
import ImageLoader from "./ImageLoader";
import type { HeadMovementName } from "../extras/headMovements";
import { HEAD_MOVEMENTS } from "../extras/headMovements";
import type { PoseName } from "../extras/poses";

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
  gesture: PoseName;
  cameraView: CameraViewName;
  headMovement: HeadMovementName;
  audioFileName: string;
  isExporting: boolean;
  exportProgress: number;
  canPlayAudio: boolean;
  onDialogChange: (value: string) => void;
  onGestureChange: (value: PoseName) => void;
  onCameraViewChange: (value: CameraViewName) => void;
  onHeadMovementChange: (value: HeadMovementName) => void;
  onImportAudio: (event: ChangeEvent<HTMLInputElement>) => void;
  onImageChange: (url: string) => void;
  onImageErrorChange: (error: string) => void;
  onTalk: () => void;
  onExport: () => void;
}

const Panel: FC<PanelProps> = ({
  dialogo,
  gesture,
  cameraView,
  headMovement,
  audioFileName,
  isExporting,
  exportProgress,
  canPlayAudio,
  onDialogChange,
  onGestureChange,
  onCameraViewChange,
  onHeadMovementChange,
  onImportAudio,
  onImageChange,
  onImageErrorChange,
  onTalk,
  onExport,
}) => {
  const cambiarGesto = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = GESTURE_OPTIONS.find(
      (option) => option.value === event.currentTarget.value,
    );
    if (value) onGestureChange(value.value);
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

  return (
    <aside className="editor-toolbar" aria-label="Controles del editor">
      <label className="editor-field">
        <span>Importar audio</span>
        <input
          type="file"
          accept="audio/*,.mp3,.wav,.m4a,.ogg"
          onChange={onImportAudio}
          disabled={isExporting}
        />
      </label>
      {audioFileName && (
        <span className="audio-file-name" title={audioFileName}>
          {audioFileName}
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
      <label className="editor-field">
        <span>Gesto del personaje</span>
        <select
          value={gesture}
          onChange={cambiarGesto}
          disabled={isExporting}
        >
          {GESTURE_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
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
      <button onClick={onTalk} disabled={isExporting || !canPlayAudio}>
        Hablar
      </button>
      <button onClick={onExport} disabled={isExporting || !canPlayAudio}>
        {isExporting ? `Exportando ${exportProgress}%` : "Exportar MP4"}
      </button>
    </aside>
  );
};

export default Panel;
