import { useCallback, useRef, useState, type RefObject } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toCanvas } from "html-to-image";
import ffmpegCoreUrl from "@ffmpeg/core?url";
import ffmpegWasmUrl from "@ffmpeg/core/wasm?url";
import fondo from "../assets/fondo.jpg";

const VIDEO_WIDTH = 720;
const VIDEO_HEIGHT = 1280;
const PANEL_WIDTH = 720;
const PANEL_HEIGHT = 1080;
const fondoImage = new Image();
fondoImage.src = fondo;

interface SaveFileWritable {
  write: (data: Uint8Array) => Promise<void>;
  close: () => Promise<void>;
  abort: () => Promise<void>;
}

interface SaveFileHandle {
  name: string;
  createWritable: () => Promise<SaveFileWritable>;
}

interface SaveFilePickerOptions {
  suggestedName: string;
  types: {
    description: string;
    accept: Record<string, string[]>;
  }[];
}

interface WindowWithSavePicker extends Window {
  showSaveFilePicker?: (
    options: SaveFilePickerOptions,
  ) => Promise<SaveFileHandle>;
}

interface UseVideoExportOptions {
  targetRef: RefObject<HTMLElement | null>;
  durationMs: number;
  audioFile: File | null;
  onPrepare: () => void | Promise<void>;
  onStart: () => void | Promise<void>;
}

const wait = (milliseconds: number) =>
  new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds));

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "No se pudo exportar el video.";

const getAudioInputName = (file: File) => {
  const extension = file.name.split(".").pop()?.toLowerCase();
  const safeExtension =
    extension && /^[a-z0-9]{1,8}$/.test(extension) ? extension : "audio";
  return `dialogue-input.${safeExtension}`;
};

const downloadMp4 = (mp4: Blob) => {
  const url = URL.createObjectURL(mp4);
  const link = document.createElement("a");
  link.href = url;
  link.download = "juan-salazar.mp4";
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
};

export const useVideoExport = ({
  targetRef,
  durationMs,
  audioFile,
  onPrepare,
  onStart,
}: UseVideoExportOptions) => {
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const exportVideo = useCallback(async () => {
    if (isExporting) return;

    setError("");
    setStatus("");

    const target = targetRef.current;
    if (!target) {
      setError("No se encontró el área del personaje para exportar.");
      return;
    }
    if (!audioFile || audioFile.size === 0) {
      setError("Importa un archivo de audio válido antes de exportar.");
      return;
    }
    if (!Number.isFinite(durationMs) || durationMs <= 0) {
      setError("El audio todavía no está listo para exportar.");
      return;
    }

    let saveHandlePromise: Promise<SaveFileHandle | null>;
    try {
      const pickerWindow = window as WindowWithSavePicker;
      saveHandlePromise = pickerWindow.showSaveFilePicker
        ? pickerWindow.showSaveFilePicker({
            suggestedName: "juan-salazar.mp4",
            types: [
              {
                description: "Video MP4",
                accept: { "video/mp4": [".mp4"] },
              },
            ],
          })
        : Promise.resolve(null);
    } catch (caughtError) {
      setStatus("");
      setError(getErrorMessage(caughtError));
      return;
    }

    setIsExporting(true);
    setProgress(0);
    setError("");
    setStatus("Selecciona dónde guardar el video.");

    let stream: MediaStream | null = null;
    let recorder: MediaRecorder | null = null;

    try {
      const saveHandle = await saveHandlePromise;
      let writable: SaveFileWritable | null = null;
      let saveError: unknown = null;
      if (saveHandle) {
        setStatus("Preparando el guardado en la ubicación elegida...");
        try {
          writable = await saveHandle.createWritable();
        } catch (caughtError) {
          saveError = caughtError;
          setStatus(
            "El navegador bloqueó esa ubicación; se descargará una copia al terminar.",
          );
        }
      }

      const frame = document.createElement("canvas");
      frame.width = VIDEO_WIDTH;
      frame.height = VIDEO_HEIGHT;

      const context = frame.getContext("2d");
      if (!context) throw new Error("No se pudo preparar el lienzo del video.");

      const drawPanel = async () => {
        const panel = await toCanvas(target, {
          canvasWidth: PANEL_WIDTH,
          canvasHeight: PANEL_HEIGHT,
          pixelRatio: 1,
          backgroundColor: "transparent",
        });

        context.clearRect(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
        context.drawImage(fondoImage, 0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
        context.drawImage(
          panel,
          0,
          (VIDEO_HEIGHT - PANEL_HEIGHT) / 2,
          PANEL_WIDTH,
          PANEL_HEIGHT,
        );
      };

      await drawPanel();
      const mimeType = [
        "video/webm;codecs=vp9",
        "video/webm;codecs=vp8",
        "video/webm",
      ].find((type) => MediaRecorder.isTypeSupported(type));
      if (!mimeType) {
        throw new Error("Este navegador no permite grabar el video temporal.");
      }

      stream = frame.captureStream(10);
      recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 5_000_000,
      });
      const chunks: BlobPart[] = [];
      const recording = new Promise<Blob>((resolve, reject) => {
        recorder?.addEventListener("dataavailable", (event: BlobEvent) => {
          if (event.data.size > 0) chunks.push(event.data);
        });
        recorder?.addEventListener(
          "error",
          (event: Event) => {
            reject(
              (event as ErrorEvent).error ??
                new Error("Falló la grabación del video."),
            );
          },
          { once: true },
        );
        recorder?.addEventListener(
          "stop",
          () => resolve(new Blob(chunks, { type: mimeType })),
          { once: true },
        );
      });

      await onPrepare();
      recorder.start(250);
      setStatus("Grabando y preparando el codificador MP4...");
      await onStart();

      const ffmpegLoadPromise = (async () => {
        let ffmpeg = ffmpegRef.current;
        if (ffmpeg) return { ffmpeg };

        ffmpeg = new FFmpeg();
        ffmpeg.on("progress", ({ progress: conversionProgress }) => {
          const boundedProgress = Number.isFinite(conversionProgress)
            ? Math.max(0, Math.min(1, conversionProgress))
            : 0;
          setProgress(65 + Math.round(boundedProgress * 30));
        });

        try {
          await ffmpeg.load({
            coreURL: ffmpegCoreUrl,
            wasmURL: ffmpegWasmUrl,
          });
          ffmpegRef.current = ffmpeg;
          return { ffmpeg };
        } catch (caughtError) {
          return { error: caughtError };
        }
      })();

      const endTime = Date.now() + durationMs + 500;
      while (Date.now() < endTime) {
        await drawPanel();
        const elapsed = durationMs - (endTime - Date.now());
        setProgress(
          Math.max(0, Math.min(60, Math.round((elapsed / durationMs) * 60))),
        );
        await wait(100);
      }

      if (recorder.state === "recording") recorder.stop();
      const webm = await recording;
      if (webm.size === 0) throw new Error("La grabación quedó vacía.");

      setProgress(65);
      setStatus("Finalizando la preparación del codificador MP4...");
      const ffmpegResult = await ffmpegLoadPromise;
      if ("error" in ffmpegResult) throw ffmpegResult.error;
      const { ffmpeg } = ffmpegResult;

      setStatus("Convirtiendo la grabación a MP4...");
      const audioInputName = getAudioInputName(audioFile);
      await ffmpeg.writeFile(
        "recording.webm",
        new Uint8Array(await webm.arrayBuffer()),
      );
      await ffmpeg.writeFile(
        audioInputName,
        new Uint8Array(await audioFile.arrayBuffer()),
      );
      const exitCode = await ffmpeg.exec([
        "-i",
        "recording.webm",
        "-i",
        audioInputName,
        "-map",
        "0:v:0",
        "-map",
        "1:a:0",
        "-c:v",
        "libx264",
        "-preset",
        "ultrafast",
        "-crf",
        "23",
        "-profile:v",
        "high",
        "-level:v",
        "3.1",
        "-tag:v",
        "avc1",
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "aac",
        "-b:a",
        "128k",
        "-ar",
        "48000",
        "-ac",
        "2",
        "-shortest",
        "-brand",
        "mp42",
        "-movflags",
        "+faststart",
        "-r",
        "10",
        "-f",
        "mp4",
        "video.mp4",
      ]);
      if (exitCode !== 0) throw new Error("FFmpeg no pudo codificar el archivo MP4.");

      const output = await ffmpeg.readFile("video.mp4");
      if (typeof output === "string" || output.byteLength < 12) {
        throw new Error("FFmpeg devolvió un archivo de video vacío o inválido.");
      }
      const mp4Buffer = new ArrayBuffer(output.byteLength);
      new Uint8Array(mp4Buffer).set(output);
      const mp4 = new Blob([mp4Buffer], { type: "video/mp4" });
      const mp4Bytes = new Uint8Array(await mp4.arrayBuffer());
      const fileType = String.fromCharCode(...mp4Bytes.subarray(4, 8));
      if (fileType !== "ftyp") {
        throw new Error("El archivo generado no tiene una cabecera MP4 válida.");
      }

      if (saveHandle && writable && !saveError) {
        setStatus(`Guardando en la ubicación elegida: ${saveHandle.name}...`);
        try {
          await writable.write(mp4Bytes);
          await writable.close();
        } catch (caughtError) {
          saveError = caughtError;
          try {
            await writable.abort();
          } catch (abortError) {
            saveError = new Error(
              `${getErrorMessage(caughtError)} No se pudo cancelar la escritura: ${getErrorMessage(abortError)}`,
            );
          }
        }
      }

      if (!saveHandle) {
        setStatus("Descargando en la carpeta predeterminada del navegador...");
        downloadMp4(mp4);
      } else if (saveError) {
        downloadMp4(mp4);
        setError(
          `No se pudo guardar en la ubicación elegida. Se inició una descarga en la carpeta del navegador. Detalle: ${getErrorMessage(saveError)}`,
        );
        setStatus("");
      } else {
        setStatus(`Video guardado en la ubicación elegida: ${saveHandle.name}`);
      }

      setProgress(100);
    } catch (caughtError) {
      if (caughtError instanceof DOMException && caughtError.name === "AbortError") {
        setStatus("");
        return;
      }
      setError(getErrorMessage(caughtError));
      setStatus("");
    } finally {
      if (recorder?.state === "recording") recorder.stop();
      stream?.getVideoTracks().forEach((track) => track.stop());
      setIsExporting(false);
    }
  }, [audioFile, durationMs, isExporting, onPrepare, onStart, targetRef]);

  return { exportVideo, isExporting, progress, error, status };
};
