import { useState, useRef, useCallback, useEffect } from "react";

interface UseVoiceRecorderOptions {
  /** Duración máxima de grabación en ms (0 = sin límite) */
  maxDuration?: number;
  /** Formato de audio preferido */
  mimeType?: string;
}

export interface VoiceRecorderState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number; // en ms
  audioBlob: Blob | null;
  audioUrl: string | null;
  error: string;
}

const getSupportedMimeType = (preferred: string): string => {
  if (typeof MediaRecorder === "undefined") return "";
  const candidates = [
    preferred,
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/aac",
  ];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) ?? "";
};

export const useVoiceRecorder = ({
  maxDuration = 0,
  mimeType = "audio/webm;codecs=opus",
}: UseVoiceRecorderOptions = {}) => {
  const [state, setState] = useState<VoiceRecorderState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    audioBlob: null,
    audioUrl: null,
    error: "",
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const pauseStartRef = useRef<number>(0);
  const totalPausedTimeRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);
  const maxDurationTimerRef = useRef<number | null>(null);

  // Limpieza al desmontar el componente para evitar fugas de memoria y micrófono abierto
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (timerRef.current) clearInterval(timerRef.current);
      if (maxDurationTimerRef.current) clearTimeout(maxDurationTimerRef.current);
    };
  }, []);

  // Revocar URL anterior si cambia
  useEffect(() => {
    return () => {
      if (state.audioUrl) URL.revokeObjectURL(state.audioUrl);
    };
  }, [state.audioUrl]);

  const updateDuration = useCallback(() => {
    const now = Date.now();
    const elapsed = now - startTimeRef.current - totalPausedTimeRef.current;
    setState((prev) => ({ ...prev, duration: Math.max(0, elapsed) }));
  }, []);

  const stopRecording = useCallback(() => {
    // Se permite detener tanto si está 'recording' como 'paused'
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (maxDurationTimerRef.current) {
      clearTimeout(maxDurationTimerRef.current);
      maxDurationTimerRef.current = null;
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, error: "" }));

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });
      streamRef.current = stream;

      const selectedMimeType = getSupportedMimeType(mimeType);
      const options: MediaRecorderOptions = { audioBitsPerSecond: 128000 };
      if (selectedMimeType) options.mimeType = selectedMimeType;

      const mediaRecorder = new MediaRecorder(stream, options);

      chunksRef.current = [];
      startTimeRef.current = Date.now();
      totalPausedTimeRef.current = 0;
      pauseStartRef.current = 0;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const finalType = selectedMimeType || chunksRef.current[0]?.type || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: finalType });
        const url = URL.createObjectURL(blob);

        setState((prev) => ({
          ...prev,
          isRecording: false,
          isPaused: false,
          audioBlob: blob,
          audioUrl: url,
        }));

        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      };

      mediaRecorder.onerror = (event) => {
        setState((prev) => ({
          ...prev,
          isRecording: false,
          error: `Error en grabación: ${(event as ErrorEvent).error?.message || "Desconocido"}`,
        }));
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      };

      mediaRecorder.start(100);
      mediaRecorderRef.current = mediaRecorder;

      setState((prev) => ({
        ...prev,
        isRecording: true,
        isPaused: false,
        duration: 0,
        audioBlob: null,
        audioUrl: null,
      }));

      timerRef.current = window.setInterval(updateDuration, 100);

      if (maxDuration > 0) {
        maxDurationTimerRef.current = window.setTimeout(() => {
          stopRecording();
        }, maxDuration);
      }
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : "No se pudo acceder al micrófono",
      }));
    }
  }, [mimeType, maxDuration, updateDuration, stopRecording]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.pause();
      pauseStartRef.current = Date.now();
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setState((prev) => ({ ...prev, isPaused: true }));
    }
  }, []);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "paused") {
      mediaRecorderRef.current.resume();
      if (pauseStartRef.current > 0) {
        totalPausedTimeRef.current += Date.now() - pauseStartRef.current;
        pauseStartRef.current = 0;
      }
      timerRef.current = window.setInterval(updateDuration, 100);
      setState((prev) => ({ ...prev, isPaused: false }));
    }
  }, [updateDuration]);

  const resetRecording = useCallback(() => {
    if (state.audioUrl) {
      URL.revokeObjectURL(state.audioUrl);
    }
    setState({
      isRecording: false,
      isPaused: false,
      duration: 0,
      audioBlob: null,
      audioUrl: null,
      error: "",
    });
  }, [state.audioUrl]);

  return {
    ...state,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
  };
};
