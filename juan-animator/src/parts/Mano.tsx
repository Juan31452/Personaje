
import type { FC } from "react";

type HandPose = "relajada" | "señalando";

interface ManoProps {
  lado: "izquierdo" | "derecho";
  angle?: number;
  pose?: HandPose;
}

const Mano: FC<ManoProps> = ({
  lado,
  angle = 0,
  pose = "relajada",
}) => {
  const isIzq = lado === "izquierdo";

  return (
    <g
      id={`mano-${lado}`}
      style={{
        transformOrigin: isIzq ? "95px 418px" : "305px 418px",
        transform: `translateY(5px) rotate(${angle}deg) scale(0.8)`,
      }}
    >
      {pose === "señalando" ? (
        isIzq ? (
          <g>
            {/* Palma */}
            <path
              d="M95 414
                 Q84 408 77 416
                 Q70 424 77 434
                 Q85 443 98 437
                 L105 427
                 Q108 420 101 416
                 Z"
              fill="#C98765"
              stroke="#995E46"
              strokeWidth="1.5"
            />

            {/* Índice extendido */}
            <path
               d="M79 419
                  Q69 410 63 402
                  Q60 399 57 402
                  Q56 405 60 409
                  L75 426
                  Z"
                  fill="#C98765"
               stroke="#995E46"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />

            {/* Dedos recogidos */}
            <path
              d="M91 435 Q82 432 83 425
                 Q85 419 91 423
                 L100 429
                 M98 434 Q92 428 96 423"
              fill="none"
              stroke="#995E46"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
        ) : (
          <g transform="translate(622 0) scale(-1 1)">
            {/* Palma */}
            <path
              d="M305 414
                 Q316 408 323 416
                 Q330 424 323 434
                 Q315 443 302 437
                 L295 427
                 Q292 420 299 416
                 Z"
              fill="#C98765"
              stroke="#995E46"
              strokeWidth="1.5"
            />
          </g>
        )
      ) : (
        isIzq ? (
          <g transform="translate(10, 0)">
            <path
              d="M85 400 L100 398 L105 418 Q108 433 95 438 Q82 440 74 428 L70 412 Q68 402 85 400 Z"
              fill="#C98765"
            />
            <path
              d="M98 405 Q108 403 110 410 Q112 417 105 419 Q98 419 96 412"
              fill="#C98765"
            />
          </g>
        ) : (
          <g transform="translate(400 0) scale(-1 1)">
            <g transform="translate(10, 0)">
              <path
                d="M85 400 L100 398 L105 418 Q108 433 95 438 Q82 440 74 428 L70 412 Q68 402 85 400 Z"
                fill="#C98765"
              />
              <path
                d="M98 405 Q108 403 110 410 Q112 417 105 419 Q98 419 96 412"
                fill="#C98765"
              />
            </g>
          </g>
        )
      )}
    </g>
  );
};

export default Mano;
