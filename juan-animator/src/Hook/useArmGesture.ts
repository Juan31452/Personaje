import { useEffect, useState } from "react";

export interface ArmAngles {
  leftArmAngle: number;
  rightArmAngle: number;
  leftForearmAngle: number;
  rightForearmAngle: number;
}

export const useArmGesture = (
  isActive = false,
  intensity = 8,
  speed = 1500,
  sync = false
) => {
  const [angles, setAngles] = useState<ArmAngles>({
    leftArmAngle: 0,
    rightArmAngle: 0,
    leftForearmAngle: 0,
    rightForearmAngle: 0,
  });

  useEffect(() => {
    if (!isActive) {
      setAngles({
        leftArmAngle: 0,
        rightArmAngle: 0,
        leftForearmAngle: 0,
        rightForearmAngle: 0,
      });
      return;
    }

    const gestureInterval = setInterval(() => {
      const leftArm = Math.random() * intensity * 2 - intensity;
      const rightArm = sync ? leftArm : Math.random() * intensity * 2 - intensity;
      
      // Los codos se doblan más que los hombros (gestos naturales)
      const leftForearm = Math.random() * (intensity * 2) - intensity;
      const rightForearm = sync ? leftForearm : Math.random() * (intensity * 2) - intensity;

      setAngles({
        leftArmAngle: leftArm,
        rightArmAngle: rightArm,
        leftForearmAngle: leftForearm,
        rightForearmAngle: rightForearm,
      });
    }, speed);

    return () => clearInterval(gestureInterval);
  }, [isActive, intensity, speed, sync]);

  return angles;
};