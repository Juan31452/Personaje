import type { FC } from "react";
import "../style/Dialogo.css";

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
      const silabasAproximadas = palabra.match(/[aeiouáéíóúü]+/gi)?.length ?? 0;
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
    (Math.min(Math.max(tiempoActualMs, 0), duracionMs) / duracionMs) * pesoTotal;
  let pesoAcumulado = 0;

  for (let indice = 0; indice < pesos.length; indice += 1) {
    const pesoAnterior = pesoAcumulado;
    pesoAcumulado += pesos[indice];
    if (pesoObjetivo < pesoAcumulado || indice === pesos.length - 1) {
      let pesoPalabraAcumulado = 0;
      const pesoPalabraObjetivo = pesoObjetivo - pesoAnterior;
      const palabras = pesosPorDialogo[indice];
      const palabraIndex = palabras.findIndex((peso, palabraIndice) => {
        const siguientePeso = pesoPalabraAcumulado + peso;
        if (pesoPalabraObjetivo < siguientePeso || palabraIndice === palabras.length - 1) {
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

  return (
    <div
      className={`dialogo-wrapper dialogo-wrapper--${posicion} ${!animar ? "dialogo-wrapper--no-anim" : ""}`}
    >
      <div className="dialogo-bubble">
        {palabras.map((palabra, indice) => {
          const esPalabraActiva = indice === palabraActiva;
          return (
            <span key={indice}>
              <span
                className={`dialogo-palabra ${
                  esPalabraActiva
                    ? `dialogo-palabra-activa ${animar ? "dialogo-palabra-animada" : ""}`
                    : ""
                }`.trim()}
              >
                {palabra}
              </span>
              {indice < palabras.length - 1 ? " " : null}
            </span>
          );
        })}
        
        {/* Punta de la burbuja */}
        <div className={`dialogo-punta dialogo-punta--${posicion}`} />
      </div>
    </div>
  );
};

export default Dialogo;