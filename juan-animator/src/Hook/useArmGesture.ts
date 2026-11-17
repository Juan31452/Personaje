
import { useEffect, useState } from "react";

export interface ArmAngles {
  leftArmAngle: number;
  rightArmAngle: number;
  leftForearmAngle: number;
  rightForearmAngle: number;
}

const REST_POSITION: ArmAngles = {
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
  const [angles, setAngles] = useState<ArmAngles>(REST_POSITION);

  useEffect(() => {
    if (!isActive) {
      setAngles(REST_POSITION);
      return;
    }

    let animationFrame = 0;
    let startTime: number | null = null;

    const animate = (time: number) => {
      if (startTime === null) startTime = time;

      const elapsed = time - startTime;
      const phase = (elapsed / speed) * Math.PI * 2;

      // Oscilaciones suaves, sin saltos aleatorios.
      const leftArm = Math.sin(phase) * intensity * 0.45;
      const rightArm = sync
        ? leftArm
        : Math.sin(phase + 1.2) * intensity * 0.45;

      const leftForearm =
        Math.sin(phase + 0.8) * intensity * 0.65;

      const rightForearm = sync
        ? leftForearm
        : Math.sin(phase + 2) * intensity * 0.65;

      setAngles({
        leftArmAngle: leftArm,
        rightArmAngle: rightArm,
        leftForearmAngle: leftForearm,
        rightForearmAngle: rightForearm,
      });

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [isActive, intensity, speed, sync]);

  return angles;
};
