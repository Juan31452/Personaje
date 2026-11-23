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
import { dividirDialogos, obtenerProgresoDialogo } from "./Dialogo";

interface DialogProgress {
  dialogoIndex: number;
  palabraIndex: number;
}

export interface AudioManagerRenderProps {
  dialogos: string[];
  progresoDialogo: DialogProgress;
  audioCurrentTimeMs: number;
  audioDurationMs: number;
  isAudioPlaying: boolean;
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
  onPreparePlayback: () => void;
  onTalk: () => void;
  onExport: () => void;
}

interface AudioManagerProps {
  dialogo: string;
  targetRef: RefObject<HTMLDivElement | null>;
  backgroundImageUrl: string;
  children: (audio: AudioManagerRenderProps) => ReactNode;
}

const AudioManager: FC<AudioManagerProps> = ({
  dialogo,
  targetRef,
  backgroundImageUrl,
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
  const [audioCurrentTimeMs, setAudioCurrentTimeMs] = useState(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioError, setAudioError] = useState("");

  const audioRef = useRef<HTMLAudioElement>(null);
  const playbackTimeFrameRef = useRef<number | null>(null);
  const dialogoRef = useRef(dialogo);
  dialogoRef.current = dialogo;

  const dialogos = useMemo(() => dividirDialogos(dialogo), [dialogo]);

  // Reinicia el índice de progreso si el usuario edita el texto del diálogo
  useEffect(() => {
    setProgresoDialogo({ dialogoIndex: 0, palabraIndex: 0 });
  }, [dialogo]);

  const updateDialogProgress = useCallback(
    (timeMs: number) => {
      const nextProgress = obtenerProgresoDialogo(
        dialogos,
        timeMs,
        audioDurationMs,
      );
      setProgresoDialogo((current) =>
        current.dialogoIndex === nextProgress.dialogoIndex &&
        current.palabraIndex === nextProgress.palabraIndex
          ? current
          : nextProgress,
      );
    },
    [audioDurationMs, dialogos],
  );

  const {
    mouthState,
    audioStream,
    error: mouthError,
    resumeAudioContext,
  } = useAudioMouth(audioRef);

  // Libera la URL temporal del archivo anterior al cambiar o desmontar
  useEffect(() => {
    if (!audioUrl) return;
    return () => URL.revokeObjectURL(audioUrl);
  }, [audioUrl]);

  // Seguimiento fluido del tiempo de reproducción mediante requestAnimationFrame
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updatePlaybackTime = () => {
      if (audio.paused || audio.ended) {
        playbackTimeFrameRef.current = null;
        return;
      }
      const timeMs = audio.currentTime * 1000;
      setAudioCurrentTimeMs(timeMs);
      updateDialogProgress(timeMs);
      playbackTimeFrameRef.current =
        window.requestAnimationFrame(updatePlaybackTime);
    };

    const startTracking = () => {
      setIsAudioPlaying(true);
      setIsTalking(Boolean(dialogoRef.current.trim()));
      if (playbackTimeFrameRef.current !== null) {
        window.cancelAnimationFrame(playbackTimeFrameRef.current);
      }
      playbackTimeFrameRef.current =
        window.requestAnimationFrame(updatePlaybackTime);
    };

    const stopTracking = () => {
      setIsAudioPlaying(false);
      setIsTalking(false);
      if (playbackTimeFrameRef.current !== null) {
        window.cancelAnimationFrame(playbackTimeFrameRef.current);
        playbackTimeFrameRef.current = null;
      }
      const timeMs = audio.currentTime * 1000;
      setAudioCurrentTimeMs(timeMs);
      updateDialogProgress(timeMs);
    };

    audio.addEventListener("play", startTracking);
    audio.addEventListener("pause", stopTracking);
    if (!audio.paused && !audio.ended) startTracking();

    return () => {
      audio.removeEventListener("play", startTracking);
      audio.removeEventListener("pause", stopTracking);
      if (playbackTimeFrameRef.current !== null) {
        window.cancelAnimationFrame(playbackTimeFrameRef.current);
      }
    };
  }, [updateDialogProgress]);

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
    setIsAudioPlaying(false);
    setAudioDurationMs(0);
    setAudioCurrentTimeMs(0);
    setProgresoDialogo({ dialogoIndex: 0, palabraIndex: 0 });
    setAudioError("");
    setAudioFile(file);
    setAudioFileName(file.name);
    setAudioUrl(URL.createObjectURL(file));
  }, []);

  const preparePlayback = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) {
      throw new Error("Primero importa un archivo de audio.");
    }

    setAudioError("");
    setIsTalking(Boolean(dialogoRef.current.trim()));
    setProgresoDialogo({ dialogoIndex: 0, palabraIndex: 0 });
    audio.currentTime = 0;
    setAudioCurrentTimeMs(0);
  }, [audioUrl]);

  const startPlayback = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) {
      throw new Error("Primero importa un archivo de audio.");
    }

    preparePlayback();
    try {
      await resumeAudioContext();
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
  }, [audioUrl, preparePlayback, resumeAudioContext]);

  // Referencias frescas para evitar cierres obsoletos durante la exportación
  const preparePlaybackRef = useRef(preparePlayback);
  preparePlaybackRef.current = preparePlayback;

  const startPlaybackRef = useRef(startPlayback);
  startPlaybackRef.current = startPlayback;

  const stablePreparePlayback = useCallback(
    () => preparePlaybackRef.current(),
    [],
  );
  const stableStartPlayback = useCallback(
    () => startPlaybackRef.current(),
    [],
  );

  const {
    exportVideo,
    isExporting,
    progress: exportProgress,
    error: exportError,
    status: exportStatus,
  } = useVideoExport({
    targetRef,
    audioRef,
    dialogos,
    durationMs: audioDurationMs,
    audioFile,
    backgroundImageUrl,
    onPrepare: resumeAudioContext,
    onPreparePlayback: stablePreparePlayback,
    onStart: stableStartPlayback,
  });

  const onTalk = useCallback(() => {
    void startPlayback().catch(() => undefined);
  }, [startPlayback]);

  const syncDuration = useCallback((durationSec: number) => {
    if (Number.isFinite(durationSec) && durationSec > 0) {
      setAudioDurationMs(durationSec * 1000);
    }
  }, []);

  const renderProps: AudioManagerRenderProps = {
    dialogos,
    progresoDialogo,
    audioCurrentTimeMs,
    audioDurationMs,
    isAudioPlaying,
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
    onPreparePlayback: preparePlayback,
    onTalk,
    onExport: exportVideo,
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={audioUrl || undefined}
        preload="auto"
        onLoadedMetadata={(event) =>
          syncDuration(event.currentTarget.duration)
        }
        onDurationChange={(event) =>
          syncDuration(event.currentTarget.duration)
        }
        onTimeUpdate={(event) => {
          const timeMs = event.currentTarget.currentTime * 1000;
          setAudioCurrentTimeMs(timeMs);
          updateDialogProgress(timeMs);
        }}
        onEnded={() => {
          setAudioCurrentTimeMs(audioDurationMs);
          updateDialogProgress(audioDurationMs);
          setIsAudioPlaying(false);
          setIsTalking(false);
        }}
        onError={() => {
          setAudioError("No se pudo cargar el audio del diálogo.");
          setIsAudioPlaying(false);
          setIsTalking(false);
        }}
      />
      {children(renderProps)}
    </>
  );
};

export default AudioManager;
