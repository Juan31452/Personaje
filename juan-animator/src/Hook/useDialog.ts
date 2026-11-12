import { useState, useEffect, useRef } from "react";

/**
 * Hook que sincroniza el movimiento de la boca con un diálogo.
 * Recorre las sílabas del diálogo y vuelve al reposo al terminar.
 */
export const useDialog = (dialog: string, speed = 180) => {
  const [mouthState, setMouthState] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getMouthStateForVowel = (vowel: string): number => {
    if (vowel === "a") return 2;
    if (vowel === "e" || vowel === "i") return 1;
    if (vowel === "o" || vowel === "u") return 3;
    return 0;
  };

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    const normalizedDialog = dialog
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();

    if (!normalizedDialog) {
      setMouthState(0);
      setIsSpeaking(false);
      return;
    }

    const syllableStates = Array.from(normalizedDialog.matchAll(/[aeiou]+/g)).flatMap(
      ([vowels]) => [getMouthStateForVowel(vowels[0]), 0]
    );

    if (syllableStates.length === 0) {
      setMouthState(0);
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    setMouthState(syllableStates[0]);
    let currentIndex = 1;

    intervalRef.current = setInterval(() => {
      if (currentIndex >= syllableStates.length) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setMouthState(0);
        setIsSpeaking(false);
        return;
      }

      setMouthState(syllableStates[currentIndex]);
      currentIndex += 1;
    }, speed);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [dialog, speed]);

  const hasDialog = dialog.trim().length > 0;
  return {
    mouthState: hasDialog ? mouthState : 0,
    isSpeaking: hasDialog && isSpeaking,
  };
};