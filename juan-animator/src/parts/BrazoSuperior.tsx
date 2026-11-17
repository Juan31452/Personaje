import type { FC } from "react";

interface BrazoSuperiorProps {
  lado: "izquierdo" | "derecho";
  angle?: number;
  children?: React.ReactNode;
}

const BrazoSuperior: FC<BrazoSuperiorProps> = ({ lado, angle = 0, children }) => {
  const isIzq = lado === "izquierdo";
  const pivotX = isIzq ? 140 : 260;
  const pivotY = 280;

  return (
    <g
      id={`brazo-superior-${lado}`}
      style={{ transformOrigin: `${pivotX}px ${pivotY}px`, transform: `rotate(${angle}deg)` }}
    >
      {/* Brazo superior más grueso */}
      <path
        d={
          isIzq
            ? "M140 280 Q105 285 100 310 L95 340 Q92 355 108 357 Q124 358 126 343 L135 310 Q142 295 140 280 Z"
            : "M260 280 Q295 285 300 310 L305 340 Q308 355 292 357 Q276 358 274 343 L265 310 Q258 295 260 280 Z"
        }
        fill="#72A3C9"
        stroke="#416A8B"
        strokeWidth="3"
      />
      
      {/* Codo */}
      <circle
        cx={isIzq ? 113 : 287}
        cy={350}
        r="8"
        fill="#5A8FB8"
      />

      {children}
    </g>
  );
};

export default BrazoSuperior;