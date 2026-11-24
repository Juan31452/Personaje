import { useEffect, useRef, useState } from "react";
import AudioManager from "./components/AudioManager";
import Dialogo from "./components/Dialogo";
import JuanSalazar from "./components/JuanSalazar";
import Panel from "./components/Panel";
import TTSEditor from "./components/TTSEditor";
import "./App.css";
import { GESTURE_TRANSITION_DURATION } from "./Hook/useGesture";
import type { CameraViewName } from "./components/camera";
import type { HeadMovementName } from "./extras/headMovements";
import type { PoseName } from "./extras/poses";

function App() {
  const [dialogo, setDialogo] = useState("");
  const [selectedGestures, setSelectedGestures] = useState<PoseName[]>([]);
  const [gestureSequence, setGestureSequence] = useState<PoseName[]>([]);
  const [gestureSequenceIndex, setGestureSequenceIndex] = useState(0);
  const [isPlayingGestures, setIsPlayingGestures] = useState(false);
  const [isGestureSequenceSynced, setIsGestureSequenceSynced] =
    useState(false);
  const [cameraView, setCameraView] = useState<CameraViewName>("closeUp");
  const [headMovement, setHeadMovement] =
    useState<HeadMovementName>("sway");
  const [backgroundImageUrl, setBackgroundImageUrl] = useState("");
  const [backgroundError, setBackgroundError] = useState("");
  const [showTTS, setShowTTS] = useState(true);
  const characterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      !isPlayingGestures ||
      isGestureSequenceSynced ||
      gestureSequenceIndex >= gestureSequence.length
    )
      return;

    const timer = window.setTimeout(
      () => {
        if (gestureSequenceIndex + 1 >= gestureSequence.length) {
          setIsPlayingGestures(false);
          setGestureSequenceIndex(0);
        } else {
          setGestureSequenceIndex((index) => index + 1);
        }
      },
      GESTURE_TRANSITION_DURATION,
    );
    return () => window.clearTimeout(timer);
  }, [
    gestureSequence,
    gestureSequenceIndex,
    isGestureSequenceSynced,
    isPlayingGestures,
  ]);

  const toggleGesture = (pose: PoseName) => {
    setSelectedGestures((selected) =>
      selected.includes(pose)
        ? selected.filter((item) => item !== pose)
        : [...selected, pose],
    );
  };

  const playGestureSequence = (syncToDialogue = false) => {
    if (selectedGestures.length === 0) {
      setGestureSequence([]);
      setGestureSequenceIndex(0);
      setIsPlayingGestures(false);
      setIsGestureSequenceSynced(false);
      return;
    }
    setGestureSequence([...selectedGestures]);
    setGestureSequenceIndex(0);
    setIsGestureSequenceSynced(syncToDialogue);
    setIsPlayingGestures(true);
  };

  const stopGestureSequence = () => {
    setIsPlayingGestures(false);
    setIsGestureSequenceSynced(false);
    setGestureSequenceIndex(0);
  };

  return (
    <AudioManager
      dialogo={dialogo}
      targetRef={characterRef}
      backgroundImageUrl={backgroundImageUrl}
    >
      {(audio) => {
        const isDialogueSequenceComplete =
          isGestureSequenceSynced &&
          !audio.isAudioPlaying &&
          audio.audioDurationMs > 0 &&
          audio.audioCurrentTimeMs >= audio.audioDurationMs;
        const isGestureSequenceActive =
          isPlayingGestures &&
          (!isGestureSequenceSynced || audio.isAudioPlaying);
        const currentGestureIndex =
          isGestureSequenceSynced && audio.audioDurationMs > 0
            ? Math.min(
                gestureSequence.length - 1,
                Math.floor(
                  (audio.audioCurrentTimeMs / audio.audioDurationMs) *
                    gestureSequence.length,
                ),
              )
            : gestureSequenceIndex;
        const gesture: PoseName = isGestureSequenceActive
          ? (gestureSequence[currentGestureIndex] ?? "idle")
          : isDialogueSequenceComplete
            ? (gestureSequence[gestureSequence.length - 1] ?? "idle")
            : "idle";
        const gestureTransitionDuration = isDialogueSequenceComplete
          ? 0
          : isGestureSequenceSynced && isGestureSequenceActive
            ? Math.max(
                1,
                audio.audioDurationMs / gestureSequence.length,
              )
            : GESTURE_TRANSITION_DURATION;

        return (
        <div className={`video-editor ${showTTS ? "video-editor--with-tts" : ""}`}>
          <Panel
            dialogo={dialogo}
            selectedGestures={selectedGestures}
            isPlayingGestures={isGestureSequenceActive}
            gestureSequenceStep={
              isGestureSequenceActive ? currentGestureIndex + 1 : 0
            }
            gestureSequenceLength={gestureSequence.length}
            cameraView={cameraView}
            headMovement={headMovement}
            audioFileName={audio.audioFileName}
            isExporting={audio.isExporting}
            exportProgress={audio.exportProgress}
            canPlayAudio={audio.canPlayAudio}
            onDialogChange={setDialogo}
            onToggleGesture={toggleGesture}
            onPlayGestureSequence={playGestureSequence}
            onStopGestureSequence={stopGestureSequence}
            onCameraViewChange={setCameraView}
            onHeadMovementChange={setHeadMovement}
            onImportAudio={audio.onImportAudio}
            onImportAudioFile={audio.onImportAudioFile}
            onImageChange={setBackgroundImageUrl}
            onImageErrorChange={setBackgroundError}
            onTalk={() => {
              audio.onTalk();
              playGestureSequence(true);
            }}
            onExport={() => {
              playGestureSequence(true);
              audio.onExport();
            }}
          />

          <main className="editor-canvas">
            <button
              type="button"
              className="tts-toggle-btn"
              onClick={() => setShowTTS((v) => !v)}
              title={showTTS ? "Ocultar panel TTS" : "Abrir generador de voz TTS"}
            >
              🗣️ {showTTS ? "Ocultar TTS" : "Voz TTS"}
            </button>
            <div className="character-container" ref={characterRef}>
              <Dialogo
                texto={
                  audio.dialogos[audio.progresoDialogo.dialogoIndex] ?? ""
                }
                palabraActiva={audio.progresoDialogo.palabraIndex}
                visible={audio.isTalking}
                animar={!audio.isExporting}
                posicion="arriba"
              />
              <JuanSalazar
                mouthState={audio.mouthState}
                isTalking={audio.isTalking}
                backgroundImageUrl={backgroundImageUrl || undefined}
                gesture={gesture}
                gestureTransitionDuration={gestureTransitionDuration}
                cameraView={cameraView}
                headMovement={headMovement}
              />
            </div>
            {(audio.audioError ||
              backgroundError ||
              audio.mouthError ||
              audio.exportError ||
              audio.exportStatus) && (
              <p
                className={`export-status${
                  audio.audioError || backgroundError || audio.exportError
                    ? " export-status--error"
                    : ""
                }`}
                role={
                  audio.audioError ||
                  backgroundError ||
                  audio.mouthError ||
                  audio.exportError
                    ? "alert"
                    : "status"
                }
              >
                {audio.audioError ||
                  backgroundError ||
                  audio.mouthError ||
                  audio.exportError ||
                  audio.exportStatus}
              </p>
            )}
          </main>

          {showTTS && (
            <aside className="editor-tts-sidebar" aria-label="Editor de voz TTS">
              <div className="tts-sidebar-header">
                <h3>🗣️ Voz Sintética (TTS)</h3>
                <button
                  type="button"
                  className="tts-close-btn"
                  onClick={() => setShowTTS(false)}
                  title="Cerrar panel TTS"
                >
                  ✕
                </button>
              </div>
              <TTSEditor
                dialogos={audio.dialogos}
                onApplyText={(text) => setDialogo(text)}
                onApplyAudio={(file) => audio.onImportAudioFile(file)}
              />
            </aside>
          )}
        </div>
        );
      }}
    </AudioManager>
  );
}

export default App;
