import { useState, useEffect } from "react";

/**
 * Hook que simula el movimiento de la boca al hablar.
 * @param isTalking - Si el personaje está hablando
 * @param speed - Velocidad de cambio entre formas (ms)
 */
export const useTalking = (isTalking: boolean, speed = 200) => {
  const [mouthState, setMouthState] = useState(0);

  useEffect(() => {
    if (!isTalking) {
      setMouthState(0); // Boca cerrada cuando no habla
      return;
    }

    const interval = setInterval(() => {
      // 4 estados diferentes para simular fonemas variados
      setMouthState((prev) => (prev + 1) % 4);
    }, speed);

    return () => clearInterval(interval);
  }, [isTalking, speed]);

  return mouthState;
};