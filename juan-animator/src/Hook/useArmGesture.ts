
import { useEffect, useState } from "react";

export interface ArmAngles {
  leftArmAngle: number;
  rightArmAngle: number;
  leftForearmAngle: number;
  rightForearmAngle: number;
}

const INITIAL_ANGLES: ArmAngles = {
  leftArmAngle: 0,
  rightArmAngle: 0,
  leftForearmAngle: 0,
  rightForearmAngle: 0,
};

export const useArmGesture = (
  isActive = false,
  intensity = 3,
  speed = 5000,
  sync = false
) => {
  const [angles, setAngles] = useState<ArmAngles>(INITIAL_ANGLES);

  useEffect(() => {
    if (!isActive) {
      setAngles(INITIAL_ANGLES);
      return;
    }

    let animationId = 0;
    let lastUpdate = 0;

    const animate = (timestamp: number) => {
      if (timestamp - lastUpdate >= 33) {
        lastUpdate = timestamp;

        const phase = (timestamp / speed) * Math.PI * 2;

        setAngles({
          leftArmAngle:
            Math.sin(phase) * intensity * 0.45,

          rightArmAngle: sync
            ? Math.sin(phase) * intensity * 0.45
            : Math.sin(phase + 1.5) * intensity * 0.45,

          leftForearmAngle:
            Math.sin(phase + 0.7) * intensity * 0.65,

          rightForearmAngle: sync
            ? Math.sin(phase + 0.7) * intensity * 0.65
            : Math.sin(phase + 1.8) * intensity * 0.65,
        });
      }

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, [isActive, intensity, speed, sync]);

  return angles;
};
