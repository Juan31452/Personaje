import { useRef, useState } from "react";
import AudioManager from "./components/AudioManager";
import Dialogo from "./components/Dialogo";
import JuanSalazar from "./components/JuanSalazar";
import Panel from "./components/Panel";
import "./App.css";
import type { CameraViewName } from "./components/camera";
import type { HeadMovementName } from "./extras/headMovements";
import type { PoseName } from "./extras/poses";

function App() {
  const [dialogo, setDialogo] = useState("");
  const [gesture, setGesture] = useState<PoseName>("idle");
  const [cameraView, setCameraView] = useState<CameraViewName>("front");
  const [headMovement, setHeadMovement] =
    useState<HeadMovementName>("sway");
  const [backgroundImageUrl, setBackgroundImageUrl] = useState("");
  const [backgroundError, setBackgroundError] = useState("");
  const characterRef = useRef<HTMLDivElement>(null);

  return (
    <AudioManager dialogo={dialogo} targetRef={characterRef}>
      {(audio) => (
        <div className="video-editor">
          <Panel
            dialogo={dialogo}
            gesture={gesture}
            cameraView={cameraView}
            headMovement={headMovement}
            audioFileName={audio.audioFileName}
            isExporting={audio.isExporting}
            exportProgress={audio.exportProgress}
            canPlayAudio={audio.canPlayAudio}
            onDialogChange={setDialogo}
            onGestureChange={setGesture}
            onCameraViewChange={setCameraView}
            onHeadMovementChange={setHeadMovement}
            onImportAudio={audio.onImportAudio}
            onImageChange={setBackgroundImageUrl}
            onImageErrorChange={setBackgroundError}
            onTalk={audio.onTalk}
            onExport={audio.onExport}
          />

          <main className="editor-canvas">
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
        </div>
      )}
    </AudioManager>
  );
}

export default App;
