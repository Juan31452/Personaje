
import JuanSalazar from "./components/JuanSalazar";
import Dialogo from "./components/Dialogo";
import "./App.css";
import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";
import { useAudioMouth } from "./Hook/useAudioMouth";
import { useVideoExport } from "./Hook/useVideoExport";

function App() {
  const [dialogo, setDialogo] = useState("");
  const [mostrarDialogo, setMostrarDialogo] = useState(false);
  const [audioError, setAudioError] = useState("");
  const [audioDurationMs, setAudioDurationMs] = useState(0);
  const [audioUrl, setAudioUrl] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioFileName, setAudioFileName] = useState("");
  const [backgroundImageUrl, setBackgroundImageUrl] = useState("");
  const [backgroundFileName, setBackgroundFileName] = useState("");
  const [backgroundError, setBackgroundError] = useState("");
  const audioRef = useRef<HTMLAudioElement>(null);
  const characterRef = useRef<HTMLDivElement>(null);
  const {
    mouthState,
    audioStream,
    error: mouthError,
    resumeAudioContext,
  } = useAudioMouth(audioRef);

  useEffect(() => {
    if (!audioUrl) return;
    return () => URL.revokeObjectURL(audioUrl);
  }, [audioUrl]);

  useEffect(() => {
    if (!backgroundImageUrl) return;
    return () => URL.revokeObjectURL(backgroundImageUrl);
  }, [backgroundImageUrl]);

  const importarAudio = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;

    if (file.type && !file.type.startsWith("audio/")) {
      setAudioError("Selecciona un archivo de audio válido.");
      return;
    }

    audioRef.current?.pause();
    setMostrarDialogo(false);
    setAudioDurationMs(0);
    setAudioError("");
    setAudioFile(file);
    setAudioFileName(file.name);
    setAudioUrl(URL.createObjectURL(file));
  };

  const importarImagenFondo = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;

    if (file.type && !file.type.startsWith("image/")) {
      setBackgroundError("Selecciona un archivo de imagen válido.");
      return;
    }

    setBackgroundError("");
    setBackgroundFileName(file.name);
    setBackgroundImageUrl(URL.createObjectURL(file));
  };

  const iniciarDialogo = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) {
      throw new Error("Primero importa un archivo de audio.");
    }

    setAudioError("");
    setMostrarDialogo(Boolean(dialogo.trim()));

    try {
      await resumeAudioContext();
      audio.currentTime = 0;
      await audio.play();
    } catch (caughtError) {
      setMostrarDialogo(false);
      setAudioError(
        caughtError instanceof Error
          ? caughtError.message
          : "No se pudo reproducir el audio del diálogo.",
      );
      throw caughtError;
    }
  }, [audioUrl, dialogo, resumeAudioContext]);

  const hablar = () => {
    void iniciarDialogo().catch(() => undefined);
  };

  const {
    exportVideo,
    isExporting,
    progress,
    error: exportError,
    status: exportStatus,
  } = useVideoExport({
    targetRef: characterRef,
    durationMs: audioDurationMs,
    audioFile,
    onPrepare: resumeAudioContext,
    onStart: iniciarDialogo,
  });

  return (
    <div className="video-editor">
      <audio
        ref={audioRef}
        src={audioUrl || undefined}
        preload="auto"
        onLoadedMetadata={(event) => {
          const duration = event.currentTarget.duration;
          if (Number.isFinite(duration)) {
            setAudioDurationMs(duration * 1000);
          }
        }}
        onEnded={() => setMostrarDialogo(false)}
        onError={() => {
          setAudioError("No se pudo cargar el audio del diálogo.");
          setMostrarDialogo(false);
        }}
      />
      <aside className="editor-toolbar" aria-label="Controles del editor">
        <label className="editor-field">
          <span>Importar audio</span>
          <input
            type="file"
            accept="audio/*,.mp3,.wav,.m4a,.ogg"
            onChange={importarAudio}
            disabled={isExporting}
          />
        </label>
        {audioFileName && (
          <span className="audio-file-name" title={audioFileName}>
            {audioFileName}
          </span>
        )}
        <label className="editor-field">
          <span>Importar fondo del personaje</span>
          <input
            type="file"
            accept="image/*"
            onChange={importarImagenFondo}
            disabled={isExporting}
          />
        </label>
        {backgroundFileName && (
          <span className="audio-file-name" title={backgroundFileName}>
            {backgroundFileName}
          </span>
        )}
        {backgroundImageUrl && (
          <button
            className="editor-button-secondary"
            onClick={() => {
              setBackgroundImageUrl("");
              setBackgroundFileName("");
              setBackgroundError("");
            }}
            disabled={isExporting}
          >
            Usar fondo original
          </button>
        )}
        <small className="editor-note">
          El audio, el texto y el fondo personalizado no se guardan en el
          proyecto.
        </small>
        <label className="editor-field">
          <span>Texto del diálogo</span>
          <textarea
            value={dialogo}
            onChange={(event) => setDialogo(event.currentTarget.value)}
            placeholder="Escribe el texto para la burbuja..."
            disabled={isExporting}
          />
        </label>
        <button
          onClick={hablar}
          disabled={
            isExporting || !audioUrl || !audioStream || audioDurationMs === 0
          }
        >
          Hablar
        </button>
        <button
          onClick={exportVideo}
          disabled={
            isExporting || !audioUrl || !audioStream || audioDurationMs === 0
          }
        >
          {isExporting ? `Exportando ${progress}%` : "Exportar MP4"}
        </button>
      </aside>

      <main className="editor-canvas">
        <div className="character-container" ref={characterRef}>
          <Dialogo
            texto={dialogo}
            visible={mostrarDialogo}
            animar={!isExporting}
            posicion="arriba"
          />
          <JuanSalazar
            mouthState={mouthState}
            isTalking={mostrarDialogo}
            backgroundImageUrl={backgroundImageUrl || undefined}
          />
        </div>
        {(audioError ||
          backgroundError ||
          mouthError ||
          exportError ||
          exportStatus) && (
          <p
            className={`export-status${
              audioError || backgroundError || exportError
                ? " export-status--error"
                : ""
            }`}
            role={
              audioError || backgroundError || mouthError || exportError
                ? "alert"
                : "status"
            }
          >
            {audioError ||
              backgroundError ||
              mouthError ||
              exportError ||
              exportStatus}
          </p>
        )}
      </main>
    </div>
  );
}

export default App;
