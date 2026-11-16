import { useState, useEffect } from "react";

export interface ArmAngles {
  leftArmAngle: number;
  rightArmAngle: number;
}

/**
 * Hook que simula gestos naturales de los brazos al hablar.
 * @param isActive - Si la animación está activa
 * @param intensity - Intensidad del movimiento (0-10 grados)
 * @param speed - Velocidad de cambio (ms)
 * @param sync - Si los brazos se mueven sincronizados
 */
export const useArmGesture = (
  isActive = false,
  intensity = 8,
  speed = 1500,
  sync = false
) => {
  const [angles, setAngles] = useState<ArmAngles>({
    leftArmAngle: 0,
    rightArmAngle: 0,
  });

  useEffect(() => {
    if (!isActive) {
      setAngles({ leftArmAngle: 0, rightArmAngle: 0 });
      return;
    }

    const gestureInterval = setInterval(() => {
      // Ángulo aleatorio para el brazo izquierdo
      const leftAngle = Math.random() * intensity * 2 - intensity;
      
      // Brazo derecho: sincronizado o independiente
      const rightAngle = sync ? leftAngle : Math.random() * intensity * 2 - intensity;

      setAngles({
        leftArmAngle: leftAngle,
        rightArmAngle: rightAngle,
      });
    }, speed);

    return () => clearInterval(gestureInterval);
  }, [isActive, intensity, speed, sync]);

  return angles;
};