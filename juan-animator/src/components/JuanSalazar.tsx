
import { useState } from "react";

interface JuanSalazarProps {
  isTalking?: boolean;
}

export default function JuanSalazar({
  isTalking = false,
}: JuanSalazarProps) {
  const [mouthOpen, setMouthOpen] = useState(false);

  return (
    <svg
      viewBox="0 0 400 500"
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      role="img"
      aria-label="Personaje animado de Juan Salazar"
    >
      {/* Fondo */}
      <rect
        width="400"
        height="500"
        fill="#EAF2F8"
        rx="20"
      />

      
      
      {/* Brazos */}
      <g fill="#172B4D">

        {/* Brazo izquierdo */}
        <path
          d="
            M105 365
            C75 370 65 400 65 430
            L55 475
            C52 490 60 500 72 500
            C84 500 90 490 94 475
            L120 410
            Z
          "
        />

        {/* Brazo derecho */}
        <path
          d="
            M295 365
            C325 370 335 400 335 430
            L345 475
            C348 490 340 500 328 500
            C316 500 310 490 306 475
            L280 410
            Z
          "
        />

      </g>

      {/* Cuerpo */}
      <path
        d="M90 500
          L100 390
          Q110 340 200 340
          Q290 340 300 390
          L310 500
          Z"
        fill="#172B4D"
      />


      {/* Cuello */}
      <path
        d="M165 320 L165 365 Q200 390 235 365
           L235 320 Z"
        fill="#C98765"
      />

      {/* Cabeza */}
      <ellipse
        cx="200"
        cy="220"
        rx="105"
        ry="125"
        fill="#DDA17A"
      />

      {/* Orejas */}
      <ellipse
        cx="95"
        cy="230"
        rx="17"
        ry="27"
        fill="#DDA17A"
      />

      <ellipse
        cx="305"
        cy="230"
        rx="17"
        ry="27"
        fill="#DDA17A"
      />

      {/* Cejas */}
      <path
        d="M130 170 Q155 155 180 170"
        stroke="#292929"
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
      />

      <path
        d="M220 170 Q245 155 270 170"
        stroke="#292929"
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
      />

      {/* Ojos */}
      <ellipse
        cx="155"
        cy="195"
        rx="10"
        ry="13"
        fill="#292929"
      />

      <ellipse
        cx="245"
        cy="195"
        rx="10"
        ry="13"
        fill="#292929"
      />

      {/* Gafas */}
      <g
        fill="none"
        stroke="#151515"
        strokeWidth="8"
      >
        <rect
          x="112"
          y="175"
          width="83"
          height="55"
          rx="12"
        />

        <rect
          x="205"
          y="175"
          width="83"
          height="55"
          rx="12"
        />

        <path d="M195 195 L205 195" />

        <path d="M112 190 L95 185" />

        <path d="M288 190 L305 185" />
      </g>

      {/* Nariz */}
      <path
        d="M200 200 L190 245 Q200 255 212 245"
        fill="none"
        stroke="#B97855"
        strokeWidth="6"
        strokeLinecap="round"
      />

      {/* Boca */}
      {isTalking || mouthOpen ? (
        <ellipse
          cx="200"
          cy="285"
          rx="24"
          ry="18"
          fill="#6D2929"
        />
      ) : (
        <path
          d="M175 285 Q200 300 225 285"
          fill="none"
          stroke="#6D2929"
          strokeWidth="6"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}
