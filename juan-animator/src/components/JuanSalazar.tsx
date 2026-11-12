import type { FC } from "react";
import { useBlink } from "../Hook/useBlink";
import { useDialog } from "../Hook/useDialog";
import Cabeza from "../parts/Cabeza";
import Cuello from "../parts/Cuello";
import Torso from "../parts/Torso";
import Pantalon from "../parts/Pantalon";
import Zapatos from "../parts/Zapatos";
import Brazo from "../parts/Brazo";
import Mano from "../parts/Mano";

interface JuanSalazarProps {
  dialog?: string;
  headTilt?: number;
  leftArmAngle?: number;
  rightArmAngle?: number;
  leftHandAngle?: number;
  rightHandAngle?: number;
}

const JuanSalazar: FC<JuanSalazarProps> = ({
  dialog = "",
  headTilt = 0,
  leftArmAngle = 0,
  rightArmAngle = 0,
  leftHandAngle = 0,
  rightHandAngle = 0,
}) => {
  const isBlinking = useBlink();
  const { mouthState } = useDialog(dialog, 180);

  return (
    <svg
      viewBox="0 0 600 900"
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      role="img"
      aria-label="Juan Salazar de cuerpo completo"
    >
      {/* Fondo */}
      <rect width="600" height="900" rx="20" fill="#EAF2F8" />

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

      {/* 4. Brazos (detrás de las manos) */}
      <Brazo lado="izquierdo" angle={leftArmAngle} />
      <Brazo lado="derecho" angle={rightArmAngle} />

      {/* 5. Manos (al final de los brazos) */}
      <Mano lado="izquierdo" angle={leftHandAngle} />
      <Mano lado="derecho" angle={rightHandAngle} />

      {/* 6. Cabeza (al frente, con rotación) */}
      <g
        id="cabeza-grupo"
        style={{
          transformOrigin: "200px 270px",
          transform: `rotate(${headTilt}deg)`,
        }}
      >
        <Cabeza isBlinking={isBlinking} mouthState={mouthState} />
      </g>
      </g>
    </svg>
  );
};

export default JuanSalazar;