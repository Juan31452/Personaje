import type { FC } from "react";

interface DialogoProps {
  texto: string;
  visible?: boolean;
  animar?: boolean;
  posicion?: "arriba" | "abajo" | "izquierda" | "derecha";
}

const Dialogo: FC<DialogoProps> = ({
  texto,
  visible = true,
  animar = true,
  posicion = "arriba",
}) => {
  if (!visible) return null;

  const posiciones = {
    arriba: { top: "-5px", left: "50%", transform: "translateX(-50%)" },
    abajo: { top: "calc(100% + 20px)", left: "50%", transform: "translateX(-50%)" },
    izquierda: { left: "-30px", top: "36%", transform: "translateY(-50%)" },
    derecha: { left: "calc(100% + 30px)", top: "36%", transform: "translateY(-50%)" },
  };

  const puntas = {
    arriba: {
      left: "50%",
      bottom: "-10px",
      transform: "translateX(-50%)",
      borderLeft: "15px solid transparent",
      borderRight: "15px solid transparent",
      borderTop: "15px solid white",
    },
    abajo: {
      left: "50%",
      top: "-10px",
      transform: "translateX(-50%)",
      borderLeft: "15px solid transparent",
      borderRight: "15px solid transparent",
      borderBottom: "15px solid white",
    },
    izquierda: {
      top: "50%",
      right: "-15px",
      transform: "translateY(-50%)",
      borderTop: "15px solid transparent",
      borderBottom: "15px solid transparent",
      borderRight: "15px solid white",
    },
    derecha: {
      top: "50%",
      left: "-15px",
      transform: "translateY(-50%)",
      borderTop: "15px solid transparent",
      borderBottom: "15px solid transparent",
      borderLeft: "15px solid white",
    },
  };

  return (
    <div
      style={{
        position: "absolute",
        ...posiciones[posicion],
        animation: animar ? "fadeIn 0.3s ease-in-out" : "none",
        zIndex: 10,
      }}
    >
      <div
        style={{
          background: "white",
          border: "3px solid #2C3E50",
          borderRadius: "24px",
          padding: "18px 24px",
          width: "min(52vw, 360px)",
          maxWidth: "360px",
          minWidth: "240px",
          fontSize: "18px",
          lineHeight: 1.35,
          fontWeight: "600",
          color: "#2C3E50",
          textAlign: "left",
          boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
          position: "relative",
        }}
      >
        {texto}
        <div
          style={{
            position: "absolute",
            width: 0,
            height: 0,
            ...puntas[posicion],
          }}
        />
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default Dialogo;