import { useCallback, useRef, useState, type RefObject } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toCanvas } from "html-to-image";
import ffmpegCoreUrl from "@ffmpeg/core?url";
import ffmpegWasmUrl from "@ffmpeg/core/wasm?url";

const VIDEO_WIDTH = 720;
const VIDEO_HEIGHT = 1280;
const PANEL_WIDTH = 720;
const PANEL_HEIGHT = 1080;

interface SaveFileHandle {
  createWritable: () => Promise<{
    write: (data: Uint8Array) => Promise<void>;
    close: () => Promise<void>;
  }>;
  getFile: () => Promise<File>;
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
  onStart: () => void;
}

const wait = (milliseconds: number) =>
  new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds));

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "No se pudo exportar el video.";

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
  onStart,
}: UseVideoExportOptions) => {
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const exportVideo = useCallback(async () => {
    if (isExporting) return;

    const target = targetRef.current;
    if (!target) {
      setError("No se encontró el área del personaje para exportar.");
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

      let ffmpeg = ffmpegRef.current;
      if (!ffmpeg) {
        setStatus("Cargando el codificador MP4...");
        ffmpeg = new FFmpeg();
        ffmpeg.on("progress", ({ progress: conversionProgress }) => {
          const boundedProgress = Number.isFinite(conversionProgress)
            ? Math.max(0, Math.min(1, conversionProgress))
            : 0;
          setProgress(65 + Math.round(boundedProgress * 30));
        });
        await ffmpeg.load({
          coreURL: ffmpegCoreUrl,
          wasmURL: ffmpegWasmUrl,
        });
        ffmpegRef.current = ffmpeg;
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
          backgroundColor: "#EAF2F8",
        });
        context.fillStyle = "#EAF2F8";
        context.fillRect(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
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

      stream = frame.captureStream(6);
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

      recorder.start(250);
      setStatus("Grabando el diálogo...");
      onStart();

      const endTime = Date.now() + durationMs;
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
      setStatus("Convirtiendo la grabación a MP4...");
      await ffmpeg.writeFile("recording.webm", new Uint8Array(await webm.arrayBuffer()));
      const exitCode = await ffmpeg.exec([
        "-i",
        "recording.webm",
        "-f",
        "lavfi",
        "-i",
        "anullsrc=channel_layout=stereo:sample_rate=48000",
        "-map",
        "0:v:0",
        "-map",
        "1:a:0",
        "-c:v",
        "libx264",
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
        "24",
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

      let saveError: unknown;
      if (saveHandle) {
        setStatus("Guardando el MP4...");
        try {
          const writable = await saveHandle.createWritable();
          await writable.write(mp4Bytes);
          await writable.close();
          const savedFile = await saveHandle.getFile();
          if (savedFile.size !== mp4.size) {
            throw new Error(
              `El archivo guardado quedó incompleto (${savedFile.size} de ${mp4.size} bytes).`,
            );
          }
        } catch (caughtError) {
          saveError = caughtError;
        }
      }

      if (!saveHandle || saveError) {
        setStatus("No se pudo guardar en la ubicación elegida; iniciando descarga...");
        downloadMp4(mp4);
      }

      setProgress(100);
      if (saveError) {
        setError(
          `No se pudo guardar en la ubicación elegida. Se inició la descarga del MP4. Detalle: ${getErrorMessage(saveError)}`,
        );
        setStatus("");
      } else {
        setStatus("Video exportado correctamente.");
      }
    } catch (caughtError) {
      if (caughtError instanceof DOMException && caughtError.name === "AbortError") {
        setStatus("");
        return;
      }
      setError(getErrorMessage(caughtError));
      setStatus("");
    } finally {
      if (recorder?.state === "recording") recorder.stop();
      stream?.getTracks().forEach((track) => track.stop());
      setIsExporting(false);
    }
  }, [durationMs, isExporting, onStart, targetRef]);

  return { exportVideo, isExporting, progress, error, status };
};
