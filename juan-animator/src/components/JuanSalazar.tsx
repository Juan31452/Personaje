import type { FC } from "react";
import fondo from "../assets/fondo.jpg";
import { useBlink } from "../Hook/useBlink";
import { useArmGesture } from "../Hook/useArmGesture";
import { useHeadTilt } from "../Hook/useHeadTilt";
import Cabeza from "../parts/Cabeza";
import Cuello from "../parts/Cuello";
import Torso from "../parts/Torso";
import Pantalon from "../parts/Pantalon";
import Zapatos from "../parts/Zapatos";
import BrazoCompleto from "../parts/BrazoCompleto";

interface JuanSalazarProps {
  mouthState?: number;
  backgroundImageUrl?: string;
  headTilt?: number;
  isTalking?: boolean;
  leftForearmAngle?: number;
  rightForearmAngle?: number;
  leftHandAngle?: number;
  rightHandAngle?: number;
}

const JuanSalazar: FC<JuanSalazarProps> = ({
  mouthState = 0,
  backgroundImageUrl = fondo,
  headTilt = 0,
  isTalking = false,
  leftForearmAngle ,
  rightForearmAngle ,  
  leftHandAngle = 0,
  rightHandAngle = 0,
}) => {
  const isBlinking = useBlink();
  const {
    leftArmAngle,
    rightArmAngle,
    leftForearmAngle: animatedLeftForearmAngle,
    rightForearmAngle: animatedRightForearmAngle,
  } = useArmGesture(isTalking);

   const effectiveLeftForearmAngle =
    leftForearmAngle !== undefined
      ? leftForearmAngle
      : animatedLeftForearmAngle;

    const effectiveRightForearmAngle =
    rightForearmAngle !== undefined
      ? rightForearmAngle
      : animatedRightForearmAngle;
  
  const naturalHeadTilt = useHeadTilt(true, -8, 8, 1800);
  const effectiveHeadTilt = headTilt + naturalHeadTilt;

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

      {/* =========================
          ORDEN DE CAPAS (de atrás hacia adelante)
      ========================= */}

      {/* 1. Piernas y zapatos (fondo) */}
      <Pantalon />
      <Zapatos />

      {/* 2. Torso */}
      <Torso />

      {/* 3. Cuello */}
      <Cuello />

      {/* 4. Brazos y manos, unidos para compartir el movimiento del brazo */}
      <g
        style={{
          transformOrigin: "140px 280px",
          transform: `rotate(${leftArmAngle}deg)`,
        }}
      >
        {/* 4. Brazos articulados */}
      <BrazoCompleto
        lado="izquierdo"
        armAngle={leftArmAngle}
        forearmAngle={effectiveLeftForearmAngle}
        handAngle={leftHandAngle}
      />



      </g>
      <g
        style={{
          transformOrigin: "260px 280px",
          transform: `rotate(${rightArmAngle}deg)`,
        }}
      >

      <BrazoCompleto
        lado="derecho"
        armAngle={rightArmAngle}
        forearmAngle={effectiveRightForearmAngle}
        handAngle={rightHandAngle}
        handPose="relajada"
      />
      </g>

      {/* 6. Cabeza (al frente, con rotación) */}
      <g
        id="cabeza-grupo"
        style={{
          transformOrigin: "200px 270px",
          transform: `rotate(${effectiveHeadTilt}deg)`,
        }}
      >
        <Cabeza isBlinking={isBlinking} mouthState={mouthState} />
      </g>
      </g>
    </svg>
  );
};

export default JuanSalazar;