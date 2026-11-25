import { useRef, useState } from "react";
import AudioManager from "./components/AudioManager";
import { EditorLayout } from "./components/EditorLayout";
import { useGestureSequence } from "./Hook/useGestureSequence";
import { useEditorUI } from "./Hook/useEditorUI";

function App() {
  const [dialogo, setDialogo] = useState("");
  const characterRef = useRef<HTMLDivElement>(null);

  // 1. Hook para la interfaz de usuario
  const ui = useEditorUI();

  return (
    // 2. AudioManager es la fuente de verdad del audio
    <AudioManager
      dialogo={dialogo}
      targetRef={characterRef}
      backgroundImageUrl={ui.backgroundImageUrl}
    >
      {(audio) => {
        // 3. Hook para la lógica de gestos, alimentado por el estado de audio
        const gesture = useGestureSequence({
          isAudioPlaying: audio.isAudioPlaying,
          audioDurationMs: audio.audioDurationMs,
          audioCurrentTimeMs: audio.audioCurrentTimeMs,
        });

        // 4. Renderizamos el layout pasándole todo lo que necesita
        return (
          <EditorLayout
            dialogo={dialogo}
            characterRef={characterRef}
            gesture={gesture}
            ui={ui}
            audio={audio}
            onDialogChange={setDialogo}
            onImageChange={ui.setBackgroundImageUrl}
            onImageErrorChange={ui.setBackgroundError}
            onTalk={() => {
              audio.onTalk();
              gesture.playGestureSequence(true);
            }}
            onExport={() => {
              gesture.playGestureSequence(true);
              audio.onExport();
            }}
          />
        );
      }}
    </AudioManager>
  );
}

export default App;