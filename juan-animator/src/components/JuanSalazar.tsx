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
import Brazo from "../parts/Brazo";
import Mano from "../parts/Mano";

interface JuanSalazarProps {
  mouthState?: number;
  headTilt?: number;
  isTalking?: boolean;
  leftHandAngle?: number;
  rightHandAngle?: number;
}

const JuanSalazar: FC<JuanSalazarProps> = ({
  mouthState = 0,
  headTilt = 0,
  isTalking = false,
  leftHandAngle = 0,
  rightHandAngle = 0,
}) => {
  const isBlinking = useBlink();
  const { leftArmAngle, rightArmAngle } = useArmGesture(isTalking);
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
        href={fondo}
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
        <Brazo lado="izquierdo" />
        <Mano lado="izquierdo" angle={leftHandAngle} />
      </g>
      <g
        style={{
          transformOrigin: "260px 280px",
          transform: `rotate(${rightArmAngle}deg)`,
        }}
      >
        <Brazo lado="derecho" />
        <Mano lado="derecho" angle={rightHandAngle} />
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