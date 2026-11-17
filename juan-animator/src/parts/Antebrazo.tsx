import type { FC } from "react";

interface AntebrazoProps {
  lado: "izquierdo" | "derecho";
  angle?: number;
  children?: React.ReactNode;
}

const Antebrazo: FC<AntebrazoProps> = ({ lado, angle = 0, children }) => {
  const isIzq = lado === "izquierdo";
  const pivotX = isIzq ? 113 : 287;
  const pivotY = 350;

  return (
    <g
      id={`antebrazo-${lado}`}
      style={{ transformOrigin: `${pivotX}px ${pivotY}px`, transform: `rotate(${angle}deg)` }}
    >
      {/* Antebrazo más grueso */}
      <path
        d={
          isIzq
            ? "M113 350 Q100 365 95 385 L90 400 Q87 410 100 412 Q113 413 115 403 L120 375 Q122 360 113 350 Z"
            : "M287 350 Q300 365 305 385 L310 400 Q313 410 300 412 Q287 413 285 403 L280 375 Q278 360 287 350 Z"
        }
        fill="#72A3C9"
        stroke="#416A8B"
        strokeWidth="3"
      />

      {children}
    </g>
  );
};

export default Antebrazo;