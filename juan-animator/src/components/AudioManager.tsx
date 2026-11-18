import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FC,
  type ReactNode,
  type RefObject,
} from "react";
import { useAudioMouth } from "../Hook/useAudioMouth";
import { useVideoExport } from "../Hook/useVideoExport";
import { obtenerProgresoDialogo } from "./Dialogo";

interface DialogProgress {
  dialogoIndex: number;
  palabraIndex: number;
}

export interface AudioManagerRenderProps {
  dialogos: string[];
  progresoDialogo: DialogProgress;
  isTalking: boolean;
  mouthState: number;
  audioFileName: string;
  canPlayAudio: boolean;
  isExporting: boolean;
  exportProgress: number;
  audioError: string;
  mouthError: string;
  exportError: string;
  exportStatus: string;
  onImportAudio: (event: ChangeEvent<HTMLInputElement>) => void;
  onTalk: () => void;
  onExport: () => void;
}

interface AudioManagerProps {
  dialogo: string;
  targetRef: RefObject<HTMLDivElement | null>;
  children: (audio: AudioManagerRenderProps) => ReactNode;
}

const separarDialogos = (texto: string) =>
  texto
    .split(/\n+/)
    .map((parrafo) => parrafo.trim())
    .filter(Boolean);

const AudioManager: FC<AudioManagerProps> = ({
  dialogo,
  targetRef,
  children,
}) => {
  const [progresoDialogo, setProgresoDialogo] = useState<DialogProgress>({
    dialogoIndex: 0,
    palabraIndex: 0,
  });
  const [isTalking, setIsTalking] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioFileName, setAudioFileName] = useState("");
  const [audioDurationMs, setAudioDurationMs] = useState(0);
  const [audioError, setAudioError] = useState("");
  const audioRef = useRef<HTMLAudioElement>(null);
  const dialogos = useMemo(() => separarDialogos(dialogo), [dialogo]);
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

  const importAudio = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;

    if (file.type && !file.type.startsWith("audio/")) {
      setAudioError("Selecciona un archivo de audio válido.");
      return;
    }

    audioRef.current?.pause();
    setIsTalking(false);
    setAudioDurationMs(0);
    setAudioError("");
    setAudioFile(file);
    setAudioFileName(file.name);
    setAudioUrl(URL.createObjectURL(file));
  }, []);

  const startPlayback = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) {
      throw new Error("Primero importa un archivo de audio.");
    }

    setAudioError("");
    setIsTalking(Boolean(dialogo.trim()));
    setProgresoDialogo({ dialogoIndex: 0, palabraIndex: 0 });

    try {
      await resumeAudioContext();
      audio.currentTime = 0;
      await audio.play();
    } catch (caughtError) {
      setIsTalking(false);
      setAudioError(
        caughtError instanceof Error
          ? caughtError.message
          : "No se pudo reproducir el audio del diálogo.",
      );
      throw caughtError;
    }
  }, [audioUrl, dialogo, resumeAudioContext]);

  const {
    exportVideo,
    isExporting,
    progress: exportProgress,
    error: exportError,
    status: exportStatus,
  } = useVideoExport({
    targetRef,
    durationMs: audioDurationMs,
    audioFile,
    onPrepare: resumeAudioContext,
    onStart: startPlayback,
  });

  const onTalk = () => {
    void startPlayback().catch(() => undefined);
  };

  const renderProps: AudioManagerRenderProps = {
    dialogos,
    progresoDialogo,
    isTalking,
    mouthState,
    audioFileName,
    canPlayAudio:
      Boolean(audioUrl) && Boolean(audioStream) && audioDurationMs > 0,
    isExporting,
    exportProgress,
    audioError,
    mouthError,
    exportError,
    exportStatus,
    onImportAudio: importAudio,
    onTalk,
    onExport: exportVideo,
  };

  return (
    <>
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
        onTimeUpdate={(event) => {
          const nextProgress = obtenerProgresoDialogo(
            dialogos,
            event.currentTarget.currentTime * 1000,
            audioDurationMs,
          );
          setProgresoDialogo((current) =>
            current.dialogoIndex === nextProgress.dialogoIndex &&
            current.palabraIndex === nextProgress.palabraIndex
              ? current
              : nextProgress,
          );
        }}
        onEnded={() => setIsTalking(false)}
        onError={() => {
          setAudioError("No se pudo cargar el audio del diálogo.");
          setIsTalking(false);
        }}
      />
      {children(renderProps)}
    </>
  );
};

export default AudioManager;
