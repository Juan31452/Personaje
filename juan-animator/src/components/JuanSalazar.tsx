import type { FC } from "react";
import fondo from "../assets/fondo.jpg";
import { useBlink } from "../Hook/useBlink";
import { useCamera } from "../Hook/useCamera";
import { useArmGesture } from "../Hook/useArmGesture";
import { useHeadTilt } from "../Hook/useHeadTilt";
import { useGesture } from "../Hook/useGesture";
import type { HeadMovementName } from "../extras/headMovements";
import type { Pose, PoseName } from "../extras/poses";
import type { CameraView, CameraViewName } from "./camera";
import Cabeza from "../parts/Cabeza";
import Cuello from "../parts/Cuello";
import Torso from "../parts/Torso";
import Pantalon from "../parts/Pantalon";
import Zapatos from "../parts/Zapatos";
import BrazoCompleto from "../parts/BrazoCompleto";

interface JuanSalazarProps {
  mouthState?: number;
  backgroundImageUrl?: string;
  headMovement?: HeadMovementName;
  headTilt?: number;
  leftArmAngle?: number;
  rightArmAngle?: number;
  isTalking?: boolean;
  leftForearmAngle?: number;
  rightForearmAngle?: number;
  leftHandAngle?: number;
  rightHandAngle?: number;
  gesture?: PoseName;
  customGesture?: Partial<Pose>;
  cameraView?: CameraViewName;
  customCamera?: Partial<CameraView>;
}

const JuanSalazar: FC<JuanSalazarProps> = ({
  mouthState = 0,
  backgroundImageUrl = fondo,
  headMovement = "sway",
  headTilt,
  leftArmAngle,
  rightArmAngle,
  isTalking = false,
  leftForearmAngle,
  rightForearmAngle,
  leftHandAngle,
  rightHandAngle,
  gesture,
  customGesture,
  cameraView,
  customCamera,
}) => {
  const gestureAngles = useGesture({ pose: gesture, custom: customGesture });
  const talkingAngles = useArmGesture(isTalking);
  const isBlinking = useBlink();
  const headMovementFrame = useHeadTilt(headMovement);
  const effectiveLeftArmAngle =
    leftArmAngle ?? gestureAngles.leftArmAngle + talkingAngles.leftArmAngle;
  const effectiveRightArmAngle =
    rightArmAngle ?? gestureAngles.rightArmAngle + talkingAngles.rightArmAngle;
  const effectiveLeftForearmAngle =
    leftForearmAngle ??
    gestureAngles.leftForearmAngle + talkingAngles.leftForearmAngle;
  const effectiveRightForearmAngle =
    rightForearmAngle ??
    gestureAngles.rightForearmAngle + talkingAngles.rightForearmAngle;
  const effectiveLeftHandAngle = leftHandAngle ?? gestureAngles.leftHandAngle;
  const effectiveRightHandAngle = rightHandAngle ?? gestureAngles.rightHandAngle;
  const effectiveHeadTilt =
    (headTilt ?? gestureAngles.headTilt) + headMovementFrame.rotation;

  const camera = useCamera({ view: cameraView, custom: customCamera });

  return (
    <svg
      viewBox="0 0 600 900"
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      role="img"
      aria-label="Juan Salazar de cuerpo completo"
    >
      <image
        href={backgroundImageUrl}
        x="0"
        y="0"
        width="600"
        height="900"
        preserveAspectRatio="xMidYMid slice"
      />
      <g
        transform={`translate(${camera.translateX} ${camera.translateY}) translate(300 450) rotate(${camera.rotate}) skewX(${camera.skewX}) skewY(${camera.skewY}) scale(${camera.scaleX} ${camera.scaleY}) translate(-300 -450)`}
      >
        <g transform="translate(110 114) scale(0.95)">
          {/* Sombra del suelo */}
          <ellipse
            cx="200"
            cy="665"
            rx="115"
            ry="12"
            fill="#B8C7D3"
            opacity="0.5"
          />

          <Pantalon />
          <Zapatos />
          <Torso />
          <Cuello />
          <BrazoCompleto
            lado="izquierdo"
            armAngle={effectiveLeftArmAngle}
            forearmAngle={effectiveLeftForearmAngle}
            handAngle={effectiveLeftHandAngle}
            handPose={gesture === "waving" ? "saludando" : "abierta"}
          />
          <BrazoCompleto
            lado="derecho"
            armAngle={effectiveRightArmAngle}
            forearmAngle={effectiveRightForearmAngle}
            handAngle={effectiveRightHandAngle}
            handPose={gesture === "waving" ? "saludando" : "abierta"}
          />
          <g
            id="cabeza-grupo"
            style={{
              transformOrigin: "200px 270px",
              transform: `translateY(${headMovementFrame.verticalOffset}px) rotate(${effectiveHeadTilt}deg)`,
            }}
          >
            <Cabeza
              isBlinking={isBlinking}
              mouthState={mouthState}
              eyebrowRaise={gestureAngles.eyebrowRaise}
            />
          </g>
        </g>
      </g>
    </svg>
  );
};

export default JuanSalazar;