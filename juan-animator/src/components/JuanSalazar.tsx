import { useEffect, useState, type FC } from "react";
import fondo from "../assets/fondo.jpg";
import { useBlink } from "../Hook/useBlink";
import { useCamera } from "../Hook/useCamera";
import { useArmGesture } from "../Hook/useArmGesture";
import { useHeadTilt } from "../Hook/useHeadTilt";
import {
  GESTURE_TRANSITION_DURATION,
  useGesture,
} from "../Hook/useGesture";
import type { HeadMovementName } from "../extras/headMovements";
import type { Pose, PoseName } from "../extras/poses";
import type { CameraView, CameraViewName } from "./camera";
import Cabeza from "../parts/Cabeza";
import Cuello from "../parts/Cuello";
import Torso from "../parts/Torso";
import Pantalon from "../parts/Pantalon";
import Zapatos from "../parts/Zapatos";
import BrazoCompleto from "../parts/BrazoCompleto";
import "../style/JuanSalazar.css"; // 👈 Importamos el CSS separado

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
  gestureTransitionDuration?: number;
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
  gestureTransitionDuration,
  cameraView,
  customCamera,
}) => {
  const gestureAngles = useGesture({
    pose: gesture,
    custom: customGesture,
    transitionDuration: gestureTransitionDuration,
  });

  const isIdle = !gesture || gesture === "idle";
  const talkingAngles = useArmGesture(isTalking && isIdle);
  
  const isBlinking = useBlink();
  const headMovementFrame = useHeadTilt(headMovement);
  const camera = useCamera({ view: cameraView, custom: customCamera });

  //const turn = gestureAngles.bodyTurn ?? 0;

  const effectiveLeftArmAngle = leftArmAngle ?? (isIdle 
    ? gestureAngles.leftArmAngle + talkingAngles.leftArmAngle 
    : gestureAngles.leftArmAngle
  );
  
  const effectiveRightArmAngle = rightArmAngle ?? (isIdle 
    ? gestureAngles.rightArmAngle + talkingAngles.rightArmAngle 
    : gestureAngles.rightArmAngle
  );
  
  const effectiveLeftForearmAngle = leftForearmAngle ?? (isIdle 
    ? gestureAngles.leftForearmAngle + talkingAngles.leftForearmAngle 
    : gestureAngles.leftForearmAngle
  );
  
  const effectiveRightForearmAngle = rightForearmAngle ?? (isIdle 
    ? gestureAngles.rightForearmAngle + talkingAngles.rightForearmAngle 
    : gestureAngles.rightForearmAngle
  );

  const effectiveLeftHandAngle = leftHandAngle ?? gestureAngles.leftHandAngle;
  const effectiveRightHandAngle = rightHandAngle ?? gestureAngles.rightHandAngle;
  const effectiveHeadTilt = (headTilt ?? gestureAngles.headTilt) + headMovementFrame.rotation;

  const [rightHandPose, setRightHandPose] = useState<"abierta" | "señalando" | "saludando" | "presentando">("abierta");
  const handShapeDelay = (gestureTransitionDuration ?? GESTURE_TRANSITION_DURATION) * 0.65;

  useEffect(() => {
    if (gesture === "waving") {
      setRightHandPose("saludando");
      return;
    }
    const timer = window.setTimeout(
      () => setRightHandPose(gesture === "pointing" ? "señalando" : "abierta"),
      handShapeDelay
    );
    return () => window.clearTimeout(timer);
  }, [gesture, handShapeDelay]);

  return (
    <svg
      viewBox="0 0 600 900"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Juan Salazar de cuerpo completo"
      preserveAspectRatio="xMidYMid meet" /* 🔑 CLAVE: Mantiene la proporción sin desbordar */
      className="juan-salazar-svg" /* 👈 Usamos la clase del CSS */
    >
      <image
        href={backgroundImageUrl}
        x="0"
        y="0"
        width="600"
        height="900"
        preserveAspectRatio="xMidYMid slice"
      />
      
      {/* Grupo de Cámara Virtual */}
      <g
        transform={`translate(${camera.translateX} ${camera.translateY}) translate(300 450) rotate(${camera.rotate}) skewX(${camera.skewX}) skewY(${camera.skewY}) scale(${camera.scaleX} ${camera.scaleY}) translate(-300 -450)`}
      >
        <g transform="translate(110 114) scale(0.95)">
          
          {/* Sombra del suelo */}
          <ellipse cx="200" cy="665" rx="115" ry="12" fill="#B8C7D3" opacity="0.5" />

          <Pantalon />
          <Zapatos />

          {/* GRUPO DEL TORSO CON GIRO 2.5D */}
          <g
            className="torso-group" /* 👈 Clase para el transform-origin */
            style={{
    //          transform: `translateX(${turn * -12}px) scaleX(${1 - Math.abs(turn) * 0.1})`,
            }}
          >
            <Torso />
            <Cuello />
            
            {/* Cabeza */}
            <g
              className="head-group" /* 👈 Clase para el transform-origin */
              style={{
      //          transform: `translate(${turn * -8}px, ${headMovementFrame.verticalOffset}px) rotate(${effectiveHeadTilt}deg)`,
              }}
            >
              <Cabeza
                isBlinking={isBlinking}
                mouthState={mouthState}
                eyebrowRaise={gestureAngles.eyebrowRaise ?? 0}
              />
            </g>
          </g>

          {/* BRAZO IZQUIERDO */}
          <BrazoCompleto
            lado="izquierdo"
            armAngle={effectiveLeftArmAngle}
            forearmAngle={effectiveLeftForearmAngle}
            handAngle={effectiveLeftHandAngle}
        //    scale={1 - turn * 0.06} 
            handPose={
              gesture === "thinking" ? "pensando" :
              gesture === "waving" ? "saludando" :
              gesture === "presenting" ? "presentando" : "abierta"
            }
          />

          {/* BRAZO DERECHO */}
          <BrazoCompleto
            lado="derecho"
            armAngle={effectiveRightArmAngle}
            forearmAngle={effectiveRightForearmAngle}
            handAngle={effectiveRightHandAngle}
        //    scale={1 + turn * 0.06}
            handPose={rightHandPose}
          />
          
        </g>
      </g>
    </svg>
  );
};

export default JuanSalazar;