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
    arriba: { top: "20px", left: "50%", transform: "translateX(-50%)" },
    abajo: { top: "calc(100% + 20px)", left: "50%", transform: "translateX(-50%)" },
    izquierda: { left: "-8px", top: "50%", transform: "translateY(-50%)" },
    derecha: { left: "calc(100% + 20px)", top: "50%", transform: "translateY(-50%)" },
  };

  const puntas = {
    arriba: {
      left: "50%",
      bottom: "-15px",
      transform: "translateX(-50%)",
      borderLeft: "15px solid transparent",
      borderRight: "15px solid transparent",
      borderTop: "15px solid white",
    },
    abajo: {
      left: "50%",
      top: "-15px",
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
          padding: "24px 30px",
          maxWidth: "340px",
          fontSize: "20px",
          lineHeight: 1.4,
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
            transform: translateX(-50%) translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Dialogo;