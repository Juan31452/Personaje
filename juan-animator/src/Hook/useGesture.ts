import { POSES, type Pose, type PoseName } from "../extras/poses";

interface UseGestureOptions {
  pose?: PoseName;
  custom?: Partial<Pose>;
}

export const useGesture = ({
  pose = "idle",
  custom,
}: UseGestureOptions = {}) => {
  const base: Pose = POSES[pose] ?? POSES.idle;
  return {
    leftArmAngle: custom?.leftArmAngle ?? base.leftArmAngle,
    rightArmAngle: custom?.rightArmAngle ?? base.rightArmAngle,
    leftForearmAngle: custom?.leftForearmAngle ?? base.leftForearmAngle,
    rightForearmAngle: custom?.rightForearmAngle ?? base.rightForearmAngle,
    leftHandAngle: custom?.leftHandAngle ?? base.leftHandAngle,
    rightHandAngle: custom?.rightHandAngle ?? base.rightHandAngle,
    headTilt: custom?.headTilt ?? base.headTilt,
    eyebrowRaise:
      custom?.eyebrowRaise ?? base.eyebrowRaise ?? 0,
  };
};