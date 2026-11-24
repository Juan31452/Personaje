import type { FC } from "react";

export type HandPose = "abierta" | "relajada" | "señalando" | "saludando" | "presentando" | "pensando";


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
  const isThinking = pose === "pensando";
  const isOpen = pose === "abierta" || isWaving || isThinking;
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
      {/* 1. ABIERTA O SALUDANDO O PENSANDO */}
      {isOpen && (
        <g transform={openHandTransform}>
            <path
              d={
                isThinking
                  ? "M -4 -1 Q -12 -2 -14 -6 L -16 -13 Q -17 -18 -11 -17 L 0 -8 L 1 -28 Q 1 -33 5 -34 Q 9 -34 10 -29 L 10 -12 L 12 -30 Q 13 -35 17 -34 Q 21 -33 20 -28 L 17 -10 L 23 -24 Q 25 -28 29 -26 Q 33 -24 31 -19 L 25 -6 L 30 -15 Q 32 -19 36 -17 Q 40 -15 37 -10 L 29 0 Q 25 8 16 9 L 5 8 Q -1 7 -4 -1 Z"
                  : "M -4 -1 Q -9 -3 -7 -8 L -3 -18 Q -1 -22 3 -19 L 2 -10 L 1 -28 Q 1 -33 5 -34 Q 9 -34 10 -29 L 10 -12 L 12 -30 Q 13 -35 17 -34 Q 21 -33 20 -28 L 17 -10 L 23 -24 Q 25 -28 29 -26 Q 33 -24 31 -19 L 25 -6 L 30 -15 Q 32 -19 36 -17 Q 40 -15 37 -10 L 29 0 Q 25 8 16 9 L 5 8 Q -1 7 -4 -1 Z"
              }
              fill="#C98765"
              stroke="#995E46"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
            
            {isWaving && (
              <>
                <path
                  d="M 3 -13 Q 6 -10 10 -12"
                  fill="none"
                  stroke="#995E46"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  className="wave-line-1"
                />
                <path
                  d="M 16 -13 Q 20 -11 23 -14"
                  fill="none"
                  stroke="#995E46"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  className="wave-line-2"
                />
              </>
            )}
          </g>
      )}

      {/* 2. SEÑALANDO (índice arriba, dedos recogidos abajo) */}
       {pose === "señalando" && (
              <g transform="scale(1.6) translate(5, -12)">
          {/* 1. Índice extendido recto desde la parte superior */}
          <path
            d="M 10 2
               L 28 1
               Q 38 1 38 5
               Q 38 9 33 9
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
