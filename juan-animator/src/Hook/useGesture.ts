import { useState, useEffect, useRef } from "react";
import { POSES, type PoseName, type Pose } from "../extras/poses";

interface UseGestureOptions {
  /** Nombre del gesto predefinido */
  pose?: PoseName;
  /** Ángulos personalizados (sobrescriben el gesto) */
  custom?: Partial<Pose>;
  /** Duración de la transición en ms */
  transitionDuration?: number;
  /** Si la animación está activa */
  active?: boolean;
}

export const GESTURE_TRANSITION_DURATION = 1500;

const EMPTY_CUSTOM: Partial<Pose> = {};

/**
 * Hook que aplica un gesto con animación suave.
 * Interpola los ángulos desde la pose actual hasta la pose destino.
 */
export const useGesture = ({
  pose = "idle",
  custom = EMPTY_CUSTOM,
  transitionDuration = GESTURE_TRANSITION_DURATION,
  active = true,
}: UseGestureOptions = {}) => {
  const [currentPose, setCurrentPose] = useState<Pose>(POSES.idle);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const currentPoseRef = useRef<Pose>(POSES.idle);

  useEffect(() => {
    if (!active) {
      currentPoseRef.current = POSES.idle;
      setCurrentPose(POSES.idle);
      return;
    }

    const base: Pose = POSES[pose] || POSES.idle;
    const target: Pose = {
      leftArmAngle: custom.leftArmAngle ?? base.leftArmAngle,
      rightArmAngle: custom.rightArmAngle ?? base.rightArmAngle,
      leftForearmAngle: custom.leftForearmAngle ?? base.leftForearmAngle,
      rightForearmAngle: custom.rightForearmAngle ?? base.rightForearmAngle,
      leftHandAngle: custom.leftHandAngle ?? base.leftHandAngle,
      rightHandAngle: custom.rightHandAngle ?? base.rightHandAngle,
      headTilt: custom.headTilt ?? base.headTilt,
      eyebrowRaise: custom.eyebrowRaise ?? base.eyebrowRaise ?? 0,
    };

    const start = { ...currentPoseRef.current };
    startTimeRef.current = null;

    if (transitionDuration <= 0) {
      currentPoseRef.current = target;
      setCurrentPose(target);
      return;
    }

    // Easing suave (cubic ease-in-out)
    const easeInOutCubic = (t: number): number => {
      return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    // Interpolación lineal
    const lerp = (a: number, b: number, t: number): number => {
      return a + (b - a) * t;
    };

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / transitionDuration, 1);
      const easedProgress = easeInOutCubic(progress);

      const interpolated: Pose = {
        leftArmAngle: lerp(start.leftArmAngle, target.leftArmAngle, easedProgress),
        rightArmAngle: lerp(start.rightArmAngle, target.rightArmAngle, easedProgress),
        leftForearmAngle: lerp(start.leftForearmAngle, target.leftForearmAngle, easedProgress),
        rightForearmAngle: lerp(start.rightForearmAngle, target.rightForearmAngle, easedProgress),
        leftHandAngle: lerp(start.leftHandAngle, target.leftHandAngle, easedProgress),
        rightHandAngle: lerp(start.rightHandAngle, target.rightHandAngle, easedProgress),
        headTilt: lerp(start.headTilt, target.headTilt, easedProgress),
        eyebrowRaise: lerp(
          start.eyebrowRaise ?? 0,
          target.eyebrowRaise ?? 0,
          easedProgress,
        ),
      };

      currentPoseRef.current = interpolated;
      setCurrentPose(interpolated);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [pose, custom, transitionDuration, active]);

  return currentPose;
};