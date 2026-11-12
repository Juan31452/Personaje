import type { FC } from "react";

interface CabezaProps {
  isBlinking?: boolean;
  mouthState?: number;
}

const Cabeza: FC<CabezaProps> = ({
  isBlinking = false,
  mouthState = 0,
}) => {
  return (
    <g id="cabeza">
      {/* Cara */}
      <ellipse cx="200" cy="160" rx="100" ry="110" fill="#DDA17A" />

      {/* Orejas */}
      <ellipse cx="100" cy="175" rx="16" ry="23" fill="#DDA17A" />
      <ellipse cx="300" cy="175" rx="16" ry="23" fill="#DDA17A" />

      {/* Cejas */}
      <path d="M135 115 Q155 102 180 115" stroke="#292929" strokeWidth="8" strokeLinecap="round" fill="none" />
      <path d="M220 115 Q245 102 265 115" stroke="#292929" strokeWidth="8" strokeLinecap="round" fill="none" />

      {/* Ojos */}
      {isBlinking ? (
        <>
          <path d="M150 140 Q160 145 170 140" stroke="#292929" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M230 140 Q240 145 250 140" stroke="#292929" strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <ellipse cx="160" cy="140" rx="10" ry="13" fill="#292929" />
          <ellipse cx="240" cy="140" rx="10" ry="13" fill="#292929" />
        </>
      )}

      {/* Gafas */}
      <g fill="none" stroke="#151515" strokeWidth="7">
        <rect x="118" y="120" width="80" height="50" rx="12" />
        <rect x="202" y="120" width="80" height="50" rx="12" />
        <path d="M198 140 L202 140" />
        <path d="M118 135 L102 130" />
        <path d="M282 135 L298 130" />
      </g>

      {/* Nariz */}
      <path d="M200 155 L192 190 Q200 198 210 190" fill="none" stroke="#B97855" strokeWidth="6" strokeLinecap="round" />

      {/* Boca sincronizada con el diálogo */}
      <g id="boca">
        {mouthState === 0 && (
          <path d="M178 215 Q200 228 222 215" stroke="#6D2929" strokeWidth="6" strokeLinecap="round" fill="none" />
        )}
        {mouthState === 1 && (
          <ellipse cx="200" cy="220" rx="14" ry="6" fill="#6D2929" />
        )}
        {mouthState === 2 && (
          <ellipse cx="200" cy="220" rx="16" ry="10" fill="#6D2929" />
        )}
        {mouthState === 3 && (
          <ellipse cx="200" cy="220" rx="10" ry="12" fill="#6D2929" />
        )}
      </g>
    </g>
  );
};

export default Cabeza;