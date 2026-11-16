import { useState, useEffect } from "react";

// #sym:useHeadTilt
/**
 * Hook que simula inclinación natural de la cabeza.
 * @param isActive - Si la animación está activa
 * @param minTilt - Inclinación mínima (grados)
 * @param maxTilt - Inclinación máxima (grados)
 * @param interval - Frecuencia de cambio (ms)
 */
export const useHeadTilt = (
  isActive = true,
  minTilt = -5,
  maxTilt = 5,
  interval = 4000
) => {
  const [tilt, setTilt] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setTilt(0);
      return;
    }

    const tiltInterval = setInterval(() => {
      // Genera un ángulo aleatorio entre minTilt y maxTilt
      const randomTilt = Math.random() * (maxTilt - minTilt) + minTilt;
      setTilt(randomTilt);
    }, interval);

    return () => clearInterval(tiltInterval);
  }, [isActive, minTilt, maxTilt, interval]);

  return tilt;
};