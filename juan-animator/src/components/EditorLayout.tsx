import type { FC, RefObject } from "react";
import type { AudioManagerRenderProps } from "./AudioManager";
import Dialogo from "./Dialogo";
import JuanSalazar from "./JuanSalazar";
import Panel from "./Panel";
import TTSEditor from "./TTSEditor";
import type { GestureSequenceState } from "../Hook/useGestureSequence";
import type { EditorUIState } from "../Hook/useEditorUI";
import "../style/EditorLayout.css"; // 👈 Importamos el CSS

interface EditorLayoutProps {
  dialogo: string;
  characterRef: RefObject<HTMLDivElement | null>;
  gesture: GestureSequenceState;
  ui: EditorUIState;
  audio: AudioManagerRenderProps;
  onDialogChange: (value: string) => void;
  onImageChange: (value: string) => void;
  onImageErrorChange: (value: string) => void;
  onTalk: () => void;
  onExport: () => void;
}

export const EditorLayout: FC<EditorLayoutProps> = ({
  dialogo,
  characterRef,
  gesture,
  ui,
  audio,
  onDialogChange,
  onImageChange,
  onImageErrorChange,
  onTalk,
  onExport,
}) => {
  const statusMessage =
    audio.audioError ||
    ui.backgroundError ||
    audio.mouthError ||
    audio.exportError ||
    audio.exportStatus;

  const isStatusError = Boolean(
    audio.audioError || ui.backgroundError || audio.exportError,
  );

  return (
    <div className={`editor-layout ${ui.showTTS ? "editor-layout--with-tts" : ""}`}>
      
      {/* 1. PANEL IZQUIERDO (Controles) */}
      <aside className="editor-panel-left">
        <Panel
          dialogo={dialogo}
          selectedGestures={gesture.selectedGestures}
          isPlayingGestures={gesture.isGestureSequenceActive}
          gestureSequenceStep={gesture.gestureSequenceStep}
          gestureSequenceLength={gesture.gestureSequenceLength}
          cameraView={ui.cameraView}
          headMovement={ui.headMovement}
          audioFileName={audio.audioFileName}
          isExporting={audio.isExporting}
          exportProgress={audio.exportProgress}
          canPlayAudio={audio.canPlayAudio}
          onDialogChange={onDialogChange}
          onToggleGesture={gesture.toggleGesture}
          onPlayGestureSequence={gesture.playGestureSequence}
          onStopGestureSequence={gesture.stopGestureSequence}
          onCameraViewChange={ui.setCameraView}
          onHeadMovementChange={ui.setHeadMovement}
          onImportAudio={audio.onImportAudio}
          onImportAudioFile={audio.onImportAudioFile}
          onImageChange={onImageChange}
          onImageErrorChange={onImageErrorChange}
          onTalk={onTalk}
          onExport={onExport}
        />
      </aside>

      {/* 2. CANVAS CENTRAL (Personaje) */}
      <main className="editor-canvas">
        <button
          type="button"
          className="tts-toggle-btn"
          onClick={() => ui.setShowTTS((v) => !v)}
          title={ui.showTTS ? "Ocultar panel TTS" : "Abrir generador de voz TTS"}
        >
          🗣️ {ui.showTTS ? "Ocultar TTS" : "Voz TTS"}
        </button>

        <div className="character-container" ref={characterRef}>
          <div className="dialogo-container">
            <Dialogo
              texto={audio.dialogos[audio.progresoDialogo.dialogoIndex] ?? ""}
              palabraActiva={audio.progresoDialogo.palabraIndex}
              visible={audio.isTalking}
              animar={!audio.isExporting}
              posicion="arriba"
            />
          </div>

          <div className="character-wrapper">
            <JuanSalazar
              mouthState={audio.mouthState}
              isTalking={audio.isTalking}
              backgroundImageUrl={ui.backgroundImageUrl || undefined}
              gesture={gesture.gesture}
              gestureTransitionDuration={gesture.gestureTransitionDuration}
              cameraView={ui.cameraView}
              headMovement={ui.headMovement}
            />
          </div>
        </div>

        {statusMessage && (
          <p
            className={`export-status ${isStatusError ? "export-status--error" : "export-status--info"}`}
            role={isStatusError ? "alert" : "status"}
          >
            {statusMessage}
          </p>
        )}
      </main>

      {/* 3. PANEL DERECHO (TTS) */}
      {ui.showTTS && (
        <aside className="editor-tts-sidebar" aria-label="Editor de voz TTS">
          <div className="tts-sidebar-header">
            <h3>🗣️ Voz Sintética (TTS)</h3>
            <button
              type="button"
              className="tts-close-btn"
              onClick={() => ui.setShowTTS(false)}
              title="Cerrar panel TTS"
            >
              ✕
            </button>
          </div>
          <div className="tts-sidebar-content">
            <TTSEditor
              dialogos={audio.dialogos}
              onApplyText={onDialogChange}
              onApplyAudio={audio.onImportAudioFile}
            />
          </div>
        </aside>
      )}
    </div>
  );
};