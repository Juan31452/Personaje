import { useEffect, useState } from "react";
import {
  HEAD_MOVEMENTS,
  type HeadMovementName,
} from "../extras/headMovements";

interface HeadMovementFrame {
  rotation: number;
  verticalOffset: number;
}

const REST_POSITION: HeadMovementFrame = {
  rotation: 0,
  verticalOffset: 0,
};

export const useHeadTilt = (movement: HeadMovementName) => {
  const [frame, setFrame] = useState(REST_POSITION);
  const settings = HEAD_MOVEMENTS[movement];

  useEffect(() => {
    if (
      settings.rotationAmplitude === 0 &&
      settings.verticalAmplitude === 0
    ) {
      return;
    }

    let animationFrame = 0;
    let startTime: number | null = null;

    const animate = (time: number) => {
      if (startTime === null) startTime = time;

      const phase = ((time - startTime) / settings.periodMs) * Math.PI * 2;
      const wave = Math.sin(phase);
      const verticalOffset =
        settings.verticalPattern === "bounce"
          ? ((1 - Math.cos(phase)) * settings.verticalAmplitude) / 2
          : wave * settings.verticalAmplitude;

      setFrame({
        rotation: wave * settings.rotationAmplitude,
        verticalOffset,
      });
      animationFrame = window.requestAnimationFrame(animate);
    };

    animationFrame = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [movement, settings]);

  return settings.rotationAmplitude === 0 && settings.verticalAmplitude === 0
    ? REST_POSITION
    : frame;
};
