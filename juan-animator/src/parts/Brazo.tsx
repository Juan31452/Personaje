import type { FC } from "react";

interface BrazoProps {
  lado: "izquierdo" | "derecho";
}

const Brazo: FC<BrazoProps> = ({ lado }) => {
  const isIzq = lado === "izquierdo";

  return (
    <g id={`brazo-${lado}`}>
      <path
        d={
          isIzq
            ? "M140 280 Q108 285 103 325 L95 385 Q91 403 105 408 Q118 410 125 393 L148 335 Q153 310 151 290 Z"
            : "M260 280 Q292 285 297 325 L305 385 Q309 403 295 408 Q282 410 275 393 L252 335 Q247 310 249 290 Z"
        }
        fill="#72A3C9"
        stroke="#416A8B"
        strokeWidth="3"
      />
    </g>
  );
};

export default Brazo;