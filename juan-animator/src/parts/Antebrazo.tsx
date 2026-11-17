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
  const forearmPath = isIzq
    ? "M113 342 Q98 342 91 353 Q93 361 92 385 L86 400 Q83 410 100 412 Q114 413 119 403 L124 375 Q128 359 127 351 Q126 342 113 342 Z"
    : "M287 342 Q302 342 309 353 Q307 361 308 385 L314 400 Q317 410 300 412 Q286 413 281 403 L276 375 Q272 359 273 351 Q274 342 287 342 Z";
  const forearmOutline = isIzq
    ? "M91 353 Q93 361 92 385 L86 400 Q83 410 100 412 Q114 413 119 403 L124 375 Q128 359 127 351"
    : "M309 353 Q307 361 308 385 L314 400 Q317 410 300 412 Q286 413 281 403 L276 375 Q272 359 273 351";

  return (
    <g
      id={`antebrazo-${lado}`}
      style={{ transformOrigin: `${pivotX}px ${pivotY}px`, transform: `rotate(${angle}deg)` }}
    >
      <path d={forearmPath} fill="#72A3C9" />
      <path
        d={forearmOutline}
        fill="none"
        stroke="#416A8B"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {children}
    </g>
  );
};

export default Antebrazo;