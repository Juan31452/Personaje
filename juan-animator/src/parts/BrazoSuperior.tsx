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
            ? "M147 275 Q142 268 132 270 Q110 273 98 310 L93 340 Q90 355 107 358 Q125 359 128 343 L137 310 Q142 295 147 275 Z"
            : "M253 275 Q258 268 268 270 Q290 273 302 310 L307 340 Q310 355 293 358 Q275 359 272 343 L263 310 Q258 295 253 275 Z"
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