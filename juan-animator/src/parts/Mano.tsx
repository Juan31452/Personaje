import type { FC } from "react";

export type HandPose = "abierta" | "relajada" | "señalando" | "saludando" | "presentando";


interface ManoProps {
  lado: "izquierdo" | "derecho";
  angle?: number;
  pose?: HandPose;
}

const Mano: FC<ManoProps> = ({
  lado,
  angle = 0,
  pose = "abierta",
}) => {
  const isIzq = lado === "izquierdo";
  const isWaving = pose === "saludando";
  const isOpen = pose === "abierta" || isWaving;
  const openHandTransform = isWaving
    ? isIzq
      ? "translate(-15, -5) scale(1.25)"
      : "translate(-10, -5) scale(1.25)"
    : isIzq
      ? "translate(-10, 5) scale(1.25, -1.25)"
      : "translate(-15, 5) scale(1.25, -1.25)";
  //const relaxedHandTransform = "scale(1.2) translate(-7.5, 1)";

  // El antebrazo termina en estas coordenadas para ambos lados.
  const pivotX = isIzq ? 100 : 300;
  const pivotY = 412;
  const mirrorX = isIzq ? -1 : 1;

  return (
    <g
      id={`mano-${lado}`}
      transform={`translate(${pivotX}, ${pivotY}) rotate(${angle}) scale(${mirrorX * 0.8}, 0.8)`}
    >
      {/* 1. ABIERTA O SALUDANDO */}
       {isOpen && (
        <g transform={openHandTransform}>
          <path
            d="M -4 -1 Q -9 -3 -7 -8 L -3 -21 Q -1 -25 3 -22 L 2 -14 L 1 -35 Q 1 -40 5 -41 Q 9 -41 10 -36 L 10 -17 L 12 -39 Q 13 -44 17 -43 Q 21 -42 20 -37 L 17 -16 L 23 -34 Q 25 -38 29 -36 Q 33 -34 31 -29 L 25 -11 L 30 -23 Q 32 -27 36 -25 Q 40 -23 37 -18 L 29 -4 Q 25 4 16 5 L 5 4 Q -1 3 -4 -1 Z"
            fill="#C98765"
            stroke="#995E46"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
          {isWaving && (
            <path
              d="M 3 -13 Q 6 -10 10 -12 M 16 -13 Q 20 -11 23 -14"
              fill="none"
              stroke="#995E46"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          )}
        </g>
      )}

      {/* 2. SEÑALANDO (índice arriba, dedos recogidos abajo) */}
       {pose === "señalando" && (
              <g transform="scale(1.6) translate(5, -12)">
          {/* 1. Índice extendido recto desde la parte superior */}
          <path
            d="M 10 2
               L 35 1
               Q 40 1 40 5
               Q 40 9 35 9
               L 12 10
               Z"
            fill="#C98765"
            stroke="#995E46"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* 2. Palma y dorso de la mano */}
          <path
            d="M -2 2
               Q 8 -1 15 3
               Q 20 8 18 16
               Q 15 23 5 23
               L -3 20
               Q -7 12 -2 2
               Z"
            fill="#C98765"
            stroke="#995E46"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* 3. Dedos medio, anular y meñique recogidos debajo */}
          <path
            d="M 14 11 Q 20 11 19 15 Q 18 18 12 17
               M 13 16 Q 18 16 17 20 Q 16 22 10 21
               M 10 20 Q 15 20 14 23 Q 12 25 7 23"
            fill="none"
            stroke="#995E46"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* 4. Pulgar doblado por encima de los dedos recogidos */}
          <path
            d="M 4 5
               Q 11 6 13 11
               Q 14 15 9 15
               Q 5 15 4 11"
            fill="#C98765"
            stroke="#995E46"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
      )}

            {/* 3. RELAJADA */}
      {pose === "relajada" && (
        <g transform="translate(-8, -6) scale(1.1)">
          {/* Palma */}
          <path
            d="M 15 0 L 0 -2 L -5 18 Q -8 33 5 38 Q 18 40 26 28 L 30 12 Q 32 2 15 0 Z"
            fill="#red"
            stroke="#995E46"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          {/* Pulgar hacia el cuerpo */}
          <path
            d="M 2 5 Q -8 3 -10 10 Q -12 17 -5 19 Q 2 19 4 12"
            fill="#C98765"
            stroke="#995E46"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </g>
      )}
    </g>
  );
};

export default Mano;
