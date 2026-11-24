import { useCallback, useRef, useState, type RefObject } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import ffmpegCoreUrl from "@ffmpeg/core?url";
import ffmpegWasmUrl from "@ffmpeg/core/wasm?url";
import fondo from "../assets/fondo.jpg";
import { obtenerProgresoDialogo } from "../components/Dialogo";

const VIDEO_WIDTH = 720;
const VIDEO_HEIGHT = 1280;
const PANEL_HEIGHT = 1080;
const PANEL_TOP = (VIDEO_HEIGHT - PANEL_HEIGHT) / 2;
const TARGET_FPS = 24; // ⬅️ reducido de 30 a 24, suficiente para animación
const FRAME_INTERVAL = 1000 / TARGET_FPS;

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
  audioRef: RefObject<HTMLAudioElement | null>;
  dialogos: string[];
  durationMs: number;
  audioFile: File | null;
  backgroundImageUrl: string;
  onPrepare: () => void | Promise<void>;
  onPreparePlayback: () => void | Promise<void>;
  onStart: () => void | Promise<void>;
}

const wait = (ms: number) =>
  new Promise<void>((resolve) => window.setTimeout(resolve, ms));
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "No se pudo exportar el video.";

const getAudioInputName = (file: File) => {
  const ext = file.name.split(".").pop()?.toLowerCase();
  const safe = ext && /^[a-z0-9]{1,8}$/.test(ext) ? ext : "audio";
  return `dialogue-input.${safe}`;
};

const downloadMp4 = (mp4: Blob) => {
  const url = URL.createObjectURL(mp4);
  const link = document.createElement("a");
  link.href = url;
  link.download = "juan-salazar.mp4";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
};

export const useVideoExport = ({
  targetRef, audioRef, dialogos, durationMs, audioFile,
  backgroundImageUrl,
  onPrepare, onPreparePlayback, onStart,
}: UseVideoExportOptions) => {
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const observerRef = useRef<MutationObserver | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const exportVideo = useCallback(async () => {
    if (isExporting) return;
    setError(""); setStatus("");

    const target = targetRef.current;
    const audio = audioRef.current;
    if (!target) { setError("No se encontró el área del personaje."); return; }
    if (!audioFile || audioFile.size === 0) { setError("Importa un audio válido."); return; }
    if (!Number.isFinite(durationMs) || durationMs <= 0) { setError("Audio no listo."); return; }
    if (!audio) { setError("No se encontró el reproductor de audio."); return; }

    const totalSeconds = Math.ceil(durationMs / 1000);

    let saveHandlePromise: Promise<SaveFileHandle | null>;
    try {
      const pickerWindow = window as WindowWithSavePicker;
      saveHandlePromise = pickerWindow.showSaveFilePicker
        ? pickerWindow.showSaveFilePicker({
            suggestedName: "juan-salazar.mp4",
            types: [{ description: "Video MP4", accept: { "video/mp4": [".mp4"] } }],
          })
        : Promise.resolve(null);
    } catch (e) { setError(getErrorMessage(e)); return; }

    setIsExporting(true);
    setProgress(0);
    setStatus("Selecciona dónde guardar el video.");

    let stream: MediaStream | null = null;
    let recorder: MediaRecorder | null = null;
    try {
      const saveHandle = await saveHandlePromise;
      setStatus("Preparando los elementos del video...");
      await fondoImage.decode();

      const exportBackgroundImage =
        backgroundImageUrl && backgroundImageUrl !== fondo
          ? new Image()
          : fondoImage;
      if (backgroundImageUrl && backgroundImageUrl !== fondo) {
        exportBackgroundImage.src = backgroundImageUrl;
        await exportBackgroundImage.decode();
      }

      let writable: SaveFileWritable | null = null;
      let saveError: unknown = null;
      if (saveHandle) {
        try { writable = await saveHandle.createWritable(); }
        catch (e) { saveError = e; setStatus("Ubicación bloqueada, se descargará al terminar."); }
      }

      const frame = document.createElement("canvas");
      frame.width = VIDEO_WIDTH;
      frame.height = VIDEO_HEIGHT;
      const context = frame.getContext("2d", { alpha: false });
      if (!context) throw new Error("No se pudo preparar el lienzo.");

      const targetBounds = target.getBoundingClientRect();
      const scale = VIDEO_WIDTH / targetBounds.width;

      const character = target.querySelector("svg");
      if (!character) throw new Error("No se encontró el SVG.");

      const characterCache: {
        image: HTMLImageElement | null;
        dirty: boolean;
      } = { image: null, dirty: true };

      const renderCharacterToImage = async () => {
        const characterCopy = character.cloneNode(true) as SVGSVGElement;
        characterCopy.setAttribute("width", "600");
        characterCopy.setAttribute("height", "900");
        characterCopy.querySelectorAll("image").forEach((image) => image.remove());
        const svgUrl = URL.createObjectURL(
          new Blob([new XMLSerializer().serializeToString(characterCopy)], {
            type: "image/svg+xml;charset=utf-8",
          }),
        );
        const img = new Image();
        img.src = svgUrl;
        try {
          await img.decode();
        } finally {
          URL.revokeObjectURL(svgUrl);
        }
        characterCache.image = img;
        characterCache.dirty = false;
      };

      const observer = new MutationObserver(() => {
        characterCache.dirty = true;
      });
      observerRef.current = observer;
      observer.observe(character, { subtree: true, attributes: true, childList: true });

      const drawPanel = async () => {
        if (characterCache.dirty || !characterCache.image) {
          await renderCharacterToImage();
        }

        context.drawImage(exportBackgroundImage, 0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
        const characterImage = characterCache.image;
        if (characterImage) {
          context.drawImage(characterImage, 0, PANEL_TOP, VIDEO_WIDTH, PANEL_HEIGHT);
        }

        const dialogRoot = target.firstElementChild;
        const bubble = dialogRoot instanceof HTMLDivElement ? dialogRoot.firstElementChild : null;
        if (!(bubble instanceof HTMLDivElement)) return;

        const bubbleBounds = bubble.getBoundingClientRect();
        const x = (bubbleBounds.left - targetBounds.left) * scale;
        const y = (bubbleBounds.top - targetBounds.top) * scale + PANEL_TOP;
        const width = bubbleBounds.width * scale;
        const height = bubbleBounds.height * scale;

        const bubbleStyle = window.getComputedStyle(bubble);
        const borderRadius = Number.parseFloat(bubbleStyle.borderRadius) * scale;

        context.fillStyle = bubbleStyle.backgroundColor;
        context.strokeStyle = bubbleStyle.borderColor;
        context.lineWidth = Number.parseFloat(bubbleStyle.borderWidth) * scale;
        context.shadowColor = "rgba(0, 0, 0, 0.18)";
        context.shadowBlur = 24 * scale;
        context.shadowOffsetY = 8 * scale;
        context.beginPath();
        context.roundRect(x, y, width, height, borderRadius);
        context.fill();
        context.stroke();
        context.shadowColor = "transparent";
        context.shadowBlur = 0;
        context.shadowOffsetY = 0;

        context.beginPath();
        context.moveTo(x + width / 2 - 15 * scale, y + height - 1);
        context.lineTo(x + width / 2 + 15 * scale, y + height - 1);
        context.lineTo(x + width / 2, y + height + 14 * scale);
        context.closePath();
        context.fillStyle = bubbleStyle.backgroundColor;
        context.fill();

        const expectedProgress = obtenerProgresoDialogo(
          dialogos, audio.currentTime * 1000, durationMs,
        );
        const currentDialog = dialogos[expectedProgress.dialogoIndex]?.trim() ?? "";
        const words = currentDialog.split(/\s+/);

        const lineHeight = Number.parseFloat(bubbleStyle.lineHeight) * scale;
        const fontSize = Number.parseFloat(bubbleStyle.fontSize) * scale;
        const padding = Number.parseFloat(bubbleStyle.paddingLeft) * scale;

        context.textBaseline = "alphabetic";
        context.font = `600 ${fontSize}px ${bubbleStyle.fontFamily}`;

        const maxWidth = width - padding * 2;
        const lines: { word: string; x: number; y: number; active: boolean }[] = [];
        let currentLine: string[] = [];
        let currentLineWidth = 0;
        let lineY = y + padding + fontSize;
        let wordIdx = 0;

        const measureWord = (w: string) => {
          context.font = `600 ${fontSize}px ${bubbleStyle.fontFamily}`;
          return context.measureText(w).width;
        };

        for (const word of words) {
          const wordWidth = measureWord(word + " ");
          if (currentLineWidth + wordWidth > maxWidth && currentLine.length > 0) {
            let lineX = x + padding;
            for (const w of currentLine) {
              lines.push({
                word: w, x: lineX, y: lineY,
                active: wordIdx === expectedProgress.palabraIndex,
              });
              lineX += measureWord(w + " ");
              wordIdx++;
            }
            currentLine = [word];
            currentLineWidth = wordWidth;
            lineY += lineHeight;
          } else {
            currentLine.push(word);
            currentLineWidth += wordWidth;
          }
        }
        let lineX = x + padding;
        for (const w of currentLine) {
          lines.push({
            word: w, x: lineX, y: lineY,
            active: wordIdx === expectedProgress.palabraIndex,
          });
          lineX += measureWord(w + " ");
          wordIdx++;
        }

        for (const line of lines) {
          context.font = `${line.active ? 800 : 600} ${fontSize}px ${bubbleStyle.fontFamily}`;
          context.fillStyle = line.active ? "#c2410c" : "#2C3E50";
          context.fillText(line.word, line.x, line.y);
        }
      };

      const mimeType = [
        "video/mp4",
        "video/webm;codecs=vp9",
        "video/webm;codecs=vp8",
        "video/webm",
      ].find((type) => MediaRecorder.isTypeSupported(type));
      if (!mimeType) throw new Error("Navegador no permite grabar video.");
      const recordingFileName = `recording.${mimeType.startsWith("video/mp4") ? "mp4" : "webm"}`;
      const copyVideo = recordingFileName.endsWith(".mp4");

      await onPrepare();
      await onPreparePlayback();
      await new Promise<void>((resolve) =>
        window.requestAnimationFrame(() => resolve()),
      );

      await drawPanel();
      stream = frame.captureStream(TARGET_FPS);
      const videoTrack = stream.getVideoTracks()[0];
      if (!videoTrack) throw new Error("No se pudo iniciar la captura.");

      recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 4_000_000,
      });

      const chunks: BlobPart[] = [];
      const recording = new Promise<Blob>((resolve, reject) => {
        recorder?.addEventListener("dataavailable", (event) => {
          if (event.data.size > 0) chunks.push(event.data);
        });
        recorder?.addEventListener(
          "error",
          (event) => {
            reject(
              (event as ErrorEvent).error ?? new Error("Grabación falló."),
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

      recorder.start(500);
      setStatus("Grabando video y sincronizando el audio...");
      await onStart();

      const frameClock = { lastFrameTime: performance.now() };
      await new Promise<void>((resolve, reject) => {
        const loop = async (now: number) => {
          if (audio.ended || audio.currentTime * 1000 >= durationMs) {
            resolve();
            return;
          }
          if (now - frameClock.lastFrameTime >= FRAME_INTERVAL) {
            frameClock.lastFrameTime = now;
            try {
              await drawPanel();
              const elapsed = Math.min(audio.currentTime * 1000, durationMs);
              setProgress(Math.round(clamp(elapsed / durationMs, 0, 1) * 60));
            } catch (caughtError) {
              reject(caughtError);
              return;
            }
          }
          window.requestAnimationFrame(loop);
        };
        window.requestAnimationFrame(loop);
      });

      // Ensure mouth animation stops before capturing the final frame
      audio.pause();
      // tiny delay to let the mouthState reset via useAudioMouth's pause handler
      await new Promise((resolve) => setTimeout(resolve, 50));
      await drawPanel();
      await wait(550);
      observer.disconnect();
      observerRef.current = null;

      if (recorder.state === "recording") recorder.stop();
      const recordingBlob = await recording;
      if (recordingBlob.size === 0) throw new Error("Grabación vacía.");

      setProgress(65);
      setStatus("Preparando codificador MP4...");
      let ffmpeg = ffmpegRef.current;
      if (!ffmpeg) {
        ffmpeg = new FFmpeg();
        ffmpeg.on("progress", ({ progress: cp, time }) => {
          const pFromTime = time / (durationMs * 1000);
          const bounded = clamp([pFromTime, cp].find(Number.isFinite) ?? 0, 0, 1);
          const secs = Math.min(Math.floor(time / 1_000_000), totalSeconds);
          setStatus(`Convirtiendo a MP4: ${secs} / ${totalSeconds} s...`);
          setProgress(65 + Math.round(bounded * 30));
        });
        await ffmpeg.load({ coreURL: ffmpegCoreUrl, wasmURL: ffmpegWasmUrl });
        ffmpegRef.current = ffmpeg;
      }

      setStatus("Convirtiendo a MP4...");
      const audioInputName = getAudioInputName(audioFile);
      await ffmpeg.writeFile(
        recordingFileName,
        new Uint8Array(await recordingBlob.arrayBuffer()),
      );
      await ffmpeg.writeFile(audioInputName, new Uint8Array(await audioFile.arrayBuffer()));

      const videoCodecArgs = copyVideo
        ? ["-c:v", "copy", "-tag:v", "avc1"]
        : [
            "-c:v",
            "libx264",
            "-preset",
            "ultrafast",
            "-crf",
            "24",
            "-profile:v",
            "high",
            "-level:v",
            "3.1",
            "-tag:v",
            "avc1",
            "-pix_fmt",
            "yuv420p",
          ];
      const exitCode = await ffmpeg.exec([
        "-i", recordingFileName,
        "-i", audioInputName,
        "-map", "0:v:0", "-map", "1:a:0",
        ...videoCodecArgs,
        "-c:a", "aac", "-b:a", "128k", "-ar", "48000", "-ac", "2",
        "-t", (durationMs / 1000).toFixed(3),
        "-brand", "mp42", "-movflags", "+faststart",
        "-f", "mp4", "video.mp4",
      ], Math.max(120_000, durationMs * 3));

      if (exitCode !== 0) {
        throw new Error(`FFmpeg falló (código ${exitCode}).`);
      }

      const output = await ffmpeg.readFile("video.mp4");
      if (typeof output === "string" || output.byteLength < 12) {
        throw new Error("FFmpeg devolvió archivo vacío.");
      }
      const mp4Buffer = new ArrayBuffer(output.byteLength);
      new Uint8Array(mp4Buffer).set(output);
      const mp4 = new Blob([mp4Buffer], { type: "video/mp4" });
      const mp4Bytes = new Uint8Array(await mp4.arrayBuffer());

      if (saveHandle && writable && !saveError) {
        setStatus(`Guardando en ${saveHandle.name}...`);
        try { await writable.write(mp4Bytes); await writable.close(); }
        catch (caughtError) {
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
      if (!saveHandle) { setStatus("Descargando..."); downloadMp4(mp4); }
      else if (saveError) {
        downloadMp4(mp4);
        setError(`No se pudo guardar en la ubicación elegida. Detalle: ${getErrorMessage(saveError)}`);
      } else {
        setStatus(`Video guardado en ${saveHandle.name}`);
      }
      setProgress(100);
    } catch (caughtError) {
      if (caughtError instanceof DOMException && caughtError.name === "AbortError") {
        setStatus(""); return;
      }
      setError(getErrorMessage(caughtError));
      setStatus("");
    } finally {
      observerRef.current?.disconnect();
      observerRef.current = null;
      if (recorder?.state === "recording") recorder.stop();
      stream?.getVideoTracks().forEach((track) => track.stop());
      setIsExporting(false);
    }
  }, [
    audioFile,
    audioRef,
    backgroundImageUrl,
    dialogos,
    durationMs,
    isExporting,
    onPrepare,
    onPreparePlayback,
    onStart,
    targetRef,
  ]);

  return { exportVideo, isExporting, progress, error, status };
};