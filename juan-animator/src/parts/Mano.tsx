import type { FC } from "react";

interface ManoProps {
  lado: "izquierdo" | "derecho";
  angle?: number;
}

const Mano: FC<ManoProps> = ({ lado, angle = 0 }) => {
  const isIzq = lado === "izquierdo";
  const transformAngle = isIzq ? angle : -angle;
  const pivotX = isIzq ? 90 : 310;
  const pivotY = 420;

  return (
    <g
      id={`mano-${lado}`}
      style={{
        transformOrigin: `${pivotX}px ${pivotY}px`,
        transform: `rotate(${transformAngle}deg)`,
      }}
    >
      {isIzq ? (
        // Mano izquierda - translate mueve todo el conjunto sin deformar
        <g transform="translate(25, 0)">
          {/* Palma y dedos */}
          <path
            d="M85 400 L100 398 L105 418 Q108 433 95 438 Q82 440 74 428 L70 412 Q68 402 85 400 Z"
            fill="#C98765"
          />
          {/* Pulgar */}
          <path
            d="M98 405 Q108 403 110 410 Q112 417 105 419 Q98 419 96 412"
            fill="#C98765"
          />
        </g>
      ) : (
        // Mano derecha - translate mueve todo el conjunto sin deformar
        <g transform="translate(-25, 0)">
          {/* Palma y dedos */}
          <path
            d="M315 400 L300 398 L295 418 Q292 433 305 438 Q318 440 326 428 L330 412 Q332 402 315 400 Z"
            fill="#C98765"
          />
          {/* Pulgar */}
          <path
            d="M302 405 Q292 403 290 410 Q288 417 295 419 Q302 419 304 412"
            fill="#C98765"
          />
        </g>
      )}
    </g>
  );
};

export default Mano;