
import JuanSalazar from "./components/JuanSalazar";
import Dialogo from "./components/Dialogo";
import "./App.css";
import { useEffect, useRef, useState } from "react";
import { useVideoExport } from "./Hook/useVideoExport";

const TEXTO_DIALOGO =
  "Hola soy Juan Salazar y estoy creado con TypeScript utilizando React";
const VELOCIDAD_DIALOGO_MS = 180;
const gruposVocales =
  TEXTO_DIALOGO.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .match(/[aeiou]+/g)?.length ?? 0;
const DURACION_DIALOGO_MS = Math.max(
  gruposVocales * 2 * VELOCIDAD_DIALOGO_MS + 200,
  1200,
);

function App() {
  const [dialogo, setDialogo] = useState("");
  const [mostrarDialogo, setMostrarDialogo] = useState(false);
  const dialogTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const characterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (dialogTimeoutRef.current) clearTimeout(dialogTimeoutRef.current);
    };
  }, []);

  const hablar = () => {
    setDialogo(TEXTO_DIALOGO);
    setMostrarDialogo(true);

    if (dialogTimeoutRef.current) clearTimeout(dialogTimeoutRef.current);

    dialogTimeoutRef.current = setTimeout(() => {
      setMostrarDialogo(false);
      dialogTimeoutRef.current = null;
    }, DURACION_DIALOGO_MS);
  };

  const {
    exportVideo,
    isExporting,
    progress,
    error: exportError,
    status: exportStatus,
  } = useVideoExport({
    targetRef: characterRef,
    durationMs: DURACION_DIALOGO_MS,
    onStart: hablar,
  });

  return (
    <div className="video-editor">
      <aside className="editor-toolbar" aria-label="Controles del editor">
        <button onClick={hablar} disabled={isExporting}>
          Hablar
        </button>
        <button onClick={exportVideo} disabled={isExporting}>
          {isExporting ? `Exportando ${progress}%` : "Exportar MP4"}
        </button>
      </aside>

      <main className="editor-canvas">
        <div className="character-container" ref={characterRef}>
          <Dialogo
            texto={dialogo}
            visible={mostrarDialogo}
            animar={!isExporting}
            posicion="arriba"
          />
          <JuanSalazar dialog={dialogo} />
        </div>
        {(exportError || exportStatus) && (
          <p
            className={`export-status${exportError ? " export-status--error" : ""}`}
            role={exportError ? "alert" : "status"}
          >
            {exportError || exportStatus}
          </p>
        )}
      </main>
    </div>
  );
}

export default App;
