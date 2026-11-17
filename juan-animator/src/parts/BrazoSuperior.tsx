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
            ? "M140 280 Q104 285 98 310 L93 340 Q90 355 107 358 Q125 359 128 343 L137 310 Q142 295 140 280 Z"
            : "M260 280 Q296 285 302 310 L307 340 Q310 355 293 358 Q275 359 272 343 L263 310 Q258 295 260 280 Z"
        }
        fill="#72A3C9"
        stroke="#416A8B"
        strokeWidth="3"
      />
      
      {children}
    </g>
  );
};

export default BrazoSuperior;