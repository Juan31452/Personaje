import { useState, useCallback, useRef, useEffect } from "react";

interface UseTextToSpeechOptions {
  /** Velocidad de habla (0.5 a 2) */
  rate?: number;
  /** Tono de voz (0 a 2) */
  pitch?: number;
  /** Volumen (0 a 1) */
  volume?: number;
  /** Nombre de la voz (ej: "Google Español") */
  voiceName?: string;
}

export interface TextToSpeechState {
  isSpeaking: boolean;
  isPaused: boolean;
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  progress: number;
  error: string;
}

export const useTextToSpeech = ({
  rate = 1,
  pitch = 1,
  volume = 1,
  voiceName,
}: UseTextToSpeechOptions = {}) => {
  const [state, setState] = useState<TextToSpeechState>({
    isSpeaking: false,
    isPaused: false,
    voices: [],
    selectedVoice: null,
    progress: 0,
    error: "",
  });

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const startTimeRef = useRef<number>(0);
  const durationRef = useRef<number>(0);
  const progressIntervalRef = useRef<number | null>(null);

  const clearProgressInterval = useCallback(() => {
    if (progressIntervalRef.current !== null) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  // Cargar voces disponibles
  const loadVoices = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setState((prev) => ({
        ...prev,
        error: "Tu navegador no soporta síntesis de voz (SpeechSynthesis).",
      }));
      return;
    }

    const availableVoices = window.speechSynthesis.getVoices();
    if (availableVoices.length === 0) return;

    const spanishVoices = availableVoices.filter((v) =>
      v.lang.startsWith("es")
    );
    const defaultVoice =
      spanishVoices.find((v) => v.name.includes("Google") || v.default) ||
      spanishVoices[0] ||
      availableVoices[0] ||
      null;

    const selected = voiceName
      ? availableVoices.find((v) => v.name === voiceName) || defaultVoice
      : defaultVoice;

    setState((prev) => ({
      ...prev,
      voices: spanishVoices.length > 0 ? spanishVoices : availableVoices,
      selectedVoice: selected,
      error: "",
    }));
  }, [voiceName]);

  // Cargar voces al montar y escuchar cambios
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.cancel();
      window.speechSynthesis.onvoiceschanged = null;
      clearProgressInterval();
    };
  }, [loadVoices, clearProgressInterval]);

  const speak = useCallback(
    (text: string) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        setState((prev) => ({
          ...prev,
          error: "SpeechSynthesis no soportado en este navegador.",
        }));
        return;
      }

      if (!text.trim()) {
        setState((prev) => ({ ...prev, error: "El texto está vacío." }));
        return;
      }

      clearProgressInterval();
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;

      if (state.selectedVoice) {
        utterance.voice = state.selectedVoice;
      }

      utterance.onstart = () => {
        startTimeRef.current = Date.now();
        const words = text.split(/\s+/).filter(Boolean).length;
        // Estimación de duración (aprox 150 palabras/min)
        durationRef.current = Math.max(
          1000,
          ((words / 150) * 60 * 1000) / rate
        );

        setState((prev) => ({
          ...prev,
          isSpeaking: true,
          isPaused: false,
          progress: 0,
          error: "",
        }));

        progressIntervalRef.current = window.setInterval(() => {
          const elapsed = Date.now() - startTimeRef.current;
          const progress = Math.min((elapsed / durationRef.current) * 100, 99);
          setState((prev) => ({ ...prev, progress }));
        }, 100);
      };

      utterance.onend = () => {
        clearProgressInterval();
        setState((prev) => ({
          ...prev,
          isSpeaking: false,
          isPaused: false,
          progress: 100,
        }));
      };

      utterance.onerror = (event) => {
        clearProgressInterval();
        setState((prev) => ({
          ...prev,
          isSpeaking: false,
          isPaused: false,
          error: `Error al reproducir voz: ${event.error}`,
        }));
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [rate, pitch, volume, state.selectedVoice, clearProgressInterval]
  );

  const pause = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.pause();
      setState((prev) => ({ ...prev, isPaused: true }));
    }
  }, []);

  const resume = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.resume();
      setState((prev) => ({ ...prev, isPaused: false }));
    }
  }, []);

  const stop = useCallback(() => {
    clearProgressInterval();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setState((prev) => ({
      ...prev,
      isSpeaking: false,
      isPaused: false,
      progress: 0,
    }));
  }, [clearProgressInterval]);

  const selectVoice = useCallback((voice: SpeechSynthesisVoice) => {
    setState((prev) => ({ ...prev, selectedVoice: voice }));
  }, []);

  return {
    ...state,
    speak,
    pause,
    resume,
    stop,
    selectVoice,
    loadVoices,
  };
};
