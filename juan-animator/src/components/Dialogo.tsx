import type { FC } from "react";

interface DialogoProps {
  texto: string;
  palabraActiva?: number;
  visible?: boolean;
  animar?: boolean;
  posicion?: "arriba" | "abajo" | "izquierda" | "derecha";
}

export const dividirDialogos = (texto: string, palabrasPorFragmento = 12) => {
  const parrafos = texto
    .split(/\n+/)
    .map((parrafo) => parrafo.trim())
    .filter(Boolean);
  const fragmentos: string[] = [];

  for (const parrafo of parrafos) {
    const frases = parrafo.match(/[^.!?]+(?:[.!?]+["')\]]*|$)/g) ?? [parrafo];

    for (const frase of frases) {
      const palabras = frase.trim().split(/\s+/).filter(Boolean);
      for (let indice = 0; indice < palabras.length; indice += palabrasPorFragmento) {
        const fragmento = palabras
          .slice(indice, indice + palabrasPorFragmento)
          .join(" ")
          .trim();
        if (fragmento) fragmentos.push(fragmento);
      }
    }
  }

  return fragmentos;
};

export const obtenerProgresoDialogo = (
  dialogos: string[],
  tiempoActualMs: number,
  duracionMs: number,
) => {
  if (dialogos.length === 0 || duracionMs <= 0) {
    return { dialogoIndex: 0, palabraIndex: 0 };
  }

  const palabrasPorDialogo = dialogos.map((texto) =>
    texto.split(/\s+/).filter(Boolean),
  );
  const pesosPorDialogo = palabrasPorDialogo.map((palabras) =>
    palabras.map((palabra) => {
      const silabasAproximadas =
        palabra.match(/[aeiouáéíóúü]+/gi)?.length ?? 0;
      const pausa = /[.!?…]["')\]]*$/.test(palabra)
        ? 1.2
        : /[,;:]["')\]]*$/.test(palabra)
          ? 0.6
          : 0;
      return Math.max(1, silabasAproximadas) + pausa;
    }),
  );
  const pesos = pesosPorDialogo.map((pesosPalabras) =>
    pesosPalabras.reduce((total, peso) => total + peso, 0),
  );
  const pesoTotal = pesos.reduce((total, peso) => total + peso, 0);

  if (pesoTotal <= 0) {
    return { dialogoIndex: 0, palabraIndex: 0 };
  }

  const pesoObjetivo =
    (Math.min(Math.max(tiempoActualMs, 0), duracionMs) / duracionMs) *
    pesoTotal;
  let pesoAcumulado = 0;

  for (let indice = 0; indice < pesos.length; indice += 1) {
    const pesoAnterior = pesoAcumulado;
    pesoAcumulado += pesos[indice];
    if (pesoObjetivo < pesoAcumulado || indice === pesos.length - 1) {
      // Corregido: empieza en 0 porque pesoPalabraObjetivo ya es relativo al diálogo actual
      let pesoPalabraAcumulado = 0;
      const pesoPalabraObjetivo = pesoObjetivo - pesoAnterior;
      const palabras = pesosPorDialogo[indice];
      const palabraIndex = palabras.findIndex((peso, palabraIndice) => {
        const siguientePeso = pesoPalabraAcumulado + peso;
        if (
          pesoPalabraObjetivo < siguientePeso ||
          palabraIndice === palabras.length - 1
        ) {
          return true;
        }
        pesoPalabraAcumulado = siguientePeso;
        return false;
      });
      return {
        dialogoIndex: indice,
        palabraIndex: Math.max(0, palabraIndex),
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
    arriba: { top: "12px", left: "50%", transform: "translateX(-50%)" },
    abajo: { bottom: "12px", left: "50%", transform: "translateX(-50%)" },
    izquierda: { right: "calc(100% + 30px)", top: "36%", transform: "translateY(-50%)" },
    derecha: { left: "calc(100% + 30px)", top: "36%", transform: "translateY(-50%)" },
  };

  // Corregido: dirección de los triángulos apuntando hacia el personaje
  const puntas = {
    arriba: {
      left: "50%",
      bottom: "-15px",
      transform: "translateX(-50%)",
      borderLeft: "15px solid transparent",
      borderRight: "15px solid transparent",
      borderTop: "15px solid #2C3E50",
    },
    abajo: {
      left: "50%",
      top: "-15px",
      transform: "translateX(-50%)",
      borderLeft: "15px solid transparent",
      borderRight: "15px solid transparent",
      borderBottom: "15px solid #2C3E50",
    },
    izquierda: {
      top: "50%",
      right: "-15px",
      transform: "translateY(-50%)",
      borderTop: "15px solid transparent",
      borderBottom: "15px solid transparent",
      borderLeft: "15px solid #2C3E50",
    },
    derecha: {
      top: "50%",
      left: "-15px",
      transform: "translateY(-50%)",
      borderTop: "15px solid transparent",
      borderBottom: "15px solid transparent",
      borderRight: "15px solid #2C3E50",
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
          background: "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(6px)",
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
