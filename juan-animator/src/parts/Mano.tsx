
import type { FC } from "react";

type HandPose = "abierta" | "relajada" | "señalando" | "saludando";

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

  return (
    <g
      id={`mano-${lado}`}
      style={{
        transformOrigin: isOpen
          ? isIzq
            ? "100px 412px"
            : "300px 412px"
          : isIzq
            ? "95px 418px"
            : "305px 418px",
        transform: `translateY(${isOpen ? 0 : 5}px) rotate(${angle}deg) scale(0.8)`,
      }}
    >
      {isOpen ? (
        <g transform={isIzq ? "translate(400 0) scale(-1 1)" : undefined}>
          <g
            transform={
              isWaving
                ? isIzq
                  ? "translate(-17 0)"
                  : "translate(-5 0)"
                : undefined
            }
          >
            <g
              transform={
                isWaving
                  ? isIzq
                    ? "translate(630 0) scale(-1 1)"
                    : undefined
                  : "translate(0 824) scale(1 -1)"
              }
            >
              <path
                d="M296 411
                   Q291 409 293 404
                   L297 391
                   Q299 387 303 390
                   L302 398
                   L301 377
                   Q301 372 305 371
                   Q309 371 310 376
                   L310 395
                   L312 373
                   Q313 368 317 369
                   Q321 370 320 375
                   L317 396
                   L323 378
                   Q325 374 329 376
                   Q333 378 331 383
                   L325 401
                   L330 389
                   Q332 385 336 387
                   Q340 389 337 394
                   L329 408
                   Q325 416 316 417
                   L305 416
                   Q299 415 296 411 Z"
                fill="#C98765"
                stroke="#995E46"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              {!isIzq && isWaving && (
                <path
                  d="M303 399 Q306 402 310 400 M316 399 Q320 401 323 398"
                  fill="none"
                  stroke="#995E46"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              )}
            </g>
          </g>
        </g>
      ) : pose === "señalando" ? (
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
