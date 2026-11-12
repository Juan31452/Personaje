import { useEffect, useState } from "react";

/**
 * Hook que simula parpadeo natural.
 * @param intervalMin - Intervalo mínimo entre parpadeos (ms)
 * @param intervalMax - Intervalo máximo entre parpadeos (ms)
 * @param duration - Duración del parpadeo (ms)
 */
export const useBlink = (
  intervalMin = 3000,
  intervalMax = 5000,
  duration = 150
) => {
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    let blinkTimeout: ReturnType<typeof setTimeout> | undefined;
    let closeTimeout: ReturnType<typeof setTimeout> | undefined;

    const scheduleNextBlink = () => {
      // Tiempo aleatorio entre min y max para que se vea natural
      const nextBlink = Math.random() * (intervalMax - intervalMin) + intervalMin;

      blinkTimeout = setTimeout(() => {
        setIsBlinking(true);

        // Cierra los ojos por `duration` ms
        closeTimeout = setTimeout(() => {
          setIsBlinking(false);
          // Programa el siguiente parpadeo
          scheduleNextBlink();
        }, duration);
      }, nextBlink);
    };

    scheduleNextBlink();

    return () => {
      if (blinkTimeout) clearTimeout(blinkTimeout);
      if (closeTimeout) clearTimeout(closeTimeout);
    };
  }, [intervalMin, intervalMax, duration]);

  return isBlinking;
};