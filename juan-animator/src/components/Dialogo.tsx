import type { FC } from "react";

interface DialogoProps {
  texto: string;
  palabraActiva?: number;
  visible?: boolean;
  animar?: boolean;
  posicion?: "arriba" | "abajo" | "izquierda" | "derecha";
}

export const obtenerProgresoDialogo = (
  dialogos: string[],
  tiempoActualMs: number,
  duracionMs: number,
) => {
  if (dialogos.length === 0 || duracionMs <= 0) {
    return { dialogoIndex: 0, palabraIndex: 0 };
  }

  const pesos = dialogos.map((texto) =>
    Math.max(8, texto.split(/\s+/).filter(Boolean).length),
  );
  const pesoTotal = pesos.reduce((total, peso) => total + peso, 0);
  const pesoObjetivo =
    (Math.min(Math.max(tiempoActualMs, 0), duracionMs) / duracionMs) *
    pesoTotal;
  let pesoAcumulado = 0;

  for (let indice = 0; indice < pesos.length; indice += 1) {
    const pesoAnterior = pesoAcumulado;
    pesoAcumulado += pesos[indice];
    if (pesoObjetivo < pesoAcumulado || indice === pesos.length - 1) {
      const palabras = dialogos[indice].split(/\s+/).filter(Boolean).length;
      const progreso =
        (pesoObjetivo - pesoAnterior) / (pesoAcumulado - pesoAnterior);

      return {
        dialogoIndex: indice,
        palabraIndex: Math.min(Math.floor(progreso * palabras), palabras - 1),
      };
    }
  }

  return { dialogoIndex: 0, palabraIndex: 0 };
};

const Dialogo: FC<DialogoProps> = ({
  texto,
  palabraActiva = -1,
  visible = true,
  animar = true,
  posicion = "arriba",
}) => {
  if (!visible) return null;

  const palabras = texto.split(/\s+/).filter(Boolean);

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
      borderTop: "15px solid rgba(255, 255, 255, 0.35)",
    },
    abajo: {
      left: "50%",
      top: "-10px",
      transform: "translateX(-50%)",
      borderLeft: "15px solid transparent",
      borderRight: "15px solid transparent",
      borderBottom: "15px solid rgba(255, 255, 255, 0.35)",
    },
    izquierda: {
      top: "50%",
      right: "-15px",
      transform: "translateY(-50%)",
      borderTop: "15px solid transparent",
      borderBottom: "15px solid transparent",
      borderRight: "15px solid rgba(255, 255, 255, 0.35)",
    },
    derecha: {
      top: "50%",
      left: "-15px",
      transform: "translateY(-50%)",
      borderTop: "15px solid transparent",
      borderBottom: "15px solid transparent",
      borderLeft: "15px solid rgba(255, 255, 255, 0.35)",
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
          background: "rgba(255, 255, 255, 0.35)",
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
        {palabras.map((palabra, indice) => {
          const esPalabraActiva = indice === palabraActiva;
          return (
            <span key={indice}>
              <span
                className={
                  esPalabraActiva
                    ? `dialogo-palabra-activa${animar ? " dialogo-palabra-animada" : ""}`
                    : undefined
                }
              >
                {palabra}
              </span>
              {indice < palabras.length - 1 ? " " : null}
            </span>
          );
        })}
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

        .dialogo-palabra-activa {
          color: #c2410c;
          font-weight: 800;
        }

        .dialogo-palabra-animada {
          display: inline-block;
          animation: palabraActiva 0.25s ease-out both;
        }

        @keyframes palabraActiva {
          from {
            color: #2C3E50;
            transform: scale(1);
          }
          to {
            color: #c2410c;
            transform: scale(1.08);
          }
        }
      `}</style>
    </div>
  );
};

export default Dialogo;